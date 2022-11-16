import {Low} from 'lowdb';
import {JSONFile} from 'lowdb/node';
import { v4 as uuidv4 } from 'uuid';

// Configure lowdb to write to JSONFile
const adapter = new JSONFile('db.json')
const db = new Low(adapter)

export const create_retro = async (instanceId, member) => {
    try {
        await db.read()
        db.data = db.data || {[instanceId]: {}}
        const retroId = uuidv4();
        
        const newRetroState = {
            id: retroId,
            members: [member],
            retro: {
                phase: 1,
                columns: [
                    {name: 'Mad', items: []},
                    {name: 'Sad', items: []},
                    {name: 'Glad', items: []},
                ]
            }
        }
        
        db.data[instanceId] = {
            ...db.data[instanceId],
            [retroId]: newRetroState
        };
        
        await db.write();
        return newRetroState;
    } catch (err) {
        console.log('Error Create Retro: ', err)
    }
}

export const add_member = async (instanceId, retroId, member) => {
    try {
        await db.read()
        
        db.data[instanceId][retroId].members.push(member);
        
        await db.write();
        return db.data[instanceId][retroId];
    } catch (err) {
        console.log('Error Create Retro: ', err)
    }
}

export const add_card = async (instanceId, retroId, card, column) => {
    try {
        await db.read()
        
        const theCol = db.data[instanceId][retroId].retro.columns.find(col => col.name === column);
        
        theCol.items.push(card);
        
        await db.write();
        return db.data[instanceId][retroId];
    } catch (err) {
        console.log('Error Create Retro: ', err)
    }
}

export const remove_card = async (instanceId, retroId, card, column) => {
    try {
        await db.read()
        
        const theCol = db.data[instanceId][retroId].retro.columns.find(col => col.name === column);
        const newItems = theCol.items.filter(item => card.text !== item.text);
        theCol.items = newItems;
        
        await db.write();
        return db.data[instanceId][retroId];
    } catch (err) {
        console.log('Error Create Retro: ', err)
    }
}

export const moveto_phase2 = async (instanceId, retroId) => {
    try {
        await db.read();
        let currentLeft = 0;
        
        const newRetro = db.data[instanceId][retroId];
        newRetro.retro.items = newRetro.retro.columns
                                .reduce((allCards, currentCol) =>
                                    allCards.concat(currentCol.items.map(item => ({...item, column: currentCol.name, top: 0, left: currentLeft += 50}))), [])
        delete newRetro.retro.columns;
        newRetro.retro.phase = 2;
        
        await db.write();
        return newRetro;
    } catch (err) {
        console.log('Error moving to phase 2', err);
    }
}

export const update_item = async (instanceId, retroId, updatedItem) => {
    try {
        await db.read();
        const retro = db.data[instanceId][retroId];
        if (retro.retro.phase === 1) {
            
        } else if (retro.retro.phase === 2) {
            const itemToUpdateIndex = retro.retro.items.findIndex(item => item.text === updatedItem.text);
            retro.retro.items[itemToUpdateIndex] = updatedItem;
        }
        await db.write();
        return retro;
    } catch (err) {
        console.log('Error updating item: ', updatedItem.text, err);
    }
}

export default db;