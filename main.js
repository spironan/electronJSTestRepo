// electron built in auto updater module maintained by electron team 
const { updateElectronApp } = require('update-electron-app')
updateElectronApp()

const { app, BrowserWindow, ipcMain } = require('electron')
// include the Node.js 'path' module at the top of your file
const path = require('node:path')

const createWindow = () => {
    const win = new BrowserWindow({
      width: 1200,
      height: 720,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })
  
    win.loadFile('index.html')
  }
  
  app.whenReady().then(() => {
    ipcMain.handle('ping', () => 'pang pong')
    createWindow()
  
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
  
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
  