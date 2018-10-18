
var map, infoWindow;

function initMap() {

  var myLatLng = {lat: 56.1304, lng: -106.3468};
  map = new google.maps.Map(document.getElementById('myMap'), {
    zoom: 4,
    center: myLatLng,
    fullscreenControl: false,
    mapTypeControl: false,
    streetViewControl: false
  });

  // Create the DIV to hold the control and call the GeolocateControl()
  // constructor passing in this DIV.
  var geolocateIconDiv = document.createElement('div');
  var geolocateControl = new GeolocateControl(geolocateIconDiv, map);

  geolocateIconDiv.index = 1;
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(geolocateIconDiv);

  // map.data.loadGeoJson('static/data/dataset.json');

  infoWindow = new google.maps.InfoWindow;


    google.maps.event.addListener(map,'click',function() {
        infoWindow.close();
    });
    // build those damn circles
    map.data.setStyle(function(feature) {
        var color = 'FF0000';
        var symbol = '%E2%80%A2';  // dot

        return /** @type {google.maps.Data.StyleOptions} */ {
            visible: feature.getProperty('active'),
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 20,
                fillColor: "rgb(213, 35, 32)",
                fillOpacity: 0.50,
                strokeWeight: 2,
                strokeColor: "#F7FC4F"

            },
        };
    });

  // info window listener
    map.data.addListener('click', function(event) {
      var myHTML = event.feature.getProperty('runway_surface');
      infoWindow.setContent("<div style='width:150px; text-align: center;'>"+myHTML+"</div>");
      infoWindow.setPosition(event.feature.getGeometry().get());
      infoWindow.setOptions({pixelOffset: new google.maps.Size(0,-30)});
      infoWindow.open(map);
    });
   map.data.loadGeoJson('static/data/data-smaller.json');


  // Try HTML5 geolocation.
  // handleGeolocation();
  // Create the search box and link it to the UI element.
  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  initAutocomplete(input, searchBox);
}

/**
 * The GeolocateControl adds a control to the map that geolocates the map on
 * the user's location.
 * This constructor takes the geolocateIcon DIV as an argument.
 * @constructor
 */
function GeolocateControl(controlDiv, map) {

  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor = '#fff';
  controlUI.style.border = '2px solid #fff';
  controlUI.style.borderRadius = '3px';
  controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  controlUI.style.cursor = 'pointer';
  controlUI.style.marginBottom = '22px';
  controlUI.style.textAlign = 'Geolocate';
  controlUI.title = 'Click to geolocate the map';
  controlDiv.appendChild(controlUI);

  // Set CSS for the control interior.
  var controlText = document.createElement('div');
  controlText.style.color = 'rgb(25,25,25)';
  controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlText.style.fontSize = '16px';
  controlText.style.lineHeight = '38px';
  controlText.style.paddingLeft = '5px';
  controlText.style.paddingRight = '5px';
  controlText.innerHTML = 'Geolocate Me!';
  controlUI.appendChild(controlText);

  // Setup the click event listeners: simply set the map to Chicago.
  controlUI.addEventListener('click', function() {
    map.setCenter(chicago);
  });

}

/**
 * [handleGeolocation description]
 * @return {[type]} [description]
 */
function handleGeolocation(){
  if (navigator.geolocation) {
   navigator.geolocation.getCurrentPosition(function(position) {
     var pos = {
       lat: position.coords.latitude,
       lng: position.coords.longitude
     };

     infoWindow.setPosition(pos);
     infoWindow.setContent('Location found.');
     infoWindow.open(map);
     map.setCenter(pos);
   }, function() {
     handleLocationError(true, infoWindow, map.getCenter());
   });
  }
  else {
   // Browser doesn't support Geolocation
   handleLocationError(false, infoWindow, map.getCenter());
  }
}
/**
 * [handleLocationError description]
 * @param  {[type]} browserHasGeolocation [description]
 * @param  {[type]} infoWindow            [description]
 * @param  {[type]} pos                   [description]
 * @return {[type]}                       [description]
 */
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}

function initAutocomplete(input, searchBox) {
  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  var markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }
      var icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      // Create a marker for each place.
      markers.push(new google.maps.Marker({
        map: map,
        icon: icon,
        title: place.name,
        position: place.geometry.location
      }));

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });
}


