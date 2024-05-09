const debug = false;
const resumePlaying = false;

let navOpen = false;
let navRef = document.getElementById("nav");
let videoRef = document.querySelector("video");
videoRef.autoplay = false;
// when directory gets resent, all folders get collapsed
let openedFolders = [];
let restoredFolders = false;
document.getElementById("navToggle").addEventListener("click", toggleNavMenu);

// graph for storing directory data
let dir = [];
function FolderNode(name, path) {
    this.path = path;
    this.name = name;
    this.children = [];
    this.html = null;
    this.has = function(name) {
        if(this.name == name) {
            return true;
        }

        if(this.children.length > 0) {
            for(let i = 0; i < this.children.length; i++) {
                if((this.children[i].name == name) || (this.children[i].has(name))) {
                    return true;
                }
            }
        }

        return false;
    }
    this.get = function(name) {
        if(this.name == name) {
            return this;
        }

        if(this.children.length > 0) {
            for(let i = 0; i < this.children.length; i++) {
                if(this.children[i].name == name) {
                    return this.children[i];
                }

            }
            for(let i = 0; i < this.children.length; i++) {
                if(this.children[i].get(name) != null) {
                    return this.children[i].get(name);
                }
            }
        }

        return null;
    }
}

function FileNode(name, src) {
    this.name = name;
    this.src = src;
    this.has = function(name) {return false;}
    this.get = function(name) {return null;}
}

function dirHas(name) {
    for(let i = 0; i < dir.length; i++) {
        if(dir[i].has(name)) {
            return true;
        }
    }

    return false;
}

function dirGet(name) {
    for(let i = 0; i < dir.length; i++) {
        if(dir[i].get(name) != null) {
            return dir[i].get(name);
        }
    }

    return null;
}

function setupDirectory() {
    if(debug) {
        console.log("setting up directory...");
    }

    document.getElementById("nav").innerHTML = "";

    dir = [];

    // generate graph
    for(let i = 0; i < directory.length; i++) {
        // slice(2) to remove . and Media directory because client directory starts at Media
        const src = directory[i];
        const splitted = src.split("/").slice(2);
        const fileName = splitted[splitted.length - 1];

        if(debug) {
            console.log("----------");
            console.log("----------");
            console.log(i)
            console.log("fileName", fileName);
            console.log("src", src);
            console.log("splitted", splitted);
        }
        
        // first determine if file in a directory that hasn't been created client-side yet
        if(splitted.length > 1) {
            // go through each sub directory of directory and see if in graph
            for(let j = 0; j < splitted.length - 1; j++) {
                let path = "";
                for(let a = 0; a < j + 1; a++) {
                    path += splitted[a] + "/";
                }

                // sub directory not in graph, so have to add to graph
                if(!(dirHas(splitted[j]))) {
                    // if sub directory at same level as Media, can add at first level of graph
                    if(j == 0) {
                        dir.push(new FolderNode(splitted[0], path));
                    }
                    
                    /**
                     * otherwise, find directory sub diretory is in by grabbing the graph node of 
                     * previous sub directory
                     */
                    else {
                        let nodeToAddTo = dirGet(splitted[j - 1]);
                        
                        // finally add sub directory to graph as a child of previous sub directory
                        nodeToAddTo.children.push(new FolderNode(splitted[j], path));
                        
                        if(debug) {
                            console.log("ADD: " + splitted[j - 1] + ", ");
                            console.log(nodeToAddTo);
                        }
                    }
                }
            }

            // now insert file into graph
            let directoryToAddFileTo = dirGet(splitted[splitted.length - 2]);
            directoryToAddFileTo.children.push(new FileNode(fileName, src));
        }
        // add file at same level as Media
        else {
            dir.push(new FileNode(fileName, src))
        }
    }

    if(debug) {
        console.log("\n--");
        console.log("--\n");
        console.log("DIR");
        console.log(dir);
    }

    generateHTMLfromGraph();

    mobileSetUp();
}

