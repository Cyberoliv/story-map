import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { User } from '../shared/models/jira/user';

@Injectable()
export class UserService {

  user: User

  constructor(private cookieService: CookieService) { }

  public set(data: any, auth:string) {
    this.user = new User(data)
    if(auth)
    {
      this.setJiraAuthCookie(auth)
    }
  }

  public unset() {
    this.user = null;
    this.deleteJiraAuthCookie()
  }

  private setJiraAuthCookie(auth: string) {
    this.cookieService.set('jira-auth', auth)
  }

  private deleteJiraAuthCookie() {
    this.cookieService.delete('jira-auth')
  }

  public isLogged(): boolean {
    return this.user != null
  }

  public getDisplayName() {
    return this.user.displayName
  }

  public getAvatarUrl() {
    return this.user.avatarUrl
  }  

  public getLogin() {
    return this.user.name
  }
}