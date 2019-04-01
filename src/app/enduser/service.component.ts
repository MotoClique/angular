//
import {Component,OnInit,ElementRef,ViewChild,HostListener} from '@angular/core';
import { Injectable }     from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import {Router, ActivatedRoute} from '@angular/router';
import { CommonService } from '../common.service';
import { SharedService } from '../shared.service';
import { AppServiceForm } from './reusable/serviceForm.component';
import { AppImageTemplate } from './reusable/imageTemplate.component';
import { AppTileTemplate } from './reusable/tileTemplate.component';
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
      //selector: 'app-root',
      templateUrl: './service.component.html',
      styleUrls: ['./service.component.css'],
      providers: [CommonService]
})

@Injectable()
export class AppService implements OnInit {
		localData: any;
		item: any = {};
		image_item: any;
		hidden: any;
		disabled: any;
		userDetail: any = {};
		showListDialog: boolean = false;
		showProductListDialog: boolean = false;
		showProductTypeListDialog: boolean = false;
		//showBrandListDialog: boolean = false;
		productTypes: any = [];
		//brands: any = [];
		products: any = [];
		fields: any = [];
		screenConfig: any = {};
		selectedPrdTyp: string = "";
		self: any = this;
		editMode: boolean = false;
		detail: boolean = false;
		results: any = [];
		screenMode: any = {add:false, edit:false};
		params: any = {count:null, skip:0, limit:10};
		loading: boolean = false;
		targetUrl: string = "";
		addresses: any = [];
		done: boolean = false;
		showAddressListDialog: boolean = false;
		lastScroll: any = 0;
		noMoreData: boolean = false;
		service_term: string = '';
		@ViewChild(AppServiceForm) serviceFormComponent: AppServiceForm;
		@ViewChild(AppImageTemplate) imageTemplateComponent: AppImageTemplate;
		@ViewChild(AppTileTemplate) tileTemplateComponent: AppTileTemplate;
		
      constructor(private router: Router, private route: ActivatedRoute, private http: Http, private commonService: CommonService, private sharedService: SharedService,private elementRef:ElementRef) {
                     this.router = router;
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
				this.item = {};
				this.sharedService.sharedObj.currentContext = this;
				this.image_item = [];
                
				this.sharedService.sharedObj.containerContext.title = "My Services";
				this.sharedService.onElementHeightChange();
      }
	  
	  ngAfterViewInit(){
				var that = this;
                this.hidden = {view: false, add: true};
                this.disabled = {field: false, save: false};
				this.sharedService.getUserProfile(function(user){
					that.userDetail = user;
					if(that.userDetail.user_id){
						var id = that.route.snapshot.params.id;
						var mode = that.route.snapshot.params.mode;
						if(id && id !== 'blank' && id !== 'new'){
							that.commonService.enduserService.getService("",id,"",null,null,null)
							  .subscribe( data => {
								  if(data.results.length > 0){
									var item = data.results[0];									
									that.item = item;
									that.item.transactionTyp = "Service";
									that.serviceFormComponent.serviceItem = that.item;
									that.imageTemplateComponent.item = that.item;
									if(mode === 'edit'){
										that.goEditMode();
									}else{
										that.detail = true;
										that.editMode = false;
										that.screenMode = {add:false, edit:false};
										that.serviceFormComponent.loadService(item);
										that.imageTemplateComponent.getTransactionThumbnails(item.service_id);
									}
                    
                    if(that.item.user_id !== that.userDetail.user_id)
										  that.sharedService.sharedObj.containerContext.title = "Services";
								  }
								  else{
									  that.sharedService.openMessageBox("E","No data found.",null);
								  }
								});
						}
            else if(id === 'new'){
							that.createNew(null);
						}
						else if(id === 'blank' && mode === 'create'){
							that.item = jQuery.extend(true, {}, that.sharedService.sharedObj.postItem);
							that.serviceFormComponent.serviceItem = that.item;
							that.imageTemplateComponent.item = that.item;
							if(that.item.product_id){
								that.goCreateMode();
							}
							else{
								that.router.navigateByUrl('/Container/Service');
							}
						}
						else{
							if(that.sharedService.sharedObj.backUpData['service']){
								that.params = that.sharedService.sharedObj.backUpData['service'].params;
								that.results = that.sharedService.sharedObj.backUpData['service'].results;
							}
							else{
								that.loading = true;
								that.commonService.enduserService.getService(that.userDetail.user_id,"","",null,0,10)
								  .subscribe( data => {
									  if(!(that.results) || that.results.length<=0){
										  that.lastScroll = 0;
										  that.noMoreData = false;
									  }
									  if(data.results && data.results.length<=0){
											that.noMoreData = true;
									  }
									  that.params = data.params;
									  that.results = data.results;
									  jQuery.each(that.results,function(i,v){
											v.busy = true;
											that.getResultImage(v);
										});
										
										if(that.sharedService.sharedObj.backUpData){
											that.sharedService.sharedObj.backUpData['service'] = {params: that.params, results: that.results};
										}
									that.loading = false;
								});
							}
						}						
					}
				});
	  }
	  
	  
	  getResultImage(item){
		  this.commonService.enduserService.getImage(this.userDetail.user_id,"",item.service_id)
			  .subscribe( prdImages => {			  
					  var prdImage = prdImages.results;
					  if(prdImage.length > 0){
						  var base64string = this.arrayBufferToBase64(prdImage[0].data.data);
						  item.data = "data:"+prdImage[0].type+";base64,"+base64string;
					  }
					  item.busy = false;
			  });
	  }
	  
