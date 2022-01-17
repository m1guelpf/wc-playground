import { app, BrowserWindow, dialog, Notification } from 'electron'
import WalletConnectClient, { CLIENT_EVENTS } from '@walletconnect/client'

async function main() {
	const client = await WalletConnectClient.init({
		controller: true,
		apiKey: process.env.WC_KEY,
		relayProvider: 'wss://relay.walletconnect.com',
		metadata: {
			name: 'Node Wallet',
			description: 'An experimental CLI wallet.',
			url: 'http://localhost',
			icons: ['https://walletconnect.com/walletconnect-logo.png'],
		},
		storageOptions: {
			database: ':memory:',
			tableName: 'walletconnect',
		},
	})

	function createWindow() {
		new Notification({ title: 'Hello World!', body: 'web2.5 here we come!' }).show()

		const win = new BrowserWindow({
			width: 800,
			height: 600,
		})

		win.loadFile('../src/index.html')
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
}

main()
