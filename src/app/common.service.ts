import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
//import { Http, Headers } from '@angular/http';
import { User } from './user';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import { map } from 'rxjs/operators/map';
import { SharedService } from './shared.service';
import { AdminService } from './admin.service';
import { EndUserService } from './enduser.service';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class CommonService {
	token: string = "";
  constructor(private auth: AuthenticationService, private http: HttpClient, private sharedService: SharedService, public adminService: AdminService, public enduserService: EndUserService) { 
	this.token = this.auth.getToken();
  }
  
  
  ///////////////////////////USERS/////////////////////////////
    
  /*checkUser(mobile,login_password){
	  return this.http.get('http://localhost:3000/api/users/?mobile='+mobile+'&login_password='+login_password)
	  .map((res: any) => {return res;});
  }*/
  
  /*login(credential){
	  return this.http.post('http://localhost:3000/api/login', credential)
	  .map(res => res.json());
  }
  
  addUser(newUser){
	  return this.http.post('http://localhost:3000/api/register', newUser)
	  .map(res => res.json());
  }*/
  
  getProfile(user_id){
	  return this.sharedService.call('getprofile', "post", {user_id:user_id}, true);
  }

  addProfile(userProfile){
	  return this.sharedService.call('profile', "post", userProfile, true);
  }
  
  updateProfile(userProfile){
	  return this.sharedService.call('profile', "put", userProfile, true);
  }
  
  changePassword(detail){
	  return this.sharedService.call('changePassword', "post", detail, true);
  }
  
  sendEmailOTP(email){
	  return this.sharedService.call('sendEmailOTP/?email='+email, "get", null, true);
  }
  
  verifyEmailOTP(body){
	  return this.sharedService.call('verifyEmailOTP', "post", body, true);
  }
    
}
