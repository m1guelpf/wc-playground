import log from 'electron-log'
import { app, BrowserWindow, dialog, Notification } from 'electron'

log.info('Chrome: v' + process.versions.chrome)
log.info('Electron: v' + process.versions.electron)
log.info('Node: v' + process.versions.node)

process.on('uncaughtException', (e: any) => {
	if (e.code === 'EADDRINUSE') dialog.showErrorBox('Frame is already running', 'Frame is already running or another application is using port 1248.')
	else dialog.showErrorBox('An error occured, Frame will quit', e.message)

	log.error('uncaughtException')
	log.error(e)
	// Kill all clients running as child processes
	// clients.stop()
	throw e
	// setTimeout(() => app.quit(), 50)
})

global.eval = () => {
	throw new Error(`This app does not support global.eval()`)
} // eslint-disable-line

function createWindow() {
	new Notification({ title: 'Hello World!', body: 'web2.5 here we come!' }).show()

	const win = new BrowserWindow({
		width: 800,
		height: 600,
	})

	win.loadFile('../app/index.html')
}

app.whenReady().then(() => {
	if (app.dock) app.dock.hide()
	app.setAsDefaultProtocolClient('web25')
	createWindow()

	app.on('activate', function () {
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
})

app.on('open-url', (event, url) => {
	dialog.showErrorBox('Welcome Back', `You arrived from: ${url}`)
})

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit()
})
