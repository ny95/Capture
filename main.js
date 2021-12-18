const { app, BrowserWindow,ipcMain,screen,desktopCapturer,autoUpdater} = require('electron')
const path = require('path')
app.whenReady().then(() => {
	let display = screen.getPrimaryDisplay()
	let source_id,sub1=false;
  	const mainWindow = new BrowserWindow({
		show: false,
		height: 600,
		width: 600,
		// frame:false,
		title:'Capture',
		webPreferences: {
			nodeIntegration: false, // default in Electron >= 5
			contextIsolation: true, // default in Electron >= 12
			preload: path.join(__dirname, 'preload.js')
    	}
  	})
  	// mainWindow.removeMenu()
	mainWindow.loadFile('index.html')
	mainWindow.once('ready-to-show', () => {
		autoUpdater.checkForUpdatesAndNotify();
		mainWindow.show()
	})
	autoUpdater.on('update-available', () => {
		mainWindow.webContents.send('update_available');
	});
	autoUpdater.on('update-downloaded', () => {
		mainWindow.webContents.send('update_downloaded');
	});
	ipcMain.on('app_version', (event) => {
		event.sender.send('app_version', { version: app.getVersion() });
	});
	ipcMain.handle(
	  'DESKTOP_CAPTURER_GET_SOURCES',
	  (event, opts) => desktopCapturer.getSources(opts)
	)


	ipcMain.handle('control_mmc_action', (event, action) => {
		switch (action) {
			case 'min':
				mainWindow.minimize();
				break;
			case 'max':
				if(mainWindow.isMaximized()){
					mainWindow.unmaximize();
				}else{
					mainWindow.maximize();
				}
				break;
			case 'cls':
				mainWindow.close();
				break;
			default:
				break;
		}
	})
})
