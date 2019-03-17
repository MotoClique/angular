//
import {Component,OnInit,Input} from '@angular/core';
import { Injectable }     from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import {Router} from '@angular/router';
import { CommonService } from '../common.service';
import { SharedService } from '../shared.service';
import { AuthenticationService } from '../authentication.service';
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
		walletAmount: string
	}
@Component({
      selector: 'buy-subscription',
      templateUrl: './buySubscription.component.html',
      styleUrls: ['./buySubscription.component.css']
})

@Injectable()

export class AppBuySubscription implements OnInit {
		item: any;
		hidden: any;
		disabled: any;
		userDetail: any = {};
		plans: any;
		@Input() buyItem;
		@Input() parentComponent;

      constructor(private auth: AuthenticationService, private router: Router, private http: Http, private commonService: CommonService, private sharedService: SharedService) {
                                          
	  }
     

      ngOnInit(){
		var that = this;
		this.item = {};
        this.hidden = {view: false, add: true};
        this.disabled = {field: false};
		this.plans = [{}];
		this.sharedService.getUserProfile(function(user){	
			that.userDetail = user;
			that.commonService.adminService.getSubscription("",that.buyItem.app_name)
				.subscribe( subscriptions => that.plans = subscriptions.results); 
		});
		
      }
	
	load(app_name){
		this.plans = [{}];
		this.commonService.adminService.getSubscription("",app_name)
			.subscribe( subscriptions => this.plans = subscriptions.results); 
	}
	
      onCancel(evt){
             this.parentComponent.onSubSaveCancel("");
      }
	
	onBuy(evt,plan){
		localStorage.setItem("lastRoute",this.router.url);
		var item = jQuery.extend({},plan,this.buyItem);
		item.amt_paid = plan.amount;
		item.email = this.userDetail.email;
		item.mobile = this.userDetail.mobile;
		item.deleted = false;
		item.createdBy = this.userDetail.user_id;
		item.changedBy = this.userDetail.user_id;
		this.buySubscription(item);
	}
  
	buySubscription(item){
		var that = this;
		var token = this.auth.getToken();
		var header: any = {
			headers: { Authorization: 'Bearer '+token }
		};
		this.http.post(that.auth.fullhost+"/api/public/node/buySubscription", item, header).toPromise().then(function(data: any){
			if(data.statusCode == "F"){
				var msg = "Unable to subscribe.";
				if(data.msg)
					msg = data.msg;
				that.sharedService.openMessageBox("E",msg,null);
			}
			else{
				document.open();
				document.write(data._body);
				document.close();
			}		  
		}).catch(function(err: any){
			that.sharedService.openMessageBox("E","Cannot make payment currently.",null);
		});
	}
	
	addSubscription(item){
		this.commonService.enduserService.addSubscription(item)
			   .subscribe( data => {	
			   debugger;
				if(data.statusCode=="S"){
						//this.onAddressSaveCancel("");
						//this.commonService.enduserService.getSubscription(this.userDetail.user_id,"")
							//.subscribe( result => this.subscriptions = result.subscription);
					this.onCancel("");
				}
				else{
					this.sharedService.openMessageBox("E","Unable to subscribe.",null);
				}		  
		});
	}


}
