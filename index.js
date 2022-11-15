import db from './db/db.js';
import { WebSocketServer } from 'ws';
import { create_retro, add_member } from './db/db.js';

const wss = new WebSocketServer({port: '7777'});

let id = 0;
const lookup = {}

wss.on('connection', (ws) => {
	console.log('connected!')
	ws.id = id++;
	lookup[ws.id] = ws;
	ws.send(JSON.stringify({ message: 'connected', socketId: ws.id }));
	
	ws.on('message', async function message(data) {
		const parsed = JSON.parse(data);
		const message = parsed.message;
		console.log('MESSAGE', message)
		switch(message) {
			case 'create_retro':
				const retroState = await create_retro('VersionOne.Web', parsed.member);
				ws.send(JSON.stringify({message: 'retro_created', retroState}));
				break;
			case 'join_retro':
				const { retroId, member } = parsed;
				const updatedRetroState = await add_member('VersionOne.Web', retroId, member);
				updatedRetroState.members.forEach(member => lookup[member.socketId].send(JSON.stringify({message: 'retro_updated', retroState: updatedRetroState})));
				break;
			default:
				break;
		}
		console.log('received: %s', data);
	});
})