	  arrayBufferToBase64( buffer ) {
		var binary = '';
		var bytes = new Uint8Array( buffer );
		var len = bytes.byteLength;
		for (var i = 0; i < len; i++) {
			binary += String.fromCharCode( bytes[ i ] );
		}
		return window.btoa( binary );
	}
	  
	  createNew(evt){
		this.item = {};
		this.commonService.adminService.getProductType("")
			.subscribe( productTypes => {
				if(productTypes.results){
					this.productTypes = productTypes.results.filter(function(ele){
						return ele.product_type_name !== 'Service' ;
					});
				}
				if(this.productTypes && this.productTypes.length==1){
					this.onPrdTypSelect(null,this.productTypes[0]);
				}
				else{
					this.showProductListDialog = false;
					this.showProductTypeListDialog = true;					
				}
		});		
		this.showListDialog = true;
		this.showAddressListDialog = false;
	  }
	  
	  openItem(item){
		if(item.user_id == this.userDetail.user_id)
			this.router.navigate(['/Container/Service',item.service_id,'edit']);
		else
			this.router.navigate(['/Container/Service',item.service_id]);
	  }
	  
	  onPrdTypSelect(evt,prdTyp){
			this.selectedPrdTyp = prdTyp.product_type_id;
			this.commonService.adminService.getServiceProduct(this.selectedPrdTyp)
				.subscribe( service => {
					this.products = service.results;
					this.products.sort((a: any, b: any)=> {
												if (a.product_id < b.product_id)
												  return -1;
												if ( a.product_id > b.product_id)
												  return 1;
												return 0;
											});//ascending sort
					if(this.products && this.products.length==1){
						this.onPrdSelect(null,this.products[0]);
					}
					else{
						this.showProductTypeListDialog = false;
						this.showProductListDialog = true;
						//this.showBrandListDialog = true;
					}
			});			
	  }
	 	  
	  
	  onPrdSelect(evt,prd){
		  this.item.product_id = prd.product_id;
		  this.item.product_type_id = prd.product_type_id;
		  this.item.product_type_name = prd.product_type_name;
		  this.item.brand_id = prd.brand_id;
		  this.item.brand_name = prd.brand_name;
		  this.item.model = prd.model;
		  this.item.transactionTyp = "Service";
		  this.showProductListDialog = false;
		  this.showListDialog = false;
		  
		this.getDefaultAddress();
		//this.serviceFormComponent.loadService(this.item);
		//this.detail = true;
		//this.editMode = true;
		//this.screenMode = {add:true, edit:false};
		//this.imageTemplateComponent.getThumbnails(prd.product_id);		
	  }
	  
