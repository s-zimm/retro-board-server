import {Low} from 'lowdb';
import {JSONFile} from 'lowdb/node';
import { v4 as uuidv4 } from 'uuid';

// Configure lowdb to write to JSONFile
const adapter = new JSONFile('db.json')
const db = new Low(adapter)

export const createRetro = async (instanceID, member) => {
    try {
        await db.read()
        db.data = db.data || {}
        const retroId = uuidv4();
        
        const createObj = {
            [instanceID]: {
                [retroId]: {
                    members: [member],
                    retro: {
                        columns: [
                            {name: 'Mad', cards: []},
                            {name: 'Sad', cards: []},
                            {name: 'Glad', cards: []},
                        ]
                    }
                }
            }
        }
        
        db.data = {...db.data, ...createObj}
        
        await db.write();
        return retroId;
    } catch (err) {
        console.log('Error Create Retro: ', err)
    }
}

export default db;

// example lowdb use
const ex = async () => {
    // Read data from JSON file, this will set db.data content
    await db.read()

    // If db.json doesn't exist, db.data will be null
    // Use the code below to set default data
    // db.data = db.data || { posts: [] } // For Node < v15.x
    db.data ||= { posts: [] }             // For Node >= 15.x

    // Create and query items using native JS API
    const firstPost = db.data.posts[0]

    // Alternatively, you can also use this syntax if you prefer
    const { posts } = db.data
    posts.push('hello world')

    // Finally write db.data content to file
    await db.write()
}