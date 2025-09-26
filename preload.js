const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs seguras al renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Aquí puedes agregar APIs específicas si las necesitas
  platform: process.platform,
  versions: process.versions
});
