require([
    'esri/Map',
    'esri/Camera',
    'esri/views/MapView',
    'esri/views/SceneView',
    'esri/Viewpoint',
    'esri/geometry/Point',
    'esri/geometry/support/webMercatorUtils',
    'dojo/domReady!'
], function (
    Map,
    Camera,
    MapView,
    SceneView,
    Viewpoint,
    Point,
    webMercatorUtils
) {
    $(document).ready(function () {
        'use strict';

        // Plane flight details
        var lastTime = null;
        var speed = 200; // m/s
        var heading = 0;
        var altitude = 3000;
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
            requestAnimationFrame(draw);
        }

        window.requestAnimationFrame(draw);

        // Update speed based on throttle control
        $('#throttle-control').on('input', function () {
            speed = parseInt($(this).val());
        });

        // Update heading based on joystick control
        $('#joystick-control').on('input', function () {
            heading = parseInt($(this).val());
        });

        // Update altitude based on joystick control
        $('#joystick-altitude-control').on('input', function () {
            altitude = parseInt($(this).val());
        });

        function ConvertDDToDMS(d, lng) {
            var dir = d < 0 ? (lng ? 'W' : 'S') : (lng ? 'E' : 'N');
            var deg = 0 | (d < 0 ? d = -d : d);
            var min = 0 | (d % 1 * 60);
            var sec = (0 | (d * 60 % 1 * 60));
            return deg + '° ' + format.format('02d')(min) + '\' ' + format.format('02d')(sec) + '" ' + dir;
        }

        String.prototype.format = function () {
            var s = this;
            var i = arguments.length;
            while (i--) {
                s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
            }
            return s;
        };
    });
});
