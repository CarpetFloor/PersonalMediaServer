const debug = false;

let navOpen = false;
let navRef;
let videoRef = document.querySelector("video");

function setupDirectory() {
    if(debug) {
        console.log("setting up directory...");
    }

    let foldersCreated = [];

    for(let i = 0; i < directory.length; i++) {
        let splitted = directory[i].split("/");
        let folderName = splitted[splitted.length - 2];
        let fileName = splitted[splitted.length - 1];

        if(folderName != "Media") {
            let parentFolder = document.getElementById(splitted[splitted.length - 3]);
            
            // the file is in a folder that does not yet exist
            if(!(foldersCreated.includes(folderName))) {
                foldersCreated.push(folderName);

                if(splitted[splitted.length - 3] != "Media") {
                    let newDiv = addDiv(parentFolder, folderName, splitted.length - 3);

                    addFileToDiv(newDiv, fileName, splitted.length - 3, directory[i]);
                }
                else {
                    let newDiv = addDiv(navRef, folderName, 1);

                    addFileToDiv(newDiv, fileName, 1, directory[i]);
                }
            }
            else {
                let divFolder = document.getElementById(splitted[splitted.length - 2]);

                addFileToDiv(divFolder, fileName, splitted.length - 3, directory[i]);
            }
        }
        else {
            addFileToDiv(navRef, fileName, 0, directory[i]);

            let children = navRef.childNodes;
            children[children.length - 1].style.display = "block";
        }
    }
}

function checkIfNeedToPlayVideo() {
    if(videoOpened == "yes") {
        localStorage.setItem("videoOpened", "no");

        document.getElementById("title").innerText = localStorage.getItem("videoName");

        let videoRef = document.getElementById("video");
        videoRef.style.display = "block";
        videoRef.src = "/videoPlayer";
    }
}

const indentSize = 20;

function addDiv(parent, name, currentLevel) {
    // div for the folder itself
    let div = document.createElement("div");
    div.id = name;
    div.style.flexDirection = "column";
    div.style.textIndent = ((currentLevel - 1) * indentSize) + "px";
    
    // p element that will be the folder name
    let title = document.createElement("p");
    title.classList.add("folderName");
    title.style.fontWeight = "normal";
    title.style.textIndent = ((currentLevel - 1) * indentSize) + "px";
    
    let icon = document.createElement("img");
    icon.classList.add("icon");
    icon.src = "Assets/folderIcon.svg";
    title.appendChild(icon);
    
    title.innerHTML += name;
    
    title.addEventListener("click", function(){toggleFolder(this.parentNode);});
    
    if(currentLevel == 1) {
        div.style.display = "flex";
    }
    else {
        div.style.display = "none";
        title.style.display = "none";
    }
    
    div.appendChild(title);

    parent.appendChild(div);

    return div;
}

function addFileToDiv(div, name, currentLevel, fullFilePath) {
    let file = document.createElement("p");
    file.style.textIndent = (currentLevel * indentSize) + "px";
    file.style.display = "none";
    
    let icon = document.createElement("img");
    icon.classList.add("icon");
    icon.src = "Assets/fileIcon.svg";
    file.appendChild(icon);
    
    file.innerHTML += name;

    file.addEventListener("click", function() {
        videoRef.style.display = "none";
        
        toggleNavMenu();
        document.getElementById("title").innerText = name;

        videoRef.src = fullFilePath.slice(2);
    });
    
    div.appendChild(file);
}

const padding = 200;
// resize video if needed
videoRef.addEventListener( "loadedmetadata", function (e) {
    let width = videoRef.videoWidth
    let height = videoRef.videoHeight;

    if(width > (window.innerWidth - padding)) {
        videoRef.style.width = (window.innerWidth - padding) + "px";
    }
    else if(height > (window.innerHeight - padding)) {
        videoRef.style.height = (window.innerHeight - padding) + "px";
    }

    videoRef.style.display = "flex";
}, false );

function toggleNavMenu() {
    navOpen = !(navOpen);

    if(navOpen) {
        navRef.style.display = "flex";

        document.getElementById("navToggle").innerText = "Close Directory";
    }
    else {
        navRef.style.display = "none";

        document.getElementById("navToggle").innerText = "Open Directory";
    }
}

function toggleFolder(elem) {
    let children = elem.childNodes;
    
    let index = 1;
    let firstActualChild = children[1];
    while(firstActualChild.nodeName == "DIV") {
        ++index;
        firstActualChild = children[index];
    }

    let test = window.getComputedStyle(firstActualChild).display;
    let update = "-1";
    let divUpdate = "-1";

    if(test == "none") {
        update = "block";
        divUpdate = "flex";
    }
    else {
        update = "none";
        divUpdate = update;
    }

    for(let i = 1; i < children.length; i++) {
        if(children[i].nodeName == "DIV") {
            children[i].style.display = divUpdate;
            children[i].children[0].style.display = update;
        } 
        else {
            children[i].style.display = update;
        }
    }
}

// after HTML loaded and stuff here loaded, establish connection with server
let socket = io();

socket.on("sendDirectory", function(receivingDirectory) {
    localStorage.setItem("video", "");
    directory = receivingDirectory;

    if(debug) {
        console.log("Recieved diretory from server:");
        console.log(directory);
    }
    
    navRef = document.getElementById("nav");
    setupDirectory();

    document.getElementById("navToggle").addEventListener("click", toggleNavMenu);
});