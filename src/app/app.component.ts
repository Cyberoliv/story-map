import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDragHandle } from '@angular/cdk/drag-drop';
import { MatTable } from '@angular/material/table';
import { JIRAService } from './services/jira.service';
import { JiraIssue } from './models/jiraIssue';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  @ViewChild('table', { static: false }) table: MatTable<any>;

  isLoadingJira: boolean;
  private firstTime = true;
  dataSource: any[] = [];

  //{ columnDef: 'symbol',   header: 'Symbol', cell: (element: any) => `${element.symbol}`   },
  fixColumns: Array<any> = [
    { name: 'position', label: 'Position' },
    { name: 'epicName', label: 'Epic' },
  ];

  maJira: JiraIssue;

  jiraList: JiraIssue[];  
  sprintList: string[];
  displayedColumns: string[];

  constructor(private JIRAService: JIRAService, private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {

    this.isLoadingJira = true;
    try {
      this.JIRAService.getDemandesJira().subscribe(jiraIssues => {

        this.jiraList = jiraIssues;
        this.sprintList = Array.from(new Set(jiraIssues.map(jira => jira.sprint))).sort();
        // Gestion de la backlog à mettre en premier
        if (this.sprintList.indexOf("backlog")>= 0) {
          this.sprintList.splice(this.sprintList.indexOf(name), 1)
          this.sprintList.unshift("backlog")
        }

        let epicList = Array.from(new Set(jiraIssues.map(jira => jira.epic)));

        epicList.forEach( (epic, index) => {
          this.dataSource.push({ position: "#"+(index+1), epicName: epic })
          })
        this.displayedColumns = this.fixColumns.map(column => column.name).concat(this.sprintList)
        this.isLoadingJira = false;
      });
    } catch (e) {
      //window.alert('Un problème au chargement des repos a été détecté');
      console.log(e)
    }
  }

  getJirasInEpicBySprint(epicName: string, sprint: string) {
    return this.jiraList.filter(jira => jira.epic === epicName && jira.sprint === sprint)
  }

  ngAfterViewChecked() {
    
    //Workaround: Uncomment this and the error is gone.
    if (this.firstTime) {
      this.changeDetectorRef.detectChanges();
      this.firstTime = false;
    }
  } 

  dropTable(event: CdkDragDrop<any[]>) {
    console.log("test")
    const prevIndex = this.dataSource.findIndex((d) => d === event.item.data);
    moveItemInArray(this.dataSource, prevIndex, event.currentIndex);
    this.table.renderRows();
  }

  toggleColumn(name: string) {
    if (this.displayedColumns.indexOf(name) >= 0) {
      this.displayedColumns.splice(this.displayedColumns.indexOf(name), 1);
    } else {
      this.displayedColumns.push(name);
      this.displayedColumns.sort();
    }
  }
}