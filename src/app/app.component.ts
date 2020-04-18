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

  title = 'testpfdjira';

  isLoadingJira: boolean;
  private firstTime = true;
  dataSource: any[] = [];

  //{ columnDef: 'symbol',   header: 'Symbol', cell: (element: any) => `${element.symbol}`   },
  columns: Array<any> = [
    { name: 'position', label: 'Position' },
    { name: 'epicName', label: 'Epic' },
    { name: 'backlog', label: 'backlog' },
  ];

  maJira: JiraIssue;

  sprintList: Set<string>;
  displayedColumns: string[];

  constructor(private JIRAService: JIRAService, private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {

    this.isLoadingJira = true;
    try {
      this.JIRAService.getDemandesJira().subscribe(jiraIssues => {
        let epicExists;
        let nbEpics = 0;
        jiraIssues.forEach(jira => {

          
        if(!this.maJira){
          this.maJira = jira;
        }

          // Recherche de l'existence de l'epic dans la dataSource
          if (epicExists = this.dataSource.filter(data => data['epicName'] === jira.epic)[0]) {
            // Elle existe, le sprint existe-t-il ?
            if (epicExists[jira.sprint]) {
              // Oui, on rajoute la Jira aux existantes
              epicExists[jira.sprint] = epicExists[jira.sprint] + "," + jira.key;
            } else {
              // Non on, créé le sprint en ajoutant la Jira
              epicExists[jira.sprint] = jira.key;
            }
          } else {
            // L' epic n'existe pas, on l'ajoute
            this.dataSource.push({ position: `${this.getJira(++nbEpics)}`, epicName: jira.epic });
            // Et on ajoute la demande dans le sprint dans la foulée
            this.dataSource.filter(data => data['epicName'] === jira.epic)[0][jira.sprint] = jira.key;
          }

        });

        this.sprintList = new Set(jiraIssues.map(jira => jira.sprint).filter((sprint => sprint != "backlog")).sort());

        this.sprintList.forEach(element => {
          this.columns.push({ name: element, label: element });
        });
        
        this.displayedColumns = this.columns.map(column => column.name)
        this.isLoadingJira = false;
        console.log(this.dataSource)
      });
    } catch (e) {
      //window.alert('Un problème au chargement des repos a été détecté');
      console.log(e)
    }
  }

    getJira(indice) {
    return "#" + indice;
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