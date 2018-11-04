function initMap() {
    var markerArray = [];

    // Instantiate a directions service.
    var directionsService = new google.maps.DirectionsService; 

    // Create a map and center it on Manhattan.
    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 13,
      center: {lat: 42.8864, lng: -73.974}
    });

    // Create a renderer for directions and bind it to the map.
    var directionsDisplay = new google.maps.DirectionsRenderer({map: map});

    // Instantiate an info window to hold step text.
    var stepDisplay = new google.maps.InfoWindow;

    // Display the route between the initial start and end selections.
    calculateAndDisplayRoute(
        directionsDisplay, directionsService, markerArray, stepDisplay, map);
    // Listen to change events from the start and end lists.
    var onChangeHandler = function() {
      calculateAndDisplayRoute(
          directionsDisplay, directionsService, markerArray, stepDisplay, map);
    };
    document.getElementById('btnSearch').addEventListener('click', onChangeHandler);
  }

  function calculateAndDisplayRoute(directionsDisplay, directionsService,
      markerArray, stepDisplay, map) {
    // First, remove any existing markers from the map.
    for (var i = 0; i < markerArray.length; i+=10) {
      markerArray[i].setMap(null);
    }

    // Retrieve the start and end locations and create a DirectionsRequest using
    // WALKING directions.
    directionsService.route({
      origin: document.getElementById('start').value,
      destination: document.getElementById('end').value,
      travelMode: 'WALKING'
    }, function(response, status) {
      // Route the directions and pass the response to a function to create
      // markers for each step.
      if (status === 'OK') {
        document.getElementById('warnings-panel').innerHTML =
            '<b>' + response.routes[0].warnings + '</b>';
        directionsDisplay.setDirections(response);
        showSteps(response, markerArray, stepDisplay, map);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  }

  function showSteps(directionResult, markerArray, stepDisplay, map) {
    // For each step, place a marker, and add the text to the marker's infowindow.
    // Also attach the marker to an array so we can keep track of it and remove it
    // when calculating new routes.
    var myRoute = directionResult.routes[0].legs[0];
    var length = myRoute.steps.length;
    for (var i = 0; i < myRoute.steps.length; i+=10) {
      var startLoc = myRoute.steps[i].start_location.lat();
      var startLng = myRoute.steps[i].start_location.lng();
      var latlng = {lat: parseFloat(startLoc), lng: parseFloat(startLng)};
      retrieveWeatherData(stepDisplay, markerArray, startLoc, startLng, map, i);
  }

  function retrieveWeatherData(stepDisplay, markerArray, startLat, startLng, map, i) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var response = xhttp.responseText;
        console.log("ok" + response);
        try {
            var obj = JSON.parse(response);
            var text = "<b>Min Temperature: </b>" + String(obj.main.temp_min) + "°F<br/><b>Current Temperature: </b>" + String(obj.main.temp) + "°F <br/><b>Max Temperature: </b>" + String(obj.main.temp_max) + "°F<br/><b>Wind speed:</b> " + String(obj.wind.speed) +  "m/s<br/><b>Wind Direction:</b>" + toTextualDescription(obj.wind.deg) + "<br/><b>Description:</b> " + String(obj.weather[0].description);
            var iconImg = obj.weather[0].icon;
            var iconUrl = "http://openweathermap.org/img/w/" + iconImg + ".png";

            var iconImage = {
                url: iconUrl
                }
              var marker = markerArray[i] = markerArray[i] || new google.maps.Marker({icon: iconImage});
                marker.setMap(map);

                marker.setPosition(myRoute.steps[i].start_location);
                attachInstructionText(
                    stepDisplay, marker, startLat, startLng, map, text);
        }
        catch(Err) {

        }
      }
    }
    var url = "https://api.openweathermap.org/data/2.5/weather?lat=" + String(startLat) + "&lon=" + startLng + "&units=imperial&appid=74988416486a288ee4fb42ad68d06c2c";
    xhttp.open("GET", url, true);

    xhttp.send();
  }
  
  function  toTextualDescription(degree){
    if (degree>337.5) return 'Northerly';
    if (degree>292.5) return 'North Westerly';
    if(degree>247.5) return 'Westerly';
    if(degree>202.5) return 'South Westerly';
    if(degree>157.5) return 'Southerly';
    if(degree>122.5) return 'South Easterly';
    if(degree>67.5) return 'Easterly';
    if(degree>22.5){return 'North Easterly';}
    return 'Northerly';
}

  function attachInstructionText(stepDisplay, marker, startLoc, startLng, map, text) {
    google.maps.event.addListener(marker, 'click', function() {
      // Open an info window when the marker is clicked on, containing the text
      // of the step.
        // Typical action to be performed when the document is ready:
        
        stepDisplay.setContent(text);
        stepDisplay.open(map, marker);   
        });
      }
    }
