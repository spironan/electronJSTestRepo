// electron built in auto updater module maintained by electron team 
const { updateElectronApp } = require('update-electron-app')
updateElectronApp()

const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron')
// include the Node.js 'path' module at the top of your file
const { path } = require('node:path')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  win.loadFile('index.html')

  const screenRecordWindow = new BrowserWindow({
    width: 800,
    height: 720,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  })
  screenRecordWindow.loadFile('recorder.html')
}

let tray

app.whenReady().then(() => {
  const icon = nativeImage.createFromPath('assets/electronics-chip.png')
  tray = new Tray(icon)

  // note: contextMenu, Tooltip and Title Code will go here!
  const contextMenu = Menu.buildFromTemplate([
    {label:'Item1', type:'radio'},
    {label:'Item2', type:'radio'},
    {label:'Item3', type:'radio', checked: true},
    {label:'Item4', type:'radio'},
  ])

  tray.setContextMenu(contextMenu)
  tray.setToolTip("this is my app")
  tray.setTitle('this is my title')


  ipcMain.handle('ping', () => 'pang pong')
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})


// EXTRA INCLUDES FOR IPC
// Main process
const { desktopCapturer, dialog } = require('electron')
const fs = require('fs');

ipcMain.handle(
  'DESKTOP_CAPTURER_GET_SOURCES',
  (event, opts) => desktopCapturer.getSources(opts)
)

ipcMain.handle('CREATE_VIDEO_OPTIONS_MENU', (event, inputSources) => {
  const videoOptionsMenu = Menu.buildFromTemplate(
      inputSources.map(source => ({
          label: source.name,
          click: () => {
              event.sender.send('SELECT_SOURCE', source);
          }
      }))
  );

  // Instead of returning, just show it
  videoOptionsMenu.popup();
  return; // No need to return the menu
});


ipcMain.handle('SHOW_SAVE_DIALOG', async (event, options) => {
    const result = await dialog.showSaveDialog(options);
    console.log("electron filepath result" + result.filePath)

    // Check if a file path was selected
    if (result.canceled) {
      return { filepath: undefined }; // User canceled the dialog
  } else {
      return { filepath: result.filePath }; // Return the file path
  }

});

// If you are using writeFile in the renderer as well, you can define it:
function writeFile(filepath, buffer, callback) {
    fs.writeFile(filepath, buffer, (err) => {
        if (err) {
            console.error('Error saving video:', err);
        } else {
            callback();
        }
    });
}