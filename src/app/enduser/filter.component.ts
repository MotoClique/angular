//
import {Component,OnInit,ElementRef,ViewChild,HostListener} from '@angular/core';
import { Injectable }     from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import {Router, ActivatedRoute} from '@angular/router';
import { CommonService } from '../common.service';
import { SharedService } from '../shared.service';
import { AppDynamicForm } from './reusable/dynamicForm.component';
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
      templateUrl: './filter.component.html',
      styleUrls: ['./filter.component.css'],
      providers: [CommonService]
})

@Injectable()
export class AppFilter implements OnInit {
		//localData: any;
		alertTypes: any;
		userTypes: any;
		productTypes: any;
		brands: any = [];
		models: any = [];
		variants: any = [];
		fuelTypes: any = [];
		countries: any = [];
		states: any = [];
		cities: any = [];
		locations: any = [];
		years: any;
		prices: any = [];
		kms: any =  [];
		transmissions: any = [];
		ownerTypes: any = [];
		colors: any = [];
		products:any = [];
		item: any = {};
		disabled: any = {field: false};
		userDetail: any = {};
		showListDialog: boolean = false;
		self: any = this;
		editMode: boolean = true;
		
		selectedPrdTyp : string = "";
		selectedBrand: string = "";
		selectedModel: string = "";
		lastScroll: any = 0;
		
		@ViewChild(AppDynamicForm) dynamicFormComponent: AppDynamicForm;
		
