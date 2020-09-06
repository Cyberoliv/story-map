import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { JiraService } from "./services/jira.service";
import { UserService } from './services/user.service';

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {

  constructor(public user: UserService, private router: Router, private jiraService: JiraService) { }

  ngOnInit() {
/*
    this.jiraService.getMyself().subscribe(
      value => {
        this.user.set(value, null);
      },
      error => console.log("Non connecté"))
*/      
  }
}
