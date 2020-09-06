export class Type {

    public id: string;
    public self: string;
    public name: string;
    public iconUrl: string;

    constructor(element: any = null) {
        if (element) {
            this.id = element.id;
            this.self = element.self;
            this.name = element.name;
            this.iconUrl = element.iconUrl;
        }
    }
}