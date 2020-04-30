
import { PosMode, PosModule, AcquireResponse } from 'posmodule';

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

export default module;

declare var cefHost: {
	posterm(success: (res: string) => void, fail: (res: string) => void, data: string): boolean;
};

const chromeExtensionId = 'bnlgbjcldhehamppfcmpphccccikbbao';
let messageId = 73;

declare var chrome: any;

class PosExtension {
	port: any;
	isConnected: boolean;
	resolvePool: any;

	constructor() {
		this.port = null;
		this.isConnected = false;
		this.resolvePool = {};
	}
	connect() {
		if (this.port) return;
		this.port = chrome.runtime.connect(chromeExtensionId, {name:'a2v10.browser.companion'}) ;
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
};

let posHost = null;
let mode: PosMode = PosMode.notconnected;
let executing: boolean = false;

if ('cefHost' in window) {
	// desktop mode
	mode = PosMode.desktop;
	posHost = window['cefHost'];
} else {
	if (chrome.runtime && chrome.runtime.connect) {
		// browser extension mode
		mode = PosMode.browser;
		posHost = new PosExtension();
		posHost.connect();
	}
}

function posMode(): PosMode {
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

function posCommand(command, data?: any): Promise<any> {
	start();
	return new Promise<any>((resolve, reject) => {
		let msgId = messageId++;
		posHost.posterm(
			r => { stop(); resolve(tryParse(r)); },
			r => { stop(); reject(tryParse(r));  },
			//JSON.stringify({ msgid: msgId, command: command, data: data || null }), msgId);
			{ msgid: msgId, command: command, data: data || null }, msgId);
	});
}

function xReport(): Promise<void> {
	return posCommand('xReport');
}


function zReport(): Promise<void> {
	return posCommand('zReport');
}

function nullReceipt(openCashDrawer?: boolean): Promise<void> {
	return posCommand('nullReceipt', { openCashDrawer: openCashDrawer || false });
}

function printReceipt(data: any): Promise<any> {
	return posCommand('printReceipt', data);
}

function serviceInOut(data: any): Promise<any> {
	return posCommand('serviceInOut', data);
}

async function hasAcqTerminal(): Promise<boolean> {
	var rc = await posCommand('hasAcqTerminal');
	return rc.hasAcqTerminal;
}

function acquirePayment(sum: number): Promise<AcquireResponse> {
	return posCommand('acquirePayment', {amount: sum });
}

async function connect() {
	let data = { port: 'COM5', baud: 19200, model:'DATECS-Krypton' };
	let result = await posCommand('connect', data);
	console.dir(result);
	return result;
}