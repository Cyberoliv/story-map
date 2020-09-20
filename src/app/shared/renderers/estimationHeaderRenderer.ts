import { Component, ViewChild, ElementRef } from '@angular/core';
import { IHeaderAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-loading-overlay',
  template: `
    <div>
      <div class="customHeaderLabel">{{ params.displayName }} points !</div>
    </div>
  `,
  styles: [
    `
      .customHeaderLabel {
        color: cornflowerblue;
      }
    `,
  ],
})
export class EstimationHeaderRenderer implements IHeaderAngularComp{
  public params: any;
  
  agInit(params): void {
    this.params = params;
  }
}