function createHTMLfolder(node, parent, level) {
    // create folder itself
    let folder = addFolder(parent, node.name, level);
    folder.id = node.path;

    // create children
    for(let i = 0; i < node.children.length; i++) {
        if(node.children[i].constructor.name == "FileNode") {
            addFileToDiv(folder, node.children[i].name, (level  + 1), node.children[i].src);
        }
        else {
            createHTMLfolder(node.children[i], folder, (level + 1));
        }
    }
}

function generateHTMLfromGraph() {
    if(debug) {
        console.log("Generating HTML from graph...");
    }
    
    for(let i = 0; i < dir.length; i++) {
        // file
        if(dir[i].constructor.name == "FileNode") {
            addFileToDiv(navRef, dir[i].name, 0, dir[i].src);
        }
        // folder
        else {
            createHTMLfolder(dir[i], navRef, 0);
        }
    }

    if(debug) {
        console.log("done");
    }
}

let mobile = false;
let portrait = false;
function mobileSetUp() {
    mobile = (Math.max(window.innerWidth, window.innerHeight) < 1000);

    if(mobile) {
        portrait = (window.innerHeight > window.innerWidth);

        document.getElementById("navToggle").style.fontSize = "1em";

        document.getElementById("title").style.fontSize = "1.35em";

        if(portrait) {
            document.querySelector("section").style.marginTop = "5vw";
            document.querySelector("section").style.marginLeft = "5vw";
        }
        else {
            document.querySelector("section").style.marginTop = "1vw";
            document.querySelector("section").style.marginLeft = "1vw";
        }

        document.getElementById("nav").style.width = "85vw";
        document.getElementById("nav").style.marginTop = "2.5em";

        let files = document.getElementById("nav").getElementsByTagName("p");
        for(let i = 0; i < files.length; i++) {
            files[i].style.fontSize = "1em";
            files[i].style.marginBottom = "1em";
        }

        if(!(portrait)) {
            document.querySelector("video").style.marginLeft = "50vw";
            document.querySelector("video").style.transform = "translateX(-50%)";
        }
    }

    document.body.style.display = "flex";
    
    if(debug) {
        console.log("directory set up!");
    }
}

const indentSize = 20;

function addFolder(parent, name, currentLevel) {
    // div for the folder itself
    let div = document.createElement("div");
    div.style.flexDirection = "column";
    div.style.textIndent = (currentLevel * indentSize) + "px";
    
    // p element that will be the folder name
    let title = document.createElement("p");
    title.classList.add("folderName");
    title.style.fontWeight = "normal";
    title.style.textIndent = (currentLevel * indentSize) + "px";
    
    let icon = document.createElement("img");
    icon.classList.add("icon");
    icon.src = "Assets/folderIcon.svg";
    title.appendChild(icon);
    
    title.innerHTML += name;
    
    title.addEventListener("click", function(){toggleFolder(this.parentNode);});
    
    if(currentLevel == 0) {
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

    if(currentLevel == 0) {
        file.style.display = "block";
    }

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
        localStorage.setItem("videosrc", fullFilePath.slice(2));
    });
    
    div.appendChild(file);
}

let padding = 200;
// resize video if needed
videoRef.addEventListener( "loadedmetadata", function (e) {
    let width = videoRef.videoWidth
    let height = videoRef.videoHeight;

    if(!(mobile)) {
        if(width > (window.innerWidth - padding)) {
            videoRef.style.width = (window.innerWidth - padding) + "px";
        }
        
        if(height > (window.innerHeight - padding)) {
            videoRef.style.height = (window.innerHeight - padding) + "px";
        }
    }
    else {
        if(portrait) {
            padding = 250;

            if(height > (window.innerHeight - padding)) {
                videoRef.style.height = (window.innerHeight - padding) + "px";
            }
            
            padding = 50;
            if(width > (window.innerWidth - padding)) {
                videoRef.style.width = (window.innerWidth - padding) + "px";
            }
        }
        else {
            padding = 120;
            if(height > (window.innerHeight - padding)) {
                videoRef.style.height = (window.innerHeight - padding) + "px";
            }
            
            else if(width > (window.innerWidth - padding)) {
                videoRef.style.width = (window.innerWidth - padding) + "px";
            }
        }
    }

    videoRef.style.display = "flex";
}, false );

