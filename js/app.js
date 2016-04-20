/**
 * Inizializing Global variables
 */
var

/**
 * this variable hold our google map
 */
map,

/**
 * This is the infoWindow that GMap Provide
 */
infoWindow,

/**
 * The markers of the GMap is ko observableArray
 * @type {ko observable Array}
 */
markers = ko.observableArray(),

/**
 * This variable will hold our viewModel
 */
vmodel;

/**
 * Add mapBounds property to the window object
 * @type {google}
 */
window.mapBounds = new google.maps.LatLngBounds();


/**
 * [Model description] : This object is our model/data
 * it holds places which we need to show on map etc
 * @type {Object}
 */
var Model = {
    /**
     * this property hold the current place when marker/ list item click
     * @type {Array}
     */
    currentPlace : null,


    /**
     * This is the array of objects that holds informations
     * of the place
     * @type {Array}
     * @childrenType {Object}
     */
    allPlaces : [
        {
            name: "Gateway Of India",
            location: { lat: 18.922003, lng: 72.834654},
            wiki : null
        },
        {
            name: "The Taj Mahal Palace",
            location: { lat: 18.921747, lng: 72.833031},
            wiki : null
        },
        {
            name: "Chhatrapati Shivaji Terminus",
            location: { lat: 18.939839, lng: 72.835468},
            wiki : null
        },
        {
            name: "Elephanta Island",
            location: { lat: 18.903720, lng: 72.813143},
            wiki : null
        },
        {
            name: "Churchgate",
            location: { lat: 18.932247, lng: 72.826316},
            wiki : null
        },
    ]
};

/**
 * InitMap initializes google map and apply knockout
 * binding to our viewmodel
 * @type { function }
 */
function initMap() {
    /**
     * Create a google map
     * @type {google}
     */
    map = new google.maps.Map(document.getElementById('map'), {
        zoomControl: true,
    });

    /**
     * Invoking createMarkers function
     */
    createMarkers(Model.allPlaces);

    /**
     * This is the infowindow provided by google, a litte
     * window that pops up when marker clicks
     * @type {google}
     */
    infoWindow = new google.maps.InfoWindow({maxWidth: 300});

    /**
     * vmodel creates a new viewModel
     * @type {viewModel}
     */
    vmodel = new viewModel();

    /**
     * Apply ko binding to the vmodel
     */
    ko.applyBindings(vmodel);

}

/**
 * This function creates map markers on the google map
 * @param  {array} allPlaces is the array containg place objects
 */
function createMarkers(allPlaces) {
    /**
     * Initializing function variables
     */
    var
    place,
    i,
    bounds,
    allPlacesLength = allPlaces.length;

    /**
     * This loop itterates over the allPlace array
     * and create map marker for every place and place
     * on the map
     */
    for(i = 0; i < allPlacesLength; i++) {
        //current place
        place = allPlaces[i];

        /**
         * Get WikiMedia information about this place
         */
        getWikiInfo(place, i);

        bounds = window.mapBounds;

        /**
         * Create a new marker for this place and assign
         * to the current map we have `map`
         * @type {google}
         */
        marker = new google.maps.Marker({
            animation: google.maps.Animation.DROP,
            position: place.location,
            map: map,
            title: place.name
        });

        /**
         * Adding ClickListner to the marker so that when it clicks
         * it performs the action we provide
         * @param  {object} place)
         * @return {function} return a function that set currentPlace to this object
         * (only when this marker) and showInfoWindow
         */
        marker.addListener('click', (function(place) {
            return function() {
                /**
                 * This IIFE set the place clicked on the currentPlace property of
                 * model so that we can access the clicked marker. Note it is not copying
                 * place to currentPlace, it is giving reference to the place
                 * @param  {object} place)
                 */
                (function(place) { Model.currentPlace = place; })(place);

                /**
                 * invoking showInfoWindow
                 */
                showInfoWindow();
            };
        })(place));

        /**
         * Extend the map boundry so that this marker include in map
         * current visible region
         */
        bounds.extend(new google.maps.LatLng(place.location.lat, place.location.lng));

       /**
        * Fit map to the boundry
        */
        map.fitBounds(bounds);

        /**
         * center the map
         */
        map.setCenter(bounds.getCenter());

        /**
         * Push the newly created marker to the markers array
         * which is ko observable, used for tracking markers
         */
        markers.push(marker);
    }
}


/**
 * Get Information from wikipedia about the place
 * @param  {object} place This is the place object
 * @param  {integer} i  This is the current index of this place
 */
