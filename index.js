import db from './db/db.js';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { create_retro, add_member, add_card, remove_card, moveto_phase2, update_item, get_retroIDs, moveto_phase3, close_retro } from './db/db.js';

const server = createServer((req, res) => {
	res.writeHead(405)
	res.end()
})
server.listen(process.env.PORT || 7777, (req, res) => {console.log('listening')})
const wss = new WebSocketServer({server,})

let id = 0;
const lookup = {}

wss.on('connection', async (ws, req) => {
	console.log('connected!')
	const INSTANCE_ID = req.rawHeaders[13]+'/'
	ws.id = id++;
	lookup[ws.id] = ws;
	ws.send(JSON.stringify({ message: 'connected', socketId: ws.id, retroIds: await get_retroIDs(INSTANCE_ID) || []}));
	
	ws.on('message', async function message(data) {
		const parsed = JSON.parse(data);
		const message = parsed.message;
		const INSTANCE_ID = parsed.instanceId;
		console.log('MESSAGE', message)
		switch(message) {
			case 'create_retro': {
				const { member, retroFormat, retroTitle } = parsed;
				const retroState = await create_retro(INSTANCE_ID, member, JSON.parse(retroFormat), retroTitle);
				ws.send(JSON.stringify({message: 'retro_created', retroState}));
				break;
			}
			case 'join_retro': {
				const { member, retroId } = parsed;
				const updatedRetroState = await add_member(INSTANCE_ID, retroId, member);
				updatedRetroState.members.forEach(member => lookup[member.socketId].send(JSON.stringify({message: 'retro_updated', retroState: updatedRetroState})));
				break;
			}
			case 'add_card': {
				const { card, column, retroId } = parsed;
				const updatedRetroState = await add_card(INSTANCE_ID, retroId, card, column);
				updatedRetroState.members.forEach(member => lookup[member.socketId].send(JSON.stringify({message: 'retro_updated', retroState: updatedRetroState})));
				break;
			}
			case 'remove_card': {
				const { card, column, retroId } = parsed;
				const updatedRetroState = await remove_card(INSTANCE_ID, retroId, card, column);
				updatedRetroState.members.forEach(member => lookup[member.socketId].send(JSON.stringify({message: 'retro_updated', retroState: updatedRetroState})));
				break;
			}
			case 'moveto_phase2': {
				const { retroId } = parsed;
				const updatedRetroState = await moveto_phase2(INSTANCE_ID, retroId);
				updatedRetroState.members.forEach(member => lookup[member.socketId].send(JSON.stringify({message: 'retro_updated', retroState: updatedRetroState})));
				break;
			}
			case 'moveto_phase3': {
				const { retroId } = parsed;
				const updatedRetroState = await moveto_phase3(INSTANCE_ID, retroId);
				updatedRetroState.members.forEach(member => lookup[member.socketId].send(JSON.stringify({message: 'retro_updated', retroState: updatedRetroState})));
				break;
			}
			case 'update_item': {
				const { retroId, item } = parsed;
				const updatedRetroState = await update_item(INSTANCE_ID, retroId, item);
				updatedRetroState.members.forEach(member => lookup[member.socketId].send(JSON.stringify({message: 'retro_updated', retroState: updatedRetroState})));
				break;
			}
			case 'close_retro': {
				const { retroId, agilityRetroUrl } = parsed;
				const members = await close_retro(INSTANCE_ID, retroId);
				const openRetros = await get_retroIDs(INSTANCE_ID) || []
				members.forEach(member => lookup[member.socketId].send(JSON.stringify({message: 'retro_closed', agilityRetroUrl, retroIds: openRetros})));
				break;
			}
			default:
				break;
		}
		console.log('received: %s', data);
	});
})