import { Component, Input } from '@angular/core';
import { JiraIssue } from './jiraIssue';

@Component({
  selector: 'demande',
  template: `{{data.key}}<br>`,
})
export class JiraCard {
  @Input('data') data:JiraIssue;
}