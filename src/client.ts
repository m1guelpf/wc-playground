import fs from 'fs'
import path from 'path'
import { SessionTypes, SignalTypes } from '@walletconnect/types'
import { calcExpiry, generateRandomBytes32, toMiliseconds } from '@walletconnect/utils'
import WalletConnectClient, { CLIENT_EVENTS, SESSION_JSONRPC } from '@walletconnect/client'

require('dotenv').config()

async function main() {
	const client = await WalletConnectClient.init({
		apiKey: process.env.WC_KEY,
		metadata: {
			name: 'Test Client',
			description: 'Test Client',
			url: 'http://localhost',
			icons: ['https://walletconnect.com/walletconnect-logo.png'],
		},
	})

	client.on(CLIENT_EVENTS.pairing.proposal, function (proposal: SessionTypes.Proposal) {
		const connectionURI = (proposal.signal.params as unknown as SignalTypes.ParamsUri).uri

		fs.writeFileSync(path.resolve('./dist/.wc'), JSON.stringify({ uri: connectionURI }))
	})

	const {
		state: {
			accounts: [connectedAccount],
		},
		topic,
	} = await client.connect({ permissions: { jsonrpc: { methods: ['personal_sign', 'custom_method'] }, blockchain: { chains: ['eip155:1'] } } })

	console.log(`connected to ${connectedAccount}`)

	console.log(`attempting personal_sign`)

	const signature = await client.request({
		chainId: 'eip155:1',
		topic: topic,
		request: {
			method: 'personal_sign',
			params: ['hello world', '0xe340b00b6b622c136ffa5cff130ec8edcddcb39d'],
		},
	})

	console.log('completed', signature)

	console.log(`attempting custom_method`)

	const response = await client.request({
		chainId: 'eip155:1',
		topic: topic,
		request: {
			method: 'custom_method',
			params: ['hello world', '0xe340b00b6b622c136ffa5cff130ec8edcddcb39d'],
		},
	})

	console.log('completed', response)
}

main()
