
export class Sprint {

    name: string;
    status: string;
    id: string;

    constructor(sprints: string[], issueStatus: string) {
        if (sprints) {
            for (const sprint of sprints) {
                let match = sprint.match(/.*id=(.*),rapidViewId=.*state=(FUTURE|ACTIVE),name=(.*?),.*/);
                if (match) {
                    this.id = match[1]
                    this.status = match[2]
                    this.name = match[3]
                    return
                }
            }
        }
        if (issueStatus === "Terminée") {
            this.id = null
            this.status = "Terminé"
            this.name = "ended"
        } else {
            this.id = null
            this.status = "A planifier"
            this.name = "backlog"
        }
    }
}