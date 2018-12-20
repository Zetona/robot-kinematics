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
    // get variables
    var input = getInputValues();

    // calculate link matrices & transformation matrices
    linkM = calcLinkM(input.l1, input.l2, input.l3);
    baseTM = calcBaseTM(input.t1, input.t2, input.t3);

    // calculate each link's end tip position
    var link1p = mMul(baseTM[0], linkM[0]);
    var link2p = mAdd(mMul(baseTM[1], linkM[1]), link1p);
    var link3p = mAdd(mMul(baseTM[2], linkM[2]), link2p);

    // show coordinate to user
    if (!renderOnly) {
        var coord = roundArray(link3p);
        input.x = coord[0];
        input.y = coord[1];
        input.z = coord[2];
        setInputValues(input);
    }

    //TODO: render

}

function backwardKinematic() {
    // get variables
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