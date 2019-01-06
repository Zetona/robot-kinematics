// === form input & matrix calculation ===

// Add event listener to buttons
document.getElementById("fwkBtn").addEventListener("click", forwardKinematic);
document.getElementById("bwkBtn").addEventListener("click", backwardKinematic);
document.getElementById("rstBtn").addEventListener("click", reset);



// Field elements
input_l1 = document.getElementById("l1");
input_l2 = document.getElementById("l2");
input_l3 = document.getElementById("l3");
input_t1 = document.getElementById("t1");
input_t2 = document.getElementById("t2");
input_t3 = document.getElementById("t3");
input_x = document.getElementById("x");
input_y = document.getElementById("y");
input_z = document.getElementById("z");

// Sliders 
slider_t1 = document.getElementById("t1Slider");
slider_t2 = document.getElementById("t2Slider");
slider_t3 = document.getElementById("t3Slider");

// Add event listener to sliders
slider_t1.oninput = function () {
    input_t1.value = this.value;
    forwardKinematic();
}
slider_t2.oninput = function () {
    input_t2.value = this.value;
    forwardKinematic();
}
slider_t3.oninput = function () {
    input_t3.value = this.value;
    forwardKinematic();
}

function getInputValues() {
    var inputValues = {
        l1: input_l1.value,
        l2: input_l2.value,
        l3: input_l3.value,
        t1: input_t1.value,
        t2: input_t2.value,
        t3: input_t3.value,
        x: input_x.value,
        y: input_y.value,
        z: input_z.value
    }
    return inputValues;
}

function setInputValues(inputValues) {
    input_l1.value = inputValues.l1;
    input_l2.value = inputValues.l2;
    input_l3.value = inputValues.l3;
    input_t1.value = inputValues.t1;
    input_t2.value = inputValues.t2;
    input_t3.value = inputValues.t3;
    input_x.value = inputValues.x;
    input_y.value = inputValues.y;
    input_z.value = inputValues.z;
}

// Converts from degrees to radians.
Math.radians = function (degrees) {
    return degrees * Math.PI / 180;
};

// Round number
function round(num, places = 10) {
    return +(Math.round(num + "e+" + places) + "e-" + places) || 0;
}

// Round array
function roundArray(A) {
    return Array.from(A, x => round(x));
}

// Converts from radians to degrees.
Math.degrees = function (radians) {
    return radians * 180 / Math.PI;
};

// Convert transformation matrix to euler angle
function toEuler(TM) {
    console.log(TM);
    var alpha = 0;
    var beta = 0;
    var gamma = 0;
    var alpha = Math.atan2(TM[7], TM[8]);
    var beta = Math.atan2(-TM[6], Math.sqrt(Math.pow(TM[7], 2) + Math.pow(TM[8], 2)));
    var gamma = Math.atan2(TM[3], TM[0]);
    var euler = [alpha, beta, gamma];
    return euler;
}

function mAdd(A, B) {
    // create Float32Array from input
    A = Float32Array.from(A);
    B = Float32Array.from(B);
    var result = weblas.saxpy(3, 1, A, B);
    result = Array.from(result);
    return result;
}

function mMul(A, B) {
    // create Float32Array from input
    A = Float32Array.from(A);
    B = Float32Array.from(B);

    // define matrix dimension
    var height_A = 3, width_A = A.length / 3,
        height_B = 3, width_B = B.length / 3;

    var M = height_A,
        N = width_B,
        K = height_B;

    var alpha = 1.0;
    var beta = 0.0;
    var C = new Float32Array(width_B)

    var result = weblas.sgemm(M, N, K, alpha, A, B, beta, C);
    // convert to float array
    result = Array.from(result);
    return result;
}

function calcBaseTM(t1, t2, t3) {
    // convert degree input to radian
    var t1 = Math.radians(t1);
    var t2 = Math.radians(t2);
    var t3 = Math.radians(t3);

    // calculate local transformation matrix
    var C1 = [Math.cos(t1), 0, Math.sin(t1), 0, 1, 0, -Math.sin(t1), 0, Math.cos(t1)]
    var C2 = [Math.cos(t2), -Math.sin(t2), 0, Math.sin(t2), Math.cos(t2), 0, 0, 0, 1]
    var C3 = [Math.cos(t3), -Math.sin(t3), 0, Math.sin(t3), Math.cos(t3), 0, 0, 0, 1]

    //calculate base transformation matrix
    var baseC1 = C1;
    var baseC2 = mMul(C1, C2);
    var baseC3 = mMul(baseC2, C3);
    return [baseC1, baseC2, baseC3];
}

function calcLinkM(l1, l2, l3) {
    var LM1 = [0, l1, 0];
    var LM2 = [l2, 0, 0];
    var LM3 = [l3, 0, 0];
    return [LM1, LM2, LM3];
}

function forwardKinematic(event, renderOnly = false) {
    // get user input
    var input = getInputValues();

    // calculate local link matrices
    linkM = calcLinkM(input.l1, input.l2, input.l3);

    // calculate base transformation matrices
    baseTM = calcBaseTM(input.t1, input.t2, input.t3);

    // calculate each link's base end tip position
    var link1p = mMul(baseTM[0], linkM[0]);
    var link2p = mAdd(mMul(baseTM[1], linkM[1]), link1p);
    var link3p = mAdd(mMul(baseTM[2], linkM[2]), link2p);
    var linkP = [link1p, link2p, link3p];

    // show coordinate to user
    if (!renderOnly) {
        var coord = roundArray(link3p);
        input.x = coord[0];
        input.y = coord[1];
        input.z = coord[2];
        setInputValues(input);
    }

    // TODO: show calculation result

    // update scene
    update(linkM, baseTM, linkP);
}

