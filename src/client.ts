import fs from 'fs'
import path from 'path'
import { SIGNER_EVENTS } from '@walletconnect/signer-connection'
import { PairingTypes } from '@walletconnect/types'
import WalletConnectProvider from '@walletconnect/ethereum-provider'
import { ethers } from 'ethers'
import { LOGIN_DOMAIN, LOGIN_TYPEHASH, LOGIN_TYPES } from './strategies/login'

require('dotenv').config()

async function main() {
	const client = new WalletConnectProvider({
		chainId: 1,
		rpc: {
			infuraId: '0e820b7eb7c54c2591508469f771c5ea',
		},
		methods: ['eth_signTypedData_v4'],
		client: {
			apiKey: process.env.WC_KEY,
			metadata: {
				name: 'Test Client',
				description: 'An example WalletConnect v2 client',
				url: 'http://localhost',
				icons: ['https://walletconnect.com/walletconnect-logo.png'],
			},
		},
	})

	client.signer.connection.on(SIGNER_EVENTS.uri, async ({ uri }) => fs.writeFileSync(path.resolve('./dist/.wc'), JSON.stringify({ uri })))

	await client.connect()

	const web3 = new ethers.providers.Web3Provider(client)
	console.log(`connected to ${await web3.getSigner().getAddress()}`)

	console.log(`attempting personal_sign`)
	const signature = await web3.getSigner().provider.send('personal_sign', ['hello world', await web3.getSigner().getAddress()])

	console.log('completed', signature)

	console.log(`attempting 712 signature`)

	const response = await web3.getSigner()._signTypedData(LOGIN_DOMAIN, LOGIN_TYPES, { wallet: await web3.getSigner().getAddress(), scope: 'example.com', nonce: 1234 })

	console.log('completed', response)
}

main()
