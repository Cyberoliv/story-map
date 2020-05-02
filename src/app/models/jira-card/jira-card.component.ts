import { Component, OnInit, Input } from '@angular/core';
import { JiraIssue } from '../jira-issue';

@Component({
  selector: 'jira-card',
  templateUrl: './jira-card.component.html',
  styleUrls: ['./jira-card.component.css']
})
export class JiraCardComponent implements OnInit {

  @Input('data') data:JiraIssue;

  constructor() { }

  ngOnInit() {
  }

}