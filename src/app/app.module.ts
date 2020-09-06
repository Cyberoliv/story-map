import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../material-module';
import { JiraService } from "./services/jira.service";
import { HttpClientModule } from '@angular/common/http';
import { JiraCardComponent } from './shared/jira-card/jira-card.component';
import { MatrixCellRenderer} from './shared/renderers/matrix-cell-renderer/matrix-cell-renderer.component';
import { CookieService } from 'ngx-cookie-service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AppRoutingModule } from './app-routing-module';
import { LoginComponent } from './login/login.component';
import { UserService } from './services/user.service';
import { AgGridModule } from 'ag-grid-angular';
import { StorymapAggridComponent } from './storymap-aggrid/storymap-aggrid.component';

@NgModule({
  declarations: [
    AppComponent,
    JiraCardComponent,
    MatrixCellRenderer,
    LoginComponent,
    StorymapAggridComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    AppRoutingModule,
    AgGridModule.withComponents([MatrixCellRenderer])
  ],
  providers: [
    JiraService,
    CookieService,
    UserService
  ],
  bootstrap: [AppComponent],
  entryComponents: [LoginComponent]
})
export class AppModule { }
