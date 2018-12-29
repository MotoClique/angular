//
import {Component,OnInit,HostListener} from '@angular/core'
import {Router, ActivatedRoute} from '@angular/router';
import { CommonService } from '../common.service';
import { SharedService } from '../shared.service';
declare var jQuery:any;
declare var gMap:any;

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
		//selector: 'app-root',
		templateUrl: './address.component.html',
		styleUrls: ['./address.component.css']
})
export class AppAddress implements OnInit {
		addresses: any;
		item: any;
		countries: any = [];
		states: any = [];
		cities: any = [];
		localities: any = [];
		hidden: any;
		disabled: any;
		userDetail: any = {};
		showPostListDialog: boolean = false;
		posts: any = [];
		lastScroll: any = 0;

		constructor(private router: Router, private route: ActivatedRoute, private sharedService: SharedService, private commonService: CommonService) {
			this.router = router;
		} 

		ngOnInit(){
				var that = this;
				this.sharedService.sharedObj.currentContext = this;
				this.sharedService.sharedObj.containerContext.title = "My Address";	
                this.addresses = [];
                this.item = {};
                //this.countries = [{name:"India"}];
                //this.states = [{name:"Karnataka"}];
                //this.cities = [{name:"Bengaluru"}];
                //this.localities = [{name:"Koramangala"},{name:"Jayanagar"},{name:"Whitefield"}];
                this.hidden = {view: false, add: true};
                this.disabled = {field: false};
				this.sharedService.getUserProfile(function(user){
					that.userDetail = user;
					that.commonService.adminService.getCountry()
					.subscribe( result => that.countries = result.results);
					var id = that.route.snapshot.params.id;
					var mode = that.route.snapshot.params.mode;
					if(id && id !== 'blank'){
							that.commonService.enduserService.getAddress("",id)
							  .subscribe( data => {
								  if(data.results.length > 0){
									var item = data.results[0];									
									that.item = item;
									if(mode === 'edit'){
										that.goEditMode();
									}else{
										that.displayAddress();
									}
								  }
								  else{
									 that.sharedService.openMessageBox("E","No data found.",null);
								  }
							});
						}
						else if(id === 'blank' && mode === 'create'){							
							that.goCreateMode();							
						}
						else{
							that.commonService.enduserService.getAddress(that.userDetail.user_id,"")
							.subscribe( result => that.addresses = result.results);
						}
				});
				this.sharedService.onElementHeightChange();
		}

		onAddressClick(evt,data){
            this.router.navigate(['/Container/Address',data.address_id]);
		}
		
		displayAddress(){
			this.hidden = {view: true, add: false};
            this.disabled = {field: true};
            //this.item = data;
			var map_point = this.item.map_point.split("/");
			this.loadGoogleMap(map_point[0],map_point[1]);
			document.getElementById('searchBoxContainer').style.display = "none";
		}
		
		onEdit(evt,doc){
			this.router.navigate(['/Container/Address',doc.address_id,'edit']);
			//document.getElementById('searchBoxContainer').style.display = "none";
		}
		
		goEditMode(){
			this.hidden = {view: true, add: false};
			this.disabled = {field: false};
			//this.item = doc;
			this.getCountry();
			this.getState((this.item.country?this.item.country:''));
			this.getCity((this.item.state?this.item.state:''));
			this.getUniqueLoc((this.item.city?this.item.city:''));
			var map_point = this.item.map_point.split("/");
			this.loadGoogleMap(map_point[0],map_point[1]);
		}
		
		onDelete(evt,doc){
			var that = this;
			if(this.addresses && this.addresses.length<=1){
				this.sharedService.openMessageBox("E","At least one address should be maintained.",null);
			}
			else{
				this.sharedService.openMessageBox("C","Are you sure you want to delete it?",function(flag){
					if(flag){			   
						  doc.deleted = true;
						  that.commonService.enduserService.updateAddress(doc)
							 .subscribe( data => {
								that.sharedService.closeMessageBox();
								if(data.statusCode=="S"){
									that.commonService.enduserService.getAddress(that.userDetail.user_id,"")
										.subscribe( result => that.addresses = result.results);
								}
								else{
									if(data.msg){										
										if(data.posts){
											that.sharedService.openMessageBox("E",data.msg,function(){
												that.posts = data.posts;
												that.showPostListDialog = true;
											});
										}
										else{
											that.sharedService.openMessageBox("E",data.msg,null);
										}
									}
									else{
										that.sharedService.openMessageBox("E","Unable to delete.",null);
									}
								}		  
							  }); 
					}
				});
			}
		}

