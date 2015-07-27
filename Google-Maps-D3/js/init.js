$(document).ready(function () {

	var map_style = [
		{
			"stylers": [
				{"visibility": "off"}
			]
		}
	];

	var layer_style = {
		strokeWeight: 0.5,
		visible: true
	};

	var styled_map = new google.maps.StyledMapType(map_style, {name: "Styled Map"});

	var map_options = {
		zoom: 4,
		center: new google.maps.LatLng(47.1, -122.32),
		mapTypeControlOptions: {
			mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
		}
	};

	// Create the Google Map…
	var map = new google.maps.Map(d3.select("#map").node(), map_options);

	map.mapTypes.set('map_style', styled_map);
	map.setMapTypeId('map_style');

	map.data.loadGeoJson("data/countries.geojson");
	map.data.setStyle(layer_style);

	var graph = {};

	google.maps.event.addListenerOnce(map, 'idle', function () {

		d3.csv('data/carlisle_transport.csv', function (data) {

			for (var i = 0; i < data.length; i++) {

				if (!graph[data[i].PLANT]) {
					graph[data[i].PLANT] = {
						'plant': {
							'name': data[i].PLANT,
							'coordinates': [
								data[i].PLANT_LAT,
								data[i].PLANT_LNG
							]
						}
					};
				}

				graph[data[i].PLANT][data[i].DESTINATION] = {
					'shipments': data[i].SHIPMENTS,
					'country': {
						'name': data[i].DESTINATION_COUNTRY
					},
					'state': {
						'name': data[i].DESTINATION_STATE,
						'coordinates': [
							data[i].DESTINATION_STATE_LAT,
							data[i].DESTINATION_STATE_LNG
						]
					},
					'zip': {
						'name': data[i].DESTINATION_ZIP,
						'coordinates': [
							data[i].DESTINATION_ZIP_LAT,
							data[i].DESTINATION_ZIP_LNG
						]
					}
				};

			} // for (var i = 0; i < data.length; i++) { ... }

			var overlay = new google.maps.OverlayView();

			// Add the container when the overlay is added to the map.
			overlay.onAdd = function () {
				var layer = d3.select(this.getPanes().overlayLayer).append("div")
						.attr("class", "stations");

				// Draw each marker as a separate SVG element.
				// We could use a single SVG, but what size would it have?

				var projection = this.getProjection(),
						padding = 10;

				var markers = layer.selectAll("svg")
						.data(d3.entries(graph))
						.each(create_origin) // update existing markers
						.enter().append("svg:svg")
						.each(create_origin)
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
						.data(d3.entries(graph))
						.each(create_edges)
						.enter().append('svg:svg')
						.each(create_edges)
						.attr('class', 'edge');

				function create_origin(node) {

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

					for (var i = 0; i < destinations.length; i++) {
						var destination_location = projection.fromLatLngToDivPixel(new google.maps.LatLng(destinations[i].value.state.coordinates[0], destinations[i].value.state.coordinates[1]));

						//debugger;
						layer.append('svg')
								.attr("class", "dankykang")
								.attr('left', Math.min(plant_location.x, destination_location.x) + 'px')
								.attr('top', Math.max(plant_location.y, destination_location.y) + 'px')
								.attr('width', Math.round(Math.abs(plant_location.x - destination_location.x)) + 'px')
								.attr('height', Math.round(Math.abs(plant_location.y - destination_location.y)) + 'px')
								.attr('width', '2000px')
								.attr('height', '1000px')
								.append('line')
								.attr("x1", plant_location.x)
								.attr("x2", destination_location.x)
								.attr("y1", plant_location.y)
								.attr("y2", destination_location.y)
								.style('stroke', "rgb(255,0,0")
								.style('stroke-width', '1');
					}

				}

			}; // overlay.onAdd = function() { ... }

			overlay.draw = function () {

			}; // overlay.draw = function() { ... }

			overlay.setMap(map);

		}); // d3.csv('data/carlisle_transport.csv', function() { ... })

	}); // google.maps.event.addListenerOnce(map, 'idle', function() { ... })

}); // $(document).ready(function() { ... })
