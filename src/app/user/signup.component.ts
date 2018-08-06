import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import { AuthenticationService } from '../authentication.service';
import { CommonService } from '../common.service';
import { SharedService } from '../shared.service';
//import { User } from '../user';
import { Http , Response } from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

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
	//user: User;
	router: Router;
	hidden: hidden;
	//mobile:string;
	login_password:string = "";
	confirm_password:string = "";
	login_mobile:string = "";
	sendOTP: string = "";
	loginError: string = '';
	login_otp: string = '';
	
	newUser: any = {};
	user_id:string = "";
	//name: string = "";
	//email: string = "";
	male: boolean = true;
	//selectedCurrency: string = "";
	loginByPassword: boolean = true;
	//amount: string = "";
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
                                   .map((res) => res.json())
                                   //.catch((error) => console.log(error));
  }

  ngOnInit() {
	  	 this.sendOTP = 'Send OTP'; 
		 this.hidden = {
			 signup: false,
			 profile: true
		 };
  }
  
  onSendOTP(){
	  this.loginError = "";
	  this.sendOTP = "Resend OTP";
	  if(this.login_mobile){
		  this.commonService.sendOtp(this.login_mobile)
			   .subscribe( data => {
			   
			  });	
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
		return false;  
	  }
	  
	  var that = this;	  
	  var login_mobile = this.login_mobile;
	  var login_password = this.login_password;
	  var login_otp = this.login_otp;
	  
	 if(login_mobile && login_otp && login_password){
			if(this.login_password === this.confirm_password){
				  /*this.commonService.loginByOtp(login_mobile,login_otp)
				   .subscribe( data => {	
					if(data[0] && data[0].mobile == login_mobile && data[0].otp == login_otp){*/
						var user = {
										user_id: "",
										admin: '',
										mobile: login_mobile,
										password: login_password,
										otp: login_otp
									};
						this.auth.register(user)
						   .subscribe( data => {	
						   //debugger;
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
									   else if(res.results.length>0){
										 that.newUser = res.results[0];
									   }
									   else{
										   that.newUser = {};
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
	  //that.newUser.name = that.name;
	  that.newUser.gender = (that.male)?'Male':'Female' ;
	  //that.newUser.email = that.email ;
	//that.newUser.login_password = login_password ;
	  //that.newUser.currency = that.selectedCurrency ;
	  //that.newUser.walletAmount = that.amount ;	
	  
	  if(that.newUser.name && that.newUser.email){
		  this.commonService.updateProfile(that.newUser)
		   .subscribe( data => {	
		   //debugger;
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