	  getDefaultAddress(){
		  var that = this;
		  this.commonService.enduserService.getAddress(this.userDetail.user_id,"")
				.subscribe( result => {
					that.addresses = result.results;
					if(that.addresses[0])
						that.item.address_id = that.addresses[0].address_id;
					for(var i=0; i<that.addresses.length; i++){
						if(that.addresses[i].default_flag){
							that.item.address_id = that.addresses[i].address_id;
							break;
						}
					}
					if(that.addresses.length && that.addresses.length>1){
						that.showAddressListDialog = true;
						that.showListDialog = true;						
					}
					else{
						that.sharedService.sharedObj.postItem = jQuery.extend(true, {},that.item);
						that.router.navigate(['/Container/Service','blank','create']);
						/*that.serviceFormComponent.loadService(that.item);
						that.detail = true;
						that.editMode = true;
						that.screenMode = {add:true, edit:false};
						that.imageTemplateComponent.getThumbnails(that.item.product_id);*/	
					}
				});
	  }
	  
	  onAddressSelect(evt,add){
		this.item.address_id = add.address_id;
		this.showAddressListDialog = false;
		this.showListDialog = false;
		
		this.sharedService.sharedObj.postItem = jQuery.extend(true, {},this.item);
		this.router.navigate(['/Container/Service','blank','create']);
		/*this.serviceFormComponent.loadService(this.item);
		this.detail = true;
		this.editMode = true;
		this.screenMode = {add:true, edit:false};
		this.imageTemplateComponent.getThumbnails(this.item.product_id);*/
	  }
	  
	  goCreateMode(){
		this.serviceFormComponent.loadService(this.item);
		this.detail = true;
		this.editMode = true;
		this.screenMode = {add:true, edit:false};
		this.imageTemplateComponent.getThumbnails(this.item.product_id);
	  }
	  	  
	  save(saveItem){
			saveItem.user_id = this.userDetail.user_id;
			saveItem.name = this.userDetail.name;
			saveItem.mobile = this.userDetail.mobile;
			saveItem.number_of_image = this.imageTemplateComponent.item.number_of_image;
			var that = this;
			if(saveItem.service_id){//Edit an existing Service
				this.commonService.enduserService.updateService(saveItem)
				  .subscribe( data => {	
				   //debugger;
					if(data.statusCode=="S"){
						//Upload Image
						var uploadCount = 0;
						jQuery.each(this.imageTemplateComponent.thumbnails, function(i,v){
							if(v._id){//update
								
								that.commonService.enduserService.updateThumbnail(v)
									.subscribe( res_thumbnail => {
										uploadCount = uploadCount - (-1);
										if(res_thumbnail.statusCode=="S"){													
										
										}
										else{
											that.sharedService.openMessageBox("E","Unable to save thumbnail.",null);
										}
										if(uploadCount === that.imageTemplateComponent.thumbnails.length){
											that.displayItem();
                      that.disabled.save = false;
                    }
								});
							}
							else if(v.newImage){//insert new								
									var image_name = "";
									var image = that.imageTemplateComponent.newImages[v.newImageLink]
									image.transaction_id = saveItem.service_id;
									image.name = image_name;
									image.user_id = that.userDetail.user_id;
									that.commonService.enduserService.addImage(image)
									   .subscribe( res_image => {							
										if(res_image.statusCode=="S"){
											//Upload Thumbnail
											v.transaction_id = saveItem.service_id;
											v.name = image_name;
											v.image_id = res_image.image.image_id;
											v.user_id = that.userDetail.user_id;
											that.commonService.enduserService.addThumbnail(v)
											  .subscribe( res_thumbnail => {
												uploadCount = uploadCount - (-1);
												if(res_thumbnail.statusCode=="S"){													
													
												}
												else{
													that.sharedService.openMessageBox("E","Unable to save thumbnail.",null);
												}
												if(uploadCount === that.imageTemplateComponent.thumbnails.length){
													that.displayItem();
                          that.disabled.save = false;
                        }
											  });
											
										}
										else{
											uploadCount = uploadCount - (-1);
											that.sharedService.openMessageBox("E","Unable to save image.",null);
											if(uploadCount === that.imageTemplateComponent.thumbnails.length){
												that.displayItem();
                        that.disabled.save = false;
                      }
										}
									   });

							}
						});							
					}
					else{
						//alert("Unable to save");
						that.sharedService.openMessageBox("E",data.msg,null);
            that.disabled.save = false;
					}		  
				  });
			}
			else{//Create New Service
				this.commonService.enduserService.addService(saveItem)
				  .subscribe( data => {	
				   //debugger;
					if(data.statusCode=="S"){
						//Upload Image
						var uploadCount = 0;
						jQuery.each(this.imageTemplateComponent.thumbnails, function(i,v){
							//if(v.newImage){								
									var image_name = "";
									var image = that.imageTemplateComponent.newImages[v.newImageLink]
									image.transaction_id = data.result.service_id;
									image.name = image_name;
									image.user_id = that.userDetail.user_id;
									that.commonService.enduserService.addImage(image)
									   .subscribe( res_image => {							
										if(res_image.statusCode=="S"){
											//Upload Thumbnail
											v.transaction_id = data.result.service_id;
											v.name = image_name;
											v.image_id = res_image.image.image_id;
											v.user_id = that.userDetail.user_id;
											that.commonService.enduserService.addThumbnail(v)
											  .subscribe( res_thumbnail => {
												uploadCount = uploadCount - (-1);
												if(res_thumbnail.statusCode=="S"){													
													
												}
												else{
													that.sharedService.openMessageBox("E","Unable to save thumbnail.",null);
												}
												if(uploadCount === that.imageTemplateComponent.thumbnails.length){
													that.gotoMainScreen();
                          that.disabled.save = false;
                        }
											  });
											
										}
										else{
											uploadCount = uploadCount - (-1);
											that.sharedService.openMessageBox("E","Unable to save image.",null);
											if(uploadCount === that.imageTemplateComponent.thumbnails.length){
												that.gotoMainScreen();
                        that.disabled.save = false;
                      }
										}
									   });

							//}
						});							
					}
					else{
						//alert("Unable to save");
						that.sharedService.openMessageBox("E",data.msg,null);
            that.disabled.save = false;
					}		  
				  });
			}				  
	  }
	  
