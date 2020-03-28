
/* Copyright © 2019-2020 Alex Kukhtin. All rights reserved. */
/* Version 10.0.7645 */


declare function require(url: string): any;

interface IElement {
	readonly $valid: boolean;
	readonly $invalid: boolean;
	readonly $isNew: boolean;
	readonly $isEmpty: boolean;

	readonly $id: any;
	readonly $name: any;

	readonly $root: IRoot;
	readonly $parent: IElement | IElementArray<IElement>;

	readonly $permissions: {
		readonly canView: boolean;
		readonly canEdit: boolean;
		readonly canDelete: boolean;
		readonly canApply: boolean;
		readonly canUnapply: boolean;
	}

	readonly $vm: IViewModel;
	readonly $ctrl: IController;

	$merge(src: object): IElement;
	$empty(): IElement;
	$set(src: object): IElement;
}

interface IArrayElement extends IElement {
	readonly $parent: IElementArray<IElement>;
	$selected: boolean;
	$checked: boolean;
	$remove(): void;
	$select(): void;
}

interface ITreeElement extends IArrayElement {
	$expanded: boolean;
}

declare const enum InsertTo {
	start = 'start',
	end = 'end',
	above = 'above',
	below = 'below'
}

interface IModelInfo {
	Filter: any;
}

interface IElementArray<T> extends Array<T> {
	[index: number]: T;

	readonly Count: number;
	readonly $isEmpty: boolean;
	readonly $hasSelected: boolean;
	readonly $checked: IElementArray<T>;
	readonly $selected: T;
	readonly $selectedIndex: number;
	readonly $parent: IElement;
	readonly $cross: { [prop: string]: string[] };
	readonly $ModelInfo: IModelInfo;

	Selected(prop: string): IElementArray<T>;

	$append(src?: object): T;
	$prepend(src?: object): T;
	$insert(src: object, to: InsertTo, ref?: T): T;

	$clearSelected(): IElementArray<T>;
	$load(): void;
	$loadLazy(): Promise<IElementArray<T>>;
	$resetLazy(): IElementArray<T>;

	$isLazy(): boolean;

	$remove(elem: T): IElementArray<T>;
	$empty(): IElementArray<T>;
	$renumberRows(): IElementArray<T>;
	$copy(src: any[]): IElementArray<T>;
}

interface IRoot extends IElement {
	readonly $readOnly: boolean;
	readonly $stateReadOnly: boolean;
	readonly $isCopy: boolean;
	readonly $ready: boolean;
	readonly $template: Template;

	$defer(handler: () => any): void;
	$emit(event: string, ...params: any[]): void;
	$forceValidate(): void;
	$setDirty(dirty: boolean, path?: string): void;
}


/* template commands */

declare const enum TemplateCommandResult {
	save = 'save'
}

interface templateCommandFunc { (this: IRoot, arg?: any): void | TemplateCommandResult | Promise<any>; }

interface templateCommandObj {
	exec: templateCommandFunc,
	canExec?: (this: IRoot, arg?: any) => boolean;
	confirm?: string | IConfirm;
	saveRequired?: boolean;
}

declare type templateCommand = templateCommandFunc | templateCommandObj;

/* template properties */
interface templatePropertyGetterSetter {
	get(this: IElement): any;
	set?(this: IElement, val: any): void;
}
interface templatePropertyGetter { (this: IElement): any; }

declare type templateProperty = templatePropertyGetter | templatePropertyGetterSetter | StringConstructor | BooleanConstructor | NumberConstructor;

/* template events */
interface templateEventChange { (this: IElement, elem: IElement, newVal?: any, oldVal?: any, prop?: string): void; }
interface templateEventAdd { (this: IElement, array?: IElementArray<IElement>, elem?: IElement): void; }
interface templateEventUnload { (this: IElement, elem?: IElement): void; }

declare type templateEvent = templateEventChange | templateEventAdd | templateEventUnload;

declare const enum StdValidator {
	notBlank = 'notBlank',
	email = 'email',
	url = 'url',
	isTrue = 'isTrue',
	regExp = 'regExp'
}

declare const enum Severity {
	error = 'error',
	warning = 'warning',
	info = 'info'
}

declare const enum CommonStyle {
	error = 'error',
	warning = 'warning',
	info = 'info',
	success = 'success'
}

declare const enum MessageStyle {
	confirm = 'confirm',
	alert = 'alert',
	info = 'info'
}

/* template validators */

interface tempateValidatorFunc { (elem: IElement, value?: any): boolean | string | Promise<any>; }

interface templateValidatorObj {
	valid: tempateValidatorFunc | StdValidator,
	async?: boolean,
	msg?: string,
	regExp?: RegExp,
	severity?: Severity
}

declare type templateValidator = String | tempateValidatorFunc | templateValidatorObj;

