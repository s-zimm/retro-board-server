import db from './db/db.js';
import { WebSocketServer } from 'ws';
import { createRetro } from './db/db.js';

const wss = new WebSocketServer({port: '7777'});

wss.on('connection', (ws) => {
	console.log('connected!')
	ws.on('hello', function hello(data) {
		console.log('received: %s', data);
	});
	
	ws.on('message', function message(data) {
		const parsed = JSON.parse(data);
		const message = parsed.message;
		console.log('MESSAGE', message)
		switch(message) {
			case 'create_retro':
				create_retro(parsed);
			default:
				break;
		}
		console.log('received: %s', data);
	});
})

const create_retro = (data) => {
	createRetro('VersionOne.Web', data.member)
}