	  onServiceSave(){
		var that = this;
      that.disabled.save = true;
		this.serviceFormComponent.serviceTabGroup.selectedIndex = 0;
		setTimeout(function(){
			var mandatoryFieldCheck = that.serviceFormComponent.requiredFieldCheck();
			if(mandatoryFieldCheck){
				  if(that.serviceFormComponent.serviceItem.address_id){
					var saveItem = that.serviceFormComponent.serviceItem;
					that.save(saveItem);
				  }
				  else{
            that.disabled.save = false;
					  that.sharedService.openMessageBox("E","Please specify your contact detail.",null);
				  }
			}
      else{
        that.disabled.save = false;
      }
		},1000);
	  }
	  
	  onServiceCancel(){
		  this.sharedService.unSaveDataCheck(function(confirmed){
			if(confirmed){
				this.gotoMainScreen();
			}
		},this);
	  }
	  
	  gotoMainScreen(){
		  /*var that = this;
				  that.loading = true;
				  this.commonService.enduserService.getService(this.userDetail.user_id,"","",null,0,10)
									  .subscribe( data => {
										  that.params = data.params;
										  that.results = data.results;
										  jQuery.each(that.results,function(i,v){
												v.busy = true;
												that.getResultImage(v);
											});
										that.loading = false;
									});
				  this.detail = false;
				  this.editMode = false;
				  this.screenMode = {add:false, edit:false};*/
		this.done = true;
		this.router.navigateByUrl('/Container/Service');
	  }
	  
	  
	  onEdit(evt){
		/*this.detail = true;
		this.editMode = true;
		this.screenMode = {add:false, edit:true};
		
		this.imageTemplateComponent.getTransactionThumbnails(this.item.service_id);*/
		this.router.navigate(['/Container/Service',this.item.service_id,'edit']);
	  }
	  
	  goEditMode(){
		this.serviceFormComponent.loadService(this.item);
		this.detail = true;
		this.editMode = true;
		this.screenMode = {add:false, edit:true};
		this.imageTemplateComponent.getTransactionThumbnails(this.item.service_id);
	  }
	  
	  onEditCancel(evt){
		  this.sharedService.unSaveDataCheck(function(confirmed){
			if(confirmed){
				this.displayItem();
			}
		  },this);
	  }
	  
	  displayItem(){
		  /*this.detail = true;
				this.editMode = false;
				this.screenMode = {add:false, edit:false};
				this.loadService(this.item.service_id);*/
		this.done = true;
		this.router.navigate(['/Container/Service',this.item.service_id]);
	  }
	  
