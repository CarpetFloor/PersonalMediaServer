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
const validFileTypes = ["mp4", "webm", "ogg"];

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
                    console.log("\nUNSUPORTED FILE FOUND - NO FILE TYPE (will be excluded from server directory)");
                    console.log("....NAME: " + file);
                    console.log("....IN FOLDER: " + folder);
                    console.log("....FULL DIRECTORY: " + fullFilePath);
                    console.log("....SUPPORTED FILE TYPES: " + validFileTypes);
                    console.log("--------------------");
                }
                else {
                    let splitted = file.split(".");
                    let fileType = splitted[splitted.length - 1];

                    if(!(validFileTypes.includes(fileType))) {
                        console.log("\nUNSUPORTED FILE FOUND (will be excluded from server directory)");
                        console.log("....NAME: " + file);
                        console.log("....IN FOLDER: " + folder);
                        console.log("....FULL DIRECTORY: " + fullFilePath);
                        console.log("....SUPPORTED FILE TYPES: " + validFileTypes);
                        console.log("--------------------");
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
        console.log("\nDirectory set up!");
    }
}

function setupDirectory() {
    console.log("\nSetting up directory...");
    
    parseFolder();
}

setupDirectory();

// use static files
app.use(express.static(__dirname));
// send index.html to client
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

/**
 * User Socket.IO to handle communication between client 
 * and server, which is needed for the client to get the 
 * media directory.
 */
io.on("connection", (socket) => {
    // when client connects to server send directory
    io.emit("sendDirectory", directory);
});

// start server
const port = 8080;
// start server
server.listen(port, () => {
    console.log("\nServer started on port " + port);
});