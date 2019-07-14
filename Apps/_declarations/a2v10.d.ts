

interface IViewModel {
	$invoke(cmd: string, data?: Object, base?: string, opts?: {}): Promise<any>;
}

interface IElement {
	$valid: boolean,
	$invalid: boolean,
	$isNew: boolean,
	$isEmpty: boolean,
	$vm: IViewModel,
	[propName: string]: any
}

interface IRoot extends IElement {
	$readOnly: boolean,
	$stateReadOnly: boolean,
	$isCopy: boolean
}

interface ICommand {
	(this: IRoot, arg?: any): void;
}

interface ITemplate {
	properties?: {
		[prop: string]: (this: IElement) => any | String | Boolean | Number
	},
	validators?: {
		[prop: string]: Object
	},
	events?: {
		[prop: string]: (this: IElement, elem: IElement, val: any, oldVal: any, prop: string) => void;
	},
	commands?: {
		[prop: string]: ICommand
	},
	delegates?: {
		[prop: string]: (this: IRoot, ...args: any[]) => any
	}
}
