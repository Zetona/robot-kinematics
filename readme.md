## About this project ##
A javascript implementation of robotic manipulator's forward and inverse kinematic simulation.
Four types of 3-DOF robot are implemented: Cartesian, Cylindrical, Spherical, Articulated.

<img src="https://imgur.com/5CYxZIM.png" width=800>

## How to run ##
* Clone the repository or download the latest release
* Open `index.html` with your web browser (Chrome/Firefox recommended)

## How to use ##
### Basic information ###
* Select robot type by clicking type selection buttons
* Click reset button to reset the robot to default posture

### Manual input ###
* Use text field for setting link length, joint angle, or end-tip position
* Click either forward kinematic or inverse kinematic button to perform calculation

### Slider control ###
* Use input sliders for controlling link length, joint angle, or end-tip position
* Forward kinematic or inverse kinematic is automatically performed based on the slider being controlled

### Keyboard control ###
* Use keyboard control to move end tip position and perform inverse kinematic
    * D - Move along positive x-axis
    * A - Move along negative x-axis
    * W - Move along positive y-axis
    * S - Move along negative y-axis
    * Q - Move along positive z-axis
    * E - Move along negative z-axis

### Mouse control ###
* Use mouse for camera control
    * Drag with primary mouse button to rotate the camera
    * Drag with secondary mouse button to translate the camera
    * Use scroll wheel to zoom

## Credits ##
This application uses open source components. For full license details, refer to the license file in the library's directory. You can find the source code of their open source projects below.

treejs: https://github.com/mrdoob/three.js/
Copyright (c) 2010-2019 three.js authors.

weblas: https://github.com/waylonflinn/weblas/
Copyright (c) 2015 Waylon Flinn.