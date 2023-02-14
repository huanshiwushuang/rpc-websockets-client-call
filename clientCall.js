const WebSocketClient = require("rpc-websockets").Client;

(() => {
    const wsClient = new WebSocketClient("ws://localhost:8891");

    wsClient.on("open", async () => {
        console.time();
        for (let i = 0; i < 1000000; i++) {
            try {
                const res = await wsClient.call(
                    "getList",
                    {
                        num: i,
                    },
                    1000
                );
                console.log(res);
            } catch {
                console.log(`执行超时 ${i}`);
            }
        }
        console.timeEnd();
    });
})();
