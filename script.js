let socket;
let videoOpened = false;
let navOpen = false;
let navRef;

window.onload = function() {
    socket = io();

    document.getElementById("navToggle").addEventListener("click", toggleNavMenu);
    navRef = document.getElementById("nav");
}

function toggleNavMenu() {
    videoOpened = true;
    document.getElementById("video").style.display = "block";

    navOpen = !(navOpen);

    if(navOpen) {
        navRef.style.display = "flex";
    }
    else {
        navRef.style.display = "none";
    }
}