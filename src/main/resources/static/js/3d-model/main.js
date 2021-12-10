import * as THREE from './three.module.js';
import Stats from './stats.module.js';
import {PLYLoader} from "./PLYLoader.js";
import {OrbitControls} from './OrbitControls.js';

let container, stats;
let camera, cameraTarget, scene, renderer, controls;
var group1 = new THREE.Group();
var x_min_group = [], y_min_group = [], z_min_group = [], x_max_group = [], y_max_group = [], z_max_group = [];
var centerX, centerY, centerZ;

init();
animate();

function init() {
    // container = document.createElement('div');
    // document.body.appendChild(container);
    var width = 1000;
    var height = 640;

    camera = new THREE.PerspectiveCamera(60, width / height, 1, 10000);
    cameraTarget = new THREE.Vector3(0.1, -0.1, 0.1);
    camera.position.set(300, 300, 300);
    camera.lookAt(0, 0, 0);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFFFFFF);
    //scene.fog = new THREE.Fog( 0x72645b, 2, 15 );


    // Ground
    // const plane = new THREE.Mesh(
    //     new THREE.PlaneGeometry( 40, 40 ),
    //     new THREE.MeshPhongMaterial( { color: 0x999999, specular: 0x101010 } )
    // );
    // plane.rotation.x = - Math.PI / 2;
    // plane.position.y = - 0.5;
    // scene.add( plane );
    // plane.receiveShadow = true;

    // PLY file
    function loadPLY(url, nameID) {
        const loader = new PLYLoader();
        loader.load(url, function (geometry) {

            geometry.computeVertexNormals();

            const material = new THREE.MeshPhongMaterial({color: 0x62605F, specular: 0x111111, shininess: 200});
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.set(-123.04345166015625, -84.4871513671875, -46.603991455078145);
            mesh.rotation.x = -Math.PI / 2;
            mesh.scale.multiplyScalar(0.003);
            mesh.material.opacity = 0.7;

            mesh.castShadow = true;
            mesh.receiveShadow = true;

            //为mesh添加轮廓线
            var edges = new THREE.EdgesGeometry(geometry);
            var edgesMaterial = new THREE.LineBasicMaterial({
                color: 0xECE32E,
                transparent: true,
                opacity: 2
            })
            var line = new THREE.LineSegments(edges, edgesMaterial);
            line.scale.multiplyScalar(0.003);
            line.position.set(-123.04345166015625, -84.4871513671875, -46.603991455078145);
            line.rotateX(-Math.PI / 2);

            //获取模型的bounding数据

            var bounding = new THREE.Box3().setFromObject(mesh);

            // console.log(bounding);
            var x_min = bounding.min.x;
            var y_min = bounding.min.y;
            var z_min = bounding.min.z;
            var x_max = bounding.max.x;
            var y_max = bounding.max.y;
            var z_max = bounding.max.z;
            x_min_group.push(x_min);
            y_min_group.push(y_min);
            z_min_group.push(z_min);
            x_max_group.push(x_max);
            y_max_group.push(y_max);
            z_max_group.push(z_max);

            group1.add(mesh);
            group1.add(line);
            scene.add(group1);

            load_standard1();
            load_standard2();
            load_standard3();
            load_standard4();
            load_standard5();
            load_standard6();
            load_standard7();
            load_standard8();
            load_standard9();
            load_standard10();
            load_standard11();
            load_standard12();
            load_standard13();
            load_standard14();
            load_standard15();
            load_standard16();
            load_standard17();
            loadPLY18('/newmodel/roof.ply', 'roof');

            //getbounds(mesh);
        });
    }

    loadPLY('/newmodel/13.ply');

    //axes
    // var axesHelper = new THREE.AxesHelper(200);
    // scene.add(axesHelper);

    var array_tower = ['A', 'B'];
    var array_wing = ['N', 'S'];

    //加载第一层标准层
    function loadPLY1(url, nameID) {
        const loader = new PLYLoader();
        loader.load(url, function (geometry) {

            geometry.computeVertexNormals();

            const material = new THREE.MeshPhongMaterial({color: 0x62605F, specular: 0x111111, shininess: 200});
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.set(-123.04345166015625, -94.4871513671875, -46.603991455078145);
            mesh.rotation.x = -Math.PI / 2;
            mesh.scale.multiplyScalar(3);
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
            })
            var line = new THREE.LineSegments(edges, edgesMaterial);
            line.scale.multiplyScalar(3);
            line.position.set(-123.04345166015625, -94.4871513671875, -46.603991455078145);
            line.rotateX(-Math.PI / 2);

            group1.add(mesh);
            group1.add(line);
            scene.add(group1);
        });
    }

    function load_standard1() {
        for (var t = 0; t < 2; t++) {
            var url_connection = '/newmodel/StandardLevel/Tower' + array_tower[t] + '/level3/' + array_tower[t] + '-3-TR.ply';
            loadPLY1(url_connection);
        }
        for (var i = 3; i < 4; i++) {//floor
            for (var j = 0; j < 2; j++) {//tower
                for (var k = 0; k < 2; k++) {//wing
                    for (var u = 1; u < 15; u++) {
                        var url_unit = '/newmodel/StandardLevel/Tower' + array_tower[j] + '/level' + i + '/' + array_tower[j] + '-' + i + '-' + array_wing[k] + '-' + u + '.ply';
                        var name_unit = array_tower[j] + '-' + i + '-' + array_wing[k] + '-' + u;
                        loadPLY1(url_unit, name_unit);
                    }
                }
            }

        }

    }

    // load_standard1();

    function getbounds(mesh) {
        var xmin = Math.min.apply(null, x_min_group);
        var ymin = Math.min.apply(null, y_min_group);
        var zmin = Math.min.apply(null, z_min_group);
        var xmax = Math.max.apply(null, x_max_group);
        var ymax = Math.max.apply(null, y_max_group);
        var zmax = Math.max.apply(null, z_max_group);
        centerX = (xmax + xmin) / 2;
        centerY = (ymax + ymin) / 2;
        centerZ = (zmax + zmin) / 2;
        let lookPos1 = new THREE.Vector3(centerX, centerY, centerZ);
        console.log("%f, %f, %f", centerX, centerY, centerZ);
        console.log("%f, %f, %f", xmax - xmin, ymax - ymin, zmax - zmin);
        // mesh.localToWorld(lookPos1);
        // console.log("%f, %f, %f", lookPos1.x, lookPos1.y, lookPos1.z);
        // const geometry = new THREE.BoxGeometry( 10, 10, 10 );
        // const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
        // const cube = new THREE.Mesh( geometry, material );
        // cube.position.set(38.076065527275205, 16.812720179557818, -41.02260017395019)

        // scene.add(cube);

        // const boundinggeoetry = new THREE.BoxGeometry( xmax-xmin, ymax-ymin, zmax-zmin );
        //     //const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
        //     var edgesMaterial = new THREE.LineBasicMaterial({
        //         color:0xECE32E,
        //         transparent:true,
        //         opacity:2
        //     })
        //     const boundingline = new THREE.LineSegments( boundinggeoetry, edgesMaterial );
        //     boundingline.position.set((xmax+xmin)/2, (ymax+ymin)/2, (zmax+zmin)/2)
        //     scene.add(boundingline)
    }

    //加载第二层标准层
    function loadPLY2(url, nameID) {
        const loader = new PLYLoader();
        loader.load(url, function (geometry) {

            geometry.computeVertexNormals();

            const material = new THREE.MeshPhongMaterial({color: 0x62605F, specular: 0x111111, shininess: 200});
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.set(-123.04345166015625, -84.4871513671875, -46.603991455078145);
            mesh.rotation.x = -Math.PI / 2;
            mesh.scale.multiplyScalar(3);
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
            })
            var line = new THREE.LineSegments(edges, edgesMaterial);
            line.scale.multiplyScalar(3);
            line.position.set(-123.04345166015625, -84.4871513671875, -46.603991455078145);
            line.rotateX(-Math.PI / 2);
            group1.add(mesh);
            group1.add(line);
            scene.add(group1);
        });
    }

    function load_standard2() {
        for (var t = 0; t < 2; t++) {
            var url_connection = '/newmodel/StandardLevel/Tower' + array_tower[t] + '/level4/' + array_tower[t] + '-4-TR.ply';
            loadPLY2(url_connection);
        }
        for (var i = 4; i < 5; i++) {//floor
            for (var j = 0; j < 2; j++) {//tower
                for (var k = 0; k < 2; k++) {//wing
                    for (var u = 1; u < 15; u++) {
                        var url_unit = '/newmodel/StandardLevel/Tower' + array_tower[j] + '/level' + i + '/' + array_tower[j] + '-' + i + '-' + array_wing[k] + '-' + u + '.ply';
                        var name_unit = array_tower[j] + '-' + i + '-' + array_wing[k] + '-' + u;
                        loadPLY2(url_unit, name_unit);
                    }
                }
            }

        }

    }

    // load_standard2();

    //加载第三层标准层
    function loadPLY3(url, nameID) {
        const loader = new PLYLoader();
        loader.load(url, function (geometry) {

            geometry.computeVertexNormals();

            const material = new THREE.MeshPhongMaterial({color: 0x62605F, specular: 0x111111, shininess: 200});
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.set(-123.04345166015625, -74.4871513671875, -46.603991455078145);
            mesh.rotation.x = -Math.PI / 2;
            mesh.scale.multiplyScalar(3);
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
            })
            var line = new THREE.LineSegments(edges, edgesMaterial);
            line.scale.multiplyScalar(3);
            line.position.set(-123.04345166015625, -74.4871513671875, -46.603991455078145);
            line.rotateX(-Math.PI / 2);

            group1.add(mesh);
            group1.add(line);
            scene.add(group1);
        });
    }

    function load_standard3() {
        for (var t = 0; t < 2; t++) {
            var url_connection = '/newmodel/StandardLevel/Tower' + array_tower[t] + '/level5/' + array_tower[t] + '-5-TR.ply';
            loadPLY3(url_connection);
        }
        for (var i = 5; i < 6; i++) {//floor
            for (var j = 0; j < 2; j++) {//tower
                for (var k = 0; k < 2; k++) {//wing
                    for (var u = 1; u < 15; u++) {
                        var url_unit = '/newmodel/StandardLevel/Tower' + array_tower[j] + '/level' + i + '/' + array_tower[j] + '-' + i + '-' + array_wing[k] + '-' + u + '.ply';
                        var name_unit = array_tower[j] + '-' + i + '-' + array_wing[k] + '-' + u;
                        loadPLY3(url_unit, name_unit);
                    }
                }
            }
        }

    }

    // load_standard3();

    //加载第四层标准层
    function loadPLY4(url, nameID) {
        const loader = new PLYLoader();
        loader.load(url, function (geometry) {

            geometry.computeVertexNormals();

            const material = new THREE.MeshPhongMaterial({color: 0x62605F, specular: 0x111111, shininess: 200});
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.set(-123.04345166015625, -64.4871513671875, -46.603991455078145);
            mesh.rotation.x = -Math.PI / 2;
            mesh.scale.multiplyScalar(3);
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
            })
            var line = new THREE.LineSegments(edges, edgesMaterial);
            line.scale.multiplyScalar(3);
            line.position.set(-123.04345166015625, -64.4871513671875, -46.603991455078145);
            line.rotateX(-Math.PI / 2);

            group1.add(mesh);
            group1.add(line);
            scene.add(group1);
        });
    }

    function load_standard4() {
        for (var t = 0; t < 2; t++) {
            var url_connection = '/newmodel/StandardLevel/Tower' + array_tower[t] + '/level6/' + array_tower[t] + '-6-TR.ply';
            loadPLY4(url_connection);
        }
        for (var i = 6; i < 7; i++) {//floor
            for (var j = 0; j < 2; j++) {//tower
                for (var k = 0; k < 2; k++) {//wing
                    for (var u = 1; u < 15; u++) {
                        var url_unit = '/newmodel/StandardLevel/Tower' + array_tower[j] + '/level' + i + '/' + array_tower[j] + '-' + i + '-' + array_wing[k] + '-' + u + '.ply';
                        var name_unit = array_tower[j] + '-' + i + '-' + array_wing[k] + '-' + u;
                        loadPLY4(url_unit, name_unit);
                    }
                }
            }
        }

    }

    // load_standard4();

    //加载第五层标准层
    function loadPLY5(url, nameID) {
        const loader = new PLYLoader();
        loader.load(url, function (geometry) {

            geometry.computeVertexNormals();

            const material = new THREE.MeshPhongMaterial({color: 0x62605F, specular: 0x111111, shininess: 200});
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.set(-123.04345166015625, -54.4871513671875, -46.603991455078145);
            mesh.rotation.x = -Math.PI / 2;
            mesh.scale.multiplyScalar(3);
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
            })
            var line = new THREE.LineSegments(edges, edgesMaterial);
            line.scale.multiplyScalar(3);
            line.position.set(-123.04345166015625, -54.4871513671875, -46.603991455078145);
            line.rotateX(-Math.PI / 2);

            group1.add(mesh);
            group1.add(line);
            scene.add(group1);
        });
    }

    function load_standard5() {
        for (var t = 0; t < 2; t++) {
            var url_connection = '/newmodel/StandardLevel/Tower' + array_tower[t] + '/level7/' + array_tower[t] + '-7-TR.ply';
            loadPLY5(url_connection);
        }
        for (var i = 7; i < 8; i++) {//floor
            for (var j = 0; j < 2; j++) {//tower
                for (var k = 0; k < 2; k++) {//wing
                    for (var u = 1; u < 15; u++) {
                        var url_unit = '/newmodel/StandardLevel/Tower' + array_tower[j] + '/level' + i + '/' + array_tower[j] + '-' + i + '-' + array_wing[k] + '-' + u + '.ply';
                        var name_unit = array_tower[j] + '-' + i + '-' + array_wing[k] + '-' + u;
                        loadPLY5(url_unit, name_unit);
                    }
                }
            }
        }

    }

    // load_standard5();

    //加载第六层标准层
    function loadPLY6(url, nameID) {
        const loader = new PLYLoader();
        loader.load(url, function (geometry) {

            geometry.computeVertexNormals();

            const material = new THREE.MeshPhongMaterial({color: 0x62605F, specular: 0x111111, shininess: 200});
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.set(-123.04345166015625, -44.4871513671875, -46.603991455078145);
            mesh.rotation.x = -Math.PI / 2;
            mesh.scale.multiplyScalar(3);
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
            })
            var line = new THREE.LineSegments(edges, edgesMaterial);
            line.scale.multiplyScalar(3);
            line.position.set(-123.04345166015625, -44.4871513671875, -46.603991455078145);
            line.rotateX(-Math.PI / 2);
            group1.add(mesh);
            group1.add(line);
            scene.add(group1);
        });
    }

    function load_standard6() {
        for (var t = 0; t < 2; t++) {
            var url_connection = '/newmodel/StandardLevel/Tower' + array_tower[t] + '/level8/' + array_tower[t] + '-8-TR.ply';
            loadPLY6(url_connection);
        }
        for (var i = 8; i < 9; i++) {//floor
            for (var j = 0; j < 2; j++) {//tower
                for (var k = 0; k < 2; k++) {//wing
                    for (var u = 1; u < 15; u++) {
                        var url_unit = '/newmodel/StandardLevel/Tower' + array_tower[j] + '/level' + i + '/' + array_tower[j] + '-' + i + '-' + array_wing[k] + '-' + u + '.ply';
                        var name_unit = array_tower[j] + '-' + i + '-' + array_wing[k] + '-' + u;
                        loadPLY6(url_unit, name_unit);
                    }
                }
            }
        }

    }

    // load_standard6();

    //加载标准层第七层
    function loadPLY7(url, nameID) {
        const loader = new PLYLoader();
        loader.load(url, function (geometry) {

            geometry.computeVertexNormals();

            const material = new THREE.MeshPhongMaterial({color: 0x62605F, specular: 0x111111, shininess: 200});
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.set(-123.04345166015625, -34.4871513671875, -46.603991455078145);
            mesh.rotation.x = -Math.PI / 2;
            mesh.scale.multiplyScalar(3);
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
            })
            var line = new THREE.LineSegments(edges, edgesMaterial);
            line.scale.multiplyScalar(3);
            line.position.set(-123.04345166015625, -34.4871513671875, -46.603991455078145);
            line.rotateX(-Math.PI / 2);


            group1.add(mesh);
            group1.add(line);
            scene.add(group1);
        });
    }

    function load_standard7() {
        for (var t = 0; t < 2; t++) {
            var url_connection = '/newmodel/StandardLevel/Tower' + array_tower[t] + '/level9/' + array_tower[t] + '-9-TR.ply';
            loadPLY7(url_connection);
        }
        for (var i = 9; i < 10; i++) {//floor
            for (var j = 0; j < 2; j++) {//tower
                for (var k = 0; k < 2; k++) {//wing
                    for (var u = 1; u < 15; u++) {
                        var url_unit = '/newmodel/StandardLevel/Tower' + array_tower[j] + '/level' + i + '/' + array_tower[j] + '-' + i + '-' + array_wing[k] + '-' + u + '.ply';
                        var name_unit = array_tower[j] + '-' + i + '-' + array_wing[k] + '-' + u;
                        loadPLY7(url_unit, name_unit);
                    }
                }
            }
        }

    }

    // load_standard7();

    //加载第八层标准层
    function loadPLY8(url, nameID) {
        const loader = new PLYLoader();
        loader.load(url, function (geometry) {

            geometry.computeVertexNormals();

            const material = new THREE.MeshPhongMaterial({color: 0x62605F, specular: 0x111111, shininess: 200});
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.set(-123.04345166015625, -24.4871513671875, -46.603991455078145);
            mesh.rotation.x = -Math.PI / 2;
            mesh.scale.multiplyScalar(3);
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
            })
            var line = new THREE.LineSegments(edges, edgesMaterial);
            line.scale.multiplyScalar(3);
            line.position.set(-123.04345166015625, -24.4871513671875, -46.603991455078145);
            line.rotateX(-Math.PI / 2);


            group1.add(mesh);
            group1.add(line);
            scene.add(group1);
        });
    }

    function load_standard8() {
        for (var t = 0; t < 2; t++) {
            var url_connection = '/newmodel/StandardLevel/Tower' + array_tower[t] + '/level10/' + array_tower[t] + '-10-TR.ply';
            loadPLY8(url_connection);
        }
        for (var i = 10; i < 11; i++) {//floor
            for (var j = 0; j < 2; j++) {//tower
                for (var k = 0; k < 2; k++) {//wing
                    for (var u = 1; u < 15; u++) {
                        var url_unit = '/newmodel/StandardLevel/Tower' + array_tower[j] + '/level' + i + '/' + array_tower[j] + '-' + i + '-' + array_wing[k] + '-' + u + '.ply';
                        var name_unit = array_tower[j] + '-' + i + '-' + array_wing[k] + '-' + u;
                        loadPLY8(url_unit, name_unit);
                    }
                }
            }
        }

    }

    // load_standard8();

    //加载第九层标准层
    function loadPLY9(url, nameID) {
        const loader = new PLYLoader();
        loader.load(url, function (geometry) {

            geometry.computeVertexNormals();

            const material = new THREE.MeshPhongMaterial({color: 0x62605F, specular: 0x111111, shininess: 200});
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.set(-123.04345166015625, -14.4871513671875, -46.603991455078145);
            mesh.rotation.x = -Math.PI / 2;
            mesh.scale.multiplyScalar(3);
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
            })
            var line = new THREE.LineSegments(edges, edgesMaterial);
            line.scale.multiplyScalar(3);
            line.position.set(-123.04345166015625, -14.4871513671875, -46.603991455078145);
            line.rotateX(-Math.PI / 2);


            group1.add(mesh);
            group1.add(line);
            scene.add(group1);
        });
    }

    function load_standard9() {
        for (var t = 0; t < 2; t++) {
            var url_connection = '/newmodel/StandardLevel/Tower' + array_tower[t] + '/level11/' + array_tower[t] + '-11-TR.ply';
            loadPLY9(url_connection);
        }
        for (var i = 11; i < 12; i++) {//floor
            for (var j = 0; j < 2; j++) {//tower
                for (var k = 0; k < 2; k++) {//wing
                    for (var u = 1; u < 15; u++) {
                        var url_unit = '/newmodel/StandardLevel/Tower' + array_tower[j] + '/level' + i + '/' + array_tower[j] + '-' + i + '-' + array_wing[k] + '-' + u + '.ply';
                        var name_unit = array_tower[j] + '-' + i + '-' + array_wing[k] + '-' + u;
                        loadPLY9(url_unit, name_unit);
                    }
                }
            }
        }

    }

    // load_standard9();

    //加载第十层标准层
    function loadPLY10(url, nameID) {
        const loader = new PLYLoader();
        loader.load(url, function (geometry) {

            geometry.computeVertexNormals();

            const material = new THREE.MeshPhongMaterial({color: 0x62605F, specular: 0x111111, shininess: 200});
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.set(-123.04345166015625, -4.4871513671875, -46.603991455078145);
            mesh.rotation.x = -Math.PI / 2;
            mesh.scale.multiplyScalar(3);
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
            })
            var line = new THREE.LineSegments(edges, edgesMaterial);
            line.scale.multiplyScalar(3);
            line.position.set(-123.04345166015625, -4.4871513671875, -46.603991455078145);
            line.rotateX(-Math.PI / 2);


            group1.add(mesh);
            group1.add(line);
            scene.add(group1);
        });
    }

    function load_standard10() {
        for (var t = 0; t < 2; t++) {
            var url_connection = '/newmodel/StandardLevel/Tower' + array_tower[t] + '/level12/' + array_tower[t] + '-12-TR.ply';
            loadPLY10(url_connection);
        }
        for (var i = 12; i < 13; i++) {//floor
            for (var j = 0; j < 2; j++) {//tower
                for (var k = 0; k < 2; k++) {//wing
                    for (var u = 1; u < 15; u++) {
                        var url_unit = '/newmodel/StandardLevel/Tower' + array_tower[j] + '/level' + i + '/' + array_tower[j] + '-' + i + '-' + array_wing[k] + '-' + u + '.ply';
                        var name_unit = array_tower[j] + '-' + i + '-' + array_wing[k] + '-' + u;
                        loadPLY10(url_unit, name_unit);
                    }
                }
            }
        }

    }

    // load_standard10();

    //加载第11层标准层
    function loadPLY11(url, nameID) {
        const loader = new PLYLoader();
        loader.load(url, function (geometry) {

            geometry.computeVertexNormals();

            const material = new THREE.MeshPhongMaterial({color: 0x62605F, specular: 0x111111, shininess: 200});
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.set(-123.04345166015625, 5.512848633, -46.603991455078145);
            mesh.rotation.x = -Math.PI / 2;
            mesh.scale.multiplyScalar(3);
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
            })
            var line = new THREE.LineSegments(edges, edgesMaterial);
            line.scale.multiplyScalar(3);
            line.position.set(-123.04345166015625, 5.512848633, -46.603991455078145);
            line.rotateX(-Math.PI / 2);


            scene.add(mesh);
            scene.add(line);
        });
    }

    function load_standard11() {
        for (var t = 0; t < 2; t++) {
            var url_connection = '/newmodel/StandardLevel/Tower' + array_tower[t] + '/level13/' + array_tower[t] + '-13-TR.ply';
            loadPLY11(url_connection);
        }
        for (var i = 13; i < 14; i++) {//floor
            for (var j = 0; j < 2; j++) {//tower
                for (var k = 0; k < 2; k++) {//wing
                    for (var u = 1; u < 15; u++) {
                        var url_unit = '/newmodel/StandardLevel/Tower' + array_tower[j] + '/level' + i + '/' + array_tower[j] + '-' + i + '-' + array_wing[k] + '-' + u + '.ply';
                        var name_unit = array_tower[j] + '-' + i + '-' + array_wing[k] + '-' + u;
                        loadPLY11(url_unit, name_unit);
                    }
                }
            }
        }

    }

    // load_standard11();

    //加载第12层标准层
    function loadPLY12(url, nameID) {
        const loader = new PLYLoader();
        loader.load(url, function (geometry) {

            geometry.computeVertexNormals();

            const material = new THREE.MeshPhongMaterial({color: 0x62605F, specular: 0x111111, shininess: 200});
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.set(-123.04345166015625, 15.512848633, -46.603991455078145);
            mesh.rotation.x = -Math.PI / 2;
            mesh.scale.multiplyScalar(3);
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
            })
            var line = new THREE.LineSegments(edges, edgesMaterial);
            line.scale.multiplyScalar(3);
            line.position.set(-123.04345166015625, 15.512848633, -46.603991455078145);
            line.rotateX(-Math.PI / 2);


            group1.add(mesh);
            group1.add(line);
            scene.add(group1);
        });
    }

    function load_standard12() {
        for (var t = 0; t < 2; t++) {
            var url_connection = '/newmodel/StandardLevel/Tower' + array_tower[t] + '/level14/' + array_tower[t] + '-14-TR.ply';
            loadPLY12(url_connection);
        }
        for (var i = 14; i < 15; i++) {//floor
            for (var j = 0; j < 2; j++) {//tower
                for (var k = 0; k < 2; k++) {//wing
                    for (var u = 1; u < 15; u++) {
                        var url_unit = '/newmodel/StandardLevel/Tower' + array_tower[j] + '/level' + i + '/' + array_tower[j] + '-' + i + '-' + array_wing[k] + '-' + u + '.ply';
                        var name_unit = array_tower[j] + '-' + i + '-' + array_wing[k] + '-' + u;
                        loadPLY12(url_unit, name_unit);
                    }
                }
            }
        }

    }

    // load_standard12();

    //加载第13层标准层
    function loadPLY13(url, nameID) {
        const loader = new PLYLoader();
        loader.load(url, function (geometry) {

            geometry.computeVertexNormals();

            const material = new THREE.MeshPhongMaterial({color: 0x62605F, specular: 0x111111, shininess: 200});
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.set(-123.04345166015625, 25.512848633, -46.603991455078145);
            mesh.rotation.x = -Math.PI / 2;
            mesh.scale.multiplyScalar(3);
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
            })
            var line = new THREE.LineSegments(edges, edgesMaterial);
            line.scale.multiplyScalar(3);
            line.position.set(-123.04345166015625, 25.512848633, -46.603991455078145);
            line.rotateX(-Math.PI / 2);


            group1.add(mesh);
            group1.add(line);
            scene.add(group1);
        });
    }

    function load_standard13() {
        for (var t = 0; t < 2; t++) {
            var url_connection = '/newmodel/StandardLevel/Tower' + array_tower[t] + '/level15/' + array_tower[t] + '-15-TR.ply';
            loadPLY13(url_connection);
        }
        for (var i = 15; i < 16; i++) {//floor
            for (var j = 0; j < 2; j++) {//tower
                for (var k = 0; k < 2; k++) {//wing
                    for (var u = 1; u < 15; u++) {
                        var url_unit = '/newmodel/StandardLevel/Tower' + array_tower[j] + '/level' + i + '/' + array_tower[j] + '-' + i + '-' + array_wing[k] + '-' + u + '.ply';
                        var name_unit = array_tower[j] + '-' + i + '-' + array_wing[k] + '-' + u;
                        loadPLY13(url_unit, name_unit);
                    }
                }
            }
        }

    }

    // load_standard13();

    //加载第14层标准层
    function loadPLY14(url, nameID) {
        const loader = new PLYLoader();
        loader.load(url, function (geometry) {

            geometry.computeVertexNormals();

            const material = new THREE.MeshPhongMaterial({color: 0x62605F, specular: 0x111111, shininess: 200});
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.set(-123.04345166015625, 35.512848633, -46.603991455078145);
            mesh.rotation.x = -Math.PI / 2;
            mesh.scale.multiplyScalar(3);
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
            })
            var line = new THREE.LineSegments(edges, edgesMaterial);
            line.scale.multiplyScalar(3);
            line.position.set(-123.04345166015625, 35.512848633, -46.603991455078145);
            line.rotateX(-Math.PI / 2);


            group1.add(mesh);
            group1.add(line);
            scene.add(group1);
        });
    }

    function load_standard14() {
        for (var t = 0; t < 2; t++) {
            var url_connection = '/newmodel/StandardLevel/Tower' + array_tower[t] + '/level16/' + array_tower[t] + '-16-TR.ply';
            loadPLY14(url_connection);
        }
        for (var i = 16; i < 17; i++) {//floor
            for (var j = 0; j < 2; j++) {//tower
                for (var k = 0; k < 2; k++) {//wing
                    for (var u = 1; u < 15; u++) {
                        var url_unit = '/newmodel/StandardLevel/Tower' + array_tower[j] + '/level' + i + '/' + array_tower[j] + '-' + i + '-' + array_wing[k] + '-' + u + '.ply';
                        var name_unit = array_tower[j] + '-' + i + '-' + array_wing[k] + '-' + u;
                        loadPLY14(url_unit, name_unit);
                    }
                }
            }
        }

    }

    // load_standard14();

    //加载第15层标准层
    function loadPLY15(url, nameID) {
        const loader = new PLYLoader();
        loader.load(url, function (geometry) {

            geometry.computeVertexNormals();

            const material = new THREE.MeshPhongMaterial({color: 0x62605F, specular: 0x111111, shininess: 200});
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.set(-123.04345166015625, 45.512848633, -46.603991455078145);
            mesh.rotation.x = -Math.PI / 2;
            mesh.scale.multiplyScalar(3);
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
            })
            var line = new THREE.LineSegments(edges, edgesMaterial);
            line.scale.multiplyScalar(3);
            line.position.set(-123.04345166015625, 45.512848633, -46.603991455078145);
            line.rotateX(-Math.PI / 2);


            group1.add(mesh);
            group1.add(line);
            scene.add(group1);
        });
    }

    function load_standard15() {
        for (var t = 0; t < 2; t++) {
            var url_connection = '/newmodel/StandardLevel/Tower' + array_tower[t] + '/level17/' + array_tower[t] + '-17-TR.ply';
            loadPLY15(url_connection);
        }
        for (var i = 17; i < 18; i++) {//floor
            for (var j = 0; j < 2; j++) {//tower
                for (var k = 0; k < 2; k++) {//wing
                    for (var u = 1; u < 15; u++) {
                        var url_unit = '/newmodel/StandardLevel/Tower' + array_tower[j] + '/level' + i + '/' + array_tower[j] + '-' + i + '-' + array_wing[k] + '-' + u + '.ply';
                        var name_unit = array_tower[j] + '-' + i + '-' + array_wing[k] + '-' + u;
                        loadPLY15(url_unit, name_unit);
                    }
                }
            }
        }

    }

    // load_standard15();

    //加载第16层标准层
    function loadPLY16(url, nameID) {
        const loader = new PLYLoader();
        loader.load(url, function (geometry) {

            geometry.computeVertexNormals();

            const material = new THREE.MeshPhongMaterial({color: 0x62605F, specular: 0x111111, shininess: 200});
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.set(-123.04345166015625, 55.512848633, -46.603991455078145);
            mesh.rotation.x = -Math.PI / 2;
            mesh.scale.multiplyScalar(3);
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
            })
            var line = new THREE.LineSegments(edges, edgesMaterial);
            line.scale.multiplyScalar(3);
            line.position.set(-123.04345166015625, 55.512848633, -46.603991455078145);
            line.rotateX(-Math.PI / 2);


            group1.add(mesh);
            group1.add(line);
            scene.add(group1);
        });
    }

    function load_standard16() {
        for (var t = 0; t < 2; t++) {
            var url_connection = '/newmodel/StandardLevel/Tower' + array_tower[t] + '/level18/' + array_tower[t] + '-18-TR.ply';
            loadPLY16(url_connection);
        }

        for (var i = 18; i < 19; i++) {//floor
            for (var j = 0; j < 2; j++) {//tower
                loadPLY16()
                for (var k = 0; k < 2; k++) {//wing
                    for (var u = 1; u < 15; u++) {
                        var url_unit = '/newmodel/StandardLevel/Tower' + array_tower[j] + '/level' + i + '/' + array_tower[j] + '-' + i + '-' + array_wing[k] + '-' + u + '.ply';
                        var name_unit = array_tower[j] + '-' + i + '-' + array_wing[k] + '-' + u;
                        loadPLY16(url_unit, name_unit);
                    }
                }
            }
        }

    }

    // load_standard16();

    //加载第17层标准层
    function loadPLY17(url, nameID) {
        const loader = new PLYLoader();
        loader.load(url, function (geometry) {

            geometry.computeVertexNormals();

            const material = new THREE.MeshPhongMaterial({color: 0x62605F, specular: 0x111111, shininess: 200});
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.set(-123.04345166015625, 65.512848633, -46.603991455078145);
            mesh.rotation.x = -Math.PI / 2;
            mesh.scale.multiplyScalar(3);
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
            })
            var line = new THREE.LineSegments(edges, edgesMaterial);
            line.scale.multiplyScalar(3);
            line.position.set(-123.04345166015625, 65.512848633, -46.603991455078145);
            line.rotateX(-Math.PI / 2);


            group1.add(mesh);
            group1.add(line);
            scene.add(group1);

            // scene.updateMatrixWorld(true);
            // var worldPosition = new THREE.Vector3();
            // mesh.getWorldPosition(worldPosition);
            // console.log(worldPosition)
        });
    }

    function load_standard17() {
        for (var t = 0; t < 2; t++) {
            var url_connection = '/newmodel/StandardLevel/Tower' + array_tower[t] + '/level18/' + array_tower[t] + '-18-TR.ply';
            loadPLY17(url_connection);
        }

        for (var i = 19; i < 20; i++) {//floor
            for (var j = 0; j < 2; j++) {//tower
                loadPLY17()
                for (var k = 0; k < 2; k++) {//wing
                    for (var u = 1; u < 15; u++) {
                        var url_unit = '/newmodel/StandardLevel/Tower' + array_tower[j] + '/level' + i + '/' + array_tower[j] + '-' + i + '-' + array_wing[k] + '-' + u + '.ply';
                        var name_unit = array_tower[j] + '-' + i + '-' + array_wing[k] + '-' + u;
                        loadPLY17(url_unit, name_unit);
                    }
                }
            }
        }

    }

    // load_standard17();

    //加载屋顶
    function loadPLY18(url, nameID) {
        const loader = new PLYLoader();
        loader.load(url, function (geometry) {

            geometry.computeVertexNormals();

            const material = new THREE.MeshPhongMaterial({color: 0x62605F, specular: 0x111111, shininess: 200});
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.set(-123.04345166015625, -77, -46.603991455078145);
            mesh.rotation.x = -Math.PI / 2;
            mesh.scale.multiplyScalar(3);
            mesh.material.opacity = 0.7;
            mesh.NameID = nameID;
            //;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            var worldPosition = new THREE.Vector3();
            mesh.getWorldPosition(worldPosition);
            // console.log(worldPosition)


            //为mesh添加轮廓线
            var edges = new THREE.EdgesGeometry(geometry);
            var edgesMaterial = new THREE.LineBasicMaterial({
                color: 0xECE32E,
                transparent: true,
                opacity: 2
            })
            var line = new THREE.LineSegments(edges, edgesMaterial);
            line.scale.multiplyScalar(3);
            line.position.set(-123.04345166015625, -77, -46.603991455078145);
            line.rotateX(-Math.PI / 2);


            group1.add(mesh);
            group1.add(line);
            scene.add(group1);
            //console.log("roof has been");
        });
    }

    // loadPLY18('/newmodel/roof.ply', 'roof');


    // function cloneModel(ply,x,y,z,name){
    //     const clonePLY= ply.clone();
    //     clonePLY.children.map((v,c)=>{
    //         if(v.material){
    //             v.material = ply.children(c).material.clone();
    //         }
    //     })
    //
    //     ply.name = name;
    //     clonePLY.position.set(x,y,z);
    //     this.group.add(clonePLY);
    // }


    //drc file

    // function load_drc(url,nameID){
    //     var loader = new DRACOLoader();
    //     loader.setDecoderPath('js/draco/');
    //     loader.load(url, function (geometry){
    //         geometry.computeVertexNormals();
    //         var material = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x111111, shininess: 200, vertexColors: THREE.VertexColors} );
    //         var mesh = = new THREE.Mesh(geometry,material);
    //         mesh.NameID = nameID;
    //         mesh.castShadow = true;
    //         mesh.receiveShadow = true;
    //         mesh.rotation.x = - Math.PI / 2;
    //         mesh.scale.multiplyScalar( 0.001 );
    //     })
    //
    // }

    //lights
    let light;
    scene.add(new THREE.AmbientLight(0x404040));

    light = new THREE.PointLight(0xffffff);
    light.position.set(0, 50, 50);

    //告诉平行光需要开启阴影投射
    light.castShadow = true;

    //canvas


    //renderer

    renderer = new THREE.WebGLRenderer({antialias: true, canvas: document.getElementById('3d-model')});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setClearColor(0xffffff);
    renderer.shadowMap.enabled = false;

    // container.appendChild(renderer.domElement);

    //stats
    stats = new Stats();
    // container.appendChild( stats.dom );

    // resize

    window.addEventListener('resize', onWindowResize);
    //document.addEventListener('click',onDocumentMouseClick,false);
}

function onWindowResize() {

    var width = window.innerWidth / 2;
    var height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);

}

// var mouse = new THREE.Vector2(), INTERSECTED;
// function onDocumentMouseClick(event){
//     mouse.x = (event.clientX / window.innerWidth)*2 - 1;
//     mouse.y = -(event.clientY / window.innerHeight)*2 + 1;
//     var x=event.clientX+50;
//     var y=event.clientY+50;
//     MouseClick();
// }
//
// function MouseClick(){
//     var mesh_array=[];
//     scene.children.forEach(child=>{
//         if (child.type == "Mesh"){
//             if (!child.name){
//                 mesh_array.push(child);
//             }
//         }
//     })

function animate() {

    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    //render();
    stats.update();

}


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