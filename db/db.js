import {Low} from 'lowdb';
import {JSONFile} from 'lowdb/node';

// Configure lowdb to write to JSONFile
const adapter = new JSONFile('db.json')
const db = new Low(adapter)



export default db;