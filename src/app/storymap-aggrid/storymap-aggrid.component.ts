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
import { HeaderTest } from '../shared/renderers/headerTest';
import { EstimationHeaderRenderer } from '../shared/renderers/estimationHeaderRenderer';

@Component({
  selector: 'app-storymap-aggrid',
  templateUrl: './storymap-aggrid.component.html',
  styleUrls: ['./storymap-aggrid.component.scss']
}) 
export class StorymapAggridComponent implements OnInit {

  // AG GRID
  columnDefs;
  rowData;
  gridApi; 
  gridColumnApi;

  readonly version: string = version

  matrixChoices: MatrixSelector[] = [
    new MatrixSelector("Composants", "getComponents()", undefined),
    new MatrixSelector("Épopée", "epic.key", undefined),
    new MatrixSelector("Étiquettes", "labels", undefined),
    new MatrixSelector("Point d'effort", "estimation", EstimationHeaderRenderer),
    new MatrixSelector("Priorité", "priority.name", undefined),
    new MatrixSelector("Rapporteur", "reporter.displayName", undefined),
    new MatrixSelector("Responsable", "assignee.displayName", undefined),
    new MatrixSelector("Sprint", "sprint.name", HeaderTest),
    new MatrixSelector("Type de ticket", "type.name", undefined),
    new MatrixSelector("Version Commerciale", "finalVersion.name", undefined),
  ]

  matrixConf: MatrixConf;
  issueList: IssueList;

  isLoading: boolean;
  totalTime: number;
  startTime: number;

  display = {
    jiraPerRow: "3",
    miniDisplay: false,
  }
  getRowHeight;

  @ViewChild(MatMenuTrigger, { static: false }) contextMenu: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };

  @ViewChild(MatSidenav, { static: false }) sidenav: MatSidenav;

  constructor(public user: UserService, private jiraService: JiraService, private snackBar: MatSnackBar, private dialog: MatDialog) { 
    this.getRowHeight = (function(params) {
      const cols: string[] = Object.keys(params.data).filter(key => key != 'headerCol')
      const jiraCardHeight: number = this.display.miniDisplay ? 57 : 116
      let maxInCol: number = 0;
      cols.forEach(col => {
        const issuesInCol: JiraIssue[] = params.data[col]
        maxInCol = issuesInCol.length > maxInCol ? issuesInCol.length : maxInCol;
      });
      const nbRowInCell = Math.ceil(maxInCol / Number(this.display.jiraPerRow))
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
    this.columnDefs = this.generateMatrixColumns()
    this.rowData = this.generateMatrixData();
    //console.log("FIN - Calcul datasource (Matrice) " + (Date.now() - this.startTime) + "ms")
    this.totalTime += Date.now() - this.startTime;
    this.startTime = Date.now();

  }

  generateMatrixData() {
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

  generateMatrixColumns() {
    let columnDefinitions = []
    columnDefinitions.push(
      {
        headerName: this.matrixConf.getRowLabel(),
        field: 'headerCol',
        pinned: 'left',
        width: 150,      }
    );

    const colWidth = this.getColWidth();
    this.getMatrixColumns().forEach(key => {
      let mappedColumn = {
        field: key,
        width: colWidth,
        headerName: key ? key.toUpperCase() : undefined,
        headerComponentFramework: this.matrixConf.col.renderer,
        cellRendererFramework: MatrixCellRenderer,
        cellRendererParams: {
          miniDisplay : this.display.miniDisplay
        }
      }
      columnDefinitions.push(mappedColumn);

    });
    return columnDefinitions;
  }

  async initData() {

    this.isLoading = true;

    this.startTime = Date.now()
    this.totalTime = 0;

    //console.log("DEB - Lecture des tickets")
    this.issueList = new IssueList(await this.jiraService.getIssuesByFilter(this.matrixConf.getFilter()));
    this.issueList.setIssues(this.issueList.getIssues().filter(issue => issue.epic.key))
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
    console.log("done !")
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

  getColWidth(): number {
    return this.getJiraCardWidth() * Number(this.display.jiraPerRow) + 2 // +2 pour les borders de la grille
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

  updateMiniDiplay() {
    this.display.miniDisplay = this.display.miniDisplay ? false : true
    this.updateGridConf({redrawRows : true})
  }

  updateJiraPerRowSetting(event: any) {
    this.display.jiraPerRow = event.value
    this.updateGridConf({redrawRows : false})
  }

  private updateGridConf({ redrawRows }: {redrawRows: boolean}) {
    
    this.getApiGridColumns().forEach(col => {

      if(col.colDef.cellRendererParams.miniDisplay != this.display.miniDisplay) {
        col.colDef.cellRendererParams.miniDisplay = this.display.miniDisplay
      }
      this.gridColumnApi.setColumnWidth(col,this.getColWidth())
    });
    if(redrawRows) { 
      this.gridApi.redrawRows()
    }
    this.gridApi.resetRowHeights();
  }

  private getApiGridColumns(addHeader:boolean = false) {
    let cols = this.gridColumnApi.getAllColumns();
    return addHeader ? cols : cols.filter(col => col.colId != 'headerCol')
  }


  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi; 
  }
}