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

        if((splitted.length > currentLevel) || (i == directory.length - 1)) {
            return i;
        }
    }
}

function setupDirectory() {
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

        // console.log(currentLevel, endIndex);
        
        for(let i = startIndex; i < (endIndex + 1); i++) {
            let folderSplitted = directory[i].split("/");
            let folderName = folderSplitted[currentLevel - 2];

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

                let temp = elem.childNodes;
                addFileToDiv(temp[temp.length - 1], folderSplitted[currentLevel - 1], currentLevel);
            }
        }

    }

    console.log("second part");
}

function findParent(splitted) {
    console.log("FINDING PARENT OF ", splitted);
    let folderName = splitted[splitted.length - 3];
    console.log("FOLDER NAME IS ", folderName);

    let element = navRef;
    let count = 0;
    
    while(count < 10) {
        ++count;
        console.log("attempt ", count);

        let children = element.childNodes;
        console.log("element", element);
        console.log("children ", children);

        for(let i = 0; i < children.length; i++) {
            if(children[i].nodeName == "DIV") {
                console.log("LOOKING AT ", children[i].children[0].innerText);

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

        console.log("--------------------");
    }
}

function addDiv(parent, name, currentLevel) {
    let div = document.createElement("div");
    div.style.flexDirection = "column";
    div.style.textIndent = ((currentLevel - 4) * 10) + "px";
    
    let title = document.createElement("p");
    title.innerText = name;
    title.style.fontWeight = "bold";
    title.style.textIndent = ((currentLevel - 4) * 10) + "px";
    title.addEventListener("click", function(){toggleFolder(this.parentNode)});
    
    if(currentLevel == 4) {
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
    file.style.textIndent = ((currentLevel - 1) * 10) + "px";
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