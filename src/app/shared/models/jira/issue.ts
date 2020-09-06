import { environment } from 'src/environments/environment';
import { User } from './user';
import { Sprint } from './sprint';
import { Version } from './version';
import { Type } from './type';
import { Priority } from './priority';
import { Status } from './status';
import { Component } from './components';

export class JiraIssue {

    // Champs simples
    private _key: string;
    private _self: string;
    private _url: string;
    private _project: string;
    private _description: string;
    private _summary: string;
    private _estimation: string;
    private _epic: JiraIssue;

    // Champs liste simple
    private _labels: string[];

    // Champs "objet"
    private _type: Type;
    private _sprint: Sprint;
    private _priority: Priority;
    private _reporter: User;
    private _assignee: User;
    private _status: Status;
    private _finalVersion: Version;

    // Champs "liste d'objets"
    private _affectedVersions: Version[];
    private _fixVersions: Version[];
    private _components: Component[];

    constructor(element: any = null) {

        if (element) {
            this.key = element['key'];
            this.url = environment.jiraURL + "/browse/" + element['key'];
            this.self = element['self'];
            this.summary = element['fields']['summary'];
            this.description = element['fields']['description'];
            this.project = element['fields']['project']['name'];
            this.estimation = element['fields']['customfield_10008']
            this.status = element['fields']['status'];
            this.affectedVersions = element['fields']['versions']
            this.fixVersions = element['fields']['fixVersions']
            this.finalVersion = element['fields']['customfield_11200']
            this.labels = element['fields']['labels']
            this.components = element['fields']['components'];
            this.reporter = element['fields']['reporter'];
            this.assignee = element['fields']['assignee'];
            this.type = element['fields']['issuetype'];
            this.priority = element['fields']['priority'];
            this.epic = this.createEpicWithKey(element['fields']['customfield_10001'])
            this.sprint = new Sprint(element['fields']['customfield_10000'], element['fields']['status']['name'])
        }
    }

    public handle(field: string, value: string): boolean {
        let fieldValue = this.getFieldValue(field)
        return Array.isArray(fieldValue) ? fieldValue.includes(value) : fieldValue === value
    }

    private pushVersions(elements: any[]): Version[] {
        let versions: Version[];
        if (elements && elements.length > 0) {
            versions = elements.map(it => new Version(it))
        } else {
            versions = [new Version()]
        }
        return versions;
    }

    private pushComponents(elements: any[]): Component[] {
        let components: Component[];
        if (elements && elements.length > 0) {
            components = elements.map(it => new Component(it))
        } else {
            components = [new Component()]
        }
        return components;
    }

    public getFieldValue(field: string) {
        return field.split('.').reduce(function (prev, curr) {
            if (prev) {
                return curr.endsWith("()") ? prev[curr.slice(0, -2)]() : prev[curr];
            } else {
                return null;
            }
        }, this || self)
    }

    public get key(): string {
        return this._key;
    }

    public set key(key: string) {
        this._key = key;
    }

    public get self(): string {
        return this._self;
    }

    public set self(self: string) {
        this._self = self;
    }

    public get url(): string {
        return this._url;
    }

    public set url(url: string) {
        this._url = url;
    }

    public get project(): string {
        return this._project;
    }

    public set project(project: string) {
        this._project = project;
    }

    public get description(): string {
        return this._description;
    }

    public set description(description: string) {
        this._description = description ? description : ""
    }

    public get summary(): string {
        return this._summary;
    }

    public set summary(summary: string) {
        this._summary = summary;
    }

    public get estimation(): string {
        return this._estimation;
    }

    public set estimation(estimation: string) {
        this._estimation = estimation ? String(estimation) : undefined;
    }

    public get epic(): JiraIssue {
        return this._epic;
    }

    private createEpicWithKey(key: string): JiraIssue {
        let epic = new JiraIssue()
        epic.key = key ? key : undefined;
        return epic;
    }

    public set epic(epic: JiraIssue) {
        this._epic = epic
    }

    public get labels(): string[] {
        return this._labels;
    }

    public set labels(labels: string[]) {
        this._labels = labels && labels.length > 0 ? labels : [undefined];
    }

    public get type(): Type {
        return this._type;
    }

    public set type(type: Type) {
        this._type = new Type(type);
    }

    public get sprint(): Sprint {
        return this._sprint;
    }

    public set sprint(sprint: Sprint) {
        this._sprint = sprint;
    }

    public get priority(): Priority {
        return this._priority;
    }

    public set priority(priority: Priority) {
        this._priority = new Priority(priority);
    }

    public get reporter(): User {
        return this._reporter;
    }

    public set reporter(reporter: User) {
        this._reporter = new User(reporter);
    }

    public get assignee(): User {
        return this._assignee;
    }

    public set assignee(assignee: User) {
        this._assignee = new User(assignee);
    }

    public get status(): Status {
        return this._status;
    }

    public set status(status: Status) {
        this._status = new Status(status);
    }

    public get finalVersion(): Version {
        return this._finalVersion;
    }

    public set finalVersion(version: Version) {
        this._finalVersion = new Version(version);
    }

    public get affectedVersions(): Version[] {
        return this._affectedVersions;
    }

    public set affectedVersions(affectedVersions: Version[]) {
        this._affectedVersions = this.pushVersions(affectedVersions)
    }

    public get fixVersions(): Version[] {
        return this._fixVersions;
    }

    public set fixVersions(fixVersions: Version[]) {
        this._fixVersions = this.pushVersions(fixVersions)
    }

    public get components(): Component[] {
        return this._components;
    }

    public getComponents(field: string = 'name'): string[] {
        return this.components ? this._components.map(it => it[field]) : []
    }

    public set components(components: Component[]) {
        this._components = this.pushComponents(components)
    }
}