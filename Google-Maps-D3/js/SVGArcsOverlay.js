SVGArcsOverlay.prototype = new google.maps.OverlayView();

function SVGArcsOverlay(graph, map) {

	this.graph_ = graph;
	this.map_ = map;

	this.container_ = null;
	this.svg_ = null;

	this.setMap(map);
} // function SVGArcsOverlay(graph, map) { ... }

SVGArcsOverlay.prototype.onAdd = function () {

	var container, svg, nodes, node, node_group, marker, label, edge_group, edges, edge;

	container = d3.select(this.getPanes().overlayLayer).append('div')
			.style('position', 'absolute')
			.attr('width', '100%')
			.attr('height', '2000px');

	svg = container.append('svg')
			.style('position', 'absolute')
			.attr('width', '2000px')
			.attr('height', '2000px');

	this.container_ = container.node();
	this.svg_ = svg.node();

	nodes = d3.entries(this.graph_);

	for (var i = 0; i < nodes.length; i++) {

		node = nodes[i];

		node_group = svg.append('g')
				.attr('class', '_' + node.key + ' ' + 'node-group');

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
					.attr('zip-lng', edges[j].value.zip.coordinates[1]);

		} // for (var j = 0; j < edges.length; j++) { ... }
	} // for (var i = 0; i < this.graph_.length; i++) { ... }
}; // SVGArcsOverlay.prototype.onAdd = function() { ... }

SVGArcsOverlay.prototype.draw = function () {

	var container, svg, projection, south_west, north_east;

	container = d3.select(this.container_);
	svg = d3.select(this.svg_);
	projection = this.getProjection();

	south_west = projection.fromLatLngToDivPixel(this.map_.getBounds().getSouthWest());
	north_east = projection.fromLatLngToDivPixel(this.map_.getBounds().getNorthEast());

	container
			.style('left', south_west.x + 'px')
			.style('top', north_east.y + 'px')
			.style('width', (north_east.x - south_west.x) + 'px')
			.style('height', (south_west.y - north_east.y) + 'px');

	var nodes, current_node_position, next_node_position, node_group, marker, label, edge_group, edges, edge, edge_position;

	nodes = svg.node().childNodes;

	for (var i = 0; i < nodes.length; i++) {

		node_group = d3.select(nodes[i]);
		marker = node_group.select('circle');
		label = node_group.select('text');
		edge_group = node_group.select('g');
		edges = edge_group.node().childNodes;

		next_node_position = projection.fromLatLngToDivPixel(new google.maps.LatLng(
				marker.attr('lat'),
				marker.attr('lng')
		));

		marker
				.attr('cx', next_node_position.x - south_west.x)
				.attr('cy', next_node_position.y - north_east.y);

		label
				.attr('x', next_node_position.x - south_west.x)
				.attr('y', next_node_position.y - north_east.y);

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

	this.container_ = container.node();
	this.svg_ = svg.node();
}; // SVGArcsOverlay.prototype.draw = function() { ... }

SVGArcsOverlay.prototype.onRemove = function() {

	this.container_.parentNode.removeChild(this.container_);
	this.container_ = null;
}; // SVGArcsOverlay.prototype.onRemove = function() { ... }
