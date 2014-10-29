angular.module('idss-dashboard').directive('view3d', ['$compile', '$templateCache', '$http', '$rootScope', '$window',  function($compile, $templateCache, $http, $rootScope, $window) {


    var typesToLoadOnInit;

    var vecCrossProduct = function(a, b) { var r = SceneJS_math_cross3Vec3([a.x, a.y, a.z], [b.x, b.y, b.z]); return {x:r[0], y:r[1], z:r[2]}; };// jshint ignore:line
    var vecMultiplyScalar = function(a, m) { return {x:a.x*m, y:a.y*m, z:a.z*m}; };// jshint ignore:line
    var vecSubtract = function(a, b) { return {x:a.x-b.x, y:a.y-b.y, z:a.z-b.z}; };// jshint ignore:line
    var vecMagnitude = function(v) { var x = v.x, y = v.y, z = v.z; return Math.sqrt(x*x + y*y + z*z); };// jshint ignore:line
    var vecNormalize = function(v) { return vecMultiplyScalar(v, 1/vecMagnitude(v)); };// jshint ignore:line
    var vecNegate = function(v) { return {x:-v.x, y:-v.y, z:-v.z}; };// jshint ignore:line

    var v = 0; // this is the offset of the menu, used in raypicking on canvas. TODO: set this in a better way
    var scene;
    var viewerHeight = window.innerHeight;
    var viewerWidth = window.innerWidth;
    
    // var bounds = {
    //     min: {x: -10929, y: -11228, z: -11228}, 
    //     max: {x: 11621, y: 11921, z: 11921}
    // };
    var bounds = {
        min: {x: -1, y: -1, z: -1}, 
        max: {x: 1, y: 1, z: 1}
    };
    var properties;

    var touching = false;
    var orbitDragging = false;
    var panDragging = false;
    var orbiting = false;
    var flying = false;
    var rotating = false;
    var lastX = null;
    var lastY = null;
    var downX = null;
    var downY = null;

    var direction = 1;
    var startYaw;
    var endYaw;
    var yaw = 0;
    var startPitch;
    var endPitch;
    var pitch = 0;
    var zoom = 0;
    var prevZoom = 0;

    var lookAt = null;
    var startEye = { x: 0, y: 0, z: 0 };
    var eye = { x: 0, y: 0, z: 0 };
    var look = { x: 0, y: 0, z: 0 };

    var startPivot = { x: 0, y: 0, z: 0 };
    var endPivot = { x: 0, y: 0, z: 0 };
    var currentPivot = { x: 0, y: 0, z: 0 };

    var flightStartTime = null;
    var flightDuration = null;

    var timeNow;
    var timeElapsed;
    var timeElapsedNormalized;

    var maxOrbitSpeed = Math.PI * 0.1;
    var orbitSpeedFactor = 0.05;
    var zoomSpeedFactor = 0.1;
    var panSpeedFactor = 0.6;

    // var indicatorPos;
    // var indicatorVis;
    // var indicatorSize;

    var ease = function(t, b, c, d) {
        b = b || 0;
        c = c || 1;
        d = d || 1;
        var ts = (t /= d) * t;
        var tc = ts * t;
        return b + c * (-1 * ts * ts + 4 * tc + -6 * ts + 4 * t);
    };
    
    var lerp = function(a, b, p) {
        return a + (b-a) * p;
    };
    
    var lerp3 = function(dest, a, b, p) {
        for (var i = 0; i < 3; ++i) {
            var component = String.fromCharCode('x'.charCodeAt(0) + i);
            dest[component] = lerp(a[component], b[component], p);
        }
    };

    var updateTimer = function() { 
        timeNow = +new Date();
        if (flightStartTime === null) {
            flightStartTime = timeNow;
        }
        timeElapsed = timeNow - flightStartTime;
        timeElapsedNormalized = Math.min(timeElapsed / flightDuration, 1.0);
        if (timeElapsed >= flightDuration) {
            flying = false;
            flightStartTime = null;
            
            rotating = false;
            startYaw = startPitch = endYaw = endPitch = null;
        }
    };
    
    var sphericalCoords = function(eye) {
        var r     = vecMagnitude(eye);
        var phi   = Math.acos(eye.z / r);
        var theta = Math.atan2(eye.y, eye.x);
        return {phi: phi, theta: theta};
    };

    var tick = function() {
        if(flying) {
            updateTimer();
            var easedTime = ease(timeElapsedNormalized);
            lerp3(currentPivot, startPivot, endPivot, easedTime);
            // Need to rotate lookAt
            orbiting = true;
        
            if(rotating) {
                pitch = lerp(startPitch, endPitch, easedTime);
                yaw = lerp(startYaw, endYaw, easedTime);
            }
        }
        if(orbiting) {
            var radius = vecMagnitude(startEye);
            
            var phiTheta = sphericalCoords(startEye);
            var startPhi = phiTheta.phi;
            var startTheta = phiTheta.theta;
            
            var PI_2 = 2*Math.PI;

            var phi = pitch * orbitSpeedFactor + startPhi;
            
            while(phi > PI_2) phi -= PI_2;// jshint ignore:line
            while(phi < 0   ) phi += PI_2;// jshint ignore:line
            
            if(phi > Math.PI) {
                if (direction !== -1) {
                    direction = -1;
                    lookAt.set('up', {x: 0, y:0, z: -1});
                }
            } else {
                if (direction !== 1) {
                    direction = 1;
                    lookAt.set('up', {x: 0, y:0, z: 1});
                }
            }

            var theta = yaw * orbitSpeedFactor + startTheta;
            var x = radius * Math.sin(phi) * Math.cos(theta);
            var y = radius * Math.sin(phi) * Math.sin(theta);
            var z = radius * Math.cos(phi);

            var zoomX = x * zoom*zoomSpeedFactor;
            var zoomY = y * zoom*zoomSpeedFactor;
            var zoomZ = z * zoom*zoomSpeedFactor;

            if((x >= 0 && zoomX > x) || (x < 0 && zoomX < x) || (y >= 0 && zoomY > y) || (y < 0 && zoomY < y) || (z >= 0 && zoomZ > z) || (z < 0 && zoomZ < z)) {
                zoom = prevZoom;
                zoomX = x * zoom*zoomSpeedFactor;
                zoomY = y * zoom*zoomSpeedFactor;
                zoomZ = z * zoom*zoomSpeedFactor;
            }

            x -= zoomX;
            y -= zoomY;
            z -= zoomZ;

            prevZoom = zoom;

            x += currentPivot.x;
            y += currentPivot.y;
            z += currentPivot.z;

            eye = { x: x, y: y, z: z };

            // Update view transform
            lookAt.setLook(currentPivot);
            lookAt.setEye(eye);
            
            orbiting = false;
        }
    };

    var pick = function(canvasX, canvasY) {

        scene.pick(canvasX, canvasY, { rayPick:true });
        
    };

    var obtainView = function() {
        var eye = lookAt.getEye();
        var tgt = lookAt.getLook();
        var up  = lookAt.getUp();

        var dir = vecNormalize(vecSubtract(tgt, eye));
        up = vecCrossProduct(vecCrossProduct(dir, up), dir);
        up = vecNormalize(up);
        
        return {
            eye: eye,
            dir: dir,
            up : up
        };
    };
    
    var restoreView = function(newLookAt) {
        // Set the current camera orientation as our initial one and
        // transition to the new one. The newLookAt structure does not
        // contain the distance from camera to target so the end pivot
        // will be set the same distance from the camera as it is now.

        console.log(eye);
        console.log(currentPivot);
        
        var l = vecMagnitude(vecSubtract(eye, currentPivot));
        
        var cy = vecSubtract(eye, currentPivot);
        startEye = {x:cy.x, y:cy.y, z:cy.z};
        
        var currentPT = sphericalCoords(startEye);
        var eventualPT = sphericalCoords(vecNegate(newLookAt.dir));
        
        endYaw = (eventualPT.theta - currentPT.theta) / orbitSpeedFactor;
        endPitch = (eventualPT.phi - currentPT.phi) / orbitSpeedFactor;
        rotating = true;
         
        startYaw = startPitch = yaw = pitch = 0;
        zoom = prevZoom = 0;
        startPivot = {x: currentPivot.x, y: currentPivot.y, z: currentPivot.z};
        endPivot = vecSubtract(newLookAt.eye, vecNegate(vecMultiplyScalar(newLookAt.dir, l)));
        
        flightStartTime = null;
        flightDuration = 1000;
        flying = true;
    };

    var actionMove = function(x, y) {
        if(orbitDragging) {
            yaw -= (x - lastX) * direction * 0.1;
            pitch -= (y - lastY) * 0.1;
            orbiting = true;
        } else if(panDragging) {

        }

        lastX = x;
        lastY = y;
    };

    var mouseDown = function(e) {
        lastX = downX = e.clientX;
        lastY = downY = e.clientY;
        if(e.which === 1) { // Left click
            orbitDragging = true;
        }
        if(e.which === 2) { // Middle click
            panDragging = true;
        }
    };

    var closeEnough = function(x, y) {
        return (x > y) ? (x - y < 5) : (y - x < 5);
    };

    var mouseUp = function(e) {
        if (orbitDragging && closeEnough(e.clientX, downX) && closeEnough(e.clientY + v, downY)) {
            pick(e.clientX, e.clientY + v);
        }
        orbitDragging = false;
        panDragging = false;
    };

    var mouseMove = function(e) {
        if(!touching) {
            actionMove(e.clientX, e.clientY);
        }
    };

    var mouseWheel = function(e) {
        var delta = 0;
        if (e.wheelDelta) {
            delta = e.wheelDelta / 120;
            if (window.opera) {
                delta = -delta;
            }
        }
        else if (e.detail) {
            delta = -e.detail / 3;
        }

        if (delta) {
            if (delta < 0  && zoom > -25) {
                zoom -= 1;
            } else if(delta > 0) {
                zoom += 1;
            }
        }

        if (e.preventDefault) {
            e.preventDefault();
        }

        e.preventDefault();
        orbiting = true;
    };

    var touchStart = function(e) {
        lastX = downX = e.targetTouches[0].clientX;
        lastY = downY = e.targetTouches[0].clientY;
        orbitDragging = true;
        touching = true;
    };

    var touchMove = function(e) {
        actionMove(e.targetTouches[0].clientX, e.targetTouches[0].clientY);

    };

    var touchEnd = function(e) {
        if (orbitDragging && closeEnough(e.clientX, downX) && closeEnough(e.clientY + v, downY)) {
            pick(e.clientX, e.clientY + v);
        }
        orbitDragging = false;
        panDragging = false;
        touching = false;
    };

    var materials = {
        "Door":{"r":0.83,"g":0.2,"b":0.27, "a":1},
        "WallSurface":{"r":0.8,"g":0.8,"b":0.8, "a":1},
    };

    var defaultScene = {
                id: "viewer-canvas",
                canvasId: "viewer-canvas",
                transparent: true,
                backfaces: false,
                type: "scene",
                nodes: [{
                    type: 'lookAt',
                    id: 'main-lookAt',
                    eye: { x: 1, y: 1, z: 1 },
                    look: { x: 0.0, y: 0.0, z: 0.0 },
                    up: { x: 0.0, y: 1.0, z: 0.0 },
                    nodes: [{
                        type: 'camera',
                        id: 'main-camera',
                        optics: {
                            type: 'perspective',
                            far: 100,
                            near: 0.001,
                            fovy: 37.8493
                        },
                        // nodes: [{
                        //     type: 'renderer',
                        //     id: 'main-renderer',
                        //     clear:{
                        //         color:true,
                        //         depth:true,
                        //         stencil:false
                        //     },
                        //     clearColor:{
                        //         r:0.2,
                        //         g:0.2,
                        //         b:0.2,
                        //         a:0.2
                        //     },
                            nodes: [{
                                type: 'lights',
                                id: 'my-lights',
                                lights: [
                                {
                                    type: 'light',
                                    id: 'sun-light',
                                    mode: 'dir',
                                    color: {r: 0.8, g: 0.8, b: 0.8},
                                    dir: {x: -0.5, y: 0.5, z: 0.5},
                                    diffuse: true,
                                    specular: true,
                                    space: 'view'
                                },
                                {
                                    mode:"ambient",
                                    color:{ r:0.4, g:0.4, b:0.4 },
                                    diffuse:false,
                                    specular:false
                                }
                                // {
                                //     type:"light",
                                //     id:"sun-light",
                                //     mode:"dir",
                                //     color:{
                                //         "r":0.8,
                                //         "g":0.8,
                                //         "b":0.8
                                //     },
                                //     dir:{
                                //         "x":-0.5,
                                //         "y":-0.5,
                                //         "z":-1.0
                                //     },
                                //     diffuse:true,
                                //     specular:true
                                // }
                                // {
                                //     mode:"dir",
                                //     color:{ r:1.0, g:1.0, b:1.0 },
                                //     diffuse:true,
                                //     specular:true,
                                //     dir:{ x:-0.5, y:-0.5, z:-1.0 },
                                //     space:"view"
                                // }
                                ]
                            }]
                        //}]
                    }]
                }, { // make unique library for every model on init - put predefined materials in constant
                    "id":"library",
                    "type":"library",
                    "nodes":[]
                }]
            };

    var highlightMaterial = {
        type : 'material',
        id : 'highlight',
        emit : 0.0,
        baseColor : {
            r : 0.5,
            g : 0.5,
            b : 0.5
        },
        alpha: 0.6
    };

    var selectMaterial = {
        type : 'material',
        id : 'highlight',
        emit : 0.0,
        baseColor : {
            r : 0.5,
            g : 0.5,
            b : 0.0
        }
    };

    var getCenter = function() {

        return {
            x: (bounds.max.x + bounds.min.x) / 2,
            y: (bounds.max.y + bounds.min.y) / 2,
            z: (bounds.max.z + bounds.min.z) / 2
        };

    };

    var setSceneCamera = function() {

        var mainCameraNode = scene.findNode("main-camera");

        var diagonal = Math.sqrt(Math.pow(bounds.max.x - bounds.min.x, 2) + Math.pow(bounds.max.y - bounds.min.y, 2) + Math.pow(bounds.max.z - bounds.min.z, 2));
        var far = diagonal * 5; 

        mainCameraNode.setOptics({
            type: 'perspective',
            far: far,
            near: far / 1000,
            aspect: viewerWidth / viewerHeight,
            fovy: 37.8493
        });

        lookAt = scene.findNode('main-lookAt');


        var center = getCenter();

        eye = { x: (bounds.max.x - bounds.min.x) * 0.5, y: (bounds.max.y - bounds.min.y) * -1,  z: (bounds.max.z - bounds.min.z) * 0.5};
        look = { x:center.x, y:center.y, z:center.z};
        
        lookAt.set({
            eye: eye,
            look: center,
            up:{ x:0, y:0, z:1 }
        });

        eye = lookAt.getEye();
        startEye = lookAt.getEye();
        look = lookAt.getLook();
        currentPivot = look;

        orbiting = true;
        tick();


    };

    // Used to store parent node objects
    var rootNode = null;
    var backNodes = []; 
    var oldSelected;

    var generatePath = function() {

        var path = _.pluck(backNodes, 'name');

        path = path.join('/');
        var dots = path.length > 20 ? '...' : '';
        var start = path.length - 20 > 0 ? path.length - 20 : 0;
        path =  dots + path.substr(start);
        return path;
    }; 

    var prepareIfcRelations = function(relations, parentId) {
        _.each(relations, function(obj) {
            obj.parentId = parentId === undefined ? null : parentId;
            obj.selected = false;
            obj.visible = true;
            if(obj.children && obj.children.length) {
                prepareIfcRelations(obj.children, obj.id);
            } 
        });
    };

    var prepareIfcLayers = function(ifcTypes) {

        var layers = [];

        _.each(ifcTypes, function(type) {
          var found = _.contains(typesToLoadOnInit, type);
          
          layers.push({
            active: found,
            label: type, 
            id: type,
            transparency: 100
          });
        });

        return layers;

    };  

    var deleteHighlights = function() {

        var oldHighlight;

        oldHighlight = scene.findNode(highlightMaterial.id);
        if (oldHighlight != null) {
            oldHighlight.splice();
        }

        return 0;
    };

    var highLightObject = function(id) {
        var node = scene.findNode(id);

        if (node != null) {
            node.insert('node', highlightMaterial);
        }
    };

    var setVisible = function(node) {
        node.visible = true; // this is already set for first node but not for recursive calls
        var sceneNode = scene.findNode('disable-' + node.id);
        if (sceneNode != null) {
            sceneNode.splice();
        }
        if(node.children) {
            _.each(node.children, function(childNode) {
                setVisible(childNode);
            });
        }
    };

    var unsetVisible = function(node) {
        node.visible = false; // this is already set for first node but not for recursive calls
        var disableTagJson = {
            type: 'tag',
            tag: 'disable-' + node.id,
            id: 'disable-' + node.id
        };
        var sceneNode = scene.findNode('geo_' + node.id);
        var oldNode = scene.findNode('disable-' + node.id);
        if (sceneNode !== null && oldNode === null) {
            oldNode = scene.findNode('disable-' + node.id);
            sceneNode.insert("node",disableTagJson);
        }
        if(node.children) {
            _.each(node.children, function(childNode) {
                unsetVisible(childNode);
            });
        }
    };

    var easeOut = function(t, b, c, d) {
        var ts = (t /= d) * t;
        var tc = ts * t;
        return b + c * (-1 * ts * ts + 4 * tc + -6 * ts + 4 * t);
    };

    var easeIn = function(t, b, c, d) {
        var ts = (t /= d) * t;
        var tc = ts * t;
        return b + c * (tc * ts);
    };

    var template = $templateCache.get('directives/view3d.tpl.html');

    var selectedProperties;
    var oldSelectedProperties;

    return {
        restrict: 'E',
        replace: true,
        scope: {
            scene: '='
        },
        link: function(scope, elem, attr) {

            var w = angular.element($window);
            // these measures are listen to in watch below
            viewerHeight = window.innerHeight; // could be set from elem
            viewerWidth = window.innerWidth; // could be set from elem
            scope.viewerHeight = window.innerHeight;
            scope.viewerWidth = window.innerWidth;

            var addFaceGeometry = function(g) {

                var i;

                var x, y, z, x1, y1, z1, x2, y2, z2, x3, y3, z3;
                var vec1, vec2, vec3;
                var normal;

                // TODO: his functionality already exists in plenty of libraries used..
                var cross = function(a, b) {
                    var ax = a[0], ay = a[1], az = a[2],
                        bx = b[0], by = b[1], bz = b[2];

                    return [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx];
                };

                // TODO: his functionality already exists in plenty of libraries used..
                var subtract = function(a, b) {
                    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
                };

                // some geometries does not have indices TODO: dont include them in first place..
                if(!g.positions) {
                    return;
                }

                // add necessary properties
                g.nrindices = g.positions.length / 3;
                g.coreId = g.id;
                delete g.id;
                g.type = 'geometry';
                g.material = g.gmlType;
                g.primitive = 'triangles';
                g.normals = [];

                for (i = 0; i < g.positions.length; i += 9) {

                    var xMin, xMax, yMin, yMax, zMin, zMax;

                    x1 = g.positions[i + 0]; 
                    y1 = g.positions[i + 1];
                    z1 = g.positions[i + 2];
                    x2 = g.positions[i + 3];
                    y2 = g.positions[i + 4];
                    z2 = g.positions[i + 5];
                    x3 = g.positions[i + 6];
                    y3 = g.positions[i + 7];
                    z3 = g.positions[i + 8];

                    xMin = Math.min(x1, Math.min(x2, x3));
                    yMin = Math.min(y1, Math.min(y2, y3));
                    zMin = Math.min(z1, Math.min(z2, z3));

                    xMax = Math.max(x1, Math.max(x2, x3));
                    yMax = Math.max(y1, Math.max(y2, y3));
                    zMax = Math.max(z1, Math.max(z2, z3));


                    bounds.min.x = Math.min(bounds.min.x, xMin);
                    bounds.min.y = Math.min(bounds.min.y, yMin);
                    bounds.min.z = Math.min(bounds.min.z, zMin);

                    bounds.max.x = Math.max(bounds.max.x, xMax);
                    bounds.max.y = Math.max(bounds.max.y, yMax);
                    bounds.max.z = Math.max(bounds.max.z, zMax);

                    vec1 = [x1, y1, z1];
                    vec2 = [x2, y2, z2];
                    vec3 = [x3, y3, z3];

                    normal = [0,0,0];

                    SceneJS_math_normalizeVec3(cross(subtract(vec2, vec1), subtract(vec3, vec1)), normal);// jshint ignore:line

                    // python would be nice... how to copy and array 3 times in javascript?
                    var normals = normal.concat(normal);
                    normals = normals.concat(normal);
                    g.normals = g.normals.concat(normals);

                }

                // add node for model geometry by type if not exists
                var type = g.gmlType;
                var typeNode = scene.findNode(type.toLowerCase());
                if(!typeNode) {
                    typeNode = {
                        id: type.toLowerCase(),
                        tag: type.toLowerCase(),
                        type: "tag",
                        nodes: []
                    };
                    typeNode = scene.findNode("bounds-translate").addNode(typeNode);
                }
                
                var library = scene.findNode("library"); // TODO: find unique for every model

                g.indices = [];
                for (i = 0; i < g.nrindices; i++) {
                    g.indices.push(i);
                }
                library.add("node", g);

                var material = materials[g.material];
                console.log(material);
                var transparent; 

                if(material) {
                    transparent = material.a !== 1;
                } else {
                    console.log('material for ' + g.gmlType + ' is missing');
                    material = materials['default'];
                }

                console.log(g);
                
                var flags = {
                    type : "flags",
                    flags : {
                        transparent : transparent
                    },
                    nodes : [{
                        type: "enable",
                        enabled: true,
                        nodes : [{
                            type : "material",
                            baseColor: material,
                            alpha: material.a,
                            nodes : [{
                                type : "name",
                                name: g.coreId,
                                id : 'geo_' + g.coreId,//ifcType + '' + g.coreId, // should be ifcId?
                                nodes : [{
                                   type: "matrix",
                                //    elements: g.transformationMatrix, // TODO: include this from ifcengine
                                    nodes:[{
                                        type: "geometry",
                                        coreId: g.coreId
                                    }]
                                }]
                            }]
                        }]
                    }]
                };
                typeNode.addNode(flags);

                console.log(typeNode);

                setSceneCamera();

            };


            scope.$watch('scene', function(newFile, oldFile) {

                if(newFile) { 


                    scope.getWindowDimensions();
                    scope.topOffset = 0;

                    SceneJS.reset();

                    elem.html('').append( $compile( template )( scope ) );

                    // create SceneJS scene
                    scene = SceneJS.createScene(defaultScene);

                    /* CONFIG SCENE */

                    //add bounds node after light node (this is used for adding groups of geometry in add geometry functions)
                    var boundsTranslateNode = scene.findNode("bounds-translate");
                    if (!boundsTranslateNode) {
                        boundsTranslateNode = {
                            id: "bounds-translate",
                            type: "translate",
                            // x: center.x,
                            // y: center.y,
                            // z: center.z,
                            nodes: []
                        };
                        boundsTranslateNode = scene.findNode("my-lights").addNode(boundsTranslateNode);
                    }

                    setSceneCamera();

                    zoom = -10;//far/2;
                    prevZoom = zoom;


                    scene.on('pick', function(hit) {
                        // Some plugins wrap things in this name to
                        // avoid them being picked, such as skyboxes
                        if (hit.name === "__SceneJS_dontPickMe") {
                            return;
                        }

                        hit.id = hit.nodeId;
                        scope.selectProperties(hit);

                        startPivot = {x: currentPivot.x, y: currentPivot.y, z: currentPivot.z};
                        endPivot = {x: hit.worldPos[0], y: hit.worldPos[1], z: hit.worldPos[2]};
                        var dif = {x: endPivot.x - startPivot.x, y: endPivot.y - startPivot.y, z: endPivot.z - startPivot.z};
                        var flightDist = Math.sqrt(dif.x*dif.x + dif.y*dif.y + dif.z*dif.z);

                        flightStartTime = null;
                        flightDuration = 1000.0 * ((flightDist / 15000) + 1); // extra seconds to ensure arrival

                        flying = true;
                    });

                    scene.on('tick', tick);

                    // register events
                    var canvas = scene.getCanvas();
                    canvas.addEventListener('mousedown', mouseDown, true);
                    canvas.addEventListener('mouseup', mouseUp, true);
                    canvas.addEventListener('touchstart', touchStart, true);
                    canvas.addEventListener('touchend', touchEnd, true);
                    canvas.addEventListener('mousemove', mouseMove, true);
                    canvas.addEventListener('touchmove', touchMove, true);
                    canvas.addEventListener('mousewheel', mouseWheel, true);
                    canvas.addEventListener('DOMMouseScroll', mouseWheel, true);

                }
            });

            scope.$watchCollection('scene.faceGeometries', function(faceGeometries, oldFaceGeometries) {

                var numAddedGeometries;

                console.log(faceGeometries, oldFaceGeometries);

                if(faceGeometries && faceGeometries.length && faceGeometries.length > 0) {

                    //addFaceGeometry(faceGeometries[0]);
                    if(oldFaceGeometries) {
                        numAddedGeometries = faceGeometries.length - oldFaceGeometries.length;
                    } else {
                        numAddedGeometries = faceGeometries.length;
                    }
                    for(var i = 0; i < numAddedGeometries; i++) {
                        addFaceGeometry(faceGeometries[faceGeometries.length-(i + 1)]);
                    }
                }
                 
            });


            scope.getWindowDimensions = function () {
                return {
                    'h': w.height(),
                    'w': w.width()
                };
            };

            scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
                
                if(newValue && scene && newValue.h !== newValue.h && newValue.w !== newValue.w) {
                    viewerHeight = newValue.h;
                    viewerWidth = newValue.w;
                    scope.viewerHeight = newValue.h;
                    scope.viewerWidth = newValue.w;
                    var c = scene.getCanvas();
                    $(c).width(viewerWidth).height(viewerHeight);

                    setSceneCamera();

                }
            }, true);

            w.bind('resize', function () {
                scope.$apply();
            });


        }
    };

}]);