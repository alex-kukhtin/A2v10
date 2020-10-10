

export interface TAgent extends IElement {
	Id: number;
	Name: string;
	Type: string;
}

export interface TRoot extends IRoot {
	Agent: TAgent;
}

