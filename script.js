let socket = io();
let videoOpened = false;
let navOpen = false;
let navRef;
let directory = [];

socket.on("sendDirectory", function(receivingDirectory) {
    directory = receivingDirectory;
    console.log(directory);
    
    navRef = document.getElementById("nav");
    document.getElementById("navToggle").addEventListener("click", toggleNavMenu);
})

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