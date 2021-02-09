
/* Copyright © 2019-2021 Alex Kukhtin. All rights reserved. */
/* Version 10.0.7745 */


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
	$select(root?: IElementArray<IElement>): void;
}

interface ITreeElement extends IArrayElement {
	$expanded: boolean;
	$expand<T>(this: T): Promise<IElementArray<T>>;
	$selectPath<T>(this: T, path: Array<any>, predicate: (item: T, val: any) => boolean): Promise<T>;
}

declare const enum InsertTo {
	start = 'start',
	end = 'end',
	above = 'above',
	below = 'below'
}

declare const enum SortDir {
	asc = 'asc',
	desc = 'desc'
}

interface IModelInfo {
	Filter?: any;
	PageSize?: number;
	Offset?: number;
	SortDir?: SortDir
	SortOrder: string;
}

interface IElementArray<T> extends Array<T> {

	readonly Count: number;

	readonly $parent: IElement;
	readonly $vm: IViewModel;
	readonly $root: IRoot;
	readonly $ctrl: IController;

	readonly $isEmpty: boolean;
	readonly $hasSelected: boolean;
	readonly $checked: IElementArray<T>;
	readonly $selected: T;
	readonly $selectedIndex: number;
	readonly $cross: { [prop: string]: string[] };
	readonly $ModelInfo: IModelInfo;
	readonly $loaded: boolean;

	Selected(prop: string): IElementArray<T>;

	$new(src?: object): T;
	$append(src?: object): T;
	$prepend(src?: object): T;
	$insert(src: object, to: InsertTo, ref?: T): T;

	$clearSelected(): IElementArray<T>;
	$reload(): Promise<IElementArray<T>>;
	$load(): void;
	$loadLazy(): Promise<IElementArray<T>>;
	$resetLazy(): IElementArray<T>;
	$lockUpdate(lock: boolean): void;

	$isLazy(): boolean;

	$find(callback: (this: any, elem: T, index?: number, array?: IElementArray<T>) => boolean, thisArg?: any): T;
	$remove(elem: T): IElementArray<T>;
	$empty(): IElementArray<T>;
	$renumberRows(): IElementArray<T>;
	$copy(src: any[]): IElementArray<T>;
	$sum(fn: (item: T) => number): number;
}

interface IRoot extends IElement {
	readonly $readOnly: boolean;
	readonly $stateReadOnly: boolean;
	readonly $isCopy: boolean;
	readonly $ready: boolean;
	readonly $template: Template;
	readonly $dirty: boolean;

	$defer(handler: () => any): void;
	$emit(event: string, ...params: any[]): void;
	$forceValidate(): void;
	$setDirty(dirty: boolean, path?: string): void;
	$createModelInfo(elem: IElementArray<IElement>, modelInfo: IModelInfo): IModelInfo;
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
	validRequired?: boolean;
	checkReadOnly?: boolean;
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

/* template defaults */
interface templateDefaultFunc { (this: IRoot, elem: IElement, prop: string): any; }
declare type templateDefault = templateDefaultFunc | string | number | boolean | Date | object;

/* template validators */

interface tempateValidatorFunc { (elem: IElement, value?: any): boolean | string | Promise<any>; }

interface templateValidatorObj {
	valid: tempateValidatorFunc | StdValidator,
	async?: boolean,
	msg?: string,
	regExp?: RegExp,
	severity?: Severity,
	applyIf?: (elem: IElement, value?: any) => boolean
}

declare type templateValidator = String | tempateValidatorFunc | templateValidatorObj;

interface Template {
	options?: {
		noDirty?: boolean,
		persistSelect?: string[],
		skipDirty?: string[],
		bindOnce?: string[]
	};
	properties?: {
		[prop: string]: templateProperty
	};
	defaults?: {
		[prop: string]: templateDefault
	},
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
	$reload(args?: any): Promise<void>;
	$invoke(command: string, arg: object, path?: string, opts?: { catchError: boolean }): Promise<any>;
	$close(): void;
	$modalClose(result?: any): any;
	$msg(msg: string, title?: string, style?: CommonStyle): Promise<boolean>;
	$alert(msg: string | IMessage): Promise<boolean>;
	$confirm(msg: string | IConfirm): Promise<boolean>;
	$showDialog(url: string, data?: object, query?: object): Promise<any>;
	$inlineOpen(id: string): void;
	$inlineClose(id: string, result?: any): void;
	$saveModified(msg?: string, title?: string): boolean;
	$asyncValid(cmd: string, arg: object): any | Promise<any>;
	$toast(text: string, style?: CommonStyle): void;
	$toast(toast: { text: string, style?: CommonStyle }): void;
	$notifyOwner(id: any, toast?: string | { text: string, style?: CommonStyle }): void;
	$navigate(url: string, data?: object, newWindow?: boolean, updateAfter?: IElementArray<IElement>): void;
	$defer(handler: () => void): void;
	$setFilter(target: any, prop: string, value: any): void;
	$expand(elem: ITreeElement, prop: string, value: boolean): Promise<any>;
}

interface IMessage {
	msg: string;
	style?: MessageStyle;
	list?: any;
}

interface IConfirm {
	msg: string;
	style?: MessageStyle;
	list?: string[];
}

interface IErrorInfo {
	path: string;
	msg: string;
	severity: Severity;
	index: number;
}

interface IViewModel extends IController {
	readonly $isLoading: boolean;
	readonly $isDirty: boolean;
	readonly $isPristine: boolean;
	readonly $canSave: boolean;
	$errorMessage(path: string): string;
	$hasError(path: string): boolean;
	$getErrors(severity: Severity): IErrorInfo[] | null;
	$dbRemove(elem: object, confirm?: string | IConfirm, opts?: { checkPermission: boolean }): void;
	$dbRemoveSelected(arr: object[], confirm?: string | IConfirm, opts?: { checkPermission: boolean }): void;
	$setCurrentUrl(url: string): void;
	$export(arg: any, url: string, data?: any, opts?: { saveRequired: boolean }): void;
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
	day = 'day',
	minute = 'minute',
	second = 'second'
}


interface UtilsDate {
	readonly minDate: Date;
	readonly maxDate: Date;

	today(): Date,
	now(seconds?: boolean): Date,
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
	containsText(obj: object, props: string, probe: string): boolean;
	capitalize(text: string): string;
	equalNoCase(s1: string, s2: string): boolean;
	maxChars(s1: string, len: number): string;
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