var getWikiInfo = function(place, i) {
    var wikiEndpoint = "https://en.wikipedia.org/w/api.php?action=opensearch&search="+place.name+"&format=json";

    /**
     * Get data using ajax and set the response to
     * current Model allPlaces object property wiki
     */
    $.ajax({
        url: wikiEndpoint,
        dataType: "jsonp",
        success: function(data) {
            Model.allPlaces[i].wiki = data[2][0];
        }
    });
}


/**
 * This function shows a little infoWindow when marker clicked
 */
showInfoWindow = function() {

    var
    currentPlace = Model.currentPlace,

    index = Model.allPlaces.indexOf(currentPlace),

    content = '<div class="info-window">';
    content += '<h4>'+ currentPlace.name +'</h4>';
    if(currentPlace.wiki == null) {
        content += '<p>Sorry! Unable to load wikipedia information</p>';
    }
    else {
        content += '<p>' + currentPlace.wiki +'</p>';
    }

    /**
     * Set infoWindow content
     */
    infoWindow.setContent(content);

    /**
     * Center the infoWindow on map
     */
    map.panTo(currentPlace.location);

    /**
     * Open the infowindow on the current map i.e `map` and
     * on above of the marker which we clicked
     */
    infoWindow.open(map, markers()[index]);
};

/**
 * Adding resize listner and resize the map when listner triggers
 */
window.addEventListener('resize', function(e) {
  //Make sure the map bounds get updated on page resize
    map.fitBounds(mapBounds);
});




/**
 * KnockOut viewModel
 */
var viewModel = function() {
  var self = this;

  /**
   * This will hold all places information created
   * from Model.allPlaces and is ko observable Array
   * @type {[type]}
   */
  self.places = ko.observableArray(Model.allPlaces);

  /**
   * The text which is used to filter the places
   * it is ko observable so its value change
   * when user filter the list of places
   * @type {[type]}
   */
  self.filterText = ko.observable('');

  /**
   * This is the function that shows InfoWindow
   * when the places in the list clicked
   * @param  {object} place This is the place which is
   * sent by knockout from view when the place item is clicked
   */
  self.showInfoWindowWhenClicked = function(place) {
    /**
     * Set Model currentPlace property to this property
     * @type {[type]}
     */
    Model.currentPlace = place;

    /**
     * Get the index of this place in the allPlaces array
     * @type {integer}
     */
    var index = Model.allPlaces.indexOf(place);

    var listGroup = $('.list-group-item');

    /**
     * Select the current list group element
     */
    var el = listGroup[index];


    /**
     * Itterate over every item of listGroup
     */
    listGroup.each(function(placeIndex){
        /**
         * remove class active from all the listGroup items
         * which are not clicked
         */
        if(index != placeIndex) $(listGroup[placeIndex]).removeClass('active');
    });


    /**
     * Toggle the class of the clicked item
     */
    $(el).toggleClass('active');

    /**
     * invokes the showInfoWindow function if clicked first
     * time or you can say active class is present otherwise close
     * the infoWindow
     */
    $(el).hasClass('active') ? showInfoWindow() : infoWindow.close();

  };

  /**
   * Filter the place list and markers on map when
   * user filter the list
   */
  self.filter = ko.computed(function(){

    /**
     * First close the infoWindow if open
     */
    infoWindow.close();

    /**
     * Itterate over the markers (ko observable) array
     * and for each object which are not visible or not
     * bound to map, make visible and bound to the map
     * @param  {markers object} obj)
     */
    markers().forEach(function(obj) {
        if(!obj.visible) obj.visible = true;
        if(obj.getMap() === null) obj.setMap(map);
    });

    /**
     * Filter left places are the places which are don't match the
     * filter
     */
    var filterLeftPlaces = ko.utils.arrayFilter(self.places(), function(places){
        return places.name.toLowerCase().indexOf(self.filterText().toLowerCase()) == -1;
    });


    var
    index,
    marker;

    /**
     * Itterate over the filterLeftPlaces and for every
     * object make its marker visibile property
     * false and set the map to which the marker is bound
     * to null
     * @param  {[type]} obj)     */
    filterLeftPlaces.forEach(function(obj) {
        index = Model.allPlaces.indexOf(obj);
        marker = markers()[index];
        marker.visible = false;
        marker.setMap(null);
    });

    /**
     * @return {array} At last return the filtered array
     */
    return ko.utils.arrayFilter(self.places(), function(places){
        return places.name.toLowerCase().indexOf(self.filterText().toLowerCase()) >= 0;
    });

  });

};

/**
 * Initialize map when browser finish loading
 */
$(document).ready(function() {
    initMap();
})