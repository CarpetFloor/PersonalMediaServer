module.exports.start = function() {
const debugMode = false;
const showUnsupported = false;

// Socket.IO
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// directory
const fileReader = require("fs");
let foldersToCheck = ["./Media/"];
let directory = [];
const validFileTypes = [
    // videos
    "mp4", "webm", "ogg", 
    // photos
    "png", "jpg"
];
let alreadySetupDirectory = false;

function parseFolder() {
    let folder = foldersToCheck[0];
    foldersToCheck.shift();
    
    fileReader.readdirSync(folder).forEach(file => {
        let fullFilePath = folder + file;

        if(file != ".gitignore") {
            // first check to see if the current file is a folder
            let fileIsFolder = fileReader.lstatSync(fullFilePath).isDirectory();
            
            if(fileIsFolder) {
                let parsePath = fullFilePath + "/";

                foldersToCheck.push(parsePath);
            }
            else {
                if(!(file.includes("."))) {
                    if(showUnsupported) {
                        console.log("\nUNSUPORTED FILE FOUND - NO FILE TYPE (will be excluded from server directory)");
                        console.log("....NAME: " + file);
                        console.log("....IN FOLDER: " + folder);
                        console.log("....FULL DIRECTORY: " + fullFilePath);
                        console.log("....SUPPORTED FILE TYPES: " + validFileTypes);
                        console.log("--------------------");
                    }
                }
                else {
                    let splitted = file.split(".");
                    let fileType = splitted[splitted.length - 1];

                    if(!(validFileTypes.includes(fileType))) {
                        if(showUnsupported) {
                            console.log("\nUNSUPORTED FILE FOUND (will be excluded from server directory)");
                            console.log("....NAME: " + file);
                            console.log("....IN FOLDER: " + folder);
                            console.log("....FULL DIRECTORY: " + fullFilePath);
                            console.log("....SUPPORTED FILE TYPES: " + validFileTypes);
                            console.log("--------------------");
                        }
                    }
                    else {
                        directory.push(fullFilePath);
                    }
                }
            }
        }
    });
    
    // if more folders need to be checked, do the function again
    if(foldersToCheck.length > 0) {
        parseFolder();
    }
    else {
        if(debugMode) {
            console.log("\nDirectory set up!");
        }

        if(alreadySetupDirectory) {
            io.emit("sendDirectory", directory);
        }
    }
}

function setupDirectory() {
    if(debugMode) {
        console.log("\nSetting up directory...");
    }
    
    foldersToCheck = ["./Media/"];
    directory = [];
    
    parseFolder();
}

setupDirectory();

// use static files
app.use(express.static(__dirname + "/Client"));
app.use(express.static(__dirname + "/Assets"));
app.use('/Media',  express.static(__dirname + '/Media'));
// app.use("/Client",  express.static(__dirname + "/Client"));
// send index.html to client
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/Client/index.html");
});

/**
 * User Socket.IO to handle communication between client 
 * and server, which is needed for the client to get the 
 * media directory.
 */
io.on("connection", (socket) => {
    // when client connects to server send directory
    io.emit("sendDirectory", directory);
    alreadySetupDirectory = true;
});

// start server
const port = 1234;
// start server
server.listen(port, () => {
    console.log("\nServer started on port " + port);
});

// watch for changes in Media directory

let mediaModified = false;

hound = require("hound");

watcher = hound.watch("Media");

watcher.on("create", function(file, stats) {
    try{
        mediaModified = true;
    }
    catch(e) {
        let unused = "unused";
    }
});
watcher.on("change", function(file, stats) {
    try{
        mediaModified = true;
    }
    catch(e) {
        let unused = "unused";
    }
});
watcher.on("delete", function(file) {
    try{
        mediaModified = true;
    }
    catch(e) {
        let unused = "unused";
    }
});

// incase a bunch of changes made, don't spam user 
setInterval(function() {
    if(mediaModified) {
        if(debugMode) {
            console.log("resending directory");
        }
    
        mediaModified = false;

        setupDirectory();
    }
}, (5 * 1000));

// handle thrown error crashing server when empty folder deleted in Media
process.on("uncaughtException", function(e) {
    if(debugMode) {
        console.log("uncaught exception:");
        console.log(e);
    }
});
}