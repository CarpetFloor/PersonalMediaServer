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

                    addFileToDiv(newDiv, fileName, splitted.length - 3);
                }
                else {
                    let newDiv = addDiv(navRef, folderName, 1);

                    addFileToDiv(newDiv, fileName, 1);
                }
            }
            else {
                let divFolder = document.getElementById(splitted[splitted.length - 2]);

                addFileToDiv(divFolder, fileName, splitted.length - 3);
            }
        }
        else {
            addFileToDiv(navRef, fileName, 0);

            let children = navRef.childNodes;
            children[children.length - 1].style.display = "block";
        }
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
    title.innerText = name;
    title.style.fontWeight = "normal";
    title.style.textIndent = ((currentLevel - 1) * INDENT_SIZE) + "px";
    title.addEventListener("click", function(){toggleFolder(this.parentNode)});
    
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

function addFileToDiv(div, name, currentLevel) {
    // the name passed to this function has the filetype, so remove it for display
    let nameSplitted = name.split(".");

    let file = document.createElement("p");
    file.innerText = nameSplitted[0];
    file.style.textIndent = (currentLevel * INDENT_SIZE) + "px";
    file.style.display = "none";
    
    div.appendChild(file);
}

function toggleNavMenu() {
    // document.getElementById("video").style.display = "block";

    navOpen = !(navOpen);

    if(navOpen) {
        navRef.style.display = "flex";
    }
    else {
        navRef.style.display = "none";
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