import { Component, OnInit } from '@angular/core';
import { JiraService } from "../services/jira.service";
import { MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;

  constructor(public user: UserService, private jiraService: JiraService, private formBuilder: FormBuilder, private dialogRef: MatDialogRef<LoginComponent>, private snackBar: MatSnackBar) {
    this.loginForm = this.formBuilder.group({
      login: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false],
    });
  }

  ngOnInit() {
    this.dialogRef.updatePosition({ top: '50px', right: '50px' });
  }

  doLogout() {
    this.user.unset()
    this.jiraService.deleteAuthHeader()
    this.snackBar.open('Déconnexion réussie', null, {
      duration: 2000,
      horizontalPosition: "right",
      verticalPosition: "top",
      panelClass: 'notif-info'
    });        

    this.dialogRef.close("Logoff OK !");
  }

  doLogin() {

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }
    let auth = btoa(this.loginForm.value.login + ":" + this.loginForm.value.password)
    this.jiraService.getMyself(auth).subscribe(
      value => {
        this.user.set(value, this.loginForm.value.rememberMe ? auth : null)
        this.jiraService.addAuthHeader(auth)
        this.snackBar.open('Connexion à Jira OK !', null, {
          duration: 2000,
          horizontalPosition: "right",
          verticalPosition: "top",
          panelClass: 'notif-success'
        });        
        this.dialogRef.close("Login OK !");
      },
      error => {
        this.snackBar.open('Erreur de connexion: Login ou mot de passe incorrect', null, {
          duration: 3000,
          horizontalPosition: "right",
          verticalPosition: "top",
          panelClass: 'notif-error'
        });        
      }
    )
  }

  cancel() {
    this.dialogRef.close();
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls }

}
