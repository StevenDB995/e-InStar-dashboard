import * as THREE from './three.module.js';
import {PLYLoader} from "./PLYLoader.js";
import {OrbitControls} from './OrbitControls.js';

let camera, scene, renderer, light, controls;
let canvasContainer = document.getElementById('canvas-container');
let width = canvasContainer.clientWidth,
    height = canvasContainer.clientHeight;
let defaultCameraZoom = 1.5;

init();
animate();

function init() {
    camera = new THREE.PerspectiveCamera(60, width / height, 1, 10000);
    camera.position.set(300, 240, 300);
    camera.zoom = defaultCameraZoom;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFFFFFF);

    var x = -123.04345166015625,
        z = -46.603991455078145;
    var y = -184.4871513671875;
    var y_ground = y + 10;
    var y_roof = y + 17.4871513671875;

    const PLY_TOTAL = 60; // total number of .ply files to be loaded
    var plySuccess = 0, plyError = 0; // number of successful and failed loads

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

    function onPLYLoadComplete() {
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

    // load a .ply file and obtain the corresponding geometry object
    function loadPLY(url, type, key) { // key: key for the standardGeometry map
        const loader = new PLYLoader();
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

            plySuccess++;
            if (plySuccess + plyError === PLY_TOTAL) {
                onPLYLoadComplete();
            }
        }, undefined, function () {
            plyError++;
            if (plySuccess + plyError === PLY_TOTAL) {
                onPLYLoadComplete();
            }
        });
    }

    // render a geometry object on the canvas
    function render(geometry, type, nameID, floor) { // floor: 3-19
        // wrap the code inside setTimeout to make each rendering asynchronous
        // this will give better effect of animation
        // not working properly in Chrome on iOS devices or Safari
        setTimeout(function () {
            if (geometry === undefined) {
                // TODO: handle undefined geometry caused by load error
                return;
            }

            geometry.computeVertexNormals();

            const material = new THREE.MeshPhongMaterial({color: 0x62605F, specular: 0x111111, shininess: 200});
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

            mesh.position.set(x, calcY, z);
            mesh.rotation.x = -Math.PI / 2;
            mesh.scale.multiplyScalar(scalar);
            mesh.material.opacity = 0.7;
            mesh.NameID = nameID;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            //为mesh添加轮廓线
            var edges = new THREE.EdgesGeometry(geometry);
            var edgesMaterial = new THREE.LineBasicMaterial({
                color: 0xECE32E,
                transparent: true,
                opacity: 2
            });

            var line = new THREE.LineSegments(edges, edgesMaterial);
            line.scale.multiplyScalar(scalar);
            line.position.set(x, calcY, z);
            line.rotateX(-Math.PI / 2);

            scene.add(mesh);
            scene.add(line);
        }, 100);
    }

    //lights
    scene.add(new THREE.AmbientLight(0x404040));
    light = new THREE.PointLight(0xffffff);
    light.position.set(0, 50, 50);
    //告诉平行光需要开启阴影投射
    light.castShadow = true;

    //canvas
    //renderer
    renderer = new THREE.WebGLRenderer({antialias: true, canvas: document.getElementById('canvas')});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setClearColor(0xffffff);
    renderer.shadowMap.enabled = false;

    // controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls._isrotateup = true;
    controls.autoRotate = false;
    //controls.dampingFactor=0.5;
    controls.enableZoom = true;
    //设置旋转范围
    //上下旋转范围
    controls.minPolarAngle = Math.PI / 4;
    controls.maxPolarAngle = Math.PI / 2;
    //左右旋转范围
    //controls.minAzimuthAngle=-Math.PI;
    controls.maxAzimuthAngle = 0;
    controls.update();

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
        camera.zoom = (window.innerWidth <= 576) ? 1.25 : defaultCameraZoom;
        camera.updateProjectionMatrix();

        renderer.setSize(newWidth, newHeight);
        renderer.render(scene, camera);

    }).observe(canvasContainer);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}