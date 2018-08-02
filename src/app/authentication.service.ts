import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Router } from '@angular/router';
import {MatSnackBar} from '@angular/material';

@Injectable()
export class AuthenticationService {
	token: string;
	protocol: string = location.protocol;
	hostname: string = location.hostname;
	host: string = location.host;
	fullhost: string = '';

  constructor(private http: HttpClient, private router: Router, public snackBar: MatSnackBar) {
	if(this.hostname === 'localhost')
		this.fullhost = "http://nodejs-mongo-persistent-mav.7e14.starter-us-west-2.openshiftapps.com";//this.protocol+"//"+ this.hostname+":8080";
	else
		this.fullhost = this.protocol+"//"+ this.host;
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
      base = this.http.post(this.fullhost+'/api/'+type, user);
    } else {
      base = this.http.get(this.fullhost+'/api/'+type, { headers: { Authorization: `Bearer ${this.getToken()}` }});
    }

    const request = base.map((data: any) => {
        if (data && data.token) {
          this.saveToken(data.token);
        }
        return data;
      })
	  .catch((err: any) => {
			this.setBusy(false);
			var message = "Error: ";
			if(err.error.error && err.error.error.message)
				message = message + err.error.error.message;
			this.snackBar.open(message, '', {
				duration: 2000,
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
  
	setBusy(state){
		if(state)
			document.getElementById("loaderContainer").style.display = "block";
		else
			setTimeout(function(){ document.getElementById("loaderContainer").style.display = "none"; }, 500);			
	}

  logout() {
    this.token = '';
    window.localStorage.removeItem('mean-token');
    this.router.navigateByUrl('/');
  }
}