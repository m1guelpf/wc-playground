import { ethers } from 'ethers'

export const LOGIN_DOMAIN = {
	name: 'LoginProtocol',
	version: '1',
}

export const LOGIN_TYPES = {
	LoginProposal: [
		{ name: 'wallet', type: 'address' }, // The user's wallet address
		{ name: 'scope', type: 'string' }, // The scope of the user authentication (i.e. the platform's domain name)
		{ name: 'nonce', type: 'uint256' }, // A nonce to prevent replay attacks
	],
}

export const LOGIN_TYPEHASH = ethers.utils.keccak256(JSON.stringify({ domain: LOGIN_DOMAIN, types: LOGIN_TYPES }))