      constructor(private router: Router, private route: ActivatedRoute, private http: Http, private commonService: CommonService, private sharedService: SharedService,private elementRef:ElementRef) {
                     this.router = router;
                     var that = this;;
                     this.getJSON().subscribe(data => {
										   that.alertTypes = data.alertTypes;
                                           that.userTypes = data.listing_by;
                                           that.fuelTypes = data.fuel_type;
										   
										   that.transmissions = data.transmission;
                                           that.ownerTypes = data.owner_type;
                                           that.colors = data.color;
										   
										   that.prices = data.prices;
										   that.kms = data.kms;
                                           
                                           //Generate Years
                                           that.years = [];
                                          var y = data.years.from;
                                           var cy = (new Date()).getFullYear();
                                           if(Number(y) < Number(cy)){
												do {
                                                       that.years.push( {name: y.toString()});
                                                       y = y - (- 1);
                                                }
                                                while (y != cy);
                                           }
                                           that.years.push( {name: cy.toString()});//Add Current Year        
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
                var that = this;                
				this.sharedService.getUserProfile(function(user){
					that.commonService.adminService.getCountry()
						.subscribe( res => that.countries = res.results);
					that.userDetail = user;
					that.commonService.adminService.getProductType("")
						.subscribe( productTypes => {
							that.productTypes = productTypes.results; 
							if(that.userDetail.user_id){
								that.commonService.enduserService.getFilter(that.userDetail.user_id)
									  .subscribe( data => {
											//that.item = data.results;
											//that.editMode = false;
											//that.dynamicFormComponent.showFilterScreen = true;
											//that.dynamicFormComponent.generateFilterField("Filter");
												var userFilter = data.results;
												if(Array.isArray(that.sharedService.sharedObj.userFilter))
													userFilter = that.sharedService.sharedObj.userFilter;
												jQuery.each(userFilter,function(i,v){
													//if(v.filter_field === 'product_type_name'){
													//	that.item[v.filter_field] = that.productTypes.find(function(element) { return element.product_type_name === v.filter_value; });
													//}
													//else if(v.filter_field === 'model'){
													//	that.item[v.filter_field] = that.models.find(function(element) { return element.model === v.filter_value; });
													//}
													//else{
														that.item[v.filter_field] = v.filter_value;
													//}
												});
												
												if(that.item['product_type_name']){
													if(that.item['product_type_name'] === 'All') 
														that.selectedPrdTyp = '';
													else{
														that.item['product_type_name'] = that.productTypes.find(function(element) { return element.product_type_name === that.item['product_type_name']; });
														that.selectedPrdTyp = that.item['product_type_name'].product_type_id;
													}
													that.commonService.adminService.getUniqueBrandBasedOnPrdTyp(that.selectedPrdTyp)
														.subscribe( brands => {
															that.brands = brands.results;
															if(that.item['brand_name']){
																if(that.item['brand_name'] === 'All') 
																	that.selectedBrand = '';
																else
																	that.selectedBrand = that.item['brand_name'];
																that.commonService.adminService.getProduct("",that.selectedPrdTyp,that.selectedBrand)
																	.subscribe( products => {
                                    that.products = products.results;
																		that.models = that.extractProductUniqueModels();
																		//that.models = models.results;
																		if(that.item['model']){
																			if(that.item['model'] === 'All') 
																				that.selectedModel = '';
																			else{
																				that.item['model'] = that.models.find(function(element) { return element.model === that.item['model']; });
																				that.selectedModel = that.item['model'].model
																			}
																			that.commonService.adminService.getVariant(that.selectedPrdTyp,that.selectedBrand,that.selectedModel)
																				.subscribe( variants => {
																					that.variants = variants.results;
																					if(that.item['variant']){
																						if(that.item['variant'] !== 'All')
																							that.item['variant'] = that.variants.find(function(element) { return element.variant === that.item['variant']; });
																					}
																				});
																		}
																});
															}
													});
												}
											
										});
													
							}
					});
					
					
				});
				this.sharedService.sharedObj.currentContext = this;
				this.sharedService.sharedObj.containerContext.title = "My Filter";
				this.sharedService.onElementHeightChange();
      }
	  
	  
	  onCountrySelect(evt){
			this.item.country = evt;
			this.states = [];
			this.commonService.adminService.getState(evt)
				.subscribe( res => this.states = res.results);
		}
		onStateSelect(evt){
			this.item.state = evt;
			this.cities = [];
			this.commonService.adminService.getCity(evt)
				.subscribe( res => this.cities = res.results);
		}
		onCitySelect(evt){
			this.item.city = evt;
			this.locations = [];
			this.commonService.adminService.getUniqueLoc(evt)
				.subscribe( res => this.locations = res.results);
		}
		
		
	onPrdTypSelect(evt){
		if(evt === 'All' || evt === ''){
			//this.item.product_type_name = evt;
			this.selectedPrdTyp = '';
		}
		else{
			//this.item.product_type_name = evt.product_type_name;
			this.selectedPrdTyp = evt.product_type_id;
		}
		//var product_type_id = this.item.product_type_id;
		//var brand_id = this.item.brand_id;
		//var model = this.item.model;
		//var variant = this.item.variant;
		this.brands = [];
		this.models = [];
		this.variants = [];
		/*this.commonService.adminService.getModel(this.selectedPrdTyp,this.selectedBrand)
			.subscribe( models => {
				this.models = models.results;
			});*/
		//this.commonService.adminService.getVariant(product_type_id,brand_id,model)
			//.subscribe( variants => this.variants = variants.product);
		this.commonService.adminService.getUniqueBrandBasedOnPrdTyp(this.selectedPrdTyp)
			.subscribe( brands => {
							this.brands = brands.results;
		});
	}
	onBrandSelect(evt){
		this.item.brand_name = evt;
		if(evt === 'All' || evt === ''){
			this.selectedBrand = '';
		}
		else{
			this.selectedBrand = evt;
		}
		//var product_type_id = this.item.product_type_id;
		//var brand_id = this.item.brand_id;
		//var model = this.item.model;
		//var variant = this.item.variant;
		this.models = [];
		this.variants = [];
		this.commonService.adminService.getProduct("",this.selectedPrdTyp,this.selectedBrand)
		.subscribe( products => {
			this.products = products.results;
			this.models = this.extractProductUniqueModels();					
		});
	}
  
  extractProductUniqueModels(){
		  var productsWithoutVariant = [];
		  for(var i=0; i<this.products.length; i++){
			var foundEle = false;
			for(var j=0; j<productsWithoutVariant.length; j++){
				var prdName = this.products[i].product_type_name +' '+ this.products[i].brand_name +' '+ this.products[i].model;
				var unqPrdName = productsWithoutVariant[j].product_type_name +' '+ productsWithoutVariant[j].brand_name +' '+ productsWithoutVariant[j].model;
				if(prdName === unqPrdName){
					var variant_entry = jQuery.extend(true, {}, this.products[i]);
					productsWithoutVariant[j].variantList.push(variant_entry);
					foundEle = true;
					break;
				}
			}
			if(!foundEle){
				var entry = jQuery.extend(true, {}, this.products[i]);
				entry['variantList'] = [];
				entry.variantList.push(entry);
				productsWithoutVariant.push(entry);
			}
		  }
		  return productsWithoutVariant;		  	  
	}
  
	onModelSelect(evt){
		if(evt === 'All' || evt === ''){
			//this.item.model = evt;
			this.selectedModel = '';
		}
		else{
			//this.item.model = evt.model;
			this.selectedModel = evt.model
		}
		//var product_type_id = this.item.product_type_id;
		//var brand_id = this.item.brand_id;
		//var model = this.item.model;
		//var variant = this.item.variant;
		this.variants = [];
		//this.commonService.adminService.getModel(product_type_id,brand_id)
		//	.subscribe( models => {
		//		this.models = models.product;
		//	});
		this.commonService.adminService.getVariant(this.selectedPrdTyp,this.selectedBrand,this.selectedModel)
			.subscribe( variants => this.variants = variants.results);
	}
	
	validatePrice(){
		  if(this.item.price_from && this.item.price_to){
			  var fromValue = (this.item.price_from && !isNaN(this.item.price_from)) ? this.item.price_from : '0';
			  var toValue = (this.item.price_to && !isNaN(this.item.price_to)) ? this.item.price_to : '0';
			  if((toValue - fromValue) < 0){
				  this.item.price_from = '';
				  this.item.price_to = '';
			  }
		  }
	  }
	  
	  validateDiscount(){
		  if(this.item.discount_from && this.item.discount_to){
			  var fromValue = (this.item.discount_from && !isNaN(this.item.discount_from)) ? this.item.discount_from : '0';
			  var toValue = (this.item.discount_to && !isNaN(this.item.discount_to)) ? this.item.discount_to : '0';
			  if((toValue - fromValue) < 0){
				  this.item.discount_from = '';
				  this.item.discount_to = '';
			  }
		  }
	  }
	  
	  validateKM(){
		  if(this.item.km_run_from && this.item.km_run_to){
			  var fromValue = (this.item.km_run_from && !isNaN(this.item.km_run_from)) ? this.item.km_run_from : '0';
			  var toValue = (this.item.km_run_to && !isNaN(this.item.km_run_to)) ? this.item.km_run_to : '0';
			  if((toValue - fromValue) < 0){
				  this.item.km_run_from = '';
				  this.item.km_run_to = '';
			  }
		  }
	  }
	  
	  validateReg(){
		  if(this.item.year_reg_from && this.item.year_reg_to){
			  var fromValue = (this.item.year_reg_from && !isNaN(this.item.year_reg_from)) ? this.item.year_reg_from : '0';
			  var toValue = (this.item.year_reg_to && !isNaN(this.item.year_reg_to)) ? this.item.year_reg_to : '0';
			  if((toValue - fromValue) < 0){
				  this.item.year_reg_from = '';
				  this.item.year_reg_to = '';
			  }
		  }
	  }
		  
	 
	  	  
	  save(saveItem){
			var that = this;
			var sendData:any = {
				user_id: that.userDetail.user_id,
				data: saveItem
			};
			this.commonService.enduserService.addFilter(sendData)
			.subscribe( data => {	
				   //debugger;
					if(data.statusCode=="S"){
						//that.loadFilter(that.userDetail.user_id);
						that.sharedService.openMessageBox("S","Successfully applied.",null);
						that.sharedService.sharedObj.containerContext.loadUserFilter();
						that.router.navigateByUrl('/Container');
					}
					else{
						//alert("Unable to save");
						that.sharedService.openMessageBox("E",data.msg,null);
					}		  
			});		  
	  }
	  
	  /*onFilterSave(evt){
		  var that = this;
		  var fields = this.dynamicFormComponent.fields;
		  var saveItems = [];
		  jQuery.each(fields, function(i,v){
			  if(v.field_type === 'select'){
				var values = v.value;
				jQuery.each(values, function(indx,val){
					var entry:any = {
						user_id: that.userDetail.user_id,
						filter_field: v.field_path,
						filter_value: val,
						deleted: false
					};
					saveItems.push(entry);
				});
			  }
			  else{
					var entry:any = {
						user_id: that.userDetail.user_id,
						filter_field: v.field_path,
						filter_value: v.value,
						deleted: false
					};
					saveItems.push(entry);
			  }
		  });
		  
		  this.save(saveItems);//Object.assign(saveItem, this.item));
	  }*/
	  
	  onFilterSave(evt){
		  var that = this;
		  var saveItems = [];
		  jQuery.each(this.item, function(key,val){
			  if(key && val){
					var value = '';
					if(key === 'product_type_name')
						value = val.product_type_name;
					else if(key === 'model')
						value = val.model;
					else if(key === 'variant')
						value = val.variant;
					else
						value = val;
					var entry:any = {
						user_id: that.userDetail.user_id,
						filter_field: key,
						filter_value: value,
						deleted: false
					};
					saveItems.push(entry);
			  }
		  });
		  
		  that.sharedService.openMessageBox("C","Would you like us to remember your filter?",function(state){
			if(state){
				that.save(saveItems);
			}
			else{
				that.sharedService.sharedObj.userFilter = saveItems;
				that.sharedService.sharedObj.containerContext.loadUserFilter();
				that.router.navigateByUrl('/Container');
			}
		  });
	  }
	  
	  
	  /*onFilterCancel(){
		  this.editMode = false;
		  this.loadFilter(this.userDetail.user_id);
	  }
	  
	  onEdit(evt){
		this.editMode = true;
	  }
	  
	  onEditCancel(evt){
		//this.editMode = false;
		//this.loadFilter(this.userDetail.user_id);
	  }*/
	  
	  /*loadFilter(id){
		  var that = this;
		  this.commonService.enduserService.getFilter(id)
			 .subscribe( data => {				
				that.item = data.results;
				that.sharedService.sharedObj.containerContext.filterItem = data.results;
				that.sharedService.sharedObj.containerContext.checkFilter();
				//that.editMode = false;
				that.dynamicFormComponent.showFilterScreen = true;
				that.dynamicFormComponent.generateFilterField("Filter");
			});
	  }*/
	  
	  loadFilter(id){
		  var that = this;
		  this.item = {};
		  this.commonService.enduserService.getFilter(id)
			 .subscribe( data => {
				var userFilter = data.results;
				if(Array.isArray(that.sharedService.sharedObj.userFilter))
					userFilter = that.sharedService.sharedObj.userFilter;
				jQuery.each(userFilter,function(i,v){
					if(v.filter_field === 'product_type_name'){
						that.item[v.filter_field] = that.productTypes.find(function(element) { return element.product_type_name === v.filter_value; });
					}
					else if(v.filter_field === 'model'){
						that.item[v.filter_field] = that.models.find(function(element) { return element.model === v.filter_value; });
					}
					else if(v.filter_field === 'variant'){
						that.item[v.filter_field] = that.variants.find(function(element) { return element.variant === v.filter_value; });
					}
					else{
						that.item[v.filter_field] = v.filter_value;
					}
				});
				that.sharedService.sharedObj.containerContext.loadUserFilter();
			});
	  }
	  
	  onClearFilter(evt){
		  var that = this;
		  this.sharedService.openMessageBox("C","Are you sure you want to clear all your settings?",function(flag){
			  if(flag){
				that.commonService.enduserService.deleteMultipleFilter(that.userDetail.user_id)
					.subscribe( data => {							
								that.sharedService.closeMessageBox();
								that.sharedService.openMessageBox("S","Successfully cleared.",null);
								//that.loadFilter(that.userDetail.user_id);
								that.sharedService.sharedObj.userFilter = null;
								that.sharedService.sharedObj.containerContext.loadUserFilter();
								that.router.navigateByUrl('/Container');
				});
			  }
		  });
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
