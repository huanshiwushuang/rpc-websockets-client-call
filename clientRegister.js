const WebSocketClient = require("rpc-websockets").Client;
const helper = require("./helper");

const wsClient = new WebSocketClient("ws://localhost:8891");
helper.websocket.makeUpClient(wsClient);

wsClient.on("open", () => {
    wsClient.register("getList", function (data) {
        console.log(data);
        return data;
    });
});
