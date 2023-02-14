const res = {}

res.websocket = {
    makeUpServer(wsServer) {
        // client 注册方法
        wsServer.register('_register', ({ method, namespace = '/', password = '' }) => {
            const registerPassword = password

            return new Promise((registerResolve) => {
                wsServer.register(
                    method,
                    function (params) {
                        return new Promise((callResolve, callReject) => {
                            const { password } = params

                            // 密码校验不通过
                            if (registerPassword && registerPassword != password) {
                                return callReject({
                                    state: 'fail',
                                    code: 'le3t8gjp',
                                    msg: `call password error`
                                })
                            }

                            // 删除密码
                            delete params.password

                            // 本次调用 id
                            const callId = `${Date.now().toString(36)}-${Math.random()}`

                            // 转发 调用数据 给注册方
                            registerResolve({
                                callId,
                                params
                            })

                            // 缓存本次
                            _registerReturn.value[callId] = {
                                ms: Date.now(),
                                // 转发 返回数据 给调用方
                                callResolve
                            }
                        })
                    },
                    namespace
                )
            })
        })
        // client 注册方法的返回
        const _registerReturn = {
            // 清理超时的 callResolve
            timeout: 1000 * 10,
            // 多久清理一次
            detectInterval: 1000 * 20,
            // 超时的 callResolve
            value: {
                // callId: {
                //     callResolve: function () {},
                //     ms: Date.now(),
                // }
            }
        }
        // 定时检测超时的 _registerReturn
        setInterval(() => {
            Object.keys(_registerReturn.value).forEach((v) => {
                if (Date.now() - _registerReturn.value[v].ms >= _registerReturn.timeout) {
                    delete _registerReturn.value[v]
                }
            })
        }, _registerReturn.detectInterval)

        wsServer.register('_registerReturn', ({ callId, returnValue }) => {
            if (!_registerReturn.value[callId]) {
                return {
                    state: 'fail',
                    code: 'le3wr8e1',
                    msg: `not found registerReturn by callId ${callId}`
                }
            }
            _registerReturn.value[callId].callResolve(returnValue)
            delete _registerReturn.value[callId]
            return true
        })
    },
    makeUpClient(wsClient) {
        Object.assign(wsClient, {
            async register(method, handler, password = "", namespace = "/") {
                // 注册函数
                const start = async () => {
                    // 通知 Server 注册一个方法
                    const res = await wsClient.call(`_register`, {
                        method,
                        namespace,
                        password,
                    });
                    const { callId, params } = res;
                    let returnValue = handler(params);
        
                    if (/promise/i.test(returnValue.toString())) {
                        returnValue = await returnValue;
                    }
        
                    wsClient.call("_registerReturn", {
                        callId,
                        returnValue,
                    });
                };
                await start();
        
                while (true) {
                    await start();
                }
            }
        })
    }
}

// export default res
module.exports = res;
