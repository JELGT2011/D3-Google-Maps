ArcGraphOverlay.prototype = new google.maps.OverlayView();

function ArcGraphOverlay(graph, map) {

	this.graph_ = graph;
	this.map_ = map;
	this.last_zoom_ = 0;
	this.setMap(map);

	this.layer_ = null;
	this.origins = null;

} // function ArcGraphOverlay(graph_) { ... }

ArcGraphOverlay.prototype.onAdd = function () {

	var layer = d3.select(this.getPanes().overlayLayer);

	layer
			.attr("class", "google-maps-overlay");

	var origins = layer.append('svg');

	origins
			.attr('id', 'origins')
			.style('position', 'absolute')
			.attr('width', '100%')
			.attr('height', $('#map').height());

	this.layer_ = layer;
	this.origins = origins;

	for (var i = 0; i < d3.entries(this.graph_).length; i++) {
		construct_from_node(this, d3.entries(this.graph_)[i]);
	}

}; // overlay.prototype.onAdd = function() { ... }

ArcGraphOverlay.prototype.draw = function () {

	// SVGs will position correctly on pan, so we only need to correct zoom change
	if (this.map_.zoom != this.last_zoom_) {

		this.last_zoom_ = this.map_.zoom;

		var layer = this.layer_;
		var origins = $('#origins');

		var projection = this.getProjection();

		for (var i = 0; i < origins.children().length; i++) {

			var origin = origins.children()[i];

			var marker = d3.select(origin.getElementsByTagName('circle').item(0));

			var label = d3.select(origin.getElementsByTagName('text').item(0));

			var new_origin_position = projection.fromLatLngToDivPixel(new google.maps.LatLng(
					marker.attr('lat'),
					marker.attr('lng')
			));

			marker
					.attr('cx', new_origin_position.x)
					.attr('cy', new_origin_position.y);

			label
					.attr('x', new_origin_position.x)
					.attr('y', new_origin_position.y);

			var destinations = origin.getElementsByTagName('line');

			var destination;
			var new_destination_location;
			for (var j = 0; j < destinations.length; j++) {

				destination = d3.select(destinations[j]);

				new_destination_location = projection.fromLatLngToDivPixel(new google.maps.LatLng(
						destination.attr('state-lat'),
						destination.attr('state-lng')
				));

				destination
						.attr('x1', new_origin_position.x)
						.attr('x2', new_destination_location.x)
						.attr('y1', new_origin_position.y)
						.attr('y2', new_destination_location.y);
			}

		}

		this.layer_ = layer;
		this.origins = origins;

	}

}; // overlay.prototype.draw = function() { ... }

ArcGraphOverlay.prototype.onRemove = function () {

}; // overlay.prototype.onRemove = function() { ... }

function construct_from_node(overlay, node) {

	var layer = overlay.layer_;
	var origins = overlay.origins;

	var origin = overlay.origins.append('g');

	origin.append('circle')
			.attr('class', '_' + node.key + ' ' + 'marker')
			.attr('lat', node.value.plant.coordinates[0])
			.attr('lng', node.value.plant.coordinates[1])
			.attr("r", 4.5);

	origin.append('text')
			.attr('class', '_' + node.key + ' ' + 'label')
			.attr('lat', node.value.plant.coordinates[0])
			.attr('lng', node.value.plant.coordinates[1])
			.attr("dy", ".31em")
			.text(function () {
				return node.key;
			});

	var line_group = origin.append('g');

	line_group
			.attr('class', '_' + node.key + ' ' + 'edge-group');

	var destinations = (d3.entries(node.value)).filter(function (element) {
		return element.key != 'plant';
	});

	for (var i = 0; i < destinations.length; i++) {

		line_group
				.append('line')
				.attr('state-lat', destinations[i].value.state.coordinates[0])
				.attr('state-lng', destinations[i].value.state.coordinates[1])
				.attr('zip-lat', destinations[i].value.zip.coordinates[0])
				.attr('zip-lng', destinations[i].value.zip.coordinates[1]);

	}

	overlay.layer_ = layer;
	overlay.origins = origins;

}

