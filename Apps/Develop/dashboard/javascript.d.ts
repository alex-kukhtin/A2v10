
export interface IConfig {
	appSettings(key: string): object;
}

declare type execSqlParams = {
	procedure: string,
	source?: string,
	parameters?: object
}

declare type saveModelParams = {
	procedure: string,
	data: object,
	source?: string,
	parameters?: object
}

declare type fetchParams = {
	method: string;
	body: object | string;
	headers: object;
}

declare type fetchResponse = {
	ok: boolean;
	status: number;
	statusText: string;
	contentType: string;
	body: string;
	headers: object;
	isJson(): boolean;
	text(): string;
	json(): string;
}

export interface IEnvironment {
	config: IConfig;
	loadModel(prms: execSqlParams): object;
	saveModel(prms: saveModelParams): object;
	executeSql(prms: execSqlParams): object;
	fetch(url: string, prms: fetchParams): fetchResponse;
}
