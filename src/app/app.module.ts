import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Component } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {DemoMaterialModule} from '../material-module';
import { JIRAService } from './services/jira.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { HttpErrorInterceptor } from './services/http-error.interceptor';
import { JiraCardComponent } from './models/jira-card/jira-card.component';

@NgModule({
  declarations: [
    AppComponent,
    JiraCardComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    DemoMaterialModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    },
    JIRAService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
