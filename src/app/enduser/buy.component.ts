//
import {Component,OnInit,ElementRef,ViewChild,HostListener} from '@angular/core';
import { Injectable }     from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import {Router, ActivatedRoute} from '@angular/router';
import { CommonService } from '../common.service';
import { SharedService } from '../shared.service';
import { AppDynamicForm } from './reusable/dynamicForm.component';
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
      templateUrl: './buy.component.html',
      styleUrls: ['./buy.component.css'],
      providers: [CommonService]
})

@Injectable()
export class AppBuy implements OnInit {
		localData: any;
		item: any = {};
		image_item: any;
		hidden: any;
		disabled: any;
		userDetail: any = {};
		showListDialog: boolean = false;
		showProductListDialog: boolean = false;
		showProductTypeListDialog: boolean = false;
		showBrandListDialog: boolean = false;
		showProductColorDialog: boolean = false;
		showProductYearDialog: boolean = false;
		productTypes: any = [];
		brands: any = [];
		products: any = [];
		fields: any = [];
		screenConfig: any = {};
		selectedPrdTyp: string = "";
		self: any = this;
		editMode: boolean = false;
		detail: boolean = false;
		results: any = [];
		colors: any = [];
		years: any = [];
		screenMode: any = {add:false, edit:false};
		params: any = {count:null, skip:0, limit:10};
		loading: boolean = false;
		targetUrl: string = "";
		addresses: any = [];
		done: boolean = false;
		lastScroll: any = 0;
		noMoreData: boolean = false;
		showAddressListDialog: boolean = false;
		@ViewChild(AppDynamicForm) dynamicFormComponent: AppDynamicForm;
		@ViewChild(AppImageTemplate) imageTemplateComponent: AppImageTemplate;
		@ViewChild(AppTileTemplate) tileTemplateComponent: AppTileTemplate;
		
