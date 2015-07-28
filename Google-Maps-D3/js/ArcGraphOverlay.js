ArcGraphOverlay.prototype = new google.maps.OverlayView();

function ArcGraphOverlay(graph, map) {

	this.graph = graph;
	this.map = map;
	this.last_zoom = 0;
	this.setMap(map);

	this.layer = null;
	this.origins = null;

} // function ArcGraphOverlay(graph) { ... }

ArcGraphOverlay.prototype.onAdd = function () {

	var layer = d3.select(this.getPanes().overlayLayer);

	layer
			.attr("class", "google-maps-overlay");

	var origins = layer.append('svg');

	origins
			//.style('left', '0px')
			//.style('top', '0px')
			.attr('width', '2000px')
			.attr('height', '2000px');

	this.layer = layer;
	this.origins = origins;

	for (var i = 0; i < d3.entries(this.graph).length; i++) {
		construct_from_node(this, d3.entries(this.graph)[i]);
	}

}; // overlay.prototype.onAdd = function() { ... }

ArcGraphOverlay.prototype.draw = function () {

	// SVGs will position correctly on pan, so we only need to correct zoom change
	if (this.map.zoom != this.last_zoom) {

		this.last_zoom = this.map.zoom;

		var layer = this.layer;
		var origins = this.origins;

		var projection = this.getProjection();

		for (var i = 0; i < origins.node().children.length; i++) {

			var origin = origins.node().children[i];

			var marker = d3.select(origin.getElementsByTagName('circle').item());

			var label = d3.select(origin.getElementsByTagName('text').item());

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

		this.layer = layer;
		this.origins = origins;

	}

}; // overlay.prototype.draw = function() { ... }

ArcGraphOverlay.prototype.onRemove = function () {

}; // overlay.prototype.onRemove = function() { ... }

function construct_from_node(overlay, node) {

	var layer = overlay.layer;
	var origins = overlay.origins;

	var projection = overlay.getProjection();

	var plant_location = projection.fromLatLngToDivPixel(new google.maps.LatLng(node.value.plant.coordinates[0], node.value.plant.coordinates[1]));

	var origin = overlay.origins.append('g');

	var origin_style = document.createElement('style');
	origin_style.type = 'text/css';
	origin_style.innerHTML = '\n' +
			'.' + node.key + ' {' + '\n' +
			'\t' + 'color: ' + '#F0F8FF' + ';' + '\n' +
			'}\n';

	origin.append('circle')
			.attr('class', node.key + ' ' + 'marker')
			.attr('lat', node.value.plant.coordinates[0])
			.attr('lng', node.value.plant.coordinates[1])
			.attr("r", 4.5)
			.attr("cx", plant_location.x)
			.attr("cy", plant_location.y);

	origin.append('text')
			.attr('class', node.key + ' ' + 'label')
			.attr('lat', node.value.plant.coordinates[0])
			.attr('lng', node.value.plant.coordinates[1])
			.attr("x", plant_location.x + 10)
			.attr("y", plant_location.y)
			.attr("dy", ".31em")
			.text(function () {
				return node.key;
			});

	var destinations = (d3.entries(node.value)).filter(function (element) {
		return element.key != 'plant';
	});

	var destination_location;
	for (var i = 0; i < destinations.length; i++) {
		destination_location = projection.fromLatLngToDivPixel(new google.maps.LatLng(destinations[i].value.state.coordinates[0], destinations[i].value.state.coordinates[1]));

		origin
				.append('line')
				.attr('class', node.key + ' ' + 'edge')
				.attr('state-lat', destinations[i].value.state.coordinates[0])
				.attr('state-lng', destinations[i].value.state.coordinates[1])
				.attr('zip-lat', destinations[i].value.zip.coordinates[0])
				.attr('zip-lng', destinations[i].value.zip.coordinates[1])
				.attr("x1", plant_location.x)
				.attr("x2", destination_location.x)
				.attr("y1", plant_location.y)
				.attr("y2", destination_location.y)
				.style('stroke', "rgb(255,0,0)")
				.style('stroke-width', '1');

	}

	overlay.layer = layer;
	overlay.origins = origins;

}

