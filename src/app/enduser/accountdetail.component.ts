//
import {Component,OnInit,HostListener} from '@angular/core'
import {Router} from '@angular/router';
import { CommonService } from '../common.service';
import { SharedService } from '../shared.service';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
declare var jQuery:any;

interface userDetail {
		_id?: string,
		admin: string,
		changedAt: string,
		changedBy: string, 
		createdAt: string, 
		createdBy: string, 
		currency: string, 
		deleted: boolean, 
		email: string, 
		email_verified: string, 
		gender: string, 
		login_password: string, 
		mobile: string, 
		mobile_verified: string,
		name: string,
		user_id: string,
		walletAmount: string,
      dob: any
	}
@Component({
    //selector: 'app-root',
    templateUrl: './accountdetail.component.html',
   styleUrls: ['./accountdetail.component.css']
})
export class AppAccountDetail implements OnInit {
	router: Router;
	male: boolean;
	currencies: any = [];
	userDetail: any = {};	
	disabledMode: boolean;
	showPasswordInfoDialog: boolean = false;
	lastScroll: any = 0;
	
	constructor(private commonService: CommonService, private sharedService: SharedService, private http: Http, router: Router) { 
					this.router = router;
					var that = this;;
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
		var that = this;
		this.sharedService.sharedObj.currentContext = this;
		this.sharedService.sharedObj.containerContext.title = "My Account";	
		this.disabledMode = true;
		this.sharedService.getUserProfile(function(user){
			that.userDetail = user;
      if(user.dob && typeof user.dob === 'string'){
        var dateString:any = (user.dob).split('/'); dateString = dateString[2]+'-'+dateString[1]+'-'+dateString[0];
        that.userDetail.dob = new Date(dateString);
      }
			that.male = (that.userDetail.gender == "Male");
		});
		
		this.sharedService.onElementHeightChange();
	}
	
	
	getUserDetail(){
		this.commonService.getProfile(this.userDetail.user_id)
		  .subscribe( details => {
				if(details.unknown_device){
					this.sharedService.noDeviceRegistrationMessageBox(details.msg);
				}
				else if(details.results && details.results.length > 0){
					this.userDetail = details.results[0];
          this.sharedService.sharedObj["userProfile"] = details.results[0];
					this.sharedService.sharedObj.containerContext["userDetail"] = details.results[0];
          if(this.userDetail.dob && typeof this.userDetail.dob === 'string'){
            var dateString:any = (this.userDetail.dob).split('/'); dateString = dateString[2]+'-'+dateString[1]+'-'+dateString[0];
            this.userDetail.dob = new Date(dateString);
          }
        }
				else{
					this.sharedService.openMessageBox("E","Unable to reload.",null);
				}
			  });
	}
	
	onAccDetailEdit(evt){
		this.disabledMode = false;
	}
	
	onAccDetailSave(evt){
		if(this.sharedService.validateFields(document.getElementById('account_form'))){
			if(this.validateEmail(this.userDetail.email)
				//&& this.validatePassword(this.userDetail.login_password)
			){
				this.userDetail.gender = (this.male)? "Male": "Female";
        var dateObj = this.userDetail.dob;
        this.userDetail.dob = dateObj.getDate() +"/"+ (dateObj.getMonth() - (-1)) +"/"+ dateObj.getFullYear() ;
				this.commonService.updateProfile(this.userDetail)
				   .subscribe( data => {	
				   debugger;
					if(data.statusCode=="S"){
						this.disabledMode = true;
						this.getUserDetail();
					}
					else{
						this.sharedService.openMessageBox("E","Unable to save.",null);
					}		  
				  });
			}
		}
	}
	
	validateEmail(email){
			var regx = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ ;
			if (regx.test(email)){ 
                return true; 
            } 
			this.sharedService.openMessageBox("E","You have entered an invalid email address!",null);
            return false; 
    }
								
	validatePassword(login_password){
           //Password should be atleast 8 characters long and should contain atleast one number,one character and one special character(among - @$!%*#?&)
           var regx = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/ ;
		   if (regx.test(login_password)){ 
                return true; 
           } 
           this.sharedService.openMessageBox("E","You have entered an invalid password!",null);
           return false; 
    }
	
	onMobileEnter(evt){
	   evt.target.value = (evt.target.value).replace(/[^0-9]/g, '');
	}
	
	passwordInfo(evt){
		this.showPasswordInfoDialog = true;
	}
	
	onPasswordChangeClick(){
		if(this.userDetail.mobile)
			this.router.navigate(['/ChangePassword',this.userDetail.mobile]);
	}
	
	onEditCancel(evt){
		this.disabledMode = true;
		this.getUserDetail();
	}
	
	
	addMoney(evt){
		
	}
	
	
	
	
	
	
	@HostListener('scroll', ['$event'])
	handleScroll(event) {
		//if(!this.loading){
			var elem = jQuery(event.currentTarget);
					
			var pos = elem.scrollTop() + elem[0].offsetHeight;
			var max = elem[0].scrollHeight + (elem[0].scrollHeight * 0.15);
			var min = elem[0].scrollHeight - (elem[0].scrollHeight * 0.15);
			// pos/max will give you the distance between scroll bottom and and bottom of screen in percentage.
			if(pos <= max && pos >= min )   {
				console.log('almost reached');//
				//this.sharedService.showFooter();
			}
			var scroll = elem.scrollTop();
			if (scroll > this.lastScroll) {	//When scroll down
				this.sharedService.hideFooter();
			}
			else{
				this.sharedService.showFooter();
			}
			this.lastScroll = elem.scrollTop();
		//}
	}
	
	onEmailIDChangeClick(){
		
	}
	
}
