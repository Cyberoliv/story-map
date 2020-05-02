import { Component, OnInit, ViewChild } from "@angular/core";
import { CdkDragDrop, moveItemInArray, CdkDragHandle} from "@angular/cdk/drag-drop";
import { MatTable } from "@angular/material/table";
import { JIRAService } from "./services/jira.service";
import { JiraIssue } from "./models/jira-issue";
import { MatMenuTrigger } from "@angular/material/menu";
import { CookieService } from "ngx-cookie-service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {

  jiraDistribution() {
    return 225* Number(this.jiraPerRow)

  }

  jiraPerRow = "3"
  isLoadingJira: boolean;
  dataSource: any[] = [];
  displayedColumns: string[];
  jiraList: JiraIssue[] = [];
  sprintList: string[];

  fixColumns: any[] = [
    { name: "position", label: "Position" },
    { name: "epicName", label: "Epic" }
  ];

  @ViewChild("table", { static: false }) table: MatTable<any>;
  @ViewChild(MatMenuTrigger)
  contextMenu: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };  

  constructor(private jiraService: JIRAService, private cookieService: CookieService) {}

  ngOnInit() {

    this.isLoadingJira = true;
    try {
      this.jiraService.getDemandesJira().subscribe(jiraIssues => {
        this.jiraList = jiraIssues;

        // Passer par des Set pour l'unicité des résultats
        this.sprintList = Array.from(new Set(jiraIssues.map(jira => jira.sprint)));
        this.displayedColumns = this.getDisplayedColumns(this.sprintList);
        // Filtre des colonne à afficher depuis la sauvegarde (cookie)
        this.filterColsFromSave();

        let epicList: string[] = Array.from(new Set(jiraIssues.map(jira => jira.epic)));
        // Tri des epics slon la sauvegarde (cookie)
        epicList = this.reorderEpicsFromSave(epicList);
        // Alimentation de la dataSource
        epicList.forEach((epic, index) => {
          this.dataSource.push({ position: "#" + (index + 1), epicName: epic });
        });
        this.isLoadingJira = false;
      });
    } catch (e) {
      window.alert('Un problème au chargement des repos a été détecté');
      console.log(e);
    }
  }

  filterColsFromSave() {
    // Lecture cookie
    let jsonSPRINT = this.cookieService.get('MEMOSPRINT');
    let hiddenSprintList = jsonSPRINT ? JSON.parse(jsonSPRINT): [];
    // On supprime des colonnes celles sauvées comme masquées dans le cookie
    // On garde donc celles qui ne sont PAS dans la liste :-)
    this.displayedColumns = this.displayedColumns.filter(sprint => hiddenSprintList.indexOf(sprint) < 0)
  }

  reorderEpicsFromSave(epicList: string[]): string[] {
    // Lecture cookie
    let jsonEPIC = this.cookieService.get('MEMOEPIC');
    let epicListLoaded = jsonEPIC ? JSON.parse(jsonEPIC): [];
    // Suppresion des épopées sauvegardées mais plus présentes...
    // On ne garde donc celles qui sont présentes dans les 2 listes
    epicListLoaded = epicListLoaded.filter(epic => epicList.indexOf(epic) >= 0);
    // Concaténation aux épopées actuelles
    epicListLoaded = epicListLoaded.concat(epicList)
    // Remise dans un set pour unicité
    return Array.from(new Set(epicListLoaded));
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
    // Epics
    this.cookieService.set('MEMOEPIC', JSON.stringify(this.dataSource.map(element => element.epicName)) )
    // Les sprints, on sauve les masqués !
    // Plus simple à gérer
    let hiddenCols = this.sprintList.filter(sprint => this.displayedColumns.indexOf(sprint) < 0);
    this.cookieService.set('MEMOSPRINT', JSON.stringify(hiddenCols) )
  }

  getDisplayedColumns(sprintCols: string[]) {
    sprintCols.sort();
    // Gestion de la backlog à mettre en premier
    let backlog = "backlog";
    if (sprintCols.indexOf(backlog) >= 0) {
      //moveItemInArray(sprintCols, sprintCols.indexOf(backlog), 0);
      sprintCols.splice(sprintCols.indexOf(backlog), 1);
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