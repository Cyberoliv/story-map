import { Component, OnInit, ViewChild } from "@angular/core";
import { CdkDragDrop, moveItemInArray, CdkDragHandle} from "@angular/cdk/drag-drop";
import { MatTable } from "@angular/material/table";
import { JIRAService } from "./services/jira.service";
import { JiraIssue } from "./models/jira-issue";
import { MatMenuTrigger } from "@angular/material/menu";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {

  isLoadingJira: boolean;
  dataSource: any[] = [];
  displayedColumns: string[];
  jiraList: JiraIssue[];
  sprintList: string[];

  fixColumns: Array<any> = [
    { name: "position", label: "Position" },
    { name: "epicName", label: "Epic" }
  ];

  @ViewChild("table", { static: false }) table: MatTable<any>;
  @ViewChild(MatMenuTrigger)
  contextMenu: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };  

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

  onContextMenu(event: MouseEvent, item: any) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menuData = { 'item': item };
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }

  sendTop(item: any) {
    const prevIndex = this.dataSource.findIndex(d => d === item);
    this.moveAndRenderTable(prevIndex, 0);
  }

  sendBottom(item: any) {
    const prevIndex = this.dataSource.findIndex(d => d === item);
    this.moveAndRenderTable(prevIndex, this.dataSource.length);
  }

   moveAndRenderTable(prevIndex: number, toIndex: number) {
    moveItemInArray(this.dataSource, prevIndex, toIndex);
    this.table.renderRows();
  }

  saveEpicPositions(){
    console.log(this.dataSource);
    console.log(JSON.stringify(this.dataSource));

  }

  getDisplayedColumns(sprintCols: string[]) {
    sprintCols.sort();
    // Gestion de la backlog à mettre en premier
    let backlog = "backlog";
    if (sprintCols.indexOf(backlog) >= 0) {
      moveItemInArray(sprintCols, sprintCols.indexOf(backlog), 0);
      //sprintCols.splice(sprintCols.indexOf(backlog), 1);
      //sprintCols.unshift(backlog);
    }
    // Ajout des colonnes fixes
    return this.fixColumns.map(column => column.name).concat(sprintCols);
  }

  dropTable(event: CdkDragDrop<any[]>) {
    const prevIndex = this.dataSource.findIndex(d => d === event.item.data);
    this.moveAndRenderTable(prevIndex, event.currentIndex);
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