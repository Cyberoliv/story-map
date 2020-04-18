import { Component, OnInit, ViewChild } from "@angular/core";
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDragHandle
} from "@angular/cdk/drag-drop";
import { MatTable } from "@angular/material/table";
import { JIRAService } from "./services/jira.service";
import { JiraIssue } from "./models/jira-issue";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
  @ViewChild("table", { static: false }) table: MatTable<any>;

  isLoadingJira: boolean;
  dataSource: any[] = [];
  displayedColumns: string[];
  jiraList: JiraIssue[];
  sprintList: string[];

  fixColumns: Array<any> = [
    { name: "position", label: "Position" },
    { name: "epicName", label: "Epic" }
  ];

  constructor(private JIRAService: JIRAService) {}

  ngOnInit() {
    this.isLoadingJira = true;
    try {
      this.JIRAService.getDemandesJira().subscribe(jiraIssues => {
        this.jiraList = jiraIssues;

        // Passer par des Set pour l'unicité des résultats
        this.sprintList = Array.from(new Set(jiraIssues.map(jira => jira.sprint)));
        let epicList = Array.from(new Set(jiraIssues.map(jira => jira.epic)));

        epicList.forEach((epic, index) => {
          this.dataSource.push({ position: "#" + (index + 1), epicName: epic });
        });

        this.displayedColumns = this.getDisplayedColumns(this.sprintList);
        this.isLoadingJira = false;
      });
    } catch (e) {
      window.alert('Un problème au chargement des repos a été détecté');
      console.log(e);
    }
  }

  getJirasInEpicBySprint(epicName: string, sprint: string) {
    return this.jiraList.filter(
      jira => jira.epic === epicName && jira.sprint === sprint
    );
  }
  getDisplayedColumns(sprintCols: string[]) {
    sprintCols.sort();
    // Gestion de la backlog à mettre en premier
    let backlog = "backlog";
    if (sprintCols.indexOf(backlog) >= 0) {
      sprintCols.splice(sprintCols.indexOf(backlog), 1);
      sprintCols.unshift(backlog);
    }
    // Ajout des colonnes fixes
    return this.fixColumns.map(column => column.name).concat(sprintCols);
  }

  dropTable(event: CdkDragDrop<any[]>) {
    const prevIndex = this.dataSource.findIndex(d => d === event.item.data);
    moveItemInArray(this.dataSource, prevIndex, event.currentIndex);
    this.table.renderRows();
  }

  toggleColumn(name: string) {
    let cols = this.displayedColumns.slice(this.fixColumns.length);
    if (cols.indexOf(name) >= 0) {
      cols.splice(cols.indexOf(name), 1);
    } else {
      cols.push(name);
    }
    this.displayedColumns = this.getDisplayedColumns(cols);
  }
}
