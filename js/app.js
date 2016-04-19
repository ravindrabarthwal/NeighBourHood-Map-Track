/*
This is the Model of our application here all the data
will be stored, it contains to properties currentPlace and allPlaces,
allPlaces is the array of object which holds value for the specific place.
*/
var Model = {
    currentPlace : null,

    allPlaces : [
        {
            name: "PVS Mall",
            location: { lat: 28.952776, lng: 77.731523},
        },
        {
            name: "Hotel Harmony Inn",
            location: { lat: 28.966971, lng: 77.732063},
        },
        {
            name: "Chaudhary Charan Singh University",
            location: { lat: 28.969006, lng: 77.741132},
        },
        {
            name: "The Yellow Chilli",
            location: { lat: 28.967028, lng: 77.736088},
        },
        {
            name: "Shopprix Mall",
            location: { lat: 28.947669, lng: 77.675443},
        },
    ]
};

//Initialize variables
var
map, //Google map will be used for this
//This is the infoWindow that GMap Provide
infoWindow,
//The markers of the GMap
markers = ko.observableArray();

window.mapBounds = new google.maps.LatLngBounds();

//Initialize Map Function
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoomControl: true,
    });

    //Create Markers from allPlaces array
    createMarkers(Model.allPlaces);

    infoWindow = new google.maps.InfoWindow();

    //Apply Knockout Binding
    ko.applyBindings(new viewModel());

}

//Create Map Marker Function
function createMarkers(allPlaces) {
    var
    place,
    i,
    bounds,
    lat,
    lon,
    allPlacesLength
    allPlacesLength = allPlaces.length;

    //Itterate over the allPlaces Array
    for(i = 0; i < allPlacesLength; i++) {

        place = allPlaces[i];
        lat = place.location.lat;
        lon = place.location.lng;
        bounds = window.mapBounds;

        //create a marker for the current selected place
        marker = new google.maps.Marker({
            animation: google.maps.Animation.DROP,
            position: place.location,
            map: map,
            title: place.name
        });

        //Add Click Listner to the Marker
        marker.addListener('click', (function(place) {
            return function() {
                //Used IIFE and set the currentPlace to the place
                (function(place) { Model.currentPlace = place; })(place);
                //Show Info Window
                showInfoWindow();
            };
        })(place));

        bounds.extend(new google.maps.LatLng(lat, lon));
        // fit the map to the new marker
        map.fitBounds(bounds);
        // center the map
        map.setCenter(bounds.getCenter());

        //Push the current marker obj to ko observable Array
        markers.push(marker);
    }
}

//Show Info Window Function
showInfoWindow = function() {
    var
    currentPlace = Model.currentPlace,
    index = Model.allPlaces.indexOf(currentPlace),
    content = '<div class="info-window">';
    content += '<h4>'+ currentPlace.name +'</h4>';
    infoWindow.setContent(content);
    map.panTo(currentPlace.location);
    //Open the map which is clicked
    infoWindow.open(map, markers()[index]);
};


window.addEventListener('resize', function(e) {
  //Make sure the map bounds get updated on page resize
    map.fitBounds(mapBounds);
});


//Knockout viewModel
var viewModel = function() {
  var self = this;

  self.places = ko.observableArray(Model.allPlaces);

  self.filterText = ko.observable('');

  self.showInfoWindowWhenClicked = function(place) {
    Model.currentPlace = place;
    var index = Model.allPlaces.indexOf(place);
    var listGroup = $('.list-group-item');
    var el = listGroup[index];
    listGroup.each(function(placeIndex){
        if(index != placeIndex) $(listGroup[placeIndex]).removeClass('active');
    });
    $(el).toggleClass('active');
    $(el).hasClass('active') ? showInfoWindow() : infoWindow.close();


  };

  //A function that filter list and marker
  self.filter = ko.computed(function(){
    infoWindow.close();

    markers().forEach(function(obj) {
        if(!obj.visible) obj.visible = true;
        if(obj.getMap() === null) obj.setMap(map);
    });

    var filterLeftPlaces = ko.utils.arrayFilter(self.places(), function(places){
        return places.name.toLowerCase().indexOf(self.filterText().toLowerCase()) == -1;
    });
    var
    index,
    marker;

    filterLeftPlaces.forEach(function(obj) {
        index = Model.allPlaces.indexOf(obj);
        marker = markers()[index];
        marker.visible = false;
        marker.setMap(null);
    });

    return ko.utils.arrayFilter(self.places(), function(places){
        return places.name.toLowerCase().indexOf(self.filterText().toLowerCase()) >= 0;
    });

  });

};

//Initialize Map when ready
$(document).ready(function() {
    initMap();
})