interface Template {
	options?: {
		noDirty?: boolean,
		persistSelect?: string[],
		skipDirty?: string[]
	};
	properties?: {
		[prop: string]: templateProperty
	};
	validators?: {
		[prop: string]: templateValidator | templateValidator[]
	};
	events?: {
		[prop: string]: templateEvent
	};
	commands?: {
		[prop: string]: templateCommand
	};
	delegates?: {
		[prop: string]: (this: IRoot, ...args: any[]) => any
	};
}

interface IController {
	$save(): Promise<object>;
	$requery(): void;
	$reload(args?: any): void;
	$invoke(command: string, arg: object, path?: string, opts?: { catchError: boolean }): Promise<object>;
	$close(): void;
	$modalClose(result?: any): any;
	$msg(msg: string, title?: string, style?: CommonStyle): Promise<boolean>;
	$alert(msg: string | IMessage): Promise<boolean>;
	$confirm(msg: string | IConfirm): Promise<boolean>;
	$showDialog(url: string, data?: object, query?: object): Promise<object>;
	$inlineOpen(id: string): void;
	$inlineClose(id: string, result?: any): void;
	$saveModified(msg?: string, title?: string): boolean;
	$asyncValid(cmd: string, arg: object): any | Promise<any>;
	$toast(text: string, style?: CommonStyle): void;
	$toast(toast: { text: string, style?: CommonStyle }): void;
	$notifyOwner(id: any, toast?: string | { text: string, style?: CommonStyle }): void;
	$navigate(url: string, data?: object, newWindow?: boolean, updateAfter?: IElementArray<IElement>): void;
	$defer(handler: () => void): void;
	$setFilter(target: object, prop: string, value: any): void;
}

interface IMessage {
	msg: string;
	style?: MessageStyle;
	list?: any;
}

interface IConfirm {
	msg: string;
	style?: MessageStyle;
}

interface IErrorInfo {
	path: string;
	msg: string;
	severity: Severity;
	index: number;
}

interface IViewModel extends IController {
	$errorMessage(path: string): string;
	$hasError(path: string): boolean;
	$getErrors(severity: Severity): IErrorInfo[] | null;
	$dbRemove(elem: object, confirm?: string | IConfirm, opts?: { checkPermission: boolean }): void;
	$dbRemoveSelected(arr: object[], confirm?: string | IConfirm, opts?: { checkPermission: boolean }): void;
}

// utilities

declare const enum DataType {
	Currency = "Currency",
	Number = "Number",
	DateTime = "DateTime",
	Date = "Date",
	DateUrl = "DateUrl",
	Time = "Time",
	Period = "Period"
}

declare const enum DateTimeUnit {
	year = 'year',
	month = 'month',
	day = 'day',
	hour = 'hour',
	minute = 'minute',
	second = 'second'
}

declare const enum DateUnit {
	year = 'year',
	month = 'month',
	day = 'day'
}


interface UtilsDate {
	readonly minDate: Date;
	readonly maxDate: Date;

	today(): Date,
	zero(): Date,
	equal(d1: Date, d2: Date): boolean;
	isZero(d: Date): boolean;
	add(d: Date, nm: number, unit: DateTimeUnit);
	create(year: number, month: number, day: number): Date;
	fromDays(days: number): Date;
	compare(d1: Date, d2: Date): number;
	diff(unit: DateUnit, d1: Date, d2: Date): number;
	endOfMonth(d: Date): Date;
	format(d: number | Date): string;
	formatDate(d: number | Date): string;
	parse(str: string): Date;
	tryParse(str: string): Date | string;
}

interface UtilsText {
	contains(text: string, probe: string): boolean;
	capitalize(text: string): string;
}

interface UtilsCurrency {
	round(val: number, digits?: number): number;
	format(val: any): string;
}

interface FormatOptions {
	format?: string;
	hideZeros?: boolean;
}

interface Utils {
	isArray(arg: any): boolean;
	isFunction(arg: any): boolean;
	isDefined(arg: any): boolean;
	isObject(arg: any): boolean;
	isObjectExact(arg: any): boolean;
	isDate(arg: any): boolean;
	isString(arg: any): boolean;
	isNumber(arg: any): boolean;
	isBoolean(arg: any): boolean;

	toNumber(arg: any): number;
	toString(arg: any): string;

	notBlank(arg: any): boolean;

	toJson(arg: object): string;
	fromJson(arg: string): object;

	isEqual(o1: any, o2: any): boolean;

	format(arg: any, dataType: DataType, opts?: FormatOptions);

	eval(obj: any, path: string, dataType: DataType, opts?: FormatOptions, skipFormat?: boolean): any;
	simpleEval(obj: any, path: string): any;

	readonly date: UtilsDate;
	readonly text: UtilsText;
	readonly currency: UtilsCurrency;
}

interface Blob {
	readonly size: number;
	readonly type: string;
}

interface Http {
	$post(url: string, data?: string | Blob): Promise<any>;
	$get(url: string): Promise<any>;
}

interface EventBus {
	$on(event: string, handler: (...params: any[]) => any);
	$off(event: string, handler: (...params: any[]) => any);
	$once(event: string, handler: (...params: any[]) => any);
	$emit(event: string, ...params: any[]);
}
