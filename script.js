let socket = io();
let videoOpened = false;
let navOpen = false;
let navRef;
let directory = [];

socket.on("sendDirectory", function(receivingDirectory) {
    directory = receivingDirectory;
    console.log(directory);
    
    navRef = document.getElementById("nav");
    setupDirectory();

    document.getElementById("navToggle").addEventListener("click", toggleNavMenu);
})

function findEndIndex(startIndex, currentLevel) {
    for(let i = startIndex; i < directory.length - 1; i++) {
        let splitted = directory[i].split("/");

        if(splitted.length > currentLevel) {
            return i;
        }
    }
}

function setupDirectory() {
    // starts at 2 because Media has 2 slashes: ./Media/
    let currentLevel = 2;
    let elem = navRef;
    let startIndex = 0;
    let endIndex = findEndIndex(startIndex, currentLevel);
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