      constructor(private router: Router, private route: ActivatedRoute, private http: Http, private commonService: CommonService, private sharedService: SharedService,private elementRef:ElementRef) {
                     this.router = router;
                     var that = this;;
                     this.getJSON().subscribe(data => {
                                   that.localData = data;
									//Generate Years
                                    that.years = [];
                                    var y = Number(data.years.from);
                                    var cy = (new Date()).getFullYear();
                                    if(Number(y) < Number(cy)){
												do {
                                                       that.years.push( {name: y});
                                                       y = y - (- 1);
                                                }
                                                while (y != cy);
                                    }
                                    that.years.push( {name: cy});//Add Current Year
									that.years.sort((a: any, b: any)=> {return b.name - a.name;});//decending sort
									
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
                
				this.sharedService.sharedObj.containerContext.title = "Buy";
				this.sharedService.onElementHeightChange();
				
      }
	  
	  ngAfterViewInit(){
				var that = this;
                this.hidden = {view: false, add: true};
                this.disabled = {field: false};
				this.sharedService.getUserProfile(function(user){
					that.userDetail = user;
					if(that.userDetail.user_id){
						var id = that.route.snapshot.params.id;
						var mode = that.route.snapshot.params.mode;
						if(id && id !== 'blank'){
							that.commonService.enduserService.getBuy("",id,"",null,null,null)
							  .subscribe( data => {
								  if(data.results.length > 0){
									var item = data.results[0];									
									that.item = item;
									that.item.transactionTyp = "Buy";
									that.dynamicFormComponent.item = that.item;
									that.imageTemplateComponent.item = that.item;
									if(mode === 'edit'){
										that.goEditMode();
									}else{
										that.detail = true;
										that.editMode = false;
										that.screenMode = {add:false, edit:false};
										that.dynamicFormComponent.generateDisplayField("Buy",item);
										that.imageTemplateComponent.getTransactionThumbnails(item.buy_req_id);
									}
								  }
								  else{
									 that.sharedService.openMessageBox("E","No data found.",null); 
								  }
								});
						}
						else if(id === 'blank' && mode === 'create'){
							that.item = jQuery.extend(true, {}, that.sharedService.sharedObj.postItem);
							that.dynamicFormComponent.item = that.item;
							that.imageTemplateComponent.item = that.item;
							if(that.item.product_id){
								that.goCreateMode();
							}
							else{
								that.router.navigateByUrl('/Container/Buy');
							}
						}
						else{
							that.loading = true;
							that.commonService.enduserService.getBuy(that.userDetail.user_id,"","",null,0,10)
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
										that.getFav(v,v.buy_req_id); 
									});
								that.loading = false;
							  });
						}						  
					}
				});
	  }
	 
	  
	  getFav(item,transaction_id){
		  this.commonService.enduserService.getFav(this.userDetail.user_id,transaction_id)
			  .subscribe( res => {			  
					var result = res.results;
					if(result.length > 0){
						if(result[0].bid_sell_buy_id === transaction_id)
							item.fav = true;
							item.fav_id = result[0]._id;
					}
			  });
	 }
	  
	  getResultImage(item){
		  this.commonService.enduserService.getImage(this.userDetail.user_id,"",item.buy_req_id)
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
			this.commonService.adminService.getProductType("")
				.subscribe( productTypes => this.productTypes = productTypes.results);		
			this.showListDialog = true;
			this.showProductTypeListDialog = true;  
			this.showProductListDialog = false;
			this.showBrandListDialog = false;
			this.showProductColorDialog = false;
			this.showProductYearDialog = false;
			this.showAddressListDialog = false;
			this.item = {};
	  }
	  
	  openItem(item){
		/*this.detail = true;
		this.editMode = false;
		this.screenMode = {add:false, edit:false};
		this.dynamicFormComponent.generateDisplayField("Buy",item);
		this.imageTemplateComponent.getTransactionThumbnails(item.buy_req_id);
		this.item = item;
		this.item.transactionTyp = "Buy";*/
		this.router.navigate(['/Container/Buy',item.buy_req_id]);
	  }
	  
	  onPrdTypSelect(evt,prdTyp){
			this.selectedPrdTyp = prdTyp.product_type_id;
			this.commonService.adminService.getUniqueBrandBasedOnPrdTyp(this.selectedPrdTyp)
				.subscribe( brands => this.brands = brands.results);
			
			this.showProductTypeListDialog = false;
			this.showProductListDialog = false;
			this.showBrandListDialog = true;
	  }
	  
	  onBrandSelect(evt,brand){
			this.commonService.adminService.getProduct("",this.selectedPrdTyp,brand)
				.subscribe( products => this.products = products.results);
			this.showBrandListDialog = false;
			this.showProductTypeListDialog = false;
			this.showProductListDialog = true;
	  }
	  
	  
	  onPrdSelect(evt,prd){
		  this.item.product_id = prd.product_id;
		  this.item.product_type_id = prd.product_type_id;
		  this.item.product_type_name = prd.product_type_name;
		  this.item.brand_id = prd.brand_id;
		  this.item.brand_name = prd.brand_name;
		  this.item.model = prd.model;
		  this.item.variant = prd.variant;
		  this.item.transactionTyp = "Buy";
		  this.commonService.adminService.getPrdThumbnailColors(prd.product_id)
				.subscribe( res => this.colors = res.results);
				
		  this.showProductListDialog = false;
		  this.showProductColorDialog = true;	
	  }
	  
	  onPrdColorSelect(evt,color){
		this.item.color = color;
		this.showProductColorDialog = false;
		this.showProductYearDialog = true;
		//this.showListDialog = false;
		
		//this.detail = true;
		//this.editMode = true;
		//this.screenMode = {add:true, edit:false};
		//this.getDefaultAddress();
		//this.dynamicFormComponent.generateField("Buy");
		//this.imageTemplateComponent.getThumbnails(this.item.product_id);
	  }
	  
	  onPrdYearSelect(evt,yr){
		this.item.year_of_reg = yr.name;
		this.showProductYearDialog = false;
		this.showListDialog = false;
		//this.showAddressListDialog = true;
		
		//this.detail = true;
		//this.editMode = true;
		//this.screenMode = {add:true, edit:false};
		this.getDefaultAddress();
		//this.dynamicFormComponent.generateField("Buy");
		//this.imageTemplateComponent.getThumbnails(this.item.product_id);
	  }
	  
	  getDefaultAddress(){
		  var that = this;
		  this.commonService.enduserService.getAddress(this.userDetail.user_id,"")
				.subscribe( result => {
					that.addresses = result.results;
					if(that.addresses[0]){
						that.item.address_id = that.addresses[0].address_id;
						that.item.country = that.addresses[0].country;
						that.item.state = that.addresses[0].state;
						that.item.city = that.addresses[0].city;
						that.item.location = that.addresses[0].locality;
					}
					for(var i=0; i<that.addresses.length; i++){
						if(that.addresses[i].default_flag){
							that.item.address_id = that.addresses[i].address_id;
							that.item.country = that.addresses[i].country;
							that.item.state = that.addresses[i].state;
							that.item.city = that.addresses[i].city;
							that.item.location = that.addresses[i].locality;
							break;
						}
					}
					if(that.addresses.length && that.addresses.length>1){
						that.showAddressListDialog = true;
						that.showListDialog = true;						
					}
					else{
						that.sharedService.sharedObj.postItem = jQuery.extend(true, {},that.item);
						that.router.navigate(['/Container/Buy','blank','create']);
						/*that.detail = true;
						that.editMode = true;
						that.screenMode = {add:true, edit:false};
						that.dynamicFormComponent.generateField("Buy");
						that.imageTemplateComponent.getThumbnails(that.item.product_id);*/
					}
				});
	  }
	  
	  onAddressSelect(evt,add){
		this.item.address_id = add.address_id;
		this.item.country = add.country;
		this.item.state = add.state;
		this.item.city = add.city;
		this.item.location = add.locality;
		this.showAddressListDialog = false;
		this.showListDialog = false;
		
		this.sharedService.sharedObj.postItem = jQuery.extend(true, {},this.item);
		this.router.navigate(['/Container/Buy','blank','create']);
		/*this.detail = true;
		this.editMode = true;
		this.screenMode = {add:true, edit:false};
		this.dynamicFormComponent.generateField("Buy");
		this.imageTemplateComponent.getThumbnails(this.item.product_id);*/
	  }
	  
	  goCreateMode(){
		this.detail = true;
		this.editMode = true;
		this.screenMode = {add:true, edit:false};
		this.dynamicFormComponent.generateField("Buy");
		this.imageTemplateComponent.getThumbnails(this.item.product_id);
	  }
	  
	  	  
	  save(saveItem){
			saveItem.user_id = this.userDetail.user_id;
			saveItem.name = this.userDetail.name;
			saveItem.mobile = this.userDetail.mobile;
			saveItem.address_id = this.dynamicFormComponent.item.address_id;
			saveItem.number_of_image = this.imageTemplateComponent.item.number_of_image;
			var that = this;
			if(saveItem.buy_req_id){//Edit an existing Buy Request
				this.commonService.enduserService.updateBuy(saveItem)
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
										if(uploadCount === that.imageTemplateComponent.thumbnails.length)
											that.displayItem();
								});
							}
							else if(v.newImage){//insert new								
									var image_name = "";
									var image = that.imageTemplateComponent.newImages[v.newImageLink]
									image.transaction_id = saveItem.buy_req_id;
									image.name = image_name;
									image.user_id = that.userDetail.user_id;
									that.commonService.enduserService.addImage(image)
									   .subscribe( res_image => {							
										if(res_image.statusCode=="S"){
											//Upload Thumbnail
											v.transaction_id = saveItem.buy_req_id;
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
												if(uploadCount === that.imageTemplateComponent.thumbnails.length)
													that.displayItem();
											  });
											
										}
										else{
											uploadCount = uploadCount - (-1);
											that.sharedService.openMessageBox("E","Unable to save image.",null);
											if(uploadCount === that.imageTemplateComponent.thumbnails.length)
												that.displayItem();
										}
									   });

							}
						});
						if(!(that.imageTemplateComponent.thumbnails) || that.imageTemplateComponent.thumbnails.length===0)
							that.displayItem();
					}
					else{
						//alert("Unable to save");
						that.sharedService.openMessageBox("E",data.msg,null);
					}		  
				  });
			}
			else{//Create New Buy Request
				this.commonService.enduserService.addBuy(saveItem)
				  .subscribe( data => {	
				   //debugger;
					if(data.statusCode=="S"){
						//Upload Image
						var uploadCount = 0 ;
						jQuery.each(this.imageTemplateComponent.thumbnails, function(i,v){
							//if(v.newImage){								
									var image_name = "";
									var image = that.imageTemplateComponent.newImages[v.newImageLink]
									image.transaction_id = data.result.buy_req_id;
									image.name = image_name;
									image.user_id = that.userDetail.user_id;
									that.commonService.enduserService.addImage(image)
									   .subscribe( res_image => {							
										if(res_image.statusCode=="S"){
											//Upload Thumbnail
											v.transaction_id = data.result.buy_req_id;
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
												if(uploadCount === that.imageTemplateComponent.thumbnails.length)
													that.gotoMainScreen();
											  });
											
										}
										else{
											uploadCount = uploadCount - (-1);
											that.sharedService.openMessageBox("E","Unable to save image.",null);
											//that.sharedService.openMessageBox("E",data.msg,null);
											if(uploadCount === that.imageTemplateComponent.thumbnails.length)
												that.gotoMainScreen();
										}
									   });

							//}
						});
						if(!(that.imageTemplateComponent.thumbnails) || that.imageTemplateComponent.thumbnails.length===0)
							that.gotoMainScreen();
					}
					else{
						//alert("Unable to save");
						that.sharedService.openMessageBox("E",data.msg,null);
					}		  
				  }); 
			}
	  }
	  
	  onBuySave(){
		  var that = this;
		  this.dynamicFormComponent.dynamicTabGroup.selectedIndex = 0;
		  setTimeout(function(){
			  var mandatoryFieldCheck = that.dynamicFormComponent.requiredFieldCheck();
			  if(mandatoryFieldCheck){
				  if(that.dynamicFormComponent.item.address_id){
					  var screenConfig = that.dynamicFormComponent.screenConfig;
					  var saveItem = {};
					  jQuery.each(screenConfig, function(field,value){
						  jQuery.each(value, function(i,v){
							saveItem[v.field_path] = v.value;
						  });
					  });
					  
					  that.save(Object.assign(that.item,saveItem));
				  }
				  else{
					  that.sharedService.openMessageBox("E","Please specify your contact detail.",null);
				  }
			  }
		  },1000);
	  }
	  
	  onBuyCancel(){
		  this.sharedService.unSaveDataCheck(function(confirmed){
			if(confirmed){
				this.gotoMainScreen();
			}
		  },this);
	  }
	  
	  gotoMainScreen(){
		  /*this.detail = false;
				  var that = this;
				  this.screenMode = {add:false, edit:false};
				  this.editMode = false;
				  that.loading = true;
				  that.commonService.enduserService.getBuy(that.userDetail.user_id,"","",null,0,10)
					.subscribe( data => {
						that.params = data.params;
						that.results = data.results;
						jQuery.each(that.results,function(i,v){
							v.busy = true;
							that.getResultImage(v);
							that.getFav(v,v.buy_req_id); 
						});
						that.loading = false;
					});*/
		this.done = true;
		this.router.navigateByUrl('/Container/Buy');
	  }
	  
	  onEdit(evt){
		/*this.detail = true;
		this.editMode = true;
		this.screenMode = {add:false, edit:true};
		this.dynamicFormComponent.generateField("Buy");
		this.imageTemplateComponent.getTransactionThumbnails(this.item.buy_req_id);*/
		this.router.navigate(['/Container/Buy',this.item.buy_req_id,'edit']);
	  }
	  
	  goEditMode(){
		this.detail = true;
		this.editMode = true;
		this.screenMode = {add:false, edit:true};
		this.dynamicFormComponent.generateField("Buy");
		this.imageTemplateComponent.getTransactionThumbnails(this.item.buy_req_id);
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
				this.loadBuy(this.item.buy_req_id);*/
		this.done = true;
		this.router.navigate(['/Container/Buy',this.item.buy_req_id]);
	  }
	  
	  loadBuy(id){
		  var that = this;
		  that.commonService.enduserService.getBuy("",id,"",null,null,null)
				.subscribe( data => {
							  if(data.results.length > 0){
									var item = data.results[0];
									that.dynamicFormComponent.generateDisplayField("Buy",item);
									that.imageTemplateComponent.getTransactionThumbnails(item.buy_req_id);
									that.item = item;
									that.item.transactionTyp = "Buy";
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
				that.commonService.enduserService.getBuy("",that.item.buy_req_id,"",null,null,null)
						.subscribe( res => {
									  if(res.results.length > 0){
										  var item = res.results[0];
										  item.active = "-";
										  that.commonService.enduserService.updateBuy(item)
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
		  });
	  }
	 
	reloadItems(){
		//this.loadFavourites();
		this.onBuyCancel();
	}
	
	paginate(){
		if(!this.detail)
			this.loadBuySet();
	}
	
	loadBuySet(){
		var that = this;
		that.loading = true;
		this.commonService.enduserService.getBuy(this.userDetail.user_id,"","",this.params.count,this.params.skip,this.params.limit)
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
						that.getFav(v,v.buy_req_id);
					}					
				});
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
						
						this.sharedService.showFooter();
					}
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
