import { Component, Input } from '@angular/core';
import { JiraIssue } from '../models/jira/issue';

@Component({
  selector: 'jira-card',
  templateUrl: './jira-card.component.html',
  styleUrls: ['./jira-card.component.scss']
})
export class JiraCardComponent {

  @Input('issue') issue: JiraIssue;
  @Input('miniDisplay') miniDisplay: boolean;
}