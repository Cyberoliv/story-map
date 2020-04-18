import { Component, Input } from '@angular/core';
import { JiraIssue } from './models/jiraIssue';

@Component({
  selector: 'demande',
  template: `Ma demande: {{data.key}}`,
  styles: [`h1 { font-family: Lato; }`]
})
export class JiraCard {
  @Input('data') data:JiraIssue;
}