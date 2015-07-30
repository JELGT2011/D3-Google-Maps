/**
 * SVGArcsOverlay for D3 drawings as an overlay to a Google Map.
 * @type {google.maps.OverlayView}
 */

// inherit prototype from Google's default overlay
SVGArcsOverlay.prototype = new google.maps.OverlayView();

/**
 * Instantiate the overlay.
 *
 * @constructor
 * @param graph
 * @param map
 */
function SVGArcsOverlay(graph, map) {

	this.graph_ = graph;
	this.map_ = map;

	// elements we will control and append to the overlay
	this.container_ = null;
	this.svg_ = null;

	this.setMap(map);

} // function SVGArcsOverlay(graph, map) { ... }

/**
 * Called internally by the map when this overlay is added.
 * Only script pertaining to setting up the overlay should go in here.
 *
 */
SVGArcsOverlay.prototype.onAdd = function () {

	var container, svg, projection, south_west, north_east, nodes_stylesheet, nodes_css_rules,
			nodes, node, node_group, marker, label, edge_group, edges, edge;

	projection = this.getProjection();

	south_west = projection.fromLatLngToDivPixel(this.map_.getBounds().getSouthWest());
	north_east = projection.fromLatLngToDivPixel(this.map_.getBounds().getNorthEast());

	nodes_css_rules = '';

	// Overview of the hierarchical structure we're creating
	// <Google-Map>       // handles our overlay's lifecycle
	//   <SVGArcsOverlay> // our overlay onto the map
	//     <Layer>        // inherited from the prototype and is unmodified in our overlay
	//       <Container>  // div wrapper around our svg for alignment purposes
	//         <SVG>      // root of our SVGs
	//         </SVG>
	//       </Container>
	//     </Layer>
	//   </Overlay>
	// </Google-Map>
	container = d3.select(this.getPanes().overlayLayer).append('div')
			.style('position', 'absolute');

	svg = container.append('svg')
			.style('position', 'absolute')
			.attr('width', north_east.x - south_west.x)
			.attr('height', south_west.y - north_east.y);

	// for consistency, always save our internal references as the element itself,
	// not the D3 selector object.
	this.container_ = container.node();
	this.svg_ = svg.node();

	nodes = d3.entries(this.graph_);

	// iterate through the nodes of the graph, where within this.svg_
	// we'll create group with the following structure
	// <SVG>        // this.svg_
	//   <g>        // group created for each node
	//     <circle> // node marker
	//     <text>   // label the marker
	//     <g>      // group for each edge from that node to each of its destinations
	//       <line> // edge from node to destination
	//       <line>
	//         .
	//         .
	//         .
	//       <line>
	//     </g>
	//   </g>
	//   <g>
	//    .
	//    .
	//    .
	//   <g>
	// </SVG>
	for (var i = 0; i < nodes.length; i++) {

		node = nodes[i];

		nodes_css_rules +=
				'._' + node.key + ' { ' +
				' stroke: ' + randomColor() + '; ' +
				' opacity: 0.85; ' +
				'}\n';

		node_group = svg.append('g')
				.attr('class', '_' + node.key + ' ' + 'node-group');

		// for each SVG element, we're appending their coordinates as attributes
		// so we don't have to look up that element from our original graph
		marker = node_group.append('circle')
				.attr('class', '_' + node.key + ' ' + 'marker')
				.attr('lat', node.value.plant.coordinates[0])
				.attr('lng', node.value.plant.coordinates[1])
				.attr("r", 4.5);

		label = node_group.append('text')
				.attr('class', '_' + node.key + ' ' + 'label')
				.attr('lat', node.value.plant.coordinates[0])
				.attr('lng', node.value.plant.coordinates[1])
				.attr("dy", ".31em")
				.text(node.key);

		edge_group = node_group.append('g')
				.attr('class', '_' + node.key + ' ' + 'edge-group');

		edges = (d3.entries(node.value)).filter(function (element) {
			return element.key != 'plant';
		});

		for (var j = 0; j < edges.length; j++) {

			edge = edge_group.append('line')
					.attr('state-lat', edges[j].value.state.coordinates[0])
					.attr('state-lng', edges[j].value.state.coordinates[1])
					.attr('zip-lat', edges[j].value.zip.coordinates[0])
					.attr('zip-lng', edges[j].value.zip.coordinates[1])
					.style('stroke-width', edges[j].value.shipments);

		} // for (var j = 0; j < edges.length; j++) { ... }
	} // for (var i = 0; i < this.graph_.length; i++) { ... }

	// create stylesheet, insert the rules string, append it to the document
	nodes_stylesheet = d3.select(document.head).append('style').html(nodes_css_rules);

}; // SVGArcsOverlay.prototype.onAdd = function() { ... }

