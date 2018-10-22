/*
  Custom functionality.
  - search + drop marker aren't working
  - geolocate and drop pin also not working
  - add google tag manager
    - for click on markers
    - and for search terms
*/

var map;
var infoWindow;


function initializeMap() {
	// Create the map using gmaps
	map = new GMaps({
	  el: '#mapcanvas',
	  lat: 56.1304,
	  lng: -106.3468,
	  zoom: 4,
	  fullscreenControl: false,
	  zoomControl: true,
	  streetViewControl: true,
	  mapTypeControlOptions: {
	    style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
	    position: google.maps.ControlPosition.BOTTOM_RIGHT,
	    mapTypeIds: ['roadmap', 'terrain']
	  },
	  zoomControlOptions: {
	    position: google.maps.ControlPosition.RIGHT_BOTTOM
	  },
	  streetViewControlOptions: {
	  	position: google.maps.ControlPosition.RIGHT_BOTTOM
	  },
	});


	addSearchBar();
	addGeolocation();
	addHelpModalControl();
	addBackButtonControl();
  loadAndDrawData();
}

/**
 * Loads the data and adds markers.
 */
function loadAndDrawData() {
  map.map.data.loadGeoJson('../data/dataset.json');
  // Style markers
  map.map.data.setStyle(function(feature) {
      var color = 'FF0000';
      var symbol = '%E2%80%A2';  // dot

      return /** @type {google.maps.Data.StyleOptions} */ {
          visible: feature.getProperty('active'),
          icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 1,
              strokeColor:"rgb(213, 35, 32)"
          },
      };
  });
  map.map.data.addListener('addfeature', function (o) {
      drawCircleOverlays(o.feature);
  });
}

/**
 * Draw circle overlays for map markers.
 */
function drawCircleOverlays(feature) {
  var circle = new google.maps.Circle({
    map: map.map,
    radius: 8046, // 5 miles in meters
    fillColor: "rgb(213, 35, 32)",
    fillOpacity: 0.50,
    strokeWeight: 2,
    strokeColor: "#F7FC4F"
  });

  var placeholderMarker = new google.maps.Marker({
      position: feature.getGeometry().get(),
      visible: false,
      map: map.map,
  });

  circle.bindTo('center', placeholderMarker, 'position');
  google.maps.event.addListener(circle, 'click', function(ev){
    addInfoWindowToCircle(feature, circle);
  });
}

/**
 * Adds an InfoWindow to each circle on the map with
 * airport information.
 */
function addInfoWindowToCircle(feature, circle) {
  var infoWindow = new google.maps.InfoWindow;
  var airport_name = feature.getProperty('airport_name');
  var airport_type = feature.getProperty('airport_type');

  var contentString =
    '<div id="content">'+
      '<p class="modal-header">' + airport_name + '</p>'+
      '<p>' + airport_type + '</p>'+
      '<div class="modal-content">'+
        '<p><a>More' + '</a></p>'+
        '<p><a>Request Permission' + '</a></p>'+
      '</div>'+
      '</div>';

  infoWindow.setContent("<div class='infoWindow'>"+contentString+"</div>");
  infoWindow.setPosition(circle.getCenter());
  infoWindow.open(map.map);
}

/**
 * Adds the search bar to the map and on click handler.
 */
function addSearchBar() {
	var input = document.getElementById('search-bar');
	map.addControl({
	  position: 'top_center',
	  content: input,
	  style: {
	    title: 'Search',
	  },
	  events: {
	    click: function(){
	      searchAutocomplete();
	    }
	  },
	});
}

/**
 * Search and autcomplete handler.
 */
function searchAutocomplete() {
	var markers = [];
	var input = document.getElementById('search-input');
	var searchBox = new google.maps.places.SearchBox(input);
	google.maps.event.addListener(searchBox,'places_changed', function() {
    var places = searchBox.getPlaces();
    if (places.length == 0) {
      return;
    }
    for (var i = 0, marker; marker = markers[i]; i++) {
      marker.setMap(null);
    }

    // For each place, get the icon, place name, and location.
    markers = [];
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0, place; place = places[i]; i++) {

      // Create a marker for each place.
      var marker = new google.maps.Marker({
        map : map.map,
        title: place.name,
        position: place.geometry.location,
      });

      markers.push(marker);
      bounds.extend(place.geometry.location);
    }
    map.map.fitBounds(bounds);
    map.map.setZoom(10);
  });

  google.maps.event.addListener(map.map, 'bounds_changed', function() {
    var bounds = map.map.getBounds();
    searchBox.setBounds(bounds);
  });
}

/**
 * Adds a Help button to the map.
 */
function addHelpModalControl() {
	map.addControl({
	  position: 'top_right',
	  content: "<div class='help-button'> \
	  					<a class='waves-effect waves-light btn-floating btn-small modal-trigger' href='#help-modal'> \
	  					<i class='material-icons'>help_outline</i></a> \
	  					</div> ",
	  style: {
	    title: 'Help',
	  }
	});
}

/**
 * Adds a back button to the map.
 */
function addBackButtonControl() {
	map.addControl({
	  position: 'top_left',
	  content: "<div class='back-button'> \
	  					<a class='waves-effect waves-light btn-small'> \
	  					<i class='material-icons'>arrow_back</i></a> \
	  					</div> ",
	  style: {
	    title: 'Back',
	  },
	  events: {
	    click: function(){
	      window.location.href = "#";
	    }
	  }
	});
}

/**
 * Adds a Geolocate button to the map.
 */
function addGeolocation() {
	map.addControl({
	  position: 'right_bottom',
	  content: "<div class='geolocate'> \
	  					<a class='btn-floating btn-small waves-effect waves-light'> \
	  					<i class='material-icons'>location_searching</i></a> \
	  					</div> ",
	  style: {
	    title: 'Geolocation',
	  },
	  events: {
	    click: function(event){
	      console.log('geolocate me!');
        geolocation(event);
	    }
	  }
	});
}

function geolocation(event) {
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      // Create a marker and center map on user location
      var marker = new google.maps.Marker({
        position: pos,
        animation: google.maps.Animation.DROP,
        map: map.map,
      });

      map.map.setCenter(pos);
      map.setZoom(10);

    }, function() {
      handleLocationError(true, infoWindow, map.map.getCenter());
    });
  }
  google.maps.event.addListener(map, 'bounds_changed', function() {
    var bounds = map.getBounds();
    map.setBounds(bounds);
  });
}

/**
 * Helper function for geolocation.
 */
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
   infoWindow.setPosition(pos);
   infoWindow.setContent(browserHasGeolocation ?
                         'Error: The Geolocation service failed.' :
                         'Error: Your browser doesn\'t support geolocation.');
   infoWindow.open(map.map);
}



