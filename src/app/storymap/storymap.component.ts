import { Component, OnInit, ViewChild, AfterViewInit, AfterViewChecked } from "@angular/core";
import { JiraService } from "../services/jira.service";
import { MatMenuTrigger } from "@angular/material/menu";
import { JiraIssue } from '../shared/models/jira/issue';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSidenav, MatDialogConfig, MatDialog } from '@angular/material';
import { version } from '../../../package.json'
import { LoginComponent } from '../login/login.component';
import { IssueList } from '../shared/models/issuelist';
import { MatrixSelector, MatrixConf } from "../shared/models/matrix"
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-storymap',
  templateUrl: './storymap.component.html',
  styleUrls: ['./storymap.component.scss']
})
export class StorymapComponent implements OnInit, AfterViewInit, AfterViewChecked {

  readonly version: string = version

  matrixChoices: MatrixSelector[] = [
    new MatrixSelector("Composants", "getComponents()", "ComponentRenderer"),
    new MatrixSelector("Épopée", "epic.key", "EpicRenderer"),
    new MatrixSelector("Étiquettes", "labels", "LabelRenderer"),
    new MatrixSelector("Point d'effort", "estimation", "EstimationRenderer"),
    new MatrixSelector("Priorité", "priority.name", "priorityRenderer"),
    new MatrixSelector("Rapporteur", "reporter.displayName", "UserRenderer"),
    new MatrixSelector("Responsable", "assignee.displayName", "UserRenderer"),
    new MatrixSelector("Sprint", "sprint.name", "SprintRenderer"),
    new MatrixSelector("Type de ticket", "type.name", "IssueTypeRenderer"),
    new MatrixSelector("Version Commerciale", "finalVersion.name", "VersionRenderer"),
  ]

  matrixConf: MatrixConf;

  issueList: IssueList;
  dataSource: any [];

  isLoading: boolean;
  totalTime: number;
  startTime: number;

  display = {
    jiraPerRowBacklog: "3",
    jiraPerRowOther: "3",
    miniDisplay: false,
    showClosed: false,
    showBacklog: true,
    epicStatus: []
  }

  displayedColums: string[];

  @ViewChild(MatMenuTrigger, { static: false }) contextMenu: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };

  @ViewChild(MatSidenav, { static: false }) sidenav: MatSidenav;

  constructor(public user: UserService, private jiraService: JiraService, private snackBar: MatSnackBar, private dialog: MatDialog) { }

  ngOnInit() {

    this.matrixConf = new MatrixConf();
    this.matrixConf.filter = 50300;
    this.matrixConf.row = this.getMatrixChoiceByLabel("Épopée");
    this.matrixConf.col = this.getMatrixChoiceByLabel("Sprint");

    this.initData()
  }

  updateDataSource(event: any = null) {

    // On va calculer toute la matrice (datasource)
    // 1 - Calcul des colonnes à afficher (Besoin également dans l'affichage côté template html)
    // 2 - Pour chaque ligne du critère de sélection:
    //      - Ajout de la colonne d'entête
    //      - Recherche des issues correspondantes à la ligne en cours
    //      - Pour chaque colonne du 1:
    //         - Recherche des issues correspondantes à la colonne (Toujours sur la ligne en cours)
    //         - Ajout des issues trouvées dans la colonne correspondante
    //      - Ajout de la ligne (entête + toutes les colonnes) dans la matrice

    console.log("DEB - Calcul datasource (Matrice)")
    this.dataSource = [];
    this.displayedColums = this.computeDisplayedColumns()
    this.computeDisplayedRows().forEach(row => {
      let content = {};
      content['headerCol'] = row;
      let issues = this.issueList.getIssuesMatching(this.matrixConf.getRowField(), row)
      this.displayedColums.forEach(col => {
        content[col] = issues.getIssuesMatching(this.matrixConf.getColField(), col).getIssues();
      })
      this.dataSource.push(content)
    })
    console.log("FIN - Calcul datasource (Matrice) " + (Date.now() - this.startTime) + "ms")
    this.totalTime += Date.now() - this.startTime;
    this.startTime = Date.now();
  }

  async initData() {

    this.isLoading = true;

    this.startTime = Date.now()
    this.totalTime = 0;    
    
    console.log("DEB - Lecture des tickets")
    this.issueList = new IssueList(await this.jiraService.getIssuesByFilter(this.matrixConf.getFilter()));
    console.log("FIN - Lecture des tickets => " + (Date.now() - this.startTime) + "ms")
    this.totalTime += Date.now() - this.startTime;
    this.startTime = Date.now();

    console.log("DEB - Lecture des épopées nécessaires")
    let epicKeys = this.issueList.getUniqueValuesOf("epic.key");
    this.jiraService.getIssuesByKeys(epicKeys).then(epicList => 
      {
        this.issueList.completeEpics(epicList)
        console.log("FIN  - Lecture des épopées nécessaires => " + (Date.now() - this.startTime) + "ms")
      }
    )
    
    this.totalTime += Date.now() - this.startTime;
    this.startTime = Date.now();    
    this.updateDataSource()
    this.isLoading = false;
  }

  computeDisplayedRows(): string[] {
    return this.issueList.getUniqueValuesOf(this.matrixConf.getRowField());
  }
  computeDisplayedColumns(): string[] {
    return this.issueList.getUniqueValuesOf(this.matrixConf.getColField())
  }

  getDisplayedCols(addHeaderCol: boolean = false): string[] {
    let cols = [...this.displayedColums]
    if (addHeaderCol) {
      cols.unshift("headerCol");
    }
    return cols
  }

  moveIssue() {
    console.log("todo")
  }

  onContextMenu(event: MouseEvent, item: JiraIssue) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menuData = { 'item': item };
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }

  setColsize(sprint: string) {
    let value = sprint === "backlog" ? this.display.jiraPerRowBacklog : this.display.jiraPerRowOther
    return {
      'min-width.px': this.getJiraCardWidth() * Number(value),
      'max-width.px': this.getJiraCardWidth() * Number(value)
    }
  }

  getMatrixChoiceByLabel(label: string): MatrixSelector {
    return this.matrixChoices.find(mc => mc.label === label)
  }

  getJiraCardWidth() {
    /* Variables déclarés dans le style.css racine */
    /* Pour calcul auto de tout... */
    if (!this.display.miniDisplay) {
      return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--jira-card-width').replace("px", ''))
        + (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--jira-card-margin').replace("px", '')) * 2)
        + (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--jira-card-padding').replace("px", '')) * 2)
    } else {
      return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--jira-card-width-minidisplay').replace("px", ''))
        + (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--jira-card-margin-minidisplay').replace("px", '')) * 2)
        + (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--jira-card-padding-minidisplay').replace("px", '')) * 2)
    }
  }

  ngAfterViewInit() {
    console.log("Fin ngAfterViewInit => Durée = " + (Date.now() - this.startTime) + "ms")
    this.totalTime += Date.now() - this.startTime;
    this.startTime = Date.now();
  }

  ngAfterViewChecked() {
    console.log("Fin ngAfterViewInit => Durée = " + (Date.now() - this.startTime) + "ms")
    this.totalTime += Date.now() - this.startTime;
    this.startTime = Date.now();

    console.log("Durée totale du rendu: " + this.totalTime + "ms")

  }
  onLogin() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;

    const dialogRef = this.dialog.open(LoginComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(
      data => {
        console.log("Dialog output:", data)
      }
    );
  }
}