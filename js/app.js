// === Variables ===

// Enum for robot types
var RobotType = Object.freeze({ "cartesian": 0, "cylindrical": 1, "spherical": 2, "articulated": 3 })
var robotType = RobotType.articulated;

// Div and div toggler
var div_input = document.getElementById("info-input");
var div_calculation = document.getElementById("info-calculation");
var toggle_input = document.getElementById("toggle-input");
var toggle_calculation = document.getElementById("toggle-calculation");

// Buttons
var button_car = document.getElementById("carBtn");
var button_cyl = document.getElementById("cylBtn");
var button_sph = document.getElementById("sphBtn");
var button_art = document.getElementById("artBtn");
var button_fwd = document.getElementById("fwkBtn");
var button_inv = document.getElementById("invBtn");
var button_rst = document.getElementById("rstBtn");

// Field elements
var input_l1 = document.getElementById("l1");
var input_l2 = document.getElementById("l2");
var input_l3 = document.getElementById("l3");
var input_t1 = document.getElementById("t1");
var input_t2 = document.getElementById("t2");
var input_t3 = document.getElementById("t3");
var input_x = document.getElementById("x");
var input_y = document.getElementById("y");
var input_z = document.getElementById("z");
var input_fields = [input_l1, input_l2, input_l3, input_t1, input_t2, input_t3, input_x, input_y, input_z];

// Sliders 
var slider_l1 = document.getElementById("l1Slider");
var slider_l2 = document.getElementById("l2Slider");
var slider_l3 = document.getElementById("l3Slider");
var slider_t1 = document.getElementById("t1Slider");
var slider_t2 = document.getElementById("t2Slider");
var slider_t3 = document.getElementById("t3Slider");
var slider_x = document.getElementById("xSlider");
var slider_y = document.getElementById("ySlider");
var slider_z = document.getElementById("zSlider");
var sliders = [slider_l1, slider_l2, slider_l3, slider_t1, slider_t2, slider_t3, slider_x, slider_y, slider_z];

// scene, camera, renderer
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 20;
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth - 5, window.innerHeight - 5);
document.body.appendChild(renderer.domElement);

// update renderer and camera when browser is resized
window.addEventListener("resize", function () {
    renderer.setSize(window.innerWidth - 5, window.innerHeight - 5);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
})

// enable mouse camera control
var controls = new THREE.OrbitControls(camera, renderer.domElement);

// create geometry for plane
var planeGeometry = new THREE.PlaneGeometry(50, 50, 50, 50);
var planeMaterial = new THREE.MeshBasicMaterial({ color: 0x555555, wireframe: true });
var plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = Math.PI / 2;
scene.add(plane);

// create geometry for axes
var axes = new THREE.AxesHelper(25);
scene.add(axes);

// create geometry for links
var material1 = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true });
var material2 = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true });
var material3 = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
var material4 = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
var meshesArray = [];



// === Event listeners ===

// Add event listner to div toggle
toggle_input.addEventListener("click", function () { toggleDiv("info-input") }, false);
toggle_calculation.addEventListener("click", function () { toggleDiv("info-calculation") }, false);

// Add event listener to buttons
button_car.addEventListener("click", function () { robotChange(this.value) });
button_cyl.addEventListener("click", function () { robotChange(this.value) });
button_sph.addEventListener("click", function () { robotChange(this.value) });
button_art.addEventListener("click", function () { robotChange(this.value) });
button_fwd.addEventListener("click", forwardKinematic);
button_inv.addEventListener("click", inverseKinematic);
button_rst.addEventListener("click", resetField);

// Add event listener to fields
input_fields.forEach(function (input) {
    input.onchange = function () {
        matchSlider();
    };
});

// Add event listener to sliders
sliders.forEach(function (slider, i) {
    slider.oninput = function () {
        input_fields[i].value = this.value;
        if (i < 6) {
            forwardKinematic();
        }
        else {
            inverseKinematic();
        }
    };
});

// Add event listener to keyboard controls
window.onkeypress = function (e) {
    var key = e.keyCode ? e.keyCode : e.which;
    if (key == 68 || key == 100) { // key "d"
        input_x.value = parseFloat(input_x.value) + 0.2;
    } else if (key == 65 || key == 97) { // key "a"
        input_x.value = parseFloat(input_x.value) - 0.2;
    } else if (key == 87 || key == 119) { // key "w"
        input_y.value = parseFloat(input_y.value) + 0.2;
    } else if (key == 83 || key == 115) { // key "s"
        input_y.value = parseFloat(input_y.value) - 0.2;
    } else if (key == 81 || key == 113) { // key "q"
        input_z.value = parseFloat(input_z.value) + 0.2;
    } else if (key == 69 || key == 101) { // key "e"
        input_z.value = parseFloat(input_z.value) - 0.2;
    } else {
        return;
    }
    inverseKinematic();
}



