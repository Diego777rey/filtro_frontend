const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    show: false,
    icon: path.join(__dirname, 'src/assets/img/material.ico'),
    autoHideMenuBar: true // 🔹 Oculta la barra de menú nativa
  });

  // Elimina cualquier menú por completo
  mainWindow.setMenu(null);

  const isDev =
    process.env.NODE_ENV === 'development' ||
    process.argv.includes('--dev');

  if (isDev) {
    console.log('Modo desarrollo: cargando http://localhost:4200');
    mainWindow.loadURL('http://localhost:4200');
    mainWindow.webContents.openDevTools();
  } else {
    let indexPath = path.join(__dirname, 'dist', 'material02', 'index.html');

    console.log('Buscando index.html en:', indexPath);
    console.log('__dirname:', __dirname);

    if (!fs.existsSync(indexPath)) {
      console.log('No encontrado en __dirname, buscando en process.resourcesPath');
      indexPath = path.join(process.resourcesPath, 'app', 'dist', 'material02', 'index.html');
      console.log('Buscando en:', indexPath);
    }

    if (fs.existsSync(indexPath)) {
      console.log('Modo producción: cargando', indexPath);
      mainWindow.loadFile(indexPath);
    } else {
      console.error('No se encontró index.html en producción');
      mainWindow.loadURL(
        'data:text/html,<h1>Error</h1><p>No se encontró el build de Angular. Ejecuta <code>npm run electron:build</code>.</p>'
      );
    }
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
