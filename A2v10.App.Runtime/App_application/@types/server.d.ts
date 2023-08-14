
/* Copyright © 2019-2023 Oleksandr Kukhtin. All rights reserved. */
/* Version 10.0.7943 */

interface keyable {
	[key: string]: any
}

interface ServerModule {
	exports(this: ServerEnvironment, prms: keyable, args: keyable);
}

declare var module:ServerModule;

interface ServerAuthorization {
	type: string;
	name?: string;
	password?: string;
	apiKey?: string;
	token?: string;
}

interface ServerFetchResponse {
	ok: boolean;
	isJson: boolean;
	json(): any;
	text(): string;
	statusText: string;
	contentType: string;
	status: number;
}

declare const enum ServerFetchMethod {
	get = "GET",
	post = "POST",
}

interface ServerFetchRequest {
	method: ServerFetchMethod;
	headers?: object;
	query?: object;
	authorization?: ServerAuthorization;
	body?: any;
}

interface ServerConfiguration {
	appSettings(name: string): keyable;
}

interface CurrentUserInfo {
	segment?: string;
	userId?: number;
	tenantId?: number;
}

interface ServerSqlParameters {
	source?: string;
	procedure: string;
	parameters?: object;
	forCurrentUser?: boolean;
}

interface ServerSaveModelParameters extends ServerSqlParameters {
	data?: object;
}

interface ServerEnvironment {
	readonly config: ServerConfiguration;
	readonly currentUser: CurrentUserInfo;
	fetch(url: string, prms?: ServerFetchRequest): ServerFetchResponse;
	executeSql(args: ServerSqlParameters): keyable;
	loadModel(args: ServerSqlParameters): keyable;
	saveModel(args: ServerSaveModelParameters): keyable;
	toBase64(source: string, codePage: number, safe: boolean): string;
	generateApiKey(): string;
	require(fileName: string, prms: object, args: object): any;
	createObject(name: string, prms: object): any;
	invokeCommand(cmd: string, baseUrl: string, prms: object): any;
	queueTask(command: string, prms: object, runAt?: Date): object;
}

declare class DateUtils {
	format(d: any, f: string): string;
}
