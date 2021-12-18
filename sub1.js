// Access information about media sources that can be used to capture audio
// and video from the desktop using the navigator.mediaDevices.getUserMedia API.
//
// For more info, see:
// https://electronjs.org/docs/api/desktop-capturer

const { app, BrowserWindow,Menu} = require('electron')
const path = require('path')
// Menu.setApplicationMenu(null)
app.whenReady().then(() => {
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 600,
    title:'Capture',
    webPreferences: {
      nodeIntegration: false, // default in Electron >= 5
      contextIsolation: true, // default in Electron >= 12
      preload: path.join(__dirname, 'sub1_preload.js')
    }
  })
  // mainWindow.removeMenu()
  mainWindow.loadFile('sub1_index.html')
})
