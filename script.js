const palette = {
    background: "#242234", 
    text: "#dae0ea"
};

let socket;
let videoRef;

window.onload = function() {
    socket = io();

    applyInitialStyles();
}

function applyInitialStyles() {
    document.body.style.backgroundColor = palette.background;
    document.body.style.color = palette.text;
}