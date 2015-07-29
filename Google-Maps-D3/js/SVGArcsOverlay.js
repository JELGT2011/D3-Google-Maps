SVGArcsOverlay.prototype = new google.maps.OverlayView();

function SVGArcsOverlay(graph, map) {

	this.graph_ = graph;
	this.map_ = map;
	this.center_ = new google.maps.LatLng(0, 0);
	this.last_zoom_ = 0;

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

	if (this.last_zoom_ !== this.map.zoom) {

		this.last_zoom_ = this.map.zoom;

		var container, svg, projection;

		container = this.container_;
		svg = this.svg_;

		projection = this.getProjection();

		// update SVG overlay to be positioned correctly
		//var style, center, width, offset, left, top, factor;
		//
		//style = this.container_.style;
		//
		//center = projection.fromLatLngToDivPixel(this.center_);
		//width = Math.round(projection.getWorldWidth());
		//offset = width / 2;
		//
		//left = Math.round(center.x) - offset;
		//top = Math.round(center.y) - offset;
		//
		//// compute offset for small zoom levels
		////factor = Math.max(1024 / width, 1) - 1;
		//factor = 1;
		//
		//// scale svg to world bounds
		//this.svg_.setAttribute('width', width);
		//this.svg_.setAttribute('height', width);
		//
		//// apply offset
		//style.left = left + 'px';
		//style.top = top + 'px';
		//style.marginLeft = (-factor * offset) + 'px';


		// update node and edge positions
		var nodes, node_position, node_group, marker, label, edge_group, edges, edge, edge_position;

		nodes = svg.childNodes;

		for (var i = 0; i < nodes.length; i++) {

			node_group = d3.select(nodes[i]);
			marker = node_group.select('circle');
			label = node_group.select('text');
			edge_group = node_group.select('g');
			edges = edge_group.node().childNodes;

			node_position = projection.fromLatLngToDivPixel(new google.maps.LatLng(
					marker.attr('lat'),
					marker.attr('lng')
			));

			marker
					.attr('cx', node_position.x)
					.attr('cy', node_position.y);

			label
					.attr('x', node_position.x)
					.attr('y', node_position.y);

			for (var j = 0; j < edges.length; j++) {

				edge = d3.select(edges[j]);

				edge_position = projection.fromLatLngToDivPixel(new google.maps.LatLng(
						edge.attr('state-lat'),
						edge.attr('state-lng')
				));

				edge
						.attr('x1', node_position.x)
						.attr('x2', edge_position.x)
						.attr('y1', node_position.y)
						.attr('y2', edge_position.y);

			} // for (var j = 0; j < edges.length; j++) { ... }
		} // for (var i = 0; i < nodes.length; i++) { ... }

		this.container_ = container;
		this.svg_ = svg;

	} // if (this.last_zoom_ !== this.map.zoom) { ... }
}; // SVGArcsOverlay.prototype.draw = function() { ... }

