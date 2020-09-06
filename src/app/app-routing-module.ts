
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StorymapAggridComponent } from './storymap-aggrid/storymap-aggrid.component';

export const routes: Routes = [
    {
        path: '',
        component: StorymapAggridComponent
    },
    {
        path: '**',
        redirectTo: '/'
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
