/* -----------------------------------------------------------------------------------
   Developed by the Applications Prototype Lab
   (c) 2015 Esri | http://www.esri.com/legal/software-license  
----------------------------------------------------------------------------------- */

require([
    'esri/Map',
    'esri/Camera',
    'esri/views/MapView',
    'esri/views/SceneView',
    'esri/Viewpoint',
    'esri/geometry/Point',
    'esri/geometry/support/webMercatorUtils',
    'dojo/domReady!'
],
function (
    Map,
    Camera,
    MapView,
    SceneView,
    Viewpoint,
    Point,
    webMercatorUtils
    ) {
    $(document).ready(function () {
        // Enforce strict mode
        'use strict';

        // Plane flight details
        var lastTime = null;
        var speed = 0; // m/s, updated by throttle
        var heading = 0; // updated by joystick
        var altitude = 3000; // m, updated by joystick
        var location = new Point({
            x: 779232,
            y: 5780430,
            z: altitude,
            spatialReference: {
                wkid: 102100
            }
        });

        // Initialize maps and views
        var map = new Map({
            basemap: 'satellite'
        });
        var viewMain = new MapView({
            container: 'map',
            map: map,
            zoom: 12,
            rotation: 0,
            center: location
        });
        var viewForward = new SceneView({
            container: 'forward-map',
            map: map,
            camera: {
                heading: 0,
                position: location,
                tilt: 85
            }
        });
        var viewLeft = new SceneView({
            container: 'left-map',
            map: map,
            camera: {
                heading: 270,
                position: location,
                tilt: 80
            }
        });
        var viewRight = new SceneView({
            container: 'right-map',
            map: map,
            camera: {
                heading: 90,
                position: location,
                tilt: 80
            }
        });

        viewMain.ui.components = ['compass', 'zoom'];
        viewForward.ui.components = [];
        viewLeft.ui.components = [];
        viewRight.ui.components = [];

        window.requestAnimationFrame(draw);

        function draw(time) {
            if (map.loaded && lastTime !== null) {
                var t = time - lastTime; // ms
                var d = speed * t / 1000;
                var v = Vector.create([location.x, location.y]);
                var x = Vector.create([0, d]).rotate(-heading * Math.PI / 180, Vector.create([0, 0]));
                var z = v.add(x);

                location.x = z.e(1);
                location.y = z.e(2);
                location.z = altitude;

                viewMain.center = location;
                viewMain.rotation = -heading;
                viewForward.camera = new Camera({
                    heading: heading,
                    position: location,
                    tilt: 85
                });
                viewLeft.camera = new Camera({
                    heading: heading - 90,
                    position: location,
                    tilt: 80
                });
                viewRight.camera = new Camera({
                    heading: heading + 90,
                    position: location,
                    tilt: 80
                });

                var geographic = webMercatorUtils.webMercatorToGeographic(location);

                $('#dial-speed').html(format.format(',')(speed) + ' m/s');
                $('#dial-altitude').html(format.format(',')(altitude) + ' m');
                $('#dial-heading').html(format.format(',')(heading) + '°');
                $('#dial-location-x').html(ConvertDDToDMS(geographic.x, true));
                $('#dial-location-y').html(ConvertDDToDMS(geographic.y, false));
            }
            lastTime = time;
            window.requestAnimationFrame(draw);
        }

        // Function to handle joystick input
        function handleJoystickInput(joystickX, joystickY) {
            // Convert joystick input to desired values
            heading = joystickX * 360; // Assumes joystickX ranges from -1 to 1, convert to degrees (0-360)
            altitude += joystickY * 100; // Assumes joystickY ranges from -1 to 1, convert to meters

            // Clamp altitude within valid range
            if (altitude < 0) {
                altitude = 0;
            }

            // Update the altitude display element if needed
            $('#dial-altitude').html(format.format(',')(altitude) + ' m');
        }

        // Function to handle throttle input
        function handleThrottleInput(throttleValue) {
            // Convert throttle input to desired speed range
            speed = throttleValue * 1000; // Assumes throttleValue ranges from 0 to 1, convert to meters per second

            // Update the speed display element if needed
            $('#dial-speed').html(format.format(',')(speed) + ' m/s');
        }

        // Simulated joystick and throttle input update loop
        setInterval(function() {
            // Simulated values for joystick and throttle inputs (replace with actual input reading code)
            var joystickX = 0.5; // Example: joystick X-axis value (ranging from -1 to 1)
            var joystickY = 0.8; // Example: joystick Y-axis value (ranging from -1 to 1)
            var throttleValue = 0.7; // Example: throttle value (ranging from 0 to 1)

            handleJoystickInput(joystickX, joystickY);
            handleThrottleInput(throttleValue);
        }, 100); // Update every 100 milliseconds (adjust this according to your needs)

        // Rest of the code...
        // ...
    });
});

// --------------------------------------------------------------------------------------------
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// RequestAnimationFrame polyfill by Erik Möller
// Fixes from Paul Irish and Tino Zijdel
// --------------------------------------------------------------------------------------------
(function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
                                      window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () { callback(currTime + timeToCall); }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
    }
}());
