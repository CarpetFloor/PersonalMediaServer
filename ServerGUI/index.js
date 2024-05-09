const { app, BrowserWindow } = require("electron");
const server = require("./server");

const createWindow = () => {
  server.start();
  
  const win = new BrowserWindow({
    width: 850,
    height: 700
  });

  win.loadFile("index.html");
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  })
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
})