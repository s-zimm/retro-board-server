import db from './db/db.js';
import { WebSocketServer } from 'ws';
import { create_retro, add_member, add_card } from './db/db.js';

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
			case 'create_retro': {
				const retroState = await create_retro('VersionOne.Web', parsed.member);
				ws.send(JSON.stringify({message: 'retro_created', retroState}));
				break;
			}
			case 'join_retro': {
				const { member, retroId } = parsed;
				const updatedRetroState = await add_member('VersionOne.Web', retroId, member);
				updatedRetroState.members.forEach(member => lookup[member.socketId].send(JSON.stringify({message: 'retro_updated', retroState: updatedRetroState})));
				break;
			}
			case 'add_card': {
				const { text, column, retroId } = parsed;
				const updatedRetroState = await add_card('VersionOne.Web', retroId, text, column);
				updatedRetroState.members.forEach(member => lookup[member.socketId].send(JSON.stringify({message: 'retro_updated', retroState: updatedRetroState})));
			}
			default:
				break;
		}
		console.log('received: %s', data);
	});
})