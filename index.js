const WebSocket = require('ws');

const wss = new WebSocket.Server({port: '7777'});

wss.on('connection', (ws) => {
    console.log('connected!')
    ws.on('hello', function hello(data) {
        console.log('received: %s', data);
    });
    
    ws.on('message', function message(data) {
      console.log('received: %s', data);
    });
})
