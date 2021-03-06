//
import {Component,OnInit,ElementRef,Input,ViewChild} from '@angular/core';
import { Injectable }     from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import {Router} from '@angular/router';
import { MatTabChangeEvent } from '@angular/material';
import { CommonService } from '../../common.service';
import { SharedService } from '../../shared.service';
import {Observable} from 'rxjs/Rx';
import { AuthenticationService } from '../../authentication.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
declare var jQuery:any;
declare var gMap:any;

@Component({
      selector: 'service-form',
      templateUrl: './serviceForm.component.html',
      styleUrls: ['./serviceForm.component.css'],
      providers: [CommonService]
})

@Injectable()
export class AppServiceForm implements OnInit {
		serviceItem: any = {};
		localData: any;
		hidden: any;
		disabled: any;
		userDetail: any = {};
		token: string = "";
		showRateUsDialog: boolean = false;
		showFeedbackDialog: boolean = false;
		showDialog: boolean = false;
		feedbackComment: any = {subject:"", details:""};
		feedbacks: any = [];
		userRating: string = "";
		serviceContact: any = {};
		address: any = [];
		showAddressListDialog: boolean = false;
		myRating: string = '';
		@Input() item;
		//@Input() ownItem;
		@Input() parentComponent;
		@Input() editMode;
		
		@ViewChild('serviceTabGroup') serviceTabGroup;
		
      constructor(private router: Router, private auth: AuthenticationService, private http: Http, private commonService: CommonService, private sharedService: SharedService,private elementRef:ElementRef) {
                     this.router = router;
                     this.token = this.auth.getToken();
					 var that = this;;
                     this.getJSON().subscribe(data => {
                                   that.localData = data;        
                     }, error => {
                                  console.log(error);
                     });
	  }
      public getJSON(): Observable<any> {
                          return this.http.get("./assets/local.json")
                                   .map((res) => res.json())
                                   //.catch((error) => console.log(error));
      }

      ngOnInit(){
				var that = this;
                this.hidden = {view: false, add: true};
                this.disabled = {field: false};
				this.sharedService.getUserProfile(function(user){
					that.userDetail = user;
				});
      }
	  
	  loadService(itm){
		  if(itm.service_id){
			  this.commonService.enduserService.getService("",itm.service_id,"",null,null,null)
					.subscribe( data => {
							if(data.results.length > 0){
									this.serviceItem = data.results[0];
									this.parentComponent.item = data.results[0];
									this.serviceItem.transactionTyp = "Service";
							}
							else{
								this.sharedService.openMessageBox("E","No data found.",null);
							}
			  
						  this.prepareRatingData();
						  if(itm.service_id)
							this.loadRatingFeedback();
						
				});
		  }
		  else{
			  this.serviceItem = itm;
		  }
		  this.serviceTabGroup.selectedIndex = 0;
	  }
  
    prepareRatingData(){
			//this.serviceItem = itm;
			var no_of_rating = this.serviceItem.no_of_rating ? this.serviceItem.no_of_rating : '0';
			if(no_of_rating == '0'){
				this.serviceItem.fiveStar = 0 + '%';
				this.serviceItem.fourStar = 0 + '%';
				this.serviceItem.threeStar = 0 + '%';
				this.serviceItem.twoStar = 0 + '%';
				this.serviceItem.oneStar = 0 + '%';
			}
			else{
				this.serviceItem.fiveStar = ((this.serviceItem.no_of_five_star ? this.serviceItem.no_of_five_star : '0')/(no_of_rating)) * 100 + '%';
				this.serviceItem.fourStar = ((this.serviceItem.no_of_four_star ? this.serviceItem.no_of_four_star : '0')/(no_of_rating)) * 100 + '%';
				this.serviceItem.threeStar = ((this.serviceItem.no_of_three_star ? this.serviceItem.no_of_three_star : '0')/(no_of_rating)) * 100 + '%';
				this.serviceItem.twoStar = ((this.serviceItem.no_of_two_star ? this.serviceItem.no_of_two_star : '0')/(no_of_rating)) * 100 + '%';
				this.serviceItem.oneStar = ((this.serviceItem.no_of_one_star ? this.serviceItem.no_of_one_star : '0')/(no_of_rating)) * 100 + '%';
			}
			
	  }
  
