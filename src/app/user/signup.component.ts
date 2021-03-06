import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import { AuthenticationService } from '../authentication.service';
import { CommonService } from '../common.service';
import { SharedService } from '../shared.service';
import { Http , Response } from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
declare var jQuery:any;

interface hidden {
  signup: boolean,
  profile: boolean
}

@Component ({
   selector: 'app-root',
   templateUrl: './signup.component.html',
   styleUrls: ['./signup.component.css'],
   providers: [CommonService] 
})
export   class   AppSignup  implements OnInit {
	router: Router;
	hidden: hidden;
	login_password:string = "";
	confirm_password:string = "";
	login_mobile:string = "";
	sendOTP: string = "";
	loginError: string = '';
	login_otp: string = '';
	
	newUser: any = {};
	user_id:string = "";
	male: boolean = true;
	loginByPassword: boolean = true;
	currencies: any = [];

  constructor(private auth: AuthenticationService, private http: Http, private commonService: CommonService, private sharedService: SharedService, router: Router) { 
		this.router = router;
		var that = this;
		this.getJSON().subscribe(data => {
                                           that.currencies = data.currencies;
                     }, error => {
                                  console.log(error);
                     });
  }
  
  public getJSON(): Observable<any> {
                          return this.http.get("./assets/local.json")
                                   .map((res) => res.json());
  }

  ngOnInit() {
	this.sendOTP = 'Send OTP'; 
	this.hidden = {
		signup: false,
		profile: true
	};
	jQuery("#brandlogo").fadeOut(2000,function(){
		jQuery("#approot").fadeIn(2000,function(){});
	});
  }
  
  onSendOTP(){
	this.loginError = "";
	this.sendOTP = "Resend OTP";
	if(this.login_mobile){
		if(this.login_mobile.length === 10){
			this.auth.sendOtp(this.login_mobile)
				.subscribe( data => {

			});
		}
		else{
			this.loginError = "Please enter a valid mobile number.";
		}
	}
	else{
		this.loginError = "Please enter your mobile number.";
	}	  
  }
  
  onKeypress(evt){
	this.loginError = "";
  }
  
  validatePassword(login_password){
        //Password should be atleast 8 characters long and should contain atleast one number,one character and one special character(among - @$!%*#?&)
        var regx = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/ ;
		if (regx.test(login_password)){ 
            return true; 
        } 
        this.loginError = "You have entered an invalid password! \n ***Password should be atleast 8 characters long and should contain atleast one number,one character and one special character(among - @$!%*#?&)";
        return false; 
  }
	
	onMobileEnter(evt){
	   evt.target.value = (evt.target.value).replace(/[^0-9]/g, '');
	   this.onKeypress(evt);
	}
  
  onSubmit() {
	if(!(this.validatePassword(this.login_password))){
		this.login_password = "";
		this.confirm_password = "";
		return false;  
	}
	  
	var that = this;	  
	var login_mobile = this.login_mobile;
	var login_password = this.login_password;
	var login_otp = this.login_otp;
	  
	if(login_mobile && (login_mobile.length === 10) && login_otp && login_password){
		if(this.login_password === this.confirm_password){
				 var user = {
								user_id: "",
								admin: '',
								mobile: login_mobile,
								password: login_password,
								otp: login_otp
							};
				this.auth.register(user)
				   .subscribe( data => {	
					if(data.statusCode=="S"){
						that.hidden = {
							 signup: true,
							 profile: false
						};
						this.commonService.getProfile(data.results.user_id)
						   .subscribe( res => {
									   if(res.error){
										   that.sharedService.openMessageBox("E","Unable to fetch profile.",null);
									   }
									   else{
										   if(res.unknown_device){
												that.sharedService.noDeviceRegistrationMessageBox(res.msg);
										   }
										   else if(res.results && res.results.length>0){
											 that.newUser = res.results[0];
										   }
										   else{
											   that.newUser = {};
										   }
									   }
						});
					}
					else{
						if(data.msg)
							that.loginError = data.msg;
						else
							that.loginError = "Unable to sign up.";
					}		  
				});
		}
		else{
			that.loginError = "Password not matching.";
		}
	}	  
	else{
		that.loginError =  "Please enter a valid credential.";
	}  
  }
  
  gotoSignIn(){
	this.router.navigateByUrl('/');
  }
  
  onUpdate() {
	var that = this;
	that.newUser.gender = (that.male)?'Male':'Female' ;
	var dateObj = this.newUser.dobobj;
	if(dateObj)
		this.newUser.dob = dateObj.getDate() +"/"+ (dateObj.getMonth() - (-1)) +"/"+ dateObj.getFullYear() ;	
	  
	if(that.newUser.name){
		this.commonService.updateProfile(that.newUser)
		.subscribe( data => {	
			if(data.statusCode=="S"){
				that.router.navigateByUrl('/Container');
			}
			else{
				that.sharedService.openMessageBox("E","Unable to update.",null);
			}		  
		});
	}
	else{
		that.sharedService.openMessageBox("E","Please enter the required fields.",null);
	}  
  }
  
  onUpdateCancel() {
	this.router.navigateByUrl('/Container');
  }
  
  onEmailEnter(evt){
	if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(evt.target.value))){ 
		evt.target.value = "";
	}                                                 
  }

}
