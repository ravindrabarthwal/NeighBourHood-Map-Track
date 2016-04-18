var map, markers = [];
 var locations = [
  {"name" : "Hyderabad", "marker": null},
  {"name" : "Gujarat", "marker": null},
  {"name" : "Noida", "marker": null},
  {"name" : "Nagpur", "marker": null},
  {"name" : "Mumbai", "marker": null},
  {"name" : "Bangalore", "marker": null},
  {"name" : "West Bengal", "marker": null},
];

var viewModel = function() {
  var self = this;

  self.places = ko.observableArray(locations);

  self.filterText = ko.observable('');

  self.filter = ko.computed(function(){

    return ko.utils.arrayFilter(self.places(), function(places){
        return places.name.toLowerCase().indexOf(self.filterText().toLowerCase()) >= 0;
    });
  });
};
var vm = new viewModel();
ko.applyBindings(vm);

/*
This is the fun part. Here's where we generate the custom Google Map for the website.
See the documentation below for more details.
https://developers.google.com/maps/documentation/javascript/reference
*/

/*
Start here! initializeMap() is called when page is loaded.
*/
function initializeMap() {
  var mapOptions = {
    disableDefaultUI: true
  };

  /*
  For the map to be displayed, the googleMap var must be
  appended to #mapDiv in resumeBuilder.js.
  */
  map = new google.maps.Map(document.querySelector('#map'), mapOptions);


  /*
  createMapMarker(placeData) reads Google Places search results to create map pins.
  placeData is the object returned from search results containing information
  about a single location.
  */
  function createMapMarker(placeData) {

    // The next lines save location data from the search result object to local variables
    var lat = placeData.geometry.location.lat();  // latitude from the place service
    var lon = placeData.geometry.location.lng();  // longitude from the place service
    var name = placeData.formatted_address;   // name of the place from the place service
    var bounds = window.mapBounds;            // current boundaries of the map window

    // marker is an object with additional data about the pin for a single location
    var marker = new google.maps.Marker({
      map: map,
      position: placeData.geometry.location,
      title: name
    });

    // infoWindows are the little helper windows that open when you click
    // or hover over a pin on a map. They usually contain more information
    // about a location.
    var infoWindow = new google.maps.InfoWindow({
      content: name
    });

    // hmmmm, I wonder what this is about...
    google.maps.event.addListener(marker, 'click', function() {

    });

    // this is where the pin actually gets added to the map.
    // bounds.extend() takes in a map location object
    bounds.extend(new google.maps.LatLng(lat, lon));
    // fit the map to the new marker
    map.fitBounds(bounds);
    // center the map
    map.setCenter(bounds.getCenter());
    markers.push(marker);
  }

  /*
  callback(results, status) makes sure the search returned results for a location.
  If so, it creates a new map marker for that location.
  */
  function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      createMapMarker(results[0]);
    }
  }

  /*
  pinPoster(locations) takes in the array of locations
  and fires off Google place searches for each location
  */
  function pinPoster(locations) {

    // creates a Google place search service object. PlacesService does the work of
    // actually searching for location data.
    var service = new google.maps.places.PlacesService(map);

    var locationsLength = locations.length;
    // Iterates through the array of locations, creates a search object for each location
      for(var i = 0; i < locationsLength; i++){
      // the search request object
      var request = {
        query: locations[i].name
      };

      // Actually searches the Google Maps API for location data and runs the callback
      // function with the search results after each search.
      service.textSearch(request, callback);
    }
  }

  // Sets the boundaries of the map based on pin locations
  window.mapBounds = new google.maps.LatLngBounds();

  // pinPoster(locations) creates pins on the map for each location in
  // the locations array
  pinPoster(locations);

}


// Calls the initializeMap() function when the page loads
window.addEventListener('load', initializeMap);

/*Vanilla JS way to listen for resizing of the window
and adjust map bounds*/
window.addEventListener('resize', function(e) {
  //Make sure the map bounds get updated on page resize
 map.fitBounds(mapBounds);
});
