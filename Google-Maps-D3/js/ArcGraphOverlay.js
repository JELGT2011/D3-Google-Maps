
//ArcGraphOverlay.prototype = new google.maps.OverlayView();
//
//function ArcGraphOverlay(bounds, svgs, map) {
//
//	this.bounds_ = bounds;
//	this.svgs_ = svgs;
//	this.map_ = map;
//
//	this.div_ = null;
//
//	this.setMap(map);
//}
//
//ArcGraphOverlay.prototype.onAdd = function() {
//
//	var div = document.createElement('div');
//	div.style.borderStyle = 'none';
//	div.style.borderWidth = '0px';
//	div.style.position = 'absolute';
//
//	var svg = document.createElement('svg');
//	div.appendChild(svg);
//
//	this.div_ = div;
//
//	var panes = this.getPanes();
//	panes.overlayLayer.appendChild(div);
//
//};
//
//ArcGraphOverlay.prototype.draw = function() {
//
//	var overlayProjection = this.getProjection();
//
//	var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
//	var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());
//
//	// Resize the image's div to fit the indicated dimensions.
//	var div = this.div_;
//	div.style.left = sw.x + 'px';
//	div.style.top = ne.y + 'px';
//	div.style.width = (ne.x - sw.x) + 'px';
//	div.style.height = (sw.y - ne.y) + 'px';
//};

