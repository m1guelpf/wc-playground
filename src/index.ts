import fs from 'fs'
import path from 'path'
import { ethers } from 'ethers'
import { SessionTypes } from '@walletconnect/types'
import WalletConnectClient, { CLIENT_EVENTS } from '@walletconnect/client'

require('dotenv').config()

async function main() {
	const wallet = ethers.Wallet.createRandom()
	const walletAddress = await wallet.getAddress()

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

	function handleSessionUserApproval(approved: boolean, proposal: SessionTypes.Proposal) {
		if (!approved) return client.reject({ proposal })

		return client.approve({
			proposal,
			response: {
				state: {
					accounts: [`eip155:1:${walletAddress}`],
				},
			},
		})
	}

	async function handleRpcRequest(method: string, params: any) {
		switch (method) {
			case 'personal_sign':
				return wallet.signMessage(params[0] as string)
			case 'eth_signTypedData_v4':
				const {
					types: { EIP712Domain: _, ...types },
					domain,
					message,
				} = JSON.parse(params[1])
				return wallet._signTypedData(domain, types, message)

			default:
				throw new Error('Not implemented.')
		}
	}

	client.on(CLIENT_EVENTS.session.proposal, async (proposal: SessionTypes.Proposal) => {
		// user should be prompted to approve the proposed session permissions displaying also dapp metadata
		const { proposer, permissions } = proposal
		const { metadata } = proposer
		let approved: boolean = true

		return handleSessionUserApproval(approved, proposal)
	})

	client.on(CLIENT_EVENTS.session.created, async (session: SessionTypes.Created) => {
		console.log(`Connected to ${session.peer.metadata.name}`)
	})

	client.on(CLIENT_EVENTS.session.request, async ({ topic, request: { id: requestId, method: rpcMethod, params } }: SessionTypes.RequestEvent) => {
		const {
			peer: { metadata },
		} = await client.session.get(topic)

		console.log(`${metadata.name} is trying to execute ${rpcMethod}.`, { params })

		let approved: boolean = true

		if (!approved) {
			return client.respond({
				topic,
				response: {
					id: requestId,
					jsonrpc: '2.0',
					error: {
						code: -32000,
						message: 'User rejected JSON-RPC request',
					},
				},
			})
		}

		await client.respond({
			topic,
			response: {
				id: requestId,
				jsonrpc: '2.0',
				result: await handleRpcRequest(rpcMethod, params),
			},
		})
	})

	console.log('init completed')
	await client.pair(JSON.parse(fs.readFileSync(path.resolve('./dist/.wc'), 'utf-8')))
}

main()