		onAddressAdd(evt){
            this.router.navigate(['/Container/Address','blank','create']);
		}
		
		goCreateMode(){
			this.hidden = {view: true, add: false};
            this.disabled = {field: false};
			this.item = {};
			this.commonService.adminService.getCountry()
				.subscribe( result => this.countries = result.results);
			this.loadGoogleMap("","");
			document.getElementById('searchBoxContainer').style.display = "block";
		}

		onAddressSave(evt){
			if(this.sharedService.validateFields(document.getElementById('address_form'))){
				this.item.user_id = this.userDetail.user_id;
				this.item.name = this.userDetail.name;
				this.item.mobile = this.userDetail.mobile;
				this.item.map_point = gMap.latitude + "/" + gMap.longitude ;
				if(this.item.address_id){
					this.commonService.enduserService.updateAddress(this.item)
					   .subscribe( data => {	
					   //debugger;
						if(data.statusCode=="S"){
							this.onAddressSaveCancel("");
						}
						else{
							this.sharedService.openMessageBox("E","Unable to update.",null);
						}		  
					  });
				}
				else{
					this.commonService.enduserService.addAddress(this.item)
					   .subscribe( data => {	
					   //debugger;
						if(data.statusCode=="S"){
							this.onAddressSaveCancel("");
						}
						else{
							this.sharedService.openMessageBox("E","Unable to save.",null);
						}		  
					  });
				}
			}
		}

		onAddressSaveCancel(evt){
				/*this.commonService.enduserService.getAddress(this.userDetail.user_id,"")
					.subscribe( result => this.addresses = result.results);
                this.hidden = {view: false, add: true};*/
			this.router.navigateByUrl('/Container/Address');
		}


		//Google Map
		loadGoogleMap(lat,lng){
                gMap.load(null,null,function(lat,lng){},lat,lng);
				document.getElementById('googleMap_address').innerHTML = "";
				if(gMap.content)
					document.getElementById('googleMap_address').appendChild(gMap.content);
				//document.getElementsByClassName('gMapSearchStyle')[0].style.display = "none";
		}
		
		locate(evt){
                var src = evt.source.ngControl.name;
                if(evt.value){
                        var address = "";
                        switch (src){
                            case "country":
                                if( this.item.state && this.item.city && this.item.locality ){
                                     address =   this.item.locality +", "+ this.item.city +", "+ this.item.state +", "+ evt.value;
                                }
								this.getState(evt.value);
								break;
								
							case "state":
                                if(this.item.country && this.item.city && this.item.locality ){
                                      address =   this.item.locality +", "+ this.item.city +", "+ evt.value +", "+ this.item.country;
                                }
								this.getCity(evt.value);
                                break;
								
							case "city":
                               if(this.item.country && this.item.state && this.item.locality){
                                    address =   this.item.locality +", "+ evt.value +", "+ this.item.state +", "+ this.item.country;
                                }
								this.getUniqueLoc(evt.value);
                                break;
								
                            case "locality":
                                if(this.item.country && this.item.state && this.item.city ){
                                     address =   evt.value +", "+ this.item.city +", "+ this.item.state +", "+ this.item.country;
                                }
                                break;
                                                           
                        }
                        gMap.locate(address);
                }
        }
		
		getCountry(){
			this.commonService.adminService.getCountry()
					.subscribe( result => this.countries = result.results);
		}

		getState(country){
			this.commonService.adminService.getState(country)
					.subscribe( result => this.states = result.results);
		}
		getCity(state){
			this.commonService.adminService.getCity(state)
					.subscribe( result => this.cities = result.results);
		}
		getUniqueLoc(city){
			this.commonService.adminService.getUniqueLoc(city)
					.subscribe( result => this.localities = result.results);
		}
		
		onPinEnter(evt){
			if(evt.target.nodeName === 'INPUT'){
				var val = evt.target.value;
				this.item.pin_code = val.replace(/\D/g,'');
			}
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
 

}