	  onTabClick(event: MatTabChangeEvent) {
		var tabname= event.tab.textLabel;
		if(tabname == "Details"){
			var mandatFieldCheck = this.sharedService.validateFields(jQuery('.detail-form')[0]);
		}
		else if(tabname === 'Contact'){
			//if(this.serviceItem.address_id)
				this.loadContact(this.serviceItem.address_id);
			//else
				//this.loadContact('');
		}
	}
	  
	  loadContact(address_id){
		  if(address_id){
				this.commonService.enduserService.getAddress("",address_id)
					.subscribe( result => {
						if(result.results.length>0){
							this.serviceContact = result.results[0];
							//this.serviceContact.name = this.serviceItem.name;
							//this.serviceContact.mobile = this.serviceItem.mobile;
							
							var map_point = result.results[0].map_point.split("/");
							this.loadGoogleMap(map_point[0],map_point[1]);
						}
						else{
							this.sharedService.openMessageBox("E","No contact details found.",null);
						}
				});
		  }
		  else{
				this.commonService.enduserService.getAddress(this.userDetail.user_id,"")
					.subscribe( result => {
						if(result.results.length>1 && this.editMode){
							this.showAddressListDialog = true;
							this.showFeedbackDialog = false;
							this.showRateUsDialog = false;
							this.showDialog = true;
							this.address = result.results;
						}
						else if(result.results.length===1){
							this.serviceContact = result.results[0];
							//this.serviceContact.name = this.userDetail.name;
							//this.serviceContact.mobile = this.userDetail.mobile;
							this.serviceItem.city = result.results[0].city;
							this.serviceItem.location = result.results[0].location;
							
							var map_point = result.results[0].map_point.split("/");
							this.loadGoogleMap(map_point[0],map_point[1]);
							
							this.serviceItem.address_id = result.results[0].address_id;
						}
						else{
							this.sharedService.openMessageBox("E","You have no contact details maintained.",null);	
						}
				});
		  }
		  //this.serviceContact;
	  }
	  
	  onAddressSelect(evt,address){
		this.serviceContact = address;
		//this.serviceContact.name = this.userDetail.name;
		//this.serviceContact.mobile = this.userDetail.mobile;
		this.serviceItem.name = this.userDetail.name;
		this.serviceItem.mobile = this.userDetail.mobile;
		this.serviceItem.city = address.city;
		this.serviceItem.location = address.location;
		
		var map_point = address.map_point.split("/");
		this.loadGoogleMap(map_point[0],map_point[1]);
		this.serviceItem.address_id = address.address_id;
		
		this.showAddressListDialog = false;
		this.showFeedbackDialog = false;
		this.showRateUsDialog = false;
		this.showDialog = false;
	  }
	  
	  onAddressChangeClick(){
		  this.loadContact('');
	  }
	  
	  //Google Map
		loadGoogleMap(lat,lng){
                gMap.load(null,null,function(lat,lng){},lat,lng);
				document.getElementById('googleMap_contact').innerHTML = "";
				if(gMap.content)
					document.getElementById('googleMap_contact').appendChild(gMap.content);
				if(document.getElementById('searchBoxContainer'))
					document.getElementById('searchBoxContainer').style.display = "none";
		}
	  
	  rateUs(){
		  this.myRating = '';
		  this.commonService.enduserService.getRating(this.userDetail.user_id,this.serviceItem.service_id)
			.subscribe( data => {	
				if(data.results && data.results.length > 0){
					this.myRating = data.results[0].rating;
				}
				this.showRateUsDialog = true;
				this.showFeedbackDialog = false;
				this.showDialog = true;
			});
	  }
	  provideFeebback(){
		  this.commonService.enduserService.getRating(this.userDetail.user_id,this.serviceItem.service_id)
			.subscribe( data => {	
			   if(data.results.length > 0){
					this.userRating = data.results[0].rating;					
					this.showRateUsDialog = false;
					this.showFeedbackDialog = true;
					this.showDialog = true;
			   }
			   else{
					this.showRateUsDialog = true;
					this.showFeedbackDialog = false;
					this.showDialog = true;
			   }
			});
		  		  
	  }
	  
