var map;

function initMap() {

  var myLatLng = {lat: 56.1304, lng: -106.3468};

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
    center: myLatLng
    // center: new google.maps.LatLng(-75.296943664551,45.391666412354)
  });

  var marker = new google.maps.Marker({
    position: myLatLng,
    map: map,
    title: 'Hello World!'
  });

  map.data.loadGeoJson('static/data/test.json');
}

