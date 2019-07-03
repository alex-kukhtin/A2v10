

interface IInvokeOpts {

}

interface IViewModel {
	$invoke(cmd: string, data?: Object, base?: string, opts?: IInvokeOpts): Promise<any>;
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
		[prop: string]: (this: IElement) => any
	},
	commands?: {
		[prop: string]: ICommand
	},
	delegates?: {
		[prop: string]: (this: IRoot, ...args: any[]) => any
	}
}

declare interface IModule {
	exports: ITemplate
}

declare const module: IModule;
