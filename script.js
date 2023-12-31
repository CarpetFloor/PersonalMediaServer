let socket = io();
let videoOpened = localStorage.getItem("videoOpened");
let navOpen = false;
let navRef;
let directory = [];
let checkIfVideoCanPlayInterval;

socket.on("sendDirectory", function(receivingDirectory) {
    directory = receivingDirectory;
    
    navRef = document.getElementById("nav");
    setupDirectory();

    document.getElementById("navToggle").addEventListener("click", toggleNavMenu);
});

function setupDirectory() {
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

    checkIfNeedToPlayVideo();
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

const INDENT_SIZE = 20;

function addDiv(parent, name, currentLevel) {
    // div for the folder itself
    let div = document.createElement("div");
    div.id = name;
    div.style.flexDirection = "column";
    div.style.textIndent = ((currentLevel - 1) * INDENT_SIZE) + "px";
    
    // p element that will be the folder name
    let title = document.createElement("p");
    title.classList.add("folderName");
    title.style.fontWeight = "normal";
    title.style.textIndent = ((currentLevel - 1) * INDENT_SIZE) + "px";
    
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
    // the name passed to this function has the filetype, so remove it for display
    let nameSplitted = name.split(".");

    let file = document.createElement("p");
    file.style.textIndent = (currentLevel * INDENT_SIZE) + "px";
    file.style.display = "none";
    
    let icon = document.createElement("img");
    icon.classList.add("icon");
    icon.src = "Assets/fileIcon.svg";
    file.appendChild(icon);
    
    file.innerHTML += nameSplitted[0];

    file.addEventListener("click", function(){
        let videoName = (file.innerText.split("."))[0];
        localStorage.setItem("videoName", videoName);
        // // remove current video
        document.getElementById("video").remove();

        toggleNavMenu();

        document.getElementById("title").innerText = "Getting Video...";

        socket.emit("requestFile", fullFilePath);

        window.setTimeout(function(){
            localStorage.setItem("videoOpened", "yes");

            // let address = window.location;
            window.open("actualindex.html");
            window.close();
        }, 10);
    });
    
    div.appendChild(file);
}

function toggleNavMenu() {
    // document.getElementById("video").style.display = "block";

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