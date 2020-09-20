import { Component, ViewChild, ElementRef } from '@angular/core';
import { IHeaderAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-loading-overlay',
  template: `
    <div>
      <div class="customHeaderLabel">MON LAB - {{ params.displayName }}</div>
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
export class HeaderTest implements IHeaderAngularComp{
  public params: any;

  agInit(params): void {
    this.params = params;
  }
}