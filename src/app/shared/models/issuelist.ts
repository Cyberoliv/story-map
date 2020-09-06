import { JiraIssue } from './jira/issue';

export class IssueList {

  private _issues: JiraIssue[];

  constructor(issues: JiraIssue[]) {
    this._issues = issues;
  }

  public setIssues(issues: JiraIssue[]) {
    this._issues = issues;
  }

  public getIssues(): JiraIssue[] {
    return this._issues;
  }

  public getUniqueValuesOf(field: string): string[] {

    let values = []
    this._issues.forEach(issue => {
      let fieldValue = issue.getFieldValue(field);
      if (Array.isArray(fieldValue)) {
        values = values.concat(fieldValue)
      } else {
        values.push(fieldValue)
      }
    })
    return [...new Set(values)]
  }

  public completeEpics(epics: JiraIssue[]) {
    this._issues.filter(issue => issue.epic.key).forEach(issue => issue.epic = epics.find(e => e.key === issue.epic.key));
  }

  public getIssuesMatching(field: string, value: string): IssueList {
    return new IssueList(this._issues.filter(issue => issue.handle(field, value)))
  }
}