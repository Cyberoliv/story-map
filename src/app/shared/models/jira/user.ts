export class User {

    public key: string;
    public self: string;
    public name: string;
    public emailAddress: string;
    public displayName: string;
    public avatarUrl: string;

    constructor(element: any = null) {
        if (element) {
            this.key = element.key;
            this.self = element.self;
            this.name = element.name;
            this.emailAddress = element.emailAddress;
            this.displayName = element.displayName;
            this.avatarUrl = element.avatarUrls['24x24'];
        }
    }
}