	  loadService(id){
		  var that = this;
		  that.commonService.enduserService.getService("",id,"",null,null,null)
				.subscribe( data => {
							  if(data.results.length > 0){
									var item = data.results[0];
									
									that.imageTemplateComponent.getTransactionThumbnails(item.service_id);
									that.item = item;
									that.item.transactionTyp = "Service";
							  }
							  else{
								  that.sharedService.openMessageBox("E","No data found.",null);
							  }
			});
	  }
	  
	  onDeactivate(evt){
		  var that = this;
		  this.sharedService.openMessageBox("C","Are you sure you want to deactivate it?",function(flag){
			  if(flag){
          if(that.sharedService.sharedObj.configParams['delete_on_deactivate'] === 'yes'){
					that.commonService.enduserService.deleteService(that.item.service_id)
						.subscribe( res => {
							if(res.statusCode=="S"){
								that.sharedService.openMessageBox("S",res.msg,null);
								that.sharedService.closeMessageBox();
								that.gotoMainScreen();
							}
							else{
								that.sharedService.openMessageBox("E",res.msg,null);
							}
					});
				}
				else{
				that.commonService.enduserService.getService("",that.item.service_id,"",null,null,null)
					.subscribe( res => {
							  if(res.results.length > 0){
								  var item = res.results[0];
								  item.active = "-";
								  that.commonService.enduserService.updateService(item)
									.subscribe( data => {
											if(data.statusCode=="S"){
												that.sharedService.openMessageBox("S","Successfully Deactivated.",null);
												that.sharedService.closeMessageBox();
												that.gotoMainScreen();
											}
											else{
												that.sharedService.openMessageBox("E","Unable to Deactivate.",null);
											}
									});
							  }
				});
        }
			  }
		  });		  
	  }
	 
	reloadItems(){
		//this.loadFavourites();
		this.onServiceCancel();
	}
	
	
	paginate(){
		if(!this.detail)
			this.loadServiceSet();
	}
	
	loadServiceSet(){
		var that = this;
		that.loading = true;
		this.commonService.enduserService.getService(this.userDetail.user_id,"","",this.params.count,this.params.skip,this.params.limit)
			 .subscribe( data => {
				if(!(that.results) || that.results.length<=0){
					  that.lastScroll = 0;
					  that.noMoreData = false;
				}
				if(data.results && data.results.length<=0){
					that.noMoreData = true;
				}
				that.params = data.params;
			    that.results = that.results.concat(data.results);
			    jQuery.each(that.results,function(i,v){
					if(!(v.data)){
						v.busy = true;
						that.getResultImage(v);						
					}					
				});
				
				if(that.sharedService.sharedObj.backUpData){
					that.sharedService.sharedObj.backUpData['service'] = {params: that.params, results: that.results};
				}
				that.loading = false;
			});
	}
	
	
	@HostListener('scroll', ['$event'])
	handleScroll(event) {
		//if(!this.loading){
			var elem = jQuery(event.currentTarget);
			if(!this.noMoreData){
				var scroll = elem.scrollTop();
				if (scroll > this.lastScroll) {	//When scroll down	
					var pos = elem.scrollTop() + elem[0].offsetHeight;
					var max = elem[0].scrollHeight + (elem[0].scrollHeight * 0.15);
					var min = elem[0].scrollHeight - (elem[0].scrollHeight * 0.15);
					// pos/max will give you the distance between scroll bottom and and bottom of screen in percentage.
					if(pos <= max && pos >= min )   {
						console.log('almost reached');//
						if(!this.loading)
							this.paginate();
						
						//this.sharedService.showFooter();
					}
					this.sharedService.hideMyPostFooter();
				}
				else{
					this.sharedService.showMyPostFooter();
				}
			}
		//}
		this.lastScroll = elem.scrollTop();
	}
	
	
	canDeactivate(component,currentRoute,currentState,nextState) {
		console.log('i am trying to navigating away');
		var that = this;
		if(this.editMode && !this.done){			
			if(!this.targetUrl){
				this.sharedService.unSaveDataCheck(function(confirmed){
					if(confirmed){
						that.router.navigateByUrl(that.targetUrl);
					}
					else{
						that.targetUrl = "";
					}
				},this);
				this.targetUrl = nextState.url;
				return false;
			}
			else{
				return true;
			}
		}
		else{
			return true;
		}
	}
	
	
		
}
