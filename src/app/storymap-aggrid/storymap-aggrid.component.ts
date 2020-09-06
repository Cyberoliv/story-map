import { Component, OnInit, ViewChild } from "@angular/core";
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
import { MatrixCellRenderer } from '../shared/renderers/matrix-cell-renderer/matrix-cell-renderer.component';

@Component({
  selector: 'app-storymap-aggrid',
  templateUrl: './storymap-aggrid.component.html',
  styleUrls: ['./storymap-aggrid.component.scss']
}) 
export class StorymapAggridComponent implements OnInit {

  frameworkComponents = {
    jiraCellRenderer: MatrixCellRenderer,
  };

  gridApi; gridColumnApi;

  columnDefs = [];
  rowData = [];

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

  defaultColDef = {
    //flex: 1,
    cellClass: 'cell-wrap-text',
//    autoHeight: true,
//    sortable: true,
//    resizable: true,
  };

  private getRowHeight;

  @ViewChild(MatMenuTrigger, { static: false }) contextMenu: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };

  @ViewChild(MatSidenav, { static: false }) sidenav: MatSidenav;

  constructor(public user: UserService, private jiraService: JiraService, private snackBar: MatSnackBar, private dialog: MatDialog) { 

    this.getRowHeight = (function(params) {
      let cols: string[] = Object.keys(params.data).filter(key => key != 'headerCol')
      let jiraCardHeight = 116
      let maxInCol = 0;
      cols.forEach(col => {
        let issuesInCol: JiraIssue[] = params.data[col]
        maxInCol = issuesInCol.length > maxInCol ? issuesInCol.length : maxInCol;
      });
      let nbRowInCell = Math.ceil(maxInCol / Number(this.display.jiraPerRowOther))
      return nbRowInCell * jiraCardHeight + 1;
    }).bind(this);

  }

  ngOnInit() {

    this.matrixConf = new MatrixConf();
    this.matrixConf.filter = 50300;
    this.matrixConf.row = this.getMatrixChoiceByLabel("Épopée");
    this.matrixConf.col = this.getMatrixChoiceByLabel("Sprint");

    this.initData()
  }

  updateDataSource(event: any = null) {

    //console.log("DEB - Calcul datasource (Matrice)")
    this.columnDefs = this.generateColumns()
    this.rowData = this.generateData();
    //console.log("FIN - Calcul datasource (Matrice) " + (Date.now() - this.startTime) + "ms")
    this.totalTime += Date.now() - this.startTime;
    this.startTime = Date.now();

  }

  generateData() {
    let data = [];
    this.getMatrixRows().forEach(row => {
      let content = {};
      content['headerCol'] = row;
      let issues = this.issueList.getIssuesMatching(this.matrixConf.getRowField(), row)
      this.getMatrixColumns().forEach(col => {
        content[col] = issues.getIssuesMatching(this.matrixConf.getColField(), col).getIssues()
      })
      data.push(content)
    })
    return data;
  }

  generateColumns() {
    let columnDefinitions = []
    columnDefinitions.push(
      {
        headerName: this.matrixConf.getRowLabel(),
        field: 'headerCol',
        pinned: 'left'
      }
    );
    this.getMatrixColumns().forEach(key => {
      let mappedColumn = {
        headerName: key ? key.toUpperCase() : undefined,
        field: key,
        cellRenderer: 'jiraCellRenderer',
        width: this.getColWidth(),
      }
      columnDefinitions.push(mappedColumn);

    });
    return columnDefinitions;
  }

  onColumnResized(params) {
    params.api.resetRowHeights();
  }

  async initData() {

    this.isLoading = true;

    this.startTime = Date.now()
    this.totalTime = 0;

    //console.log("DEB - Lecture des tickets")
    this.issueList = new IssueList(await this.jiraService.getIssuesByFilter(this.matrixConf.getFilter()));
    //this.issueList.setIssues(this.issueList.getIssues().filter(issue => issue.epic.key))
    //console.log("FIN - Lecture des tickets => " + (Date.now() - this.startTime) + "ms")
    this.totalTime += Date.now() - this.startTime;
    this.startTime = Date.now();

    //console.log("DEB - Lecture des épopées nécessaires")
    let epicKeys = this.issueList.getUniqueValuesOf("epic.key");
    this.jiraService.getIssuesByKeys(epicKeys).then(epicList => {
      this.issueList.completeEpics(epicList)
      //console.log("FIN  - Lecture des épopées nécessaires => " + (Date.now() - this.startTime) + "ms")
      }
    )

    this.totalTime += Date.now() - this.startTime;
    this.startTime = Date.now();
    this.updateDataSource()
    this.isLoading = false;
  }

  getMatrixRows(): string[] {
    return this.issueList.getUniqueValuesOf(this.matrixConf.getRowField());
  }
  getMatrixColumns(): string[] {
    return this.issueList.getUniqueValuesOf(this.matrixConf.getColField())
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

  getColWidth(sprint: string = "other"): number {
    let value = sprint === "backlog" ? this.display.jiraPerRowBacklog : this.display.jiraPerRowOther
    return this.getJiraCardWidth() * Number(value)
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
        + 1
    } else {
      return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--jira-card-width-minidisplay').replace("px", ''))
        + (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--jira-card-margin-minidisplay').replace("px", '')) * 2)
        + (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--jira-card-padding-minidisplay').replace("px", '')) * 2)
    }
  }
/*
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
  */
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

  updateJiraPerRowSetting(event: any) {
    this.display.jiraPerRowOther = event.value
    this.gridApi.resetRowHeights();

    let sizableColumns = this.gridColumnApi.getAllColumns().map(e=>e.colId).filter(e=>e!='headerCol')
    sizableColumns.forEach(e=> {
      this.gridColumnApi.setColumnWidth(e,this.getColWidth())
    })
    this.gridApi.resetRowHeights();
/*
    let columnWidths = []
    this.gridColumnApi.getAllColumns().forEach(col => {
      console.log(col)
      let toto = {}
      toto[col.colId] = 500
      columnWidths.push(toto)
    });

    console.log(columnWidths)
    console.log(this.gridColumnApi)

    this.gridColumnApi.setColumnWidths(columnWidths)
    console.log(this.display.jiraPerRowOther)
    */
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi; 
  }
}