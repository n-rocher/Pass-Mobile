import NetInfo from "@react-native-community/netinfo";

export default class Queue {

    functions = []
    running = false
    afterHandler = null
    removeNetInfoListener = null

    isConnected = null

    constructor(context, afterHandler) {
        this.afterHandler = afterHandler.bind(context)

        this.removeNetInfoListener = NetInfo.addEventListener(state => {
            this.isConnected = state.isConnected
            this.runTaskOnFns()
        })
    }

    async add(fn) {
        this.functions.push(fn)
        this.runTaskOnFns()
    }

    async runTaskOnFns() {
        if (!this.running && this.isConnected && this.functions.length > 0) {

            this.running = true

            const fn = this.functions.shift()

            try {
                await fn()
            } catch (err) {
                // We re-queue the item ?
                this.functions.push(fn)
                console.error("[Queue]", err)
            }

            this.running = false

            if (this.functions.length > 0) {
                this.runTaskOnFns()
            } else {
                this.afterHandler()
            }

        }
    }

    end() {
        this.removeNetInfoListener()
    }
}

export const wrapFunction = function (fn, context, params) {
    return function () {
        fn.apply(context, new Array(params));
    };
}

// EXEMPLE: var fun1 = wrapFunction(sayStuff, this, ["Hello, world!"]);