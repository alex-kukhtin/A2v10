
declare const enum AcquireResult {
	confirm = 'confirm',
	decline = 'decline',
	break = 'break',
	error = 'error'
}

declare const enum PosMode {
	desktop = 'desktop',
	browser = 'browser',
	notconnected = 'notconnected',
}

interface AcquireResponse {
	result: AcquireResult;
	receipt?: string;
	card_pan?: string;
	date_time?: string;
	merchant_id?: string;
	status?: string;
	status_code: string;
}

export interface PosModule {
	posCommand(command, data?: any): Promise<any>;
	xReport(): Promise<void>;
	zReport(): Promise<void>;
	nullReceipt(openCashDrawer?: boolean): Promise<void>;
	printReceipt(receipt: any): Promise<any>;
	hasAcqTerminal(): Promise<boolean>;
	acquirePayment(sum: number): Promise<AcquireResponse>;
	isProgress(): boolean;
	posMode(): PosMode;
}