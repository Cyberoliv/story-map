import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { JiraIssue } from '../../models/jira/issue';


@Component({
  selector: 'matrix-cell-renderer',
  templateUrl: './matrix-cell-renderer.component.html',
  styleUrls: ['./matrix-cell-renderer.component.scss']
})
export class MatrixCellRenderer implements ICellRendererAngularComp {

  private params: any;
  private issueList:JiraIssue[];
  public miniDisplay: boolean;

  // called on init
  agInit(params: any): void {
    this.params = params;
    this.issueList = this.params.value
    this.miniDisplay = this.params.miniDisplay
  }

  // called when the cell is refreshed
  // Retourne FALSE pour non utilisation pour le moment
  refresh(params: any): boolean {
    //this.params = params;
    //this.issueList = this.params.value
    return false;
  }

  public getIssues(): JiraIssue[] {
    return this.issueList;
  }

  public drop(event: any) {
    console.log(event)
  }
}