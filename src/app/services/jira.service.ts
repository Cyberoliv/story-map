import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError  } from 'rxjs';
import { map, catchError, retry } from "rxjs/operators";

// Données
import { JiraIssue } from '../models/jira-issue';


@Injectable()
export class JIRAService {
  private headers: HttpHeaders = new HttpHeaders();

  constructor(protected http: HttpClient) {
    this.headers = this.headers.append('Content-Type', 'text/plain');
    this.headers = this.headers.append("Authorization", "No Auth");
  }

  public getDemandesJira(): Observable<JiraIssue[]> {
    //const url = "https://enigmes.forumenigmes.net/searchjira.json"
    const url = '/assets/searchjira.json';
    console.log("Avant lecture")
    return this.http.get(url, { headers: this.headers }).pipe(map(values => {
      return values['issues'].map(element => {
          return new JiraIssue(element);
      });
    }));
  }
}