import { Injectable } from '@angular/core';
import { Router, CanActivate, CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from './authentication.service';
import { SharedService } from './shared.service';
import { Observable } from 'rxjs/Observable';

export interface CanComponentDeactivate {
  canDeactivate(component:any, currentRoute:ActivatedRouteSnapshot, currentState:RouterStateSnapshot, nextState:RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean;
}


@Injectable()
export class AuthGuardService implements CanActivate {

  constructor(private auth: AuthenticationService, private router: Router) {}

  canActivate() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/');
      return false;
    }
    return true;
  }
}


export class ConfirmDeactivateGuard implements CanDeactivate<CanComponentDeactivate> {

	canDeactivate(component:CanComponentDeactivate, currentRoute:ActivatedRouteSnapshot, currentState:RouterStateSnapshot, nextState:RouterStateSnapshot) {
		return component.canDeactivate ? component.canDeactivate(component,currentRoute,currentState,nextState) : true;
	}
}