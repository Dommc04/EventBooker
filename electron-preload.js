import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  onNewEvent: (callback) => {
    ipcRenderer.on('menu-new-event', () => callback())
  }
})