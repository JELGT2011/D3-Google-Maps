
# Integrating a D3 overlay with Google Maps

This is a sample repository for Decision First Technologies that integrates D3 into Google Maps.  The map is a custom
styled map that can be toggled on and off.  Additionally, we're using RequireJS to control our Javascript loading.

The D3 overlay is added to the map using the overlay component of the Google Maps API.  For the most part, the overlay
is abstracted out into the SVGArcsOverlay.js file.  All of the data being used for the overlay is in the data folder,
loaded in using D3's ability to natively import CSV, JSON, and GEOJSON files.

Screen Shot below.

![Screen Shot](https://github.com/JELGT2011/D3-Google-Maps/blob/master/img/ScreenShot.png)
