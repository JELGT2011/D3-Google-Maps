ArcGraphOverlay.prototype = new google.maps.OverlayView();

function ArcGraphOverlay(graph, map) {

	this.graph = graph;
	this.map = map;
	this.last_zoom = 0;
	this.setMap(map);

	this.layer = null;

} // function ArcGraphOverlay(graph) { ... }

ArcGraphOverlay.prototype.onAdd = function () {

	var layer = d3.select(this.getPanes().overlayLayer).append("div");

	layer
			.attr("class", "stations");

	var projection = this.getProjection();

	var origins = layer.append('svg');

	origins
			.style('left', '0px')
			.style('top', '0px')
			.attr('width', '2000px')
			.attr('height', '2000px');

	for (var i = 0; i < d3.entries(this.graph).length; i++) {
		construct_from_node(d3.entries(this.graph)[i]);
	}

	function construct_from_node(node) {

		var plant_location = projection.fromLatLngToDivPixel(new google.maps.LatLng(node.value.plant.coordinates[0], node.value.plant.coordinates[1]));

		var origin = origins.append('svg');

		origin.append('circle')
				.attr("r", 4.5)
				.attr("cx", plant_location.x)
				.attr("cy", plant_location.y);

		origin.append('text')
				.attr("x", plant_location.x + 10)
				.attr("y", plant_location.y)
				.attr("dy", ".31em")
				.text(function () { return node.key; });

		var destinations = (d3.entries(node.value)).filter(function (element) {
			return element.key != 'plant';
		});

		var destination_location;
		for (var i = 0; i < destinations.length; i++) {
			destination_location = projection.fromLatLngToDivPixel(new google.maps.LatLng(destinations[i].value.zip.coordinates[0], destinations[i].value.zip.coordinates[1]));

			origin
					.append('line')
					.attr("x1", plant_location.x)
					.attr("x2", destination_location.x)
					.attr("y1", plant_location.y)
					.attr("y2", destination_location.y)
					.attr('class', 'edge')
					.style('stroke', "rgb(255,0,0)")
					.style('stroke-width', '1');

		}

	}

	this.layer = layer;

}; // overlay.prototype.onAdd = function() { ... }

ArcGraphOverlay.prototype.draw = function () {

	var layer = this.layer;

	// svgs will position correctly on pan, so we only need to correct zoom change
	if (this.map.zoom != this.last_zoom) {
		this.last_zoom = this.map.zoom;

	}

	this.layer = layer;

}; // overlay.prototype.draw = function() { ... }

ArcGraphOverlay.prototype.onRemove = function () {

}; // overlay.prototype.onRemove = function() { ... }
