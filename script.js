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
    for(let i = startIndex; i < directory.length; i++) {
        let splitted = directory[i].split("/");

        if((splitted.length > currentLevel)) {
            return i;
        }
    }
}

function setupDirectoryOriginal() {
    // starts at 2 because Media has 2 slashes: ./Media/, meaning that there are 3 parts when split by "/"
    let currentLevel = 3;
    let elem = navRef;
    let startIndex = 0;
    let endIndex = -1;
    
    endIndex = findEndIndex(startIndex, currentLevel);
        
    for(let i = startIndex; i < endIndex; i++) {
        let item = document.createElement("p");

        let splitted = directory[i].split("/");
        item.innerText = splitted[splitted.length - 1];

        elem.appendChild(item);
    }

    let foldersCreated = [];

    while(endIndex < (directory.length - 1)) {
        ++currentLevel;
        startIndex = endIndex;
        endIndex = findEndIndex(startIndex, currentLevel);
        
        for(let i = startIndex; i < (endIndex + 1); i++) {
            let folderSplitted = directory[i].split("/");
            let folderName = folderSplitted[currentLevel - 2];
            console.log("CURRENT_LEVEL ", currentLevel);
            console.log("DIRECTORY[I] ", directory[i]);
            console.log("FOLDER_NAME ", folderName);
            console.log("--------------------");

            if(!(foldersCreated.includes(folderName))) {
                foldersCreated.push(folderName);

                let parent;
                if(currentLevel == 4) {
                    addDiv(elem, folderName, currentLevel);
                }
                else {
                    parent = findParent(folderSplitted);
                    
                    addDiv(parent, folderName, currentLevel);
                }
            }
        }

    }
}

function setupDirectory() {
    let foldersCreated = [];

    for(let i = 0; i < directory.length; i++) {
        let splitted = directory[i].split("/");
        let folderName = splitted[splitted.length - 2];
        let fileName = splitted[splitted.length - 1];

        if(folderName != "Media") {

            if(!(foldersCreated.includes(folderName))) {
                foldersCreated.push(folderName);

                if(splitted[splitted.length - 3] != "Media") {
                    let parentFolder = document.getElementById(splitted[splitted.length - 3])
                        
                    addDiv(parentFolder, folderName, splitted.length - 3);
                }
                else {
                    addDiv(navRef, folderName, 1);
                }
            }
        }
        else {
            addFileToDiv(navRef, fileName, 1);
        }
    }
}

function findParent(splitted) {
    let folderName = splitted[splitted.length - 3];

    let element = navRef;
    let count = 0;
    
    /**This function should find something, and so one iteration of the while loop should cause a return.
     * But just in case something goes wrong, don't get stuck in an infinte loop.
     */
    while(count < 50) {
        ++count;

        let children = element.childNodes;

        for(let i = 0; i < children.length; i++) {
            if(children[i].nodeName == "DIV") {
                // p element of div that represents the folder name
                if(children[i].children[0].innerText == folderName) {
                    return children[i];
                }
                else if(splitted.includes(children[i].children[0].innerText)) {
                    element = children[i];
    
                    break;
                }
    
            }
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
    file.style.textIndent = ((currentLevel - 1) * INDENT_SIZE) + "px";
    
    if(currentLevel != 1) {
        file.style.display = "none";
    }
    
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
    let last = children[children.length - 1];

    let test = window.getComputedStyle(last).display;
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