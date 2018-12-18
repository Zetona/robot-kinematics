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

function forwardKinematic() {
    // get variables
    var input = getInputValues();
    console.log(input);
}

function backwardKinematic() {
    // get variables
    var input = getInputValues();
    console.log(input);
}

function reset() {
    // get variables
    var input = getInputValues();
    console.log(input);
}