/**
 * Called internally by the map it has changed the view port.
 *
 */
SVGArcsOverlay.prototype.draw = function () {

	// TODO: only process visibile elements.

	var container, svg, projection, south_west, north_east;

	// get references to internal variables
	// *note* they are stored as the elements themselves, so we're getting
	// a D3 selector reference to them to do D3 operations
	container = d3.select(this.container_);
	svg = d3.select(this.svg_);

	projection = this.getProjection();

	south_west = projection.fromLatLngToDivPixel(this.map_.getBounds().getSouthWest());
	north_east = projection.fromLatLngToDivPixel(this.map_.getBounds().getNorthEast());

	// convert the bounds of the map into pixel space, and reposition the SVG container
	container
			.style('left', south_west.x + 'px')
			.style('top', north_east.y + 'px')
			.style('width', (north_east.x - south_west.x) + 'px')
			.style('height', (south_west.y - north_east.y) + 'px');

	var nodes, next_node_position, node_group, marker, label, edge_group, edges, edge, edge_position;

	nodes = svg.node().childNodes;

	// iterate through the nodes of the graph, and reposition each element
	// based on the new map's view
	for (var i = 0; i < nodes.length; i++) {

		node_group = d3.select(nodes[i]);
		marker = node_group.select('circle');
		label = node_group.select('text');
		edge_group = node_group.select('g');
		edges = edge_group.node().childNodes;

		// look up the marker's coordinates from the attribute we attached in this.onAdd
		next_node_position = projection.fromLatLngToDivPixel(new google.maps.LatLng(
				marker.attr('lat'),
				marker.attr('lng')
		));

		// reposition everything based on their coordinates
		// must be offset to account for the container moving over pixel space
		marker
				.attr('cx', next_node_position.x - south_west.x)
				.attr('cy', next_node_position.y - north_east.y);

		label
				.attr('x', next_node_position.x - south_west.x)
				.attr('y', next_node_position.y - north_east.y);

		// apply the same strategy to all edges of this node
		for (var j = 0; j < edges.length; j++) {

			edge = d3.select(edges[j]);

			edge_position = projection.fromLatLngToDivPixel(new google.maps.LatLng(
					edge.attr('state-lat'),
					edge.attr('state-lng')
			));

			edge
					.attr('x1', next_node_position.x - south_west.x)
					.attr('x2', edge_position.x - south_west.x)
					.attr('y1', next_node_position.y - north_east.y)
					.attr('y2', edge_position.y - north_east.y);

		} // for (var j = 0; j < edges.length; j++) { ... }
	} // for (var i = 0; i < nodes.length; i++) { ... }

	// save our changes to the internal references in the overlay
	this.container_ = container.node();
	this.svg_ = svg.node();

}; // SVGArcsOverlay.prototype.draw = function() { ... }

/**
 * Called internally by the map when it is destroyed or removes this overlay.
 */
SVGArcsOverlay.prototype.onRemove = function () {

	this.container_.parentNode.removeChild(this.container_);
	this.container_ = null;

}; // SVGArcsOverlay.prototype.onRemove = function() { ... }
