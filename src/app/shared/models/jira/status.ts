export class Status {

    public id: string;
    public self: string;
    public name: string;
    public iconUrl: string;
    public cssColorName: string;

    constructor(element: any = null) {
        if (element) {
            this.id = element.id;
            this.self = element.self;
            this.name = element.name;
            this.iconUrl = element.iconUrl;
            this.cssColorName = element.statusCategory.colorName;
        }
    }
}