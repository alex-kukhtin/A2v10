define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const eventBus = require('std:eventBus');
    const module = {
        posCommand,
        connect,
        xReport,
        zReport,
        nullReceipt,
        printReceipt,
        serviceInOut,
        hasAcqTerminal,
        acquirePayment,
        posMode,
        isProgress
    };
    exports.default = module;
    const chromeExtensionId = 'bnlgbjcldhehamppfcmpphccccikbbao';
    let messageId = 73;
    class PosExtension {
        constructor() {
            this.port = null;
            this.isConnected = false;
            this.resolvePool = {};
        }
        connect() {
            if (this.port)
                return;
            this.port = chrome.runtime.connect(chromeExtensionId, { name: 'a2v10.browser.companion' });
            this.port.onMessage.addListener(msg => {
                let rr = this.resolvePool[msg.msgid];
                if (rr) {
                    delete this.resolvePool[msg.msgid];
                    setTimeout(() => {
                        rr.resolve(msg);
                    }, 1000);
                }
            });
        }
        disconnect() {
            if (this.port)
                this.port.disconnect();
        }
        posterm(resolve, reject, data, id) {
            this.connect();
            this.resolvePool[id] = { resolve, reject };
            debugger;
            this.port.postMessage(data);
        }
    }
    ;
    let posHost = null;
    let mode = "notconnected";
    let executing = false;
    if ('cefHost' in window) {
        mode = "desktop";
        posHost = window['cefHost'];
    }
    else {
        if (chrome.runtime && chrome.runtime.connect) {
            mode = "browser";
            posHost = new PosExtension();
            posHost.connect();
        }
    }
    function posMode() {
        return mode;
    }
    function isProgress() {
        return executing;
    }
    function tryParse(r) {
        debugger;
        if (typeof r === 'string')
            return JSON.parse(r);
        return r;
    }
    function start() {
        console.dir('start');
        eventBus.$emit('beginRequest', '');
    }
    function stop() {
        console.dir('stop');
        eventBus.$emit('endRequest', '');
    }
    function posCommand(command, data) {
        start();
        return new Promise((resolve, reject) => {
            let msgId = messageId++;
            posHost.posterm(r => { stop(); resolve(tryParse(r)); }, r => { stop(); reject(tryParse(r)); }, { msgid: msgId, command: command, data: data || null }, msgId);
        });
    }
    function xReport() {
        return posCommand('xReport');
    }
    function zReport() {
        return posCommand('zReport');
    }
    function nullReceipt(openCashDrawer) {
        return posCommand('nullReceipt', { openCashDrawer: openCashDrawer || false });
    }
    function printReceipt(data) {
        return posCommand('printReceipt', data);
    }
    function serviceInOut(data) {
        return posCommand('serviceInOut', data);
    }
    async function hasAcqTerminal() {
        var rc = await posCommand('hasAcqTerminal');
        return rc.hasAcqTerminal;
    }
    function acquirePayment(sum) {
        return posCommand('acquirePayment', { amount: sum });
    }
    async function connect() {
        let data = { port: 'COM5', baud: 19200, model: 'DATECS-Krypton' };
        let result = await posCommand('connect', data);
        console.dir(result);
        return result;
    }
});
