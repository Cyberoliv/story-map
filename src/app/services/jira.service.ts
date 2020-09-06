import { HttpHeaders, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from "rxjs/operators";
import { environment } from 'src/environments/environment';

// Données
import { JiraIssue } from '../shared/models/jira/issue';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class JiraService {

  private jiraRestURL = environment.jiraURL + "/rest/api/2";
  private pfdAPIURL = environment.pfdAPIURL;
  private headers: HttpHeaders = new HttpHeaders();

  private mockEnabled = true;

  constructor(protected http: HttpClient, private cookieService: CookieService) {
    this.headers = this.headers.set('Content-Type', 'application/json');
    if (this.cookieService.get('jira-auth')) {
      this.addAuthHeader(this.cookieService.get('jira-auth'))
    }
  }

  public deleteAuthHeader() {
    this.headers = this.headers.delete("Authorization")
  }

  public addAuthHeader(auth: string) {
    this.headers = this.headers.set("Authorization", "Basic " + auth)
    //this.headers = this.headers.set("X-Atlassian-Token", "no-check")
  }

  /*
  * Utilisation de l'API "custom" pour passer les problèmes de xsrf
  */
  public updateIssueSprint(issue: string, sprint: string): Observable<any> {

    let sprintID = sprint ? Number.parseInt(sprint) : null

    const bodyData = 
      `{
        "fields" : {
          "customfield_10000" : ` + sprintID + `
          }
      }`;
    return this.http.put(this.pfdAPIURL + "/issues/" + issue, bodyData, { headers: this.headers }).pipe(
      catchError(this.handleError)
    );
  }

  public getMyself(auth: string = null): Observable<any> {
    let headers_ = this.headers
    if (auth) {
      headers_ = headers_.set("Authorization", "Basic " + auth);
    }
    return this.http.get(this.jiraRestURL + "/myself", { headers: headers_ }).pipe(
      catchError(this.handleError)
    );
  }

  public getIssuesByKeys(keys: string[]): Promise<JiraIssue[]> {
    if(this.mockEnabled) {
      return this.http.get("assets/epics.json", { headers: this.headers }).pipe(map(values => {
        return values['issues'].map(element => {
          return new JiraIssue(element);
        });
      })).toPromise()
    }
    let jql = "key in (" + keys.filter(k => k).join(",") + ")";
    return this.callJiraSearch(jql).toPromise();
  }

  public async getIssuesByFilter(filter: number): Promise<JiraIssue[]> {
    if(this.mockEnabled) {
      return await this.http.get("assets/issues-from-filter.json", { headers: this.headers }).pipe(map(values => {
        return values['issues'].map(element => {
          return new JiraIssue(element);
        });
      })).toPromise()
    } else {
      let jql = "filter=" + filter
    return await this.callJiraSearch(jql).toPromise();
  }
  }

  private callJiraSearch(jql: string, countOnly: boolean = false): Observable<JiraIssue[]> {

    let maxResults = "&maxResults=" + (countOnly ? "0" : "1000")
    let fields = "&fields=key,self,summary,description,project,issuetype,priority,status,assignee,reporter,versions,fixVersions,components,labels,customfield_10000,customfield_10001,customfield_11200,customfield_10008"
    let callURL = this.jiraRestURL + "/search?jql=" + jql + maxResults + fields
    console.log(callURL)
    return this.http.get(callURL, { headers: this.headers }).pipe(map(values => {
      return values['issues'].map(element => {
        return new JiraIssue(element);
      });
    }))
  }

  private handleError(error: HttpErrorResponse) {

    console.log(error)
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  }
}