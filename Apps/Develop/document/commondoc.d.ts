

export interface IDocumentModule {
	documentApply(this: IElement): IElement;
	docTotalSum(): number;
	rowSum(): number;
	findArticle(): any;
	documentCreate(doc: any, type: string): any;
	docUnApply(prms:any): any;
}