function backwardKinematic() {
    // get user input
    var input = getInputValues();
    console.log(input);

    // TODO: calculate ln and tn

    // TODO: show values to user

    // use forward kinematic function to calculate 
    // transformation matrices and render the robot
    forwardKinematic(true);
}

function reset() {
    // get variables
    var input = getInputValues();
    console.log(input);
}



// === render canvas ===

// scene, camera, renderer
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 20;
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// update renderer and camera when browser is resized
window.addEventListener("resize", function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
})

// enable mouse camera control
var controls = new THREE.OrbitControls(camera, renderer.domElement);

// create plane geometry
var planeGeometry = new THREE.PlaneGeometry(50, 50, 50, 50);
var planeMaterial = new THREE.MeshBasicMaterial({ color: 0x555555, wireframe: true });
var plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = Math.PI / 2;
scene.add(plane);

// create robot geometry
var material1 = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true });
var material2 = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true });
var material3 = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

var sphereGeometry = new THREE.SphereGeometry(0.5, 10, 10);
var material4 = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });

var meshesArray = [];

var defaultPosition = function () {
    // reset all geometries position to default
    meshesArray.forEach(function (mesh) {
        mesh.position.set(0, 0, 0);
        mesh.rotation.set(0, 0, 0);
    });
}

var resetScene = function () {
    // remove all geometries from scene
    meshesArray.forEach(function (mesh) {
        scene.remove(mesh);
    });
    meshesArray = [];
}

var createMeshes = function (linkM) {
    var boxGeometry1 = new THREE.BoxGeometry(1, Math.max(...linkM[0]), 1);
    var boxGeometry2 = new THREE.BoxGeometry(1, Math.max(...linkM[1]), 1);
    var boxGeometry3 = new THREE.BoxGeometry(1, Math.max(...linkM[2]), 1);
    var cube1 = new THREE.Mesh(boxGeometry1, material1);
    var cube2 = new THREE.Mesh(boxGeometry2, material2);
    var cube3 = new THREE.Mesh(boxGeometry3, material3);
    var joint1 = new THREE.Mesh(sphereGeometry, material4);
    var joint2 = new THREE.Mesh(sphereGeometry, material4);
    var joint3 = new THREE.Mesh(sphereGeometry, material4);
    var pivotPoint1 = new THREE.Object3D();
    var pivotPoint2 = new THREE.Object3D();
    var pivotPoint3 = new THREE.Object3D();

    joint1.eulerOrder = 'ZYX';
    joint2.eulerOrder = 'ZYX';
    joint3.eulerOrder = 'ZYX';
    joint1.add(pivotPoint1);
    joint2.add(pivotPoint2);
    joint3.add(pivotPoint3);
    pivotPoint1.add(cube1);
    pivotPoint2.add(cube2);
    pivotPoint3.add(cube3);
    scene.add(joint1);
    scene.add(joint2);
    scene.add(joint3);

    cube1.translateY(Math.max(...linkM[0]) / 2);
    cube2.translateY(Math.max(...linkM[1]) / 2);
    cube3.translateY(Math.max(...linkM[2]) / 2);
    pivotPoint2.rotation.z = -Math.PI / 2;
    pivotPoint3.rotation.z = -Math.PI / 2;

    meshesArray = [cube1, cube2, cube3, joint1, joint2, joint3];
}

var transformMeshes = function (baseTM, linkP) {
    // translate each mesh to calculated position
    meshesArray[4].position.set(linkP[0][0], linkP[0][1], linkP[0][2]);
    meshesArray[5].position.set(linkP[1][0], linkP[1][1], linkP[1][2]);
    // calculate euler angle for each baseTM
    var eulerM = [toEuler(baseTM[0]), toEuler(baseTM[1]), toEuler(baseTM[2])];
    // apply graphical rotation to each link
    console.log("Euler");
    console.log(eulerM[0]);
    console.log(eulerM[1]);
    console.log(eulerM[2]);
    var a1 = meshesArray[3].rotation;
    var a2 = meshesArray[4].rotation;
    var a3 = meshesArray[5].rotation;

    console.log("Link Rotation");
    console.log(a1);
    console.log(a2);
    console.log(a3);

    // rotate
    meshesArray[3].rotation.setFromVector3(new THREE.Vector3(eulerM[0][0], eulerM[0][1], eulerM[0][2]));
    meshesArray[4].rotation.setFromVector3(new THREE.Vector3(eulerM[1][0], eulerM[1][1], eulerM[1][2]));
    meshesArray[5].rotation.setFromVector3(new THREE.Vector3(eulerM[2][0], eulerM[2][1], eulerM[2][2]));

}

var update = function (linkM, baseTM, linkP) {
    resetScene();
    createMeshes(linkM);
    transformMeshes(baseTM, linkP);
}

var render = function () {
    renderer.render(scene, camera);
};

var gl_main = function () {
    requestAnimationFrame(gl_main);
    render();
}

gl_main();