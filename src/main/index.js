const { app, ipcMain, dialog } = require('electron')
import { electronApp, optimizer } from '@electron-toolkit/utils'

const { menubar } = require('menubar-upgrade')
const fs = require('fs-extra')
const path = require('path')
const isDev = process.env.NODE_ENV !== 'production'

const iconPath = path.join(__dirname, 'Icon.png') // Ersetze dies mit dem Pfad zu deinem Tray-Icon
console.log('\x1b[33m%s\x1b[0m', 'isDev --------------------', isDev)
let mb = menubar({
  index: isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../../dist/index.html')}`,
  icon: iconPath,
  browserWindow: {
    width: 600,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'), // Stelle sicher, dass der Pfad korrekt ist
      nodeIntegration: false,
      contextIsolation: true, // Für Sicherheit im Produktionsmodus contextIsolation auf true setzen
      devTools: {}
    },
    closable: true,
    alwaysOnTop: true,
    resizable: false,
    movable: false,
    minimizable: false
  }
})

mb.on('ready', () => {
  console.log('Menubar app is ready')
})

// Hier kommen deine ipcMain.handle Funktionen...
// ...

app.on('activate', () => {
  if (mb && mb.window === null) {
    mb.createWindow()
  }
})

// Schließe die App, wenn alle Fenster geschlossen sind (außer auf macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  let directoryPath = ''
  let fileList = []
  //IPC FUNCTIONS
  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.on('open-directory-dialog', async (event) => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (!result.canceled && result.filePaths.length > 0) {
      directoryPath = result.filePaths[0]
      try {
        fileList = await readDirectoryRecursively(directoryPath)
        console.log('\x1b[33m%s\x1b[0m', 'directoryPath --------------------', directoryPath)

        event.reply('directory-contents', { path: directoryPath, children: fileList })
      } catch (err) {
        event.reply('directory-read-error', err.toString())
      }
    }
  })

  ipcMain.on('load-directory-children', async (event, path) => {
    try {
      const children = await readDirectoryRecursively(path)
      console.log('\x1b[33m%s\x1b[0m', 'children --------------------', children)
      event.reply('directory-contents', { path: directoryPath, children: fileList })
    } catch (error) {
      event.sender.send('directory-read-error', error.toString())
    }
  })

  ipcMain.on('read-file', async (event, filePath) => {
    try {
      const fileContent = await fs.readFile(filePath, 'utf8')
      console.log('\x1b[33m%s\x1b[0m', 'fileContent --------------------', fileContent)
      event.reply('file-contents', { path: filePath, content: fileContent })
    } catch (error) {
      event.reply('file-read-error', error.toString())
    }
  })

  async function readDirectoryRecursively(dirPath) {
    let fileList = []
    try {
      const files = await fs.readdir(dirPath, { withFileTypes: true })
      for (const file of files) {
        const filePath = path.join(dirPath, file.name)
        if (file.isDirectory()) {
          const children = await readDirectoryRecursively(filePath)
          console.log('\x1b[33m%s\x1b[0m', 'children --------------------', children)
          fileList.push({
            key: filePath,
            label: file.name,
            data: filePath,
            children: children
          })
        } else {
          fileList.push({
            key: filePath,
            label: file.name,
            data: filePath,
            children: []
          })
        }
      }
      return fileList
    } catch (err) {
      console.error(err)
      throw err // or handle error as you see fit
    }
  }

  mb.createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mb.browserWindow.getAllWindows().length === 0) mb.createWindow()
  })
})
