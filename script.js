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
            let parentFolder = document.getElementById(splitted[splitted.length - 3])
            
            // the file is in a folder that does not yet exist
            if(!(foldersCreated.includes(folderName))) {
                foldersCreated.push(folderName);

                if(splitted[splitted.length - 3] != "Media") {
                        
                    addDiv(parentFolder, folderName, splitted.length - 3);
                    addFileToDiv(parentFolder, fileName, splitted.length - 3);
                }
                else {
                    addDiv(navRef, folderName, 1);
                    addFileToDiv(navRef, fileName, 1);
                }
            }
            else {
                addFileToDiv(parentFolder, fileName, splitted.length - 3);
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
    let div = document.createElement("div");
    div.id = name;
    div.style.flexDirection = "column";
    div.style.textIndent = ((currentLevel - 1) * INDENT_SIZE) + "px";
    
    let title = document.createElement("p");
    title.innerText = name;
    title.style.fontWeight = "bold";
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
}

function addFileToDiv(div, name, currentLevel) {
    let file = document.createElement("p");
    file.innerText = name;
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
    console.log("TOGGLING ", elem);
    let children = elem.childNodes;
    console.log("CHILDREN ", children);
    
    let index = 1;
    let firstActualChild = children[1];
    while(firstActualChild.nodeName == "DIV") {
        ++index;
        firstActualChild = children[index];
    }
    
    console.log("FIRST_ACTUAL ", firstActualChild);

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