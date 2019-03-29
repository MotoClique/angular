import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Router } from '@angular/router';
import {MatSnackBar} from '@angular/material';
import { SuccessSnackBarComponent, ErrorSnackBarComponent, InfoSnackBarComponent } from './customSnackBar.component';

declare global {
	interface Window { GlobalData: any; cordova: any; }
}

@Injectable()
export class AuthenticationService {
	token: string;
	protocol: string = location.protocol;
	hostname: string = location.hostname;
	host: string = location.host;
	fullhost: string = '';

  constructor(private http: HttpClient, private router: Router, public snackBar: MatSnackBar) {
	var prdEnvFlag = true;
	  
	window.GlobalData = window.GlobalData || {};
	window.GlobalData['MainUrlDomain'] = (prdEnvFlag)?"https://motoclique.in":"https://meanmav.herokuapp.com";
	  
	//if(!window.cordova && this.hostname !== 'localhost')
		//window.GlobalData['MainUrlDomain'] = this.protocol+"//"+ this.host;
	
	this.fullhost = window.GlobalData['MainUrlDomain'];
  }

  saveToken(token) {
    localStorage.setItem('mean-token', token);
    this.token = token;
  }

  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem('mean-token');
    }
    return this.token;
  }

  getUserDetails() {
    const token = this.getToken();
    let payload;
    if (token) {
      payload = token.split('.')[1];
      payload = window.atob(payload);
      return JSON.parse(payload);
    } else {
      return null;
    }
  }

  isLoggedIn() {
    const user = this.getUserDetails();
    if (user) {
      return user.exp > Date.now() / 1000;
    } else {
      return false;
    }
  }

  request(method, type, user) {
    let base;
		
    if (method === 'post') {
      if(user)
			  user.device_reg_id = (!(localStorage.getItem('device-token')))?'empty':localStorage.getItem('device-token');
      base = this.http.post(this.fullhost+'/api/'+type, user);
    } else {
      base = this.http.get(this.fullhost+'/api/'+type, {});
    }

    const request = base.map((data: any) => {
        if (data && data.token) {
          this.saveToken(data.token);
        }
		if(data && data.device_reg_id)
			localStorage.setItem('device-token', data.device_reg_id);
		
        return data;
      })
	  .catch((err: any) => {
			this.setBusy(false);
			var message = "";
			if(err.error.error && err.error.error.message)
				message = message + err.error.error.message;
			this.snackBar.openFromComponent(ErrorSnackBarComponent, {
				duration: 2000,
				data: {message: message}
			});
	  });

    return request;
  }

  public register(user: any): Observable<any> {
    return this.request('post', 'register', user);
  }

  public login(user: any): Observable<any> {
    return this.request('post', 'login', user);
  }
  
  public verifyOTP(detail: any): Observable<any> {
    return this.request('post', 'verifyOtp', detail);
  }
  
  public loginByOtp(credential: any): Observable<any> {
    return this.request('post', 'loginByOtp', credential);
  }
  public sendOtp(mobile: any): Observable<any> {
	  return this.request('get', 'sendOTP/?mobile='+mobile, null);
  }
  
	setBusy(state){
		if(state)
			document.getElementById("loaderContainer").style.display = "block";
		else
			setTimeout(function(){ document.getElementById("loaderContainer").style.display = "none"; }, 500);			
	}

  logout() {
    this.token = '';
    window.localStorage.removeItem('mean-token');
	window.location.reload();
    //this.router.navigateByUrl('/');
  }
}
