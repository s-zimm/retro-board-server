import db from './db/db.js';
// const WebSocket = require('ws');
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({port: '7777'});

wss.on('connection', (ws) => {
    
    console.log('connected!')
    ex();
    ws.on('hello', function hello(data) {
        console.log('received: %s', data);
    });
    
    ws.on('message', function message(data) {
      console.log('received: %s', data);
    });
})


const ex = async () => {
    // Read data from JSON file, this will set db.data content
    await db.read()

    // If db.json doesn't exist, db.data will be null
    // Use the code below to set default data
    // db.data = db.data || { posts: [] } // For Node < v15.x
    db.data ||= { posts: [] }             // For Node >= 15.x

    // Create and query items using native JS API
    db.data.posts.push('hello world')
    const firstPost = db.data.posts[0]

    // Alternatively, you can also use this syntax if you prefer
    const { posts } = db.data
    posts.push('hello world')

    // Finally write db.data content to file
    await db.write()
}