let currentTime = 0;

// get current time of video when played, for setting local storage to get on refresh
videoRef.addEventListener("timeupdate", function() {
    currentTime = videoRef.currentTime;

    localStorage.setItem("videoplaying", "true");
    localStorage.setItem("videotime", videoRef.currentTime.toString());
    
    if(resumePlaying) {
    }
});

// check if still playing video
if(resumePlaying) {
    window.setInterval(function() {
        let timeCheck = videoRef.currentTime;
        let playing = (!(timeCheck == currentTime));

        localStorage.setItem("videoplaying", playing.toString());
        if(playing) {
            localStorage.setItem("videotime", videoRef.currentTime.toString());
        }
    }, 700);
}

function toggleNavMenu() {
    navOpen = !(navOpen);

    localStorage.setItem("navOpen", navOpen.toString());

    if(navOpen) {
        navRef.style.display = "flex";

        document.getElementById("navToggle").innerText = "Close Directory";
    }
    else {
        navRef.style.display = "none";

        document.getElementById("navToggle").innerText = "Open Directory";
    }
}

let openFolders = [];

function toggleFolder(elem) {
    let children = elem.childNodes;
    
    let firstActualChild = children[1];

    let test = window.getComputedStyle(firstActualChild).display;
    let update = "-1";
    let divUpdate = "-1";

    if(test == "none") {
        update = "block";
        divUpdate = "flex";
        
        if(restoredFolders) {
            openFolders.push(elem.id);
        }
    }
    else {
        update = "none";
        divUpdate = update;

        if(restoredFolders) {
            let removeIndex = openFolders.indexOf(elem.id);
            openFolders.splice(removeIndex, 1);
        }
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

    if(restoredFolders) {
        let openFoldersStored = "";

        for(let i = 0; i < openFolders.length; i++) {
            openFoldersStored += openFolders[i] + "|";
        }

        if(debug) {
            console.log("Open folders:");
            console.log(openFolders);
        }

        localStorage.setItem("openFolders", openFoldersStored);
    }
}

// after HTML loaded and stuff here loaded, establish connection with server
let socket = io();

socket.on("sendDirectory", function(receivingDirectory) {
    directory = receivingDirectory;

    if(debug) {
        console.log("Recieved diretory from server:");
        console.log(directory);
    }
    
    setupDirectory();

    // when page refreshed, go back to last video and place
    if(localStorage.getItem("videosrc") != null) {
        videoRef.style.display = "none";

        // toggleNavMenu();
        document.getElementById("title").innerText = name;

        videoRef.src = localStorage.getItem("videosrc");
        
        // go to previous time
        videoRef.currentTime = parseFloat(localStorage.getItem("videotime"));

        // if video was playing during page refresh resume video
        if(resumePlaying) {
            if(localStorage.getItem("videoplaying") == "true") {
                videoRef.autoplay = true
            }
        }
    }

    openFolders = [];
    
    // restore diretory on page refresh
    if(localStorage.getItem("navOpen") != null) {
        if(localStorage.getItem("navOpen") == "true") {
            toggleNavMenu();
        }
        
        if(localStorage.getItem("openFolders") != null) {
            let splitted = localStorage.getItem("openFolders").split("|");

            if(debug) {
                console.log("Local storage open folders:");
                console.log(splitted);
            }
            
            for(let i = 0; i < splitted.length; i++) {
                if(splitted[i].length > 0) {
                    let elem = document.getElementById(splitted[i])
                    
                    if(elem != null) {
                        toggleFolder(elem);
                        
                        openFolders.push(splitted[i]);
                    }
                }
            }
        }
    }
    
    restoredFolders = true;
});