	  onRate(evt){
		 //var rating = evt.srcElement.htmlFor;
		 var saveItem:any = {};
		 saveItem.service_id = this.serviceItem.service_id;
		 saveItem.rating = evt.srcElement.htmlFor;
		 this.commonService.enduserService.addRating(saveItem)
			.subscribe( data => {	
			   //debugger;
				if(data.statusCode=="S"){
					this.userRating = saveItem.rating;
					if(data.updatedService){
						this.serviceItem = data.updatedService;
						this.parentComponent.item = data.updatedService;
						this.serviceItem.transactionTyp = "Service";
						this.prepareRatingData();
					}
					this.showRateUsDialog = false;
					this.showFeedbackDialog = true;
					this.showDialog = true;
				}
				else{
					this.sharedService.openMessageBox("E","Unable to rate.",null);
				}
			});
		 
		 		 
	  }
	  onFeedbackSubmit(evt){
		 var saveItem:any = {};
		 saveItem.service_id = this.serviceItem.service_id;
		 saveItem.subject = this.feedbackComment.subject;
		 saveItem.details = this.feedbackComment.details;
		 saveItem.user_rating = this.userRating;
		 saveItem.user_id = this.userDetail.user_id;
		 saveItem.user_name = this.userDetail.name;
		 this.commonService.enduserService.addFeedback(saveItem)
			.subscribe( data => {	
			   //debugger;
				if(data.statusCode=="S"){
          if(data.result)
						this.feedbacks.push(data.result);
					//this.loadService(this.serviceItem);
				}
				else{
					this.sharedService.openMessageBox("E","Unable to rate.",null);
				}
			});
		this.showRateUsDialog = false;
		this.showFeedbackDialog = false;
		this.showDialog = false;	
	  }
	  
	  updateStartAmt(evt,amt){
		  //this.parentComponent.item.start_from_amount = amt;
		  this.serviceItem.start_from_amount = this.serviceItem.start_from_amount.replace(/\D/g,'');
		  this.parentComponent.item.start_from_amount = this.serviceItem.start_from_amount;
	  }
	  
	  
	  loadRatingFeedback(){		  
		  this.commonService.enduserService.getFeedback("",this.serviceItem.service_id)
			.subscribe( data => {	
			   //debugger;
			   this.feedbacks = data.results;
			});
	  }
	  
	  onThumbsUp(feedback){
		  this.commonService.enduserService.getThumbsUp(this.userDetail.user_id,'',feedback.feedback_id)
			.subscribe( data => {
				if(data.results && data.results.length<=0){
				  var saveItem:any = {
					  service_id: this.serviceItem.service_id,
					  active: true,
					  feedback_id: feedback.feedback_id
				  };
				  this.commonService.enduserService.addThumbsUp(saveItem)
					.subscribe( data => {	
					   //debugger;
						if(data.statusCode=="S"){
							this.parentComponent.openItem(this.serviceItem);
              if(isNaN(feedback.thumbs_up_no))
                feedback.thumbs_up_no = '1';
              else
                feedback.thumbs_up_no = feedback.thumbs_up_no - (-1);
						}
						else{
							this.sharedService.openMessageBox("E","Unable to Thumbs Up.",null);
						}
					});
				}
			});
	  }
	  
	  onThumbsDown(feedback){
		  this.commonService.enduserService.getThumbsDown(this.userDetail.user_id,'',feedback.feedback_id)
			.subscribe( data => {
				if(data.results && data.results.length<=0){
					   var saveItem:any = {
						  service_id: this.serviceItem.service_id,
						  active: true,
						  feedback_id: feedback.feedback_id
					  };
					  this.commonService.enduserService.addThumbsDown(saveItem)
						.subscribe( data => {	
						   //debugger;
							if(data.statusCode=="S"){
								this.parentComponent.openItem(this.serviceItem);
                if(isNaN(feedback.thumbs_down_no))
                  feedback.thumbs_down_no = '1';
                else
                  feedback.thumbs_down_no = feedback.thumbs_down_no - (-1);
							}
							else{
								this.sharedService.openMessageBox("E","Unable to Thumbs Down.",null);
							}
						});
				}
			});
	  }
	  
	  
	  requiredFieldCheck(){
		  this.serviceTabGroup.selectedIndex = 0;
		  return this.sharedService.validateFields(jQuery('.detail-form')[0]);
	  }

	formatDate(d){
		if(d){
			var dateObj = new Date(d);
			return dateObj.getDate()+'/'+(dateObj.getMonth() - (-1))+'/'+dateObj.getFullYear();
		}
		else{
			return '';
		}
	}	
}
