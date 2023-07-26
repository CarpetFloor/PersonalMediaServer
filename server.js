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

// for sending client video
// const Blob = require("node-blob");

let resRef;
// add static file(s)
app.use(express.static(__dirname));
app.get("/", (req, res) => {
    resRef = res;
    res.sendFile(__dirname + "/index.html");
});

const validFileTypes = [".mp4", ".webm", ".ogg"];
let foldersToCheck = ["./Media/"];
let directory = [];
let firstFolderIndex;

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
scanForInvalidFiles();

let port = 3000;
let hostName = "test";

function startServer() {
    // start server
    server.listen(port, () => {
      console.log("\n\npersonal media server is now up");
    });
}

// handle users
io.on("connection", (socket) => {
    io.emit("sendDirectory", directory);
    
    socket.on("requestFile", (fullPath) => {
        fullFilePath = fullPath;
        let pathSplitted = fullFilePath.split(".");
        fileType = "video/" + pathSplitted[pathSplitted.length - 1];
    });
});

let fullFilePath = "file";
let fileType = "type";
/**
 * Lots of help from: https://www.geeksforgeeks.org/how-to-build-video-streaming-application-using-node-js/#
 */
// app.get("/videoPlayer", (req, res) => {
//     const range = req.headers.range
//     // console.log("RANGE ", range);
//     const videoPath = fullFilePath;
//     // console.log("VIDEO_PATH ", videoPath);
//     const videoSize = fileReader.statSync(videoPath).size;
//     // console.log("VIDEO_SIZE ", videoSize);
//     const chunkSize = 1 * 1e6;
//     // console.log("CHUNK_SIZE ", chunkSize);
//     const start = Number(range.replace(/\D/g, ""));
//     // console.log("START ", start);
//     const end = Math.min(start + chunkSize, videoSize - 1);
//     // console.log("END ", end);
//     const contentLength = end - start + 1;
//     // console.log("CONTENT_LENGTH ", contentLength);
//     const headers = {
//         "Content-Range": `bytes ${start}-${end}/${videoSize}`,
//         "Accept-Ranges": "bytes",
//         "Content-Length": contentLength,
//         "Content-Type": fileType
//     };
//     // console.log("HEADERS ", headers);
//     // console.log("--------------------");
//     // console.log("--------------------");

//     res.writeHead(206, headers);
    
//     const stream = fileReader.createReadStream(videoPath, {
//         start,
//         end
//     });
    
//     stream.pipe(res);
// });
app.get('/videoPlayer', (req, res)=>{
    const filePath = fullFilePath;
    const stat = fileReader.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;
    
    console.log(fullFilePath);
    console.log(range);
    console.log("--------------------");
    if(range){
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = end - start + 1;
        const file = fileReader.createReadStream(filePath, {start, end});

        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': fileType
        };

        res.writeHead(206, head);
        file.pipe(res);
    }
    else{
        const head = {
            'Content-Length': fileSize,
            'Content-Type': fileType
        };

        res.writeHead(200, head);
        fileReader.createReadStream(filePath).pipe(res);
    }
})