export class MatrixSelector {
    public label: string;
    public field: string;
    public renderer: string;
    constructor(label: string, field: string, renderer: string) {
        this.label = label;
        this.field = field;
        this.renderer = renderer;
    }
}

export class MatrixConf {

    public filter: number;
    public row: MatrixSelector;
    public col: MatrixSelector;
    constructor() { }

    public getFilter():number {
        return this.filter
    }

    public getRowField():string {
        return this.row.field
    }

    public getRowLabel():string {
        return this.row.label
    }

    public getColField():string {
        return this.col.field
    }

    public getColLabel():string {
        return this.col.label
    }    
}
