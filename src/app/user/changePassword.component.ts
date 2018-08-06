import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import { AuthenticationService } from '../authentication.service';
import { CommonService } from '../common.service';
import { SharedService } from '../shared.service';
//import { User } from '../user';
import { Http , Response } from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';


@Component ({
   selector: 'app-root',
   templateUrl: './changePassword.component.html',
   styleUrls: ['./changePassword.component.css'],
   providers: [CommonService] 
})
export   class   AppChangePassword  implements OnInit {
	router: Router;
	hidden: any = {mobile:false, otp:true, password:true};
	password:string = "";
	mobile:string = "";
	sendOTP: string = "Send OTP";
	confirm_password: string = '';
	otp: string = '';
	userDetail: any = {};

  constructor(private auth: AuthenticationService, private http: Http, private route: ActivatedRoute, private commonService: CommonService, private sharedService: SharedService, router: Router) { 
		this.router = router;
		var that = this;
		this.getJSON().subscribe(data => {
                                       
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
		 this.hidden = {mobile:false, otp:true, password:true};
		 var id = this.route.snapshot.params.id;
		 if(id){
			this.mobile = id;
		 }
  }
  
	onMobileEnter(evt){
	   evt.target.value = (evt.target.value).replace(/[^0-9]/g, '');
	}
  
  onkeypress(evt){
	  
  }
  
  onSendOTP(){
	if(this.mobile){
		this.commonService.sendOtp(this.mobile)
		.subscribe( data => {
			if(data.statusCode === "S"){
				this.hidden = {mobile:true, otp:false, password:true};
			}
			else{
				if(data.msg)
						this.sharedService.openMessageBox("E",data.msg,null);
					else
						this.sharedService.openMessageBox("E","Unable to send.",null);
			}
		});	
	}
	else{
		this.sharedService.openMessageBox("E","Please enter your registered mobile number.",null);
	}
  }
    
  submitOtp() {
	var that = this;
	if(this.mobile && this.otp){
			var detail = {										
					mobile: that.mobile,
					otp: that.otp
			};
			this.auth.verifyOTP(detail)
			   .subscribe( data => {
				if(data.statusCode=="S"){
					that.userDetail = data.user;
					that.hidden = {mobile:true, otp:true, password:false};
				}
				else{
					if(data.msg)
						that.sharedService.openMessageBox("E",data.msg,null);
					else
						that.sharedService.openMessageBox("E","Unable to verify.",null);
				}		  
		});
	}	  
	else{
		that.sharedService.openMessageBox("E","Please enter a valid otp.",null);
	}
	  
  }
  
  changePassword() {
	var that = this;
	if(!(this.validatePassword(this.password))){
		this.password = "";
		this.confirm_password = "";
		//that.sharedService.openMessageBox("E","Your entered password does not satisfy the criteria.",null);
	}
	else if(that.password === that.confirm_password){
		if(that.userDetail && that.userDetail.user_id){
			that.userDetail.password = that.password;
			that.userDetail.otp = that.otp;
			this.commonService.changePassword(that.userDetail)
			   .subscribe( data => {	
				if(data.statusCode=="S"){
					that.sharedService.openMessageBox("S","Password has been changed. Please login.",null);
					that.router.navigateByUrl('/');
				}
				else{
					that.sharedService.openMessageBox("E","Unable to update.",null);
				}		  
			  });
		}
		else{
			that.sharedService.openMessageBox("E","Unable to verify user detail.",null);
		}
	}
	else{
		that.sharedService.openMessageBox("E","Password is not matching.",null);
	}	  
  }
  
  validatePassword(login_password){
        //Password should be atleast 8 characters long and should contain atleast one number,one character and one special character(among - @$!%*#?&)
        var regx = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/ ;
		if (regx.test(login_password)){ 
            return true; 
        }
		this.sharedService.openMessageBox("E","You have entered an invalid password! \n ***Password should be atleast 8 characters long and should contain atleast one number,one character and one special character(among - @$!%*#?&)",null);
        
        return false; 
   }
  
  cancel() {
	  
  }
  
}