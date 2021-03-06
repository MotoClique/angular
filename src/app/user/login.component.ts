import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import { AuthenticationService } from '../authentication.service';
import { CommonService } from '../common.service';
import { SharedService } from '../shared.service';
import { User } from '../user';
import { Http , Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
declare var jQuery:any;

@Component ({
   selector: 'app-root',
   templateUrl: './login.component.html',
   styleUrls: ['./login.component.css'],
   providers: [CommonService] 
})
export   class   AppLogin  implements OnInit {
	user: User;
	router: Router;
	mobile:string;
	login_password:string = "";
	login_mobile:string = "";
	login_otp:string = "";
	user_id:string = "";
	loginByPassword: boolean = true;
	loginByOTP: boolean = false;
	loginError: string = "";
	sendOTP: string = "Send OTP";

  constructor(private auth: AuthenticationService, private commonService: CommonService, private sharedService: SharedService, router: Router) { 
		this.router = router;
  }

  ngOnInit() {
	  	  if(this.auth.isLoggedIn()){
          var userDetail = this.auth.getUserDetails();
          if(userDetail.admin === 'A' || userDetail.admin === 'S')
            this.router.navigateByUrl('/ContainerAdmin');
          else
            this.router.navigateByUrl('/Container');
        }
		else{
			jQuery("#brandlogo").fadeOut(2000,function(){
			  jQuery("#approot").fadeIn(2000,function(){});
			});
		}
  }
  
  onLogin() {
	  this.sharedService.setBusy(true);
	  var that = this;
	  var login_mobile = this.login_mobile;
	  var login_password = this.login_password;
	  var login_otp = this.login_otp;
	  if(this.loginByPassword){
			  if(login_mobile && login_password){
				  var credential:any = {mobile:login_mobile, password:login_password};
				  this.auth.login(credential)
				   .subscribe( res => {
					if(res.token){
						var userDetail = that.auth.getUserDetails();
						that.commonService.getProfile(userDetail.user_id)
						   .subscribe( data => {
								if(data.statusCode === 'F'){
									if(data.unknown_device)
										that.sharedService.noDeviceRegistrationMessageBox(data.msg);
									else
										that.sharedService.openMessageBox("E",data.msg,null);
								}
								else{
									that.sharedService.sharedObj["userProfile"] = data.results[0];
									if(userDetail.admin == 'A' || userDetail.admin == 'S'){
										that.router.navigateByUrl('/ContainerAdmin');
									}
									else{
										that.router.navigateByUrl('/Container');
									}
								}
						 });							
					}
					else if(res.registered){
						that.sharedService.openMessageBox("C",res.msg+"\n Would you like to re-register with the new device?",function(state){
							if(state){
								var credential:any = {mobile:login_mobile, password:login_password, reregister:true};
								that.auth.login(credential)
								   .subscribe( res => {
									if(res.token){
										var userDetail = that.auth.getUserDetails();
										that.commonService.getProfile(userDetail.user_id)
										   .subscribe( data => {
												if(data.statusCode === 'F'){
													if(data.unknown_device)
														that.sharedService.noDeviceRegistrationMessageBox(data.msg);
													else
														that.sharedService.openMessageBox("E",data.msg,null);
												}
												else{
													that.sharedService.sharedObj["userProfile"] = data.results[0];
													if(userDetail.admin == 'A' || userDetail.admin == 'S'){
														that.router.navigateByUrl('/ContainerAdmin');
													}
													else{
														that.router.navigateByUrl('/Container');
													}
												}
										 });
									}
                  else{
										if(res.msg)
											that.loginError = res.msg;
										else
											that.loginError = "Unable to re-register.";
									}
								});
							}
						});
					}
					else{
            if(res.msg)
							that.loginError = res.msg;
						else
						  that.loginError = "Invalid credential.";
					}
					that.sharedService.setBusy(false);
				  });
			  }
			  else{
				  this.loginError = "Please enter your credential to login.";
				  this.sharedService.setBusy(false);
			  }
	  }
	  else{
			if(login_mobile && login_otp){
				var credential:any = {mobile:login_mobile, otp:login_otp};
				  this.auth.loginByOtp(credential)
				   .subscribe( res => {
					if(res.statusCode === "F"){
						if(res.registered){
							that.sharedService.openMessageBox("C",res.msg+"\n Would you like to re-register with the new device?",function(state){
								if(state){
									var credential:any = {mobile:login_mobile, otp:login_otp, reregister:true};
									that.auth.loginByOtp(credential)
									   .subscribe( res => {
										   if(res.statusCode === "F"){
											   if(res.msg)
													that.loginError = res.msg;
												else
													that.loginError = "Login failed";
										   }
										   else{
												var data = res.results;
												if(data[0] && data[0].mobile == login_mobile && data[0].otp == login_otp){
													var userDetail = that.auth.getUserDetails();
													that.commonService.getProfile(userDetail.user_id)
														.subscribe( result => {
															if(result.statusCode === 'F'){
																if(result.unknown_device)
																	that.sharedService.noDeviceRegistrationMessageBox(result.msg);
																else
																	that.sharedService.openMessageBox("E",result.msg,null);
															}
															else{
																var users = result.results;
																that.sharedService.sharedObj["userProfile"] = users[0];
																if(userDetail.admin == 'A'){
																	that.router.navigateByUrl('/ContainerAdmin');
																}
																else{
																	that.router.navigateByUrl('/Container');
																}
															}
															that.sharedService.setBusy(false);
														});								
												}
												else{
													that.loginError = "Invalid credential.";
													that.sharedService.setBusy(false);
												}
										   }
									});
								}
							});
						}
						else{						
							if(res.msg)
								that.loginError = res.msg;
							else
								that.loginError = "Login failed";
						}
						that.sharedService.setBusy(false);
					}
					else{
						var data = res.results;
						if(data[0] && data[0].mobile == login_mobile && data[0].otp == login_otp){
							var userDetail = that.auth.getUserDetails();
							this.commonService.getProfile(userDetail.user_id)
								.subscribe( result => {
									if(result.statusCode === 'F'){
										if(result.unknown_device)
											that.sharedService.noDeviceRegistrationMessageBox(result.msg);
										else
											that.sharedService.openMessageBox("E",result.msg,null);
									}
									else{
										var users = result.results;
										//if(users.length > 0){
										that.sharedService.sharedObj["userProfile"] = users[0];
										if(userDetail.admin == 'A'){
											that.router.navigateByUrl('/ContainerAdmin');
										}
										else{
											that.router.navigateByUrl('/Container');
										}
									}									
									//}
									//else{
										//that.loginError = "Invalid Number.";
									//}
									that.sharedService.setBusy(false);
								});								
						}
						else{
							that.loginError = "Invalid credential.";
							that.sharedService.setBusy(false);
						}
					}					
				  });
			  }
			  else{
				  this.loginError = "Please enter your credential to login.";
				  this.sharedService.setBusy(false);
			  }
	  }
  }
  
  onSignup() {
	var that = this;
	var user_id = this.user_id;  	 
	that.router.navigateByUrl('/Signup');	  
  }
  onMobileEnter(evt){
	  this.onkeypress(evt);
	   evt.target.value = (evt.target.value).replace(/[^0-9]/g, '');
  }
  
  onkeypress(evt){
	  this.loginError = "";
	  if(evt.which === 13) {
         this.onLogin(); 
         evt.preventDefault();
      }
  }
  
  onSendOTP(){
	  this.loginError = "";
	  this.sendOTP = "Resend OTP";
	  if(this.login_mobile){
		  this.auth.sendOtp(this.login_mobile)
			   .subscribe( data => {
			   
			  });	
	  }
	  else{
			this.loginError = "Please enter your mobile number.";
		}	  
  }
  
  forgotPassword(){
	  this.router.navigateByUrl("/ChangePassword");
  }

}
