import * as THREE from './three.module.js';
import {PLYLoader} from './PLYLoader.js';
import {OrbitControls} from './OrbitControls.js';
import {LogisticsMap} from '../map/LogisticsMap.js';

let camera, scene, renderer, light, orbitControls;
let canvasContainer = document.getElementById('canvas-container');
let width = canvasContainer.clientWidth,
    height = canvasContainer.clientHeight;
const DEFAULT_CAMERA_ZOOM = 1.5;
const loader = new PLYLoader();

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const meshes = {};
const lines = {};

let selectedMode = false; // indicate whether a module is selected (clicked)
let selectedModuleName, hoveredModuleName;

let logisticsMap; // logistics map for the selected module

// const MESH_OPACITY_FOCUS = 1,
//     LINE_OPACITY_FOCUS = 1;
// const MESH_OPACITY_FADE = 0.3,
//     LINE_OPACITY_FADE = 0.1;
// const MESH_OPACITY_HOVER = 0.7,
//     LINE_OPACITY_HOVER = 0.5;

const MESH_COLOR_FOCUS = '#EEE',
    MESH_OPACITY_FOCUS = 0.8,
    LINE_OPACITY_FOCUS = 1;
const MESH_COLOR_FADE = '#AAA',
    MESH_OPACITY_FADE = 0.3,
    LINE_OPACITY_FADE = 0.1;
const MESH_COLOR_HOVER = '#EEE',
    MESH_OPACITY_HOVER = 0.7,
    LINE_OPACITY_HOVER = 0.5;

init();
animate();

