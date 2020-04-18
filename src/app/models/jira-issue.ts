export class JiraIssue {
    public key: string;
    public type: string;
    public project: string;
    public epic: string;
    public sprint: string;
    public description: string;
    public summary: string;


    constructor(element: any) {
        this.key = element['key'];
        this.summary = element['fields']['summary'];    
        this.description = element['fields']['description'];    
        this.project = element['fields']['project']['name'];                
        this.type = element['fields']['issuetype']['name'];
        this.epic = this.getEpic(element['fields']['customfield_10001']);
        this.sprint = this.getSprint(element['fields']['customfield_10000']);
    }

    getEpic(value: string): string {
        if (value) {
            return value;
        }
        else {
            return "Sans Epic"
        }
    }

    getSprint(value: String): string {

        if (value) {
            //"com.atlassian.greenhopper.service.sprint.Sprint@3012ff[id=2310,rapidViewId=653,state=FUTURE,name=2020-06-2,startDate=<null>,endDate=<null>,completeDate=<null>,sequence=2310]"
            let name = value[0].match(/.*name=(.*?),.*/);
            return name[1];
        } else {
            return "backlog"
        }
    }
}