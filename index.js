import db from './db/db.js';
import { WebSocketServer } from 'ws';
import { create_retro, add_member, add_card, remove_card, moveto_phase2, update_item, get_retroIDs, moveto_phase3, close_retro } from './db/db.js';

const wss = new WebSocketServer({port: '7777'});

let id = 0;
const lookup = {}

wss.on('connection', async (ws) => {
	console.log('connected!')
	ws.id = id++;
	lookup[ws.id] = ws;
	ws.send(JSON.stringify({ message: 'connected', socketId: ws.id, retroIds: await get_retroIDs('VersionOne.Web') || []}));
	
	ws.on('message', async function message(data) {
		const parsed = JSON.parse(data);
		const message = parsed.message;
		console.log('MESSAGE', message)
		switch(message) {
			case 'create_retro': {
				const { member, retroFormat, retroTitle } = parsed;
				const retroState = await create_retro('VersionOne.Web', member, JSON.parse(retroFormat), retroTitle);
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
				const { card, column, retroId } = parsed;
				const updatedRetroState = await add_card('VersionOne.Web', retroId, card, column);
				updatedRetroState.members.forEach(member => lookup[member.socketId].send(JSON.stringify({message: 'retro_updated', retroState: updatedRetroState})));
				break;
			}
			case 'remove_card': {
				const { card, column, retroId } = parsed;
				const updatedRetroState = await remove_card('VersionOne.Web', retroId, card, column);
				updatedRetroState.members.forEach(member => lookup[member.socketId].send(JSON.stringify({message: 'retro_updated', retroState: updatedRetroState})));
				break;
			}
			case 'moveto_phase2': {
				const { retroId } = parsed;
				const updatedRetroState = await moveto_phase2('VersionOne.Web', retroId);
				updatedRetroState.members.forEach(member => lookup[member.socketId].send(JSON.stringify({message: 'retro_updated', retroState: updatedRetroState})));
				break;
			}
			case 'moveto_phase3': {
				const { retroId } = parsed;
				const updatedRetroState = await moveto_phase3('VersionOne.Web', retroId);
				updatedRetroState.members.forEach(member => lookup[member.socketId].send(JSON.stringify({message: 'retro_updated', retroState: updatedRetroState})));
				break;
			}
			case 'update_item': {
				const { retroId, item } = parsed;
				const updatedRetroState = await update_item('VersionOne.Web', retroId, item);
				updatedRetroState.members.forEach(member => lookup[member.socketId].send(JSON.stringify({message: 'retro_updated', retroState: updatedRetroState})));
				break;
			}
			case 'close_retro': {
				const { retroId, agilityRetroUrl } = parsed;
				const members = await close_retro('VersionOne.Web', retroId);
				const openRetros = await get_retroIDs('VersionOne.Web') || []
				members.forEach(member => lookup[member.socketId].send(JSON.stringify({message: 'retro_closed', agilityRetroUrl, retroIds: openRetros})));
				break;
			}
			default:
				break;
		}
		console.log('received: %s', data);
	});
})