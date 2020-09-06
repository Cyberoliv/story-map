export class Version {

    public self: string;
    public name: string;
    public id: string;
    public description: string;
    public archived: boolean;
    public released: boolean;
    public releaseDate: string;

    constructor(element: any = null) {
        if (element) {
            this.id = element.id;
            this.self = element.self;
            this.name = element.name;
            this.description = element.description;
            this.archived = element.archived;
            this.released = element.released;
            this.releaseDate = element.releaseDate;
        }
    }
}