// Socket.IO
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// file reading
const fileReader = require("fs");
const path = require("path");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpegRequire = require("fluent-ffmpeg");
const { dir } = require("console");
const e = require("express");
ffmpegRequire.setFfmpegPath(ffmpegPath);


// add static file(s)
app.use(express.static(__dirname));
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

const validFileTypes = [".mp4", ".webm", ".ogg"];
let foldersToCheck = ["./Media/"];
let directory = [];
let firstFolderIndex;

scanForInvalidFiles();
function scanForInvalidFiles() {
    console.log("\n\nScanning Media folder for unsopported files...");

    setTimeout(function() {
        parseFolder();
    }, 500);
}

function parseFolder() {
    let folder = foldersToCheck[0];
    foldersToCheck.shift();

    fileReader.readdirSync(folder).forEach(file => {
        // first check to see if the current file is a folder
        let fullFilePath = folder + file;
        let fileIsFolder = fileReader.lstatSync(fullFilePath).isDirectory();

        if(fileIsFolder) {
            let parsePath = fullFilePath + "/";

            foldersToCheck.push(parsePath);
            
            // directory.push("FOLDER:" + parsePath);
        }
        else {
            let fileType = path.extname(file);

            if(!(validFileTypes.includes(fileType))) {
                if(file != ".gitignore") {
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
    });

    // if more folders need to be checked, do the function again
    if(foldersToCheck.length > 0) {
        parseFolder();
    }
    else {
        startServer();
    }
}

function startServer() {
    // start server
    server.listen(3000, () => {
      console.log("\n\npersonal media server is now up");
    });
}

// handle users
io.on("connection", (socket) => {
    io.emit("sendDirectory", directory);
});
