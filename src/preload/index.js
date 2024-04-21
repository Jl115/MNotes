// preload.js
const { contextBridge, ipcRenderer } = require('electron')

const electronAPI = {
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args))
  },
  receive: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args))
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
