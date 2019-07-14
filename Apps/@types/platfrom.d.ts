/* Copyright © 2019 Alex Kukhtin. All rights reserved.*/

/*TODO:
validators,
commands,
controller methods
*/

declare function require(url: string): any;

interface IElement {
	readonly $valid: boolean;
	readonly $invalid: boolean;
	readonly $isNew: boolean;
	readonly $isEmpty: boolean;

	readonly $id: any;
	readonly $name: any;

	readonly $root: IRoot;
	readonly $parent: IElement;

	readonly $vm: IViewModel;
	readonly $ctrl: IController;

	$merge(src: object): void;
	$empty(this: IElement): void;
}

interface IArrayElement extends IElement {
	$remove(): void;
}

interface IElementArray<T> {
	[index: number]: T;
	$insert(src: object, to?: string, ref?: T): IElementArray<T>;
}

interface IRoot extends IElement {
	readonly $readOnly: boolean,
	readonly $stateReadOnly: boolean,
	readonly $isCopy: boolean
	readonly $template: Template;

	$defer(): void;
	$emit(): void;
	$forceValidate(): void;
	$setDirty(): void;

}

interface ICommand {

}
interface templatePropertyGetterSetter {
	get(this: IElement): any;
	set?(this: IElement, val: any): void;
}
interface templatePropertyGetter { (this: IElement): any; }

declare type templateProperty = templatePropertyGetter | templatePropertyGetterSetter | StringConstructor | BooleanConstructor | NumberConstructor;

interface templateEventChange { (this: IElement, elem: IElement, newVal?: any, oldVal?: any, prop?: string): void; }
interface templateEventAdd { (this: IElement, array?: IElementArray<IElement>, elem?: IElement): void; }

declare type templateEvent = templateEventChange | templateEventAdd;

interface Template {
	properties?: {
		[prop: string]: templateProperty
	},
	validators?: {
		[prop: string]: Object
	},
	events?: {
		[prop: string]: templateEvent
	},
	commands?: {
		[prop: string]: ICommand
	},
	delegates?: {
		[prop: string]: (this: IRoot, ...args: any[]) => any
	}
}

interface IController {
	$save(): Promise<object>;
	$requery(): void;
	$reload(args: any): void;
	$invoke(command: string, arg: object, path?: string): Promise<object>;
	$close(): void;
	$modalClose(result?: any): any;
	$msg(): any; //TODO
	$alert(msg: string | IMessage);
	$confirm(msg: string | IMessage): Promise<boolean>;
	$showDialog(): Promise<object>;
	$saveModified(msg?: string, title?: string): boolean;
	$asyncValid(): any; //TODO
	$toast(): any; //TODO
	$notifyOwner(): any; //TODO
	$navigate(url: string): void; //TODO
	$defer(): any; //TODO
	$setFilter(): any; //TODO
}

interface IMessage {
	msg: string;
	style?: string;
	list?: any;
}


interface IViewModel extends IController {
	$getErrors(severity: string): any[]; // TODO result type
}


// utilities

declare const enum DataType {
	Currency = "Currency",
	Number = "Number",
	DateTime = "DateTime",
	Date = "Date",
	Time = "Time"
}

interface UtilsDate {
	formatDate(date: Date): string;
	today(): Date,
	zero(): Date,
}

interface UtilsText {
}

interface UtilsCurrency {
	round(val: number, digits?: number): number;
	format(val: any): string;
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

	format(arg: any, dataType: DataType, opts?: { format?: string, hideZeros?: boolean });
	date: UtilsDate;
	text: UtilsText;
	currency: UtilsCurrency;
}

interface Http {
	$post(): Promise<any>,
	$get(url: string): Promise<any>
}

