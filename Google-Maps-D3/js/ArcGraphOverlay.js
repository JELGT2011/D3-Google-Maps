
ArcGraphOverlay.prototype = new google.maps.OverlayView();

function ArcGraphOverlay(graph, map) {

	this.graph = graph;
	this.map = map;
	this.last_zoom = 0;
	this.setMap(map);

} // function ArcGraphOverlay(graph) { ... }

ArcGraphOverlay.prototype.onAdd = function () {

	var layer = d3.select(this.getPanes().overlayLayer).append("div")
			.attr("class", "stations");

	var projection = this.getProjection(),
			padding = 10;

	var markers = layer.selectAll("svg")
			.data(d3.entries(this.graph))
			.enter().append("svg:svg")
			.each(create_origins)
			.attr("class", "marker");

	// Add a circle.
	markers.append("circle")
			.attr("r", 4.5)
			.attr("cx", padding)
			.attr("cy", padding);

	// Add a label.
	markers.append("svg:text")
			.attr("x", padding + 7)
			.attr("y", padding)
			.attr("dy", ".31em")
			.text(function (d) {
				return d.key;
			});

	var edges = layer.selectAll('svg')
			.data(d3.entries(this.graph))
			.each(create_edges)
			.enter().append('svg:svg')
			.each(create_edges);

	function create_origins(node) {

		var plant_location = projection.fromLatLngToDivPixel(new google.maps.LatLng(node.value.plant.coordinates[0], node.value.plant.coordinates[1]));

		return d3.select(this)
				.style("left", (plant_location.x - padding) + "px")
				.style("top", (plant_location.y - padding) + "px");
	}

	function create_edges(node) {

		var destinations = (d3.entries(node.value)).filter(function (element) {
			return element.key != 'plant';
		});

		var plant_location = projection.fromLatLngToDivPixel(new google.maps.LatLng(node.value.plant.coordinates[0], node.value.plant.coordinates[1]));

		var origin = d3.select(this)
				.style("left", (plant_location.x - padding) + "px")
				.style("top", (plant_location.y - padding) + "px");

		var destination_location;
		for (var i = 0; i < destinations.length; i++) {
			destination_location = projection.fromLatLngToDivPixel(new google.maps.LatLng(destinations[i].value.zip.coordinates[0], destinations[i].value.zip.coordinates[1]));

			layer.append('svg')
					.attr('left', Math.min(plant_location.x, destination_location.x) + 'px')
					.attr('top', Math.max(plant_location.y, destination_location.y) + 'px')
					.attr('width', '2000px')
					.attr('height', '2000px')
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

}; // overlay.prototype.onAdd = function() { ... }

ArcGraphOverlay.prototype.draw = function () {

	// svgs will position correctly on pan, so we only need to correct zoom change
	if (this.map.zoom != this.last_zoom) {
		this.last_zoom = this.map.zoom;

	}

}; // overlay.prototype.draw = function() { ... }

ArcGraphOverlay.prototype.onRemove = function() {

}; // overlay.prototype.onRemove = function() { ... }