function init() {
    camera = new THREE.PerspectiveCamera(60, width / height, 1, 10000);
    camera.position.set(300, 240, 300);
    camera.zoom = DEFAULT_CAMERA_ZOOM;
    scene = new THREE.Scene();

    var x = -123.04345166015625,
        z = -46.603991455078145;
    var y = -184.4871513671875;
    var y_ground = y + 10;
    var y_roof = y + 17.4871513671875;

    const PLY_TOTAL = 60; // total number of .ply files to be loaded
    var plySuccess = 0, plyError = 0; // number of successful and failed loads
    var renderedTotal; // total number of PLY to be rendered
    var rendered = 0; // number of rendered PLY

    // store all geometry objects on load
    var groundGeometry;
    var standardGeometry = {}; // map (key: .ply file name; value: geometry object)
    var roofGeometry;

    // load ground
    loadPLY('/newmodel/ground.ply', 'ground');
    // load standard
    loadPLY(`/newmodel/standard/A-TR.ply`, 'standard', `A-TR`);
    loadPLY(`/newmodel/standard/B-TR.ply`, 'standard', `B-TR`);
    for (let i = 1; i <= 14; ++i) {
        // Tower A
        loadPLY(`/newmodel/standard/A-N-${i}.ply`, 'standard', `A-N-${i}`);
        loadPLY(`/newmodel/standard/A-S-${i}.ply`, 'standard', `A-S-${i}`);
        // Tower B
        loadPLY(`/newmodel/standard/B-N-${i}.ply`, 'standard', `B-N-${i}`);
        loadPLY(`/newmodel/standard/B-S-${i}.ply`, 'standard', `B-S-${i}`);
    }
    // load roof
    loadPLY('/newmodel/roof.ply', 'roof');

    // load a .ply file and obtain the corresponding geometry object
    function loadPLY(url, type, key) { // key: key for the standardGeometry map
        loader.load(url, function (geometry) {
            switch (type) {
                case 'ground':
                    groundGeometry = geometry;
                    break;
                case 'standard':
                    standardGeometry[key] = geometry;
                    break;
                case 'roof':
                    roofGeometry = geometry;
                    break;
            }

            if ((++plySuccess) + plyError === PLY_TOTAL) {
                onPLYLoadComplete();
            }
        }, undefined, function () {
            if (plySuccess + (++plyError) === PLY_TOTAL) {
                onPLYLoadComplete();
            }
        });
    }

    function onPLYLoadComplete() {
        if (getOS() !== 'iOS') {
            // hide the .loading div
            let loadingDiv = document.querySelector('#three-model > .loading');
            loadingDiv.classList.add('hide');
        }

        // calculate total number of PLY to be rendered
        renderedTotal = ( (groundGeometry !== undefined) ? 1 : 0 )
            + Object.keys(standardGeometry).length * 17
            + ( (roofGeometry !== undefined) ? 1 : 0 );

        // ground
        render(groundGeometry, 'ground', 'ground');

        // standard
        for (let floor = 3; floor <= 19; ++floor) {
            // Tower A, TR
            render(standardGeometry[`A-TR`], 'standard', `A-${floor}-TR`, floor);
            // Tower A, Wing N
            for (let i = 1; i <= 14; ++i) {
                render(standardGeometry[`A-N-${i}`], 'standard', `A-${floor}-N-${i}`, floor);
            }
            // Tower A, Wing S
            for (let i = 1; i <= 14; ++i) {
                render(standardGeometry[`A-S-${i}`], 'standard', `A-${floor}-S-${i}`, floor);
            }
            // Tower B, TR
            render(standardGeometry[`B-TR`], 'standard', `B-${floor}-TR`, floor);
            // Tower B, Wing N
            for (let i = 1; i <= 14; ++i) {
                render(standardGeometry[`B-N-${i}`], 'standard', `B-${floor}-N-${i}`, floor);
            }
            // Tower B, Wing S
            for (let i = 1; i <= 14; ++i) {
                render(standardGeometry[`B-S-${i}`], 'standard', `B-${floor}-S-${i}`, floor);
            }
        }

        // roof
        render(roofGeometry, 'roof', 'roof');
    }

    // render a geometry object on the canvas
    function render(geometry, type, moduleName, floor) { // floor: 3-19
        // wrap the code inside setTimeout to make each rendering asynchronous
        // this will give better effect of animation
        // not working properly in Chrome on iOS devices or Safari
        setTimeout(function () {
            if (geometry === undefined) {
                // handle undefined geometry caused by load error
                return;
            }

            geometry.computeVertexNormals();

            const material = new THREE.MeshPhongMaterial({
                // color: '#62605F', // mesh color
                color: selectedMode ? MESH_COLOR_FADE : MESH_COLOR_FOCUS, // mesh color
                specular: '#111',
                // shininess: 200,
                transparent: true,
                opacity: selectedMode ? MESH_OPACITY_FADE : MESH_OPACITY_FOCUS
            });
            const mesh = new THREE.Mesh(geometry, material);

            var scalar = 3;
            var calcY = y;
            switch (type) {
                case 'ground':
                    scalar = 0.003;
                    calcY = y_ground;
                    break;
                case 'standard':
                    calcY = y + 10 * (floor - 3);
                    break;
                case 'roof':
                    calcY = y_roof;
                    break;
            }

            mesh.name = moduleName;
            mesh.position.set(x, calcY, z);
            mesh.rotation.x = -Math.PI / 2;
            mesh.scale.multiplyScalar(scalar);
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            //为mesh添加轮廓线
            const edges = new THREE.EdgesGeometry(geometry);
            const edgesMaterial = new THREE.LineBasicMaterial({
                // color: '#ECE32E', // line color
                color: '#045996', // line color
                transparent: true,
                opacity: selectedMode ? LINE_OPACITY_FADE : LINE_OPACITY_FOCUS
            });

            const line = new THREE.LineSegments(edges, edgesMaterial);
            line.name = moduleName;
            line.scale.multiplyScalar(scalar);
            line.position.set(x, calcY, z);
            line.rotateX(-Math.PI / 2);

            // add click event for each mesh
            mesh.onClick = function () {
                if (selectedMode) {
                    setFade(selectedModuleName);
                    setFocus(moduleName);

                } else {
                    for (let key in meshes) {
                        if (key === moduleName) {
                            setFocus(key);
                            continue;
                        }

                        setFade(key);
                    }
                }

                selectedModuleName = moduleName;

                $('#selected-module > .unselected').hide();
                $('#selected-module > .selected').show();

                $('#logistics-info > .module-id > .data').text(moduleName);
                let $status = $('#logistics-info > .status > .data');

                if (logisticsMap === undefined) {
                    logisticsMap = new LogisticsMap('map', 6, false);
                }

                logisticsMap.requestForModuleDetail({
                    moduleid: moduleName,
                    judgement: true
                }, () => {
                    switch (logisticsMap.trackedModule.latest.status) {
                        case 0:
                            $status.text('In factory');
                            break;
                        case 1:
                            $status.text('Mainland transportation');
                            break;
                        case 2:
                            $status.text('Sea transportation');
                            break;
                        case 3:
                            $status.text('HK transportation');
                            break;
                        case 4:
                            $status.text('Arrived');
                            break;
                    }

                    logisticsMap.showLogisticsRoute({
                        markerSize: 0.5,
                        lineWidth: 2,
                        detailedGeoInfo: false,
                        flyToSpeed: 1
                    });
                }, () => {
                    $status.text('No data');
                    logisticsMap.clearMap();
                });
            };

            mesh.onHover = function () {
                if (selectedMode) {
                    if (hoveredModuleName !== selectedModuleName) {
                        // recover the last hovered mesh
                        setFade(hoveredModuleName);
                    }

                    if (moduleName !== selectedModuleName) {
                        // highlight the newly hovered mesh
                        setHover(moduleName);
                    }

                } else {
                    if (hoveredModuleName !== undefined) {
                        // recover the last hovered mesh
                        setFocus(hoveredModuleName);
                    }

                    // highlight the newly hovered mesh
                    setHover(moduleName);
                }

                hoveredModuleName = moduleName;
            }

            scene.add(mesh);
            scene.add(line);

            meshes[moduleName] = mesh;
            lines[moduleName] = line;

            if ((++rendered) === renderedTotal) {
                onRenderComplete();
            }
        }, 100);
    }

    function onRenderComplete() {
        if (getOS() === 'iOS') {
            // hide the .loading div
            let loadingDiv = document.querySelector('#three-model > .loading');
            loadingDiv.classList.add('hide');
        }
    }

    function getOS() {
        var userAgent = navigator.userAgent;
        if (/iPad|iPhone|iPod/.test(userAgent)
            || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 0)) {
            return 'iOS';
        } else {
            return 'other';
        }
    }

    //lights
    // light = new THREE.AmbientLight('#404040');
    light = new THREE.AmbientLight('#FFF');
    scene.add(light);

    //canvas
    //renderer
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('canvas'),
        antialias: true,
        alpha: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setClearColor('#FFF', 0);
    renderer.shadowMap.enabled = false;

    // controls
    orbitControls = new OrbitControls(camera, renderer.domElement);
    //上下旋转范围
    orbitControls.minPolarAngle = 0;
    orbitControls.maxPolarAngle = Math.PI / 2;

    // cursor: grab
    let canvas = document.getElementById('canvas');
    canvas.addEventListener('mousedown', function () {
        canvas.classList.add('grabbing');
    });
    canvas.addEventListener('mouseup', function () {
        canvas.classList.remove('grabbing');
    });

    // resize
    new ResizeObserver(function () {
        var newWidth = canvasContainer.clientWidth;
        var newHeight = canvasContainer.clientHeight;

        camera.aspect = newWidth / newHeight;
        camera.zoom = (window.innerWidth <= 576) ? 1.25 : DEFAULT_CAMERA_ZOOM;
        camera.updateProjectionMatrix();

        renderer.setSize(newWidth, newHeight);
        renderer.render(scene, camera);

    }).observe(canvasContainer);

    // mouse click event
    let drag = false;

    renderer.domElement.addEventListener('mousedown', function () {
        drag = false;
    });

    renderer.domElement.addEventListener('mousemove', function (event) {
        drag = true;
        intersect(event, function (intersects) {
            canvas.classList.add('select');
            intersects[0].object.onHover();
        }, function () {
            canvas.classList.remove('select');
            // remove the highlight when the mouse is not hovered above meshes
            if (selectedMode) {
                if (hoveredModuleName !== selectedModuleName)
                    setFade(hoveredModuleName);
            } else {
                if (hoveredModuleName !== undefined)
                    setFocus(hoveredModuleName);
            }
        })
    });

    renderer.domElement.addEventListener('mouseup', function (event) {
        if (!drag) {
            intersect(event, function (intersects) {
                intersects[0].object.onClick();
                selectedMode = true;
            }, function () {
                for (let key in meshes) setFocus(key);
                selectedMode = false;
            });
        }
    });

    // handle cursor's intersection with meshes
    function intersect(event, onIntersect, noIntersect) {
        mouse.x = (event.offsetX / renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = -(event.offsetY / renderer.domElement.clientHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        let intersects = raycaster.intersectObjects(Object.values(meshes));

        if (intersects.length > 0) {
            onIntersect(intersects);
        } else {
            noIntersect();
        }
    }

    function setFocus(moduleName) {
        meshes[moduleName].material.color.set(MESH_COLOR_FOCUS);
        meshes[moduleName].material.opacity = MESH_OPACITY_FOCUS;
        lines[moduleName].material.opacity = LINE_OPACITY_FOCUS;
    }

    function setFade(moduleName) {
        meshes[moduleName].material.color.set(MESH_COLOR_FADE);
        meshes[moduleName].material.opacity = MESH_OPACITY_FADE;
        lines[moduleName].material.opacity = LINE_OPACITY_FADE;
    }

    function setHover(moduleName) {
        meshes[moduleName].material.color.set(MESH_COLOR_HOVER);
        meshes[moduleName].material.opacity = MESH_OPACITY_HOVER;
        lines[moduleName].material.opacity = LINE_OPACITY_HOVER;
    }
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}