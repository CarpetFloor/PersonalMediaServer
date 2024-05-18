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
    this.get = function(path, index) {
        if(debug) {
            console.log("checking dirGet");
            console.log(this.name, path[index], index, path);
            console.log(this.name == path[index]);
            console.log(this);
        }

        if((this.name == path[index]) && (index == path.length - 1)) {
            if(debug) {
                console.log("FIRST PART");
            }

            return this;
        }

        if(this.children.length > 0) {
            for(let i = 0; i < this.children.length; i++) {
                if(debug) {
                    console.log("checking dirGet");
                    console.log(this.children[i].name, path[index], index, path);
                    console.log(this.children[i].name == path[index]);
                }

                if(this.children[i].name == path[index]) {
                    if(index == path.length - 1) {
                        if(debug) {
                            console.log("SECOND PART")
                        }

                        return this.children[i];
                    }
                    else {
                        if(debug) {
                            console.log("GETTING CHILD")
                        }
                        
                        return this.children[i].get(path, (index + 1));
                    }
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

function dirGet(path, index) {
    for(let i = 0; i < dir.length; i++) {
        if(debug) {
            console.log("checking dirGet");
            console.log(dir[i].name, path[index], index, path);
            console.log(dir[i].name == path[index]);
        }

        if(dir[i].name == path[index]) {
            if(path.length == 1) {
                return dir[i];
            }
            else {
                return dir[i].get(path, (index + 1));
            }
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
                if(debug) {
                    console.log(">>>>ITERATION " + j);
                }

                let path = "";
                for(let a = 0; a < j + 1; a++) {
                    path += splitted[a] + "/";
                }

                let splitSend = [];
                for(let a = 0; a < j + 1; a++) {
                    splitSend.push(splitted[a]);
                }

                if(debug) {
                    console.log("splitSend is " + splitSend);
                }

                // sub directory not in graph, so have to add to graph
                let existCheck = dirGet(splitSend, 0);
                
                if(debug) {
                    console.log("EXIST CHECK");
                    console.log(existCheck);
                }

                if(existCheck == null) {
                    if(debug) {
                        console.log("NEED TO CREATE FOLDER");
                    }
                    
                    // if sub directory at same level as Media, can add at first level of graph
                    if(j == 0) {
                        if(debug) {
                            console.log("----ACTUALLY ADD folder");
                            console.log("ADDING AT BASE LEVEL");
                        }

                        dir.push(new FolderNode(splitted[0], path));
                    }
                    
                    /**
                     * otherwise, find directory sub diretory is in by grabbing the graph node of 
                     * previous sub directory
                     */
                    else {
                        splitSend.pop();
                        
                        if(debug) {
                            console.log("UPDATED splitSend:");
                            console.log(splitSend);
                        }

                        let nodeToAddTo = dirGet(splitSend, 0);;

                        if(debug) {
                            console.log("ARE WE EVER HERE");
                            console.log("splitSend FOR FOLDER");
                            console.log(splitSend);
                            console.log(nodeToAddTo);
                        }

                        // finally add sub directory to graph as a child of previous sub directory
                        nodeToAddTo.children.push(new FolderNode(splitted[j], path));
                        
                        if(debug) {
                            console.log("----ACTUALLY ADD folder");
                            console.log("ADD: " + splitted[j - 1] + ", ");
                            console.log(nodeToAddTo);
                        }
                    }
                }
            }

            // now insert file into graph
            let splitSend = [];
            for(let a = 0; a < splitted.length - 1; a++) {
                splitSend.push(splitted[a]);
            }
            if(debug) {
                console.log("splitSend");
                console.log(splitSend);
            }

            let directoryToAddFileTo = dirGet(splitSend, 0);
            directoryToAddFileTo.children.push(new FileNode(fileName, src));
            if(debug) {
                console.log("INSERTING FILE INTO: ");
                console.log(directoryToAddFileTo);
            }
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

    let actualName = node.name;

    /**
     * check if folder name was modified because it is a duplicate, 
     * and if so change back to original name
     */
    for(let m = 0; m < modif.length; m++) {
        let splitted = ((modif[m][0]).split("/")).slice(2);
        
        let check = "";
        for(let i = 0; i < splitted.length - 1; i++) {
            check += splitted[i] + "/";
        }
        
        if(check == node.path) {
            if(debug) {
                console.log("FOUND MODIFIED DUPLICATE:");
                console.log(node.path);
            }

            actualName = (((modif[m][1]).split("/")).slice(2))[splitted.length - 2];

            if(debug) {
                console.log("NAME SHOULD BE:");
                console.log(actualName)
            }
        }
    }

    let folder = addFolder(parent, actualName, level);
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

const indentSize = 15;

function addFolder(parent, name, currentLevel) {
    // div for the folder itself
    let div = document.createElement("div");
    div.style.flexDirection = "column";
    div.style.marginLeft = (currentLevel * indentSize) + "px";
    
    // p element that will be the folder name
    let title = document.createElement("p");
    title.classList.add("folderName");
    title.style.fontWeight = "normal";
    // title.style.textIndent = (currentLevel * indentSize) + "px";
    
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

const photoTypes = ["png", "jpg"];
let currentThumbnailInterval = null;

function addFileToDiv(div, name, currentLevel, fullFilePath) {
    let file = document.createElement("p");
    file.style.marginLeft = (currentLevel * (indentSize / 2)) + "px";
    file.style.display = "none";
    file.style.flexDirection = "column";
    file.style.alignItems = "flex-start";
    file.className = "thumbnailClosed";
 
    let topContainer = document.createElement("div");
    topContainer.style.display = "flex";
    topContainer.style.flexDirection = "row"
    topContainer.style.alignItems = "flex-start";

    if(currentLevel == 0) {
        file.style.display = "flex";
    }

    let icon = document.createElement("img");
    icon.classList.add("icon");
    icon.src = "Assets/fileIcon.svg";
    topContainer.appendChild(icon);
    
    let nameText = document.createElement("p");
    nameText.innerText = name;
    nameText.style.fontSize = "inherit";
    nameText.style.marginLeft = "0";
    topContainer.appendChild(nameText);

    file.appendChild(topContainer);

    let thumbnail = document.createElement("video");
    thumbnail.id = fullFilePath;
    thumbnail.preload = "metadata";
    thumbnail.height = 0;
    thumbnail.style.display = "flex";
    thumbnail.style.marginLeft = "50px";

    file.appendChild(thumbnail);

    let splitForFileType = fullFilePath.split(".");
    let fileType = splitForFileType[splitForFileType.length - 1];
    let isPhoto = photoTypes.includes(fileType);

    let parent = document.querySelector("section");

    icon.addEventListener("click", function() {
        let displayElem = parent.children[3];

        if(!(isPhoto)) {
            if(file.className == "thumbnailOpen") {
                file.className = "thumbnailClosed";
            }
            else {
                file.className = "thumbnailOpen";
            }
            
            let toRemove = document.getElementsByClassName("activeThumbnail");

            // remove other open thumbnail
            for(let i = 0; i < toRemove.length; i++) {
                if(toRemove[i] != thumbnail) {
                    toRemove[i].removeAttribute("src");
                    toRemove[i].load();
                    toRemove[i].parentNode.className = "thumbnailClosed";
                    toRemove[i].height = 0;

                    window.clearInterval(currentThumbnailInterval);
                }
            }

            if(file.className == "thumbnailOpen") {
                thumbnail.className = "activeThumbnail";
                thumbnail.src = fullFilePath;
                thumbnail.load();
            }
            else {
                thumbnail.className = "thumbnail";
                thumbnail.removeAttribute("src");
                thumbnail.load();
                thumbnail.height = 0;

                window.clearInterval(currentThumbnailInterval);
            }
        }
    });

    thumbnail.onloadedmetadata = function() {
        let dur = Math.floor(thumbnail.duration);
        let incr = Math.floor(dur / 10);
        let cur = 0;

        thumbnail.currentTime = incr;
        
        thumbnail.height = 120;

        currentThumbnailInterval = window.setInterval(function(){
            cur += incr;
            thumbnail.currentTime = cur;

            if(cur >= dur - Math.ceil(incr / 2)) {
                cur = 0;
            }
        }, 900);
    }

    nameText.addEventListener("click", function() {
        let displayElem = parent.children[3];
        let tag = (displayElem.tagName).toLowerCase();

        if(!(isPhoto)) {
            displayElem.remove();

            let videoRef = document.createElement("video");
            videoRef.controls = true;
            parent.appendChild(videoRef);

            videoRef.style.display = "none";

            toggleNavMenu();
            document.getElementById("title").innerText = name;
            localStorage.setItem("videoname", name);

            let actualSrc = fullFilePath.slice(2);

            // fix video src if directory path modified becasue duplicate name
            for(let m = 0; m < modif.length; m++) {
                if((modif[m][0]).slice(2) == actualSrc) {
                    actualSrc = (modif[m][1]).slice(2);
                }
            }

            videoRef.src = "../" + actualSrc;
            localStorage.setItem("videosrc", actualSrc);

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
            });
        }
        else {
            document.getElementById("title").innerText = name;
            
            toggleNavMenu();

            displayElem.remove();

            let img = document.createElement("img");
            img.src = fullFilePath;
            img.style.display = "none";
            
            parent.appendChild(img);

            // set the size of the image to fit the screen
            let margin = 0.75;
            if(mobile) {
                margin = 0.9;
            }
            img.onload = function() {
                let screenHorizontal = (window.innerWidth > window.innerHeight);

                const ratio = img.width / img.height;
                const changeX = 5;
                const changeY = changeX / ratio;
                let w = img.width;
                let h = img.height;

                while(
                    (w > (window.innerWidth * margin)) || 
                    (h > (window.innerHeight * margin))
                ) {
                    w -= changeX;
                    h -= changeY;
                }
                
                img.width = w;
                img.height = h;

                img.style.display = "flex";

                let actualSrc = fullFilePath.slice(2);

                // fix video src if directory path modified becasue duplicate name
                for(let m = 0; m < modif.length; m++) {
                    if((modif[m][0]).slice(2) == actualSrc) {
                        actualSrc = (modif[m][1]).slice(2);
                    }
                }

                localStorage.setItem("videosrc", actualSrc);
                localStorage.setItem("videoname", name);
            }
        }
    });
    
    div.appendChild(file);
}

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
    
    if(debug) {
        console.log("Children:");
        console.log(children);
        
        console.log("First Actual Child:");
        console.log(firstActualChild);
    }

    let test = window.getComputedStyle(firstActualChild).display;
    let update = "-1";
    let divUpdate = "-1";

    if(test == "none") {
        update = "flex";
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

/**
 * I cannot get multiple folders with the same name (but located at different 
 * directories to properly work. So the solution is to have the actual data 
 * representation of the directory modify duplicate folder names by adding a 
 * unique number to the end of it. And keep track of which folders were changed 
 * by the full path so can easily modify the front-end HTML to show the original 
 * name.
 */
let modif = [];
function filterOutDuplicates() {
    for(let i = 0; i < directory.length; i++) {
        let before = directory[i];
        
        let checked = [];
        let splitted = directory[i].split("/");
        let fileName = splitted[splitted.length - 1];
        // remove . and Media
        splitted.slice(2);
        // remove file name - 2 files with the same name can't be in same directory
        splitted.splice(splitted.length - 1, 1);

        if(debug) {
            console.log("----");
            console.log("checking:");
            console.log(splitted);
        }

        let foundDuplicate = false;
        let addon = 1;

        for(let j = 0; j < splitted.length; j++) {
            if(checked.includes(splitted[j])) {
                if(debug) {
                    console.log("found duplicate: " + splitted[j]);
                }
                
                splitted[j] += addon.toString();
                ++addon;

                foundDuplicate = true;
            }
            else {
                checked.push(splitted[j]);
            }
        }

        
        if(foundDuplicate) {
            let after = "";

            for(let j = 0; j < splitted.length; j++) {
                after += splitted[j] + "/";
            }
            after += fileName;

            directory[i] = after;

            modif.push([after, before])
        }
    }
}

socket.on("sendDirectory", function(receivingDirectory) {
    directory = receivingDirectory;
    
    if(debug) {
        console.log("BEFORE:");
        console.log(directory);
    }
    
    filterOutDuplicates();
    
    if(debug) {
        console.log("AFTER:");
        console.log(directory);
    }

    if(debug) {
        console.log("Recieved diretory from server:");
        console.log(directory);
    }
    
    setupDirectory();

    // when page refreshed, go back to last video and place
    if(localStorage.getItem("videosrc") != null && localStorage.getItem("videoname") != null) {
        let splitForFileType = localStorage.getItem("videosrc").split(".");
        let fileType = splitForFileType[splitForFileType.length - 1];
        let isPhoto = photoTypes.includes(fileType);

        if(!(isPhoto)) {
            videoRef.style.display = "none";

            // toggleNavMenu();
            document.getElementById("title").innerText = localStorage.getItem("videoname");

            videoRef.src = "../" + localStorage.getItem("videosrc");
            
            // go to previous time
            if(localStorage.getItem("videotime") != null) {
                videoRef.currentTime = parseFloat(localStorage.getItem("videotime"));

                // if video was playing during page  refresh resume video
                if(resumePlaying) {
                    if(localStorage.getItem("videoplaying") == "true") {
                        videoRef.autoplay = true
                    }
                }
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
            });
        }
        else {
            document.getElementById("title").innerText = localStorage.getItem("videoname");
            
            document.querySelector("section").children[3].remove();

            let img = document.createElement("img");
            img.src = "../" + localStorage.getItem("videosrc");
            img.style.display = "none";
            
            document.querySelector("section").appendChild(img);

            // set the size of the image to fit the screen
            let margin = 0.75;
            if(mobile) {
                margin = 0.9;
            }

            img.onload = function() {
                let screenHorizontal = (window.innerWidth > window.innerHeight);

                const ratio = img.width / img.height;
                const changeX = 5;
                const changeY = changeX / ratio;
                let w = img.width;
                let h = img.height;

                while(
                    (w > (window.innerWidth * margin)) || 
                    (h > (window.innerHeight * margin))
                ) {
                    w -= changeX;
                    h -= changeY;
                }
                
                img.width = w;
                img.height = h;

                img.style.display = "flex";
            }
        }
    }

    openFolders = [];
    
    // restore diretory on page refresh
    if(localStorage.getItem("navOpen") != null) {
        if(localStorage.getItem("navOpen") == "true") {
            if(window.getComputedStyle(navRef).display == "none") {
                toggleNavMenu();
            }
        }
        
        if(localStorage.getItem("openFolders") != null) {
            let splitted = localStorage.getItem("openFolders").split("|");

            if(debug) {
                console.log("Local storage open folders:");
                console.log(splitted);
            }
            
            for(let i = 0; i < splitted.length; i++) {
                if(!(openFolders.includes(splitted[i])) && (splitted[i].length > 0)) {
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