// === Functions ===

// Show/hide div
function toggleDiv(id) {
    var x = document.getElementById(id);
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

// Get input values
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

// Set field values
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

// Reset input field to default values
function resetField() {
    // reset input fields
    input_l1.value = 5;
    input_l2.value = 5;
    input_l3.value = 5;
    input_t1.value = 0;
    input_t2.value = 0;
    input_t3.value = 0;
    changeFieldBG(null, null);

    // change slider position
    matchSlider();

    // perform forward kinematic and render default posture
    forwardKinematic();
}

// Reset the fields and re-render the scene when robot type is changed
function robotChange(inputRobotType) {
    robotType = inputRobotType;
    resetField();
    changeFieldBG();
    forwardKinematic();
}

// Change input field color (for showing error to user)
function changeFieldBG(type, color) {
    if (type == 0) {
        var inputs = [input_l1, input_l2, input_l3];
    } else if (type == 1) {
        var inputs = [input_x, input_y, input_z];
    } else {
        var inputs = [input_l1, input_l2, input_l3, input_x, input_y, input_z];
    }
    if (!color) {
        inputs.forEach(function (input) {
            input.removeAttribute("style");
        });
    } else {
        inputs.forEach(function (input) {
            input.style.backgroundColor = color;
        });
    }
}

// Change slider position to match value in the field
function matchSlider() {
    slider_l1.value = input_l1.value;
    slider_l2.value = input_l2.value;
    slider_l3.value = input_l3.value;
    slider_t1.value = input_t1.value;
    slider_t2.value = input_t2.value;
    slider_t3.value = input_t3.value;
    slider_x.value = input_x.value;
    slider_y.value = input_y.value;
    slider_z.value = input_z.value;
}

// Converts from degrees to radians.
function toRadians(degrees) {
    return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
function toDegrees(radians) {
    return radians * 180 / Math.PI;
};

// Round number
function round(num, places = 10) {
    return +(Math.round(num + "e+" + places) + "e-" + places) || 0;
}

// Round array
function roundArray(A, places = 10) {
    return Array.from(A, x => round(x, places));
}

// Convert transformation matrix to euler angle
function toEuler(TM) {
    var alpha = 0;
    var beta = 0;
    var gamma = 0;
    var alpha = Math.atan2(TM[7], TM[8]);
    var beta = Math.atan2(-TM[6], Math.sqrt(Math.pow(TM[7], 2) + Math.pow(TM[8], 2)));
    var gamma = Math.atan2(TM[3], TM[0]);
    var euler = [alpha, beta, gamma];
    return euler;
}

// Matrix addition
function mAdd(A, B) {
    // create Float32Array from input
    A = Float32Array.from(A);
    B = Float32Array.from(B);
    var result = weblas.saxpy(3, 1, A, B);
    result = Array.from(result);
    return result;
}

// Matrix multiply
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

// Calculate local transformation matrix
function calcLocalTM(t1, t2, t3) {
    // convert degree input to radian
    var t1 = toRadians(t1);
    var t2 = toRadians(t2);
    var t3 = toRadians(t3);

    if (robotType == RobotType.cartesian) {
        var C1 = [1, 0, 0, 0, 1, 0, 0, 0, 1]
        var C2 = [1, 0, 0, 0, 1, 0, 0, 0, 1]
        var C3 = [1, 0, 0, 0, 1, 0, 0, 0, 1]
    } else if (robotType == RobotType.cylindrical) {
        var C1 = [Math.cos(t1), 0, Math.sin(t1), 0, 1, 0, -Math.sin(t1), 0, Math.cos(t1)]
        var C2 = [1, 0, 0, 0, 1, 0, 0, 0, 1]
        var C3 = [1, 0, 0, 0, 1, 0, 0, 0, 1]
    } else if (robotType == RobotType.spherical) {
        var C1 = [Math.cos(t1), 0, Math.sin(t1), 0, 1, 0, -Math.sin(t1), 0, Math.cos(t1)]
        var C2 = [Math.cos(t2), -Math.sin(t2), 0, Math.sin(t2), Math.cos(t2), 0, 0, 0, 1]
        var C3 = [1, 0, 0, 0, 1, 0, 0, 0, 1]
    } else if (robotType == RobotType.articulated) {
        var C1 = [Math.cos(t1), 0, Math.sin(t1), 0, 1, 0, -Math.sin(t1), 0, Math.cos(t1)]
        var C2 = [Math.cos(t2), -Math.sin(t2), 0, Math.sin(t2), Math.cos(t2), 0, 0, 0, 1]
        var C3 = [Math.cos(t3), -Math.sin(t3), 0, Math.sin(t3), Math.cos(t3), 0, 0, 0, 1]
    }
    return [C1, C2, C3];
}

// Calculate base transformation matrix
function calcBaseTM(C1, C2, C3) {
    var baseC1 = C1;
    var baseC2 = mMul(C1, C2);
    var baseC3 = mMul(baseC2, C3);
    return [baseC1, baseC2, baseC3];
}

// Calculate link vector
function calcLinkM(l1, l2, l3) {
    if (robotType == RobotType.cartesian) {
        var LM1 = [l1, 0, 0];
        var LM2 = [0, 0, l2];
        var LM3 = [0, l3, 0];
    } else if (robotType == RobotType.cylindrical) {
        var LM1 = [0, l1, 0];
        var LM2 = [0, l2, 0];
        var LM3 = [l3, 0, 0];
    } else if (robotType == RobotType.spherical) {
        var LM1 = [0, l1, 0];
        var LM2 = [l2, 0, 0];
        var LM3 = [l3, 0, 0];
    } else if (robotType == RobotType.articulated) {
        var LM1 = [0, l1, 0];
        var LM2 = [l2, 0, 0];
        var LM3 = [l3, 0, 0];
    }
    return [LM1, LM2, LM3];
}

// Forward Kinematic
function forwardKinematic(event, renderOnly = false) {
    // get user input
    var input = getInputValues();

    // validate
    if (input.l1 < 0 || input.l2 < 0 || input.l3 < 0) {
        changeFieldBG(0, "pink");
        return;
    } else {
        changeFieldBG(0, null);
    }

    // calculate local link matrices
    var linkM = calcLinkM(input.l1, input.l2, input.l3);

    // calculate local transformation matrices
    var localTM = calcLocalTM(input.t1, input.t2, input.t3);

    // calculate base transformation matrices
    var baseTM = calcBaseTM(localTM[0], localTM[1], localTM[2]);

    // calculate each link's base end tip position
    var link1p = mMul(baseTM[0], linkM[0]);
    var link2p = mAdd(mMul(baseTM[1], linkM[1]), link1p);
    var link3p = mAdd(mMul(baseTM[2], linkM[2]), link2p);
    var linkP = [link1p, link2p, link3p];

    // calculate euler angle
    var eulerM = [toEuler(baseTM[0]), toEuler(baseTM[1]), toEuler(baseTM[2])];

    // update scene
    update(linkM, linkP, eulerM);

    // show coordinate to user
    if (!renderOnly) {
        var coord = roundArray(link3p, 4);
        input.x = coord[0];
        input.y = coord[1];
        input.z = coord[2];
        setInputValues(input);
    }
    matchSlider();
    changeFieldBG(null, null);

    // show calculation result
    document.getElementById("L1-x").innerHTML = round(linkM[0][0], 2);
    document.getElementById("L1-y").innerHTML = round(linkM[0][1], 2);
    document.getElementById("L1-z").innerHTML = round(linkM[0][2], 2);
    document.getElementById("L2-x").innerHTML = round(linkM[1][0], 2);
    document.getElementById("L2-y").innerHTML = round(linkM[1][1], 2);
    document.getElementById("L2-z").innerHTML = round(linkM[1][2], 2);
    document.getElementById("L3-x").innerHTML = round(linkM[2][0], 2);
    document.getElementById("L3-y").innerHTML = round(linkM[2][1], 2);
    document.getElementById("L3-z").innerHTML = round(linkM[2][2], 2);

    document.getElementById("C1-1").innerHTML = round(localTM[0][0], 2);
    document.getElementById("C1-2").innerHTML = round(localTM[0][1], 2);
    document.getElementById("C1-3").innerHTML = round(localTM[0][2], 2);
    document.getElementById("C1-4").innerHTML = round(localTM[0][3], 2);
    document.getElementById("C1-5").innerHTML = round(localTM[0][4], 2);
    document.getElementById("C1-6").innerHTML = round(localTM[0][5], 2);
    document.getElementById("C1-7").innerHTML = round(localTM[0][6], 2);
    document.getElementById("C1-8").innerHTML = round(localTM[0][7], 2);
    document.getElementById("C1-9").innerHTML = round(localTM[0][8], 2);

    document.getElementById("C2-1").innerHTML = round(localTM[1][0], 2);
    document.getElementById("C2-2").innerHTML = round(localTM[1][1], 2);
    document.getElementById("C2-3").innerHTML = round(localTM[1][2], 2);
    document.getElementById("C2-4").innerHTML = round(localTM[1][3], 2);
    document.getElementById("C2-5").innerHTML = round(localTM[1][4], 2);
    document.getElementById("C2-6").innerHTML = round(localTM[1][5], 2);
    document.getElementById("C2-7").innerHTML = round(localTM[1][6], 2);
    document.getElementById("C2-8").innerHTML = round(localTM[1][7], 2);
    document.getElementById("C2-9").innerHTML = round(localTM[1][8], 2);

    document.getElementById("C3-1").innerHTML = round(localTM[2][0], 2);
    document.getElementById("C3-2").innerHTML = round(localTM[2][1], 2);
    document.getElementById("C3-3").innerHTML = round(localTM[2][2], 2);
    document.getElementById("C3-4").innerHTML = round(localTM[2][3], 2);
    document.getElementById("C3-5").innerHTML = round(localTM[2][4], 2);
    document.getElementById("C3-6").innerHTML = round(localTM[2][5], 2);
    document.getElementById("C3-7").innerHTML = round(localTM[2][6], 2);
    document.getElementById("C3-8").innerHTML = round(localTM[2][7], 2);
    document.getElementById("C3-9").innerHTML = round(localTM[2][8], 2);

    document.getElementById("0C1-1").innerHTML = round(baseTM[0][0], 2);
    document.getElementById("0C1-2").innerHTML = round(baseTM[0][1], 2);
    document.getElementById("0C1-3").innerHTML = round(baseTM[0][2], 2);
    document.getElementById("0C1-4").innerHTML = round(baseTM[0][3], 2);
    document.getElementById("0C1-5").innerHTML = round(baseTM[0][4], 2);
    document.getElementById("0C1-6").innerHTML = round(baseTM[0][5], 2);
    document.getElementById("0C1-7").innerHTML = round(baseTM[0][6], 2);
    document.getElementById("0C1-8").innerHTML = round(baseTM[0][7], 2);
    document.getElementById("0C1-9").innerHTML = round(baseTM[0][8], 2);

    document.getElementById("0C2-1").innerHTML = round(baseTM[1][0], 2);
    document.getElementById("0C2-2").innerHTML = round(baseTM[1][1], 2);
    document.getElementById("0C2-3").innerHTML = round(baseTM[1][2], 2);
    document.getElementById("0C2-4").innerHTML = round(baseTM[1][3], 2);
    document.getElementById("0C2-5").innerHTML = round(baseTM[1][4], 2);
    document.getElementById("0C2-6").innerHTML = round(baseTM[1][5], 2);
    document.getElementById("0C2-7").innerHTML = round(baseTM[1][6], 2);
    document.getElementById("0C2-8").innerHTML = round(baseTM[1][7], 2);
    document.getElementById("0C2-9").innerHTML = round(baseTM[1][8], 2);

    document.getElementById("0C3-1").innerHTML = round(baseTM[2][0], 2);
    document.getElementById("0C3-2").innerHTML = round(baseTM[2][1], 2);
    document.getElementById("0C3-3").innerHTML = round(baseTM[2][2], 2);
    document.getElementById("0C3-4").innerHTML = round(baseTM[2][3], 2);
    document.getElementById("0C3-5").innerHTML = round(baseTM[2][4], 2);
    document.getElementById("0C3-6").innerHTML = round(baseTM[2][5], 2);
    document.getElementById("0C3-7").innerHTML = round(baseTM[2][6], 2);
    document.getElementById("0C3-8").innerHTML = round(baseTM[2][7], 2);
    document.getElementById("0C3-9").innerHTML = round(baseTM[2][8], 2);

    document.getElementById("P1-x").innerHTML = round(linkP[0][0], 2);
    document.getElementById("P1-y").innerHTML = round(linkP[0][1], 2);
    document.getElementById("P1-z").innerHTML = round(linkP[0][2], 2);
    document.getElementById("P2-x").innerHTML = round(linkP[1][0], 2);
    document.getElementById("P2-y").innerHTML = round(linkP[1][1], 2);
    document.getElementById("P2-z").innerHTML = round(linkP[1][2], 2);
    document.getElementById("P3-x").innerHTML = round(linkP[2][0], 2);
    document.getElementById("P3-y").innerHTML = round(linkP[2][1], 2);
    document.getElementById("P3-z").innerHTML = round(linkP[2][2], 2);

    document.getElementById("E1-a").innerHTML = round(eulerM[0][0], 2);
    document.getElementById("E1-b").innerHTML = round(eulerM[0][1], 2);
    document.getElementById("E1-g").innerHTML = round(eulerM[0][2], 2);
    document.getElementById("E2-a").innerHTML = round(eulerM[1][0], 2);
    document.getElementById("E2-b").innerHTML = round(eulerM[1][1], 2);
    document.getElementById("E2-g").innerHTML = round(eulerM[1][2], 2);
    document.getElementById("E3-a").innerHTML = round(eulerM[2][0], 2);
    document.getElementById("E3-b").innerHTML = round(eulerM[2][1], 2);
    document.getElementById("E3-g").innerHTML = round(eulerM[2][2], 2);
}

// Inverse Kinematic
function inverseKinematic() {
    // get user input
    var input = getInputValues();

    if (robotType == RobotType.cartesian) {
        // calculate joint angle / link length
        var l1 = input.x;
        var l2 = input.z;
        var l3 = input.y;

        // validate if joint angle / link length is valid
        if (l1 < 0 || l2 < 0 || l3 < 0) {
            changeFieldBG(1, "pink");
            return 0;
        }

        // set value in input field
        input_l1.value = round(l1, 4);
        input_l2.value = round(l2, 4);
        input_l3.value = round(l3, 4);
    } else if (robotType == RobotType.cylindrical) {
        // calculate joint angle / link length
        var t1 = -Math.atan2(input.z, input.x);
        var l2 = input.y - input.l1;
        var l3 = Math.sqrt(Math.pow(input.x, 2) + Math.pow(input.z, 2));

        // validate if joint angle / link length is valid
        if (isNaN(t1) || l2 < 0 || l3 < 0) {
            changeFieldBG(1, "pink");
            return 0;
        }

        // set value in input field
        input_t1.value = round(toDegrees(t1), 4);
        input_l2.value = round(l2, 4);
        input_l3.value = round(l3, 4);
    } else if (robotType == RobotType.spherical) {
        // calculate joint angle / link length
        var t1 = -Math.atan2(input.z, input.x);
        var t2 = Math.atan2(input.y - input.l1, Math.sqrt(Math.pow(input.x, 2) + Math.pow(input.z, 2)));
        var l3 = Math.sqrt(Math.pow(input.x, 2) + Math.pow(input.y - input.l1, 2) + Math.pow(input.z, 2)) - input.l2;

        // validate if joint angle / link length is valid
        if (isNaN(t1) || isNaN(t2) || l3 < 0) {
            changeFieldBG(1, "pink");
            return 0;
        }

        // set value in input field
        input_t1.value = round(toDegrees(t1), 4);
        input_t2.value = round(toDegrees(t2), 4);
        input_l3.value = round(l3, 4);
    } else if (robotType == RobotType.articulated) {
        // calculate joint angle / link length
        var r1 = Math.sqrt(Math.pow(input.x, 2) + Math.pow(input.z, 2));
        var r2 = input.y - input.l1;
        var r3 = Math.sqrt(Math.pow(r1, 2) + Math.pow(r2, 2));
        var p1 = Math.acos((Math.pow(input.l3, 2) - Math.pow(input.l2, 2) - Math.pow(r3, 2)) / (-2 * input.l2 * r3));
        var p2 = Math.atan2(r2, r1);
        var p3 = Math.acos((Math.pow(r3, 2) - Math.pow(input.l2, 2) - Math.pow(input.l3, 2)) / (-2 * input.l2 * input.l3));
        var t1 = -Math.atan2(input.z, input.x);
        var t2 = p2 - p1;
        var t3 = Math.PI - p3;

        // validate if joint angle / link length is valid
        if (isNaN(t1) || isNaN(t2) || isNaN(t3)) {
            changeFieldBG(1, "pink");
            return 0;
        }

        // set value in input field
        input_t1.value = round(toDegrees(t1), 4);
        input_t2.value = round(toDegrees(t2), 4);
        input_t3.value = round(toDegrees(t3), 4);
    }

    // use forward kinematic function to calculate 
    // transformation matrices and render
    forwardKinematic(null, true);
    return 1;
}

// empty scene
function resetScene() {
    // remove all geometries from scene
    meshesArray.forEach(function (mesh) {
        scene.remove(mesh);
    });
    meshesArray = [];
}

// create meshes for the robot
function createMeshes(linkM) {
    // define geometry of each link
    var boxGeometry1 = new THREE.BoxGeometry(1, Math.max(...linkM[0]), 1);
    var boxGeometry2 = new THREE.BoxGeometry(1, Math.max(...linkM[1]), 1);
    var boxGeometry3 = new THREE.BoxGeometry(1, Math.max(...linkM[2]), 1);
    var cube1 = new THREE.Mesh(boxGeometry1, material1);
    var cube2 = new THREE.Mesh(boxGeometry2, material2);
    var cube3 = new THREE.Mesh(boxGeometry3, material3);
    var sphereGeometry = new THREE.SphereGeometry(0.5, 10, 10);
    var joint1 = new THREE.Mesh(sphereGeometry, material4);
    var joint2 = new THREE.Mesh(sphereGeometry, material4);
    var joint3 = new THREE.Mesh(sphereGeometry, material4);
    var pivotPoint1 = new THREE.Object3D();
    var pivotPoint2 = new THREE.Object3D();
    var pivotPoint3 = new THREE.Object3D();

    // configure euler order 
    joint1.rotation.order = 'ZYX';
    joint2.rotation.order = 'ZYX';
    joint3.rotation.order = 'ZYX';

    // define rotation pivot of each link 
    joint1.add(pivotPoint1);
    joint2.add(pivotPoint2);
    joint3.add(pivotPoint3);
    pivotPoint1.add(cube1);
    pivotPoint2.add(cube2);
    pivotPoint3.add(cube3);

    // add all links to scene
    scene.add(joint1);
    scene.add(joint2);
    scene.add(joint3);

    // setup initial posture
    cube1.translateY(Math.max(...linkM[0]) / 2);
    cube2.translateY(Math.max(...linkM[1]) / 2);
    cube3.translateY(Math.max(...linkM[2]) / 2);
    if (robotType == RobotType.cartesian) {
        pivotPoint1.rotation.z = -Math.PI / 2;
        pivotPoint2.rotation.x = Math.PI / 2;
    } else if (robotType == RobotType.cylindrical) {
        pivotPoint3.rotation.z = -Math.PI / 2;
    } else if (robotType == RobotType.spherical) {
        pivotPoint2.rotation.z = -Math.PI / 2;
        pivotPoint3.rotation.z = -Math.PI / 2;
    } else if (robotType == RobotType.articulated) {
        pivotPoint2.rotation.z = -Math.PI / 2;
        pivotPoint3.rotation.z = -Math.PI / 2;
    }

    // array of meshes
    meshesArray = [cube1, cube2, cube3, joint1, joint2, joint3];
}

// transform each link using calculated values
function transformMeshes(linkP, eulerM) {
    // translate each link to calculated position
    meshesArray[4].position.set(linkP[0][0], linkP[0][1], linkP[0][2]);
    meshesArray[5].position.set(linkP[1][0], linkP[1][1], linkP[1][2]);
    // apply rotation to each link
    meshesArray[3].rotation.setFromVector3(new THREE.Vector3(eulerM[0][0], eulerM[0][1], eulerM[0][2]));
    meshesArray[4].rotation.setFromVector3(new THREE.Vector3(eulerM[1][0], eulerM[1][1], eulerM[1][2]));
    meshesArray[5].rotation.setFromVector3(new THREE.Vector3(eulerM[2][0], eulerM[2][1], eulerM[2][2]));
}

// update the robot with calculated values
function update(linkM, linkP, eulerM) {
    resetScene();
    createMeshes(linkM);
    transformMeshes(linkP, eulerM);
}

// render the scene
function render() {
    renderer.render(scene, camera);
};

// main function of webgl
function gl_main() {
    requestAnimationFrame(gl_main);
    render();
}

gl_main();
resetField();