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

			var overlay = new ArcGraphOverlay(graph, map);

		}); // d3.csv('data/carlisle_transport.csv', function() { ... })

	}); // google.maps.event.addListenerOnce(map, 'idle', function() { ... })

}); // $(document).ready(function() { ... })
