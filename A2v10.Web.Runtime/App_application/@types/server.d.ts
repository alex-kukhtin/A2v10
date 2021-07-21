
/* Copyright © 2019-2021 Alex Kukhtin. All rights reserved. */
/* Version 10.0.7796 */

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
	json(): string;
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

interface ServerSqlParameters {
	source?: string;
	procedure: string;
	parameters?: object;
}

interface ServerSaveModelParameters extends ServerSqlParameters {
	data?: object;
}

interface ServerEnvironment {
	config: ServerConfiguration;
	fetch(url: string, prms?: ServerFetchRequest): ServerFetchResponse;
	executeSql(args: ServerSqlParameters): keyable;
	loadModel(args: ServerSqlParameters): keyable;
	saveModel(args: ServerSaveModelParameters): keyable;
}