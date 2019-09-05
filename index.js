const library = require('./tonclient.node');
const {TONClient} = require('ton-client-js');
const fetch = require('node-fetch');
const WebSocket = require('websocket');
TONClient.setLibrary({
	fetch,
	WebSocket: WebSocket.w3cwebsocket,
	createLibrary: () => {
		return Promise.resolve(library);
	}
});

module.exports = {
    TONClient
};
