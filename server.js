const WebSocketServer = require("rpc-websockets").Server;
const helper = require("./helper");

const wsServer = new WebSocketServer({
    host: "127.0.0.1",
    port: 8891,
});
helper.websocket.makeUpServer(wsServer);
