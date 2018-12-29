//
import {Component,OnInit,HostListener} from '@angular/core';
import { Injectable }     from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import {Router, ActivatedRoute} from '@angular/router';
import { CommonService } from '../common.service';
import { SharedService } from '../shared.service';
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
      templateUrl: './alert.component.html',
      styleUrls: ['./alert.component.css'],
      providers: [CommonService]
})

@Injectable()
export class AppAlert implements OnInit {
		alerts: any;
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
		item: any;
		hidden: any;
		disabled: any;
		userDetail: any = {};
		selectedPrdTyp : string = "";
		selectedBrand: string = "";
		selectedModel: string = "";
		transmissions: any = [];
		ownerTypes: any = [];
		colors: any = [];
		lastScroll: any = 0;

      constructor(private router: Router, private route: ActivatedRoute, private http: Http, private commonService: CommonService, private sharedService: SharedService) {
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
                                                       that.years.push( {name: y});
                                                       y = y - (- 1);
                                                }
                                                while (y != cy);
                                           }
                                           that.years.push( {name: cy});//Add Current Year
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
				this.sharedService.sharedObj.currentContext = this;
				this.sharedService.sharedObj.containerContext.title = "My Alert";	
                this.item = {};
                this.hidden = {view: false, add: true};
                this.disabled = {field: false};
				this.sharedService.getUserProfile(function(user){
					that.userDetail = user;
					var id = that.route.snapshot.params.id;
					var mode = that.route.snapshot.params.mode;
					if(id && id !== 'blank'){
							that.commonService.enduserService.getAlert("",id)
							  .subscribe( data => {
								  if(data.results.length > 0){
									var item = data.results[0];									
									that.item = item;
									if(that.item.product_type_name){
										that.commonService.adminService.getProductType("")
										.subscribe( productTypes => {
											that.productTypes = productTypes.results;
											that.item.product_type_name = that.productTypes.find(function(element) { return element.product_type_name === that.item.product_type_name; });
										});
									}
									if(that.item.model){
										that.commonService.adminService.getModel("","")
										.subscribe( models => {
											that.models = models.results;
											that.item.model = that.models.find(function(element) { return element.model === that.item.model; });
										});
									}
									if(that.item.variant){
										that.commonService.adminService.getVariant("","","")
										.subscribe( variants => {
											that.variants = variants.results;
											that.item.variant = that.variants.find(function(element) { return element.variant === that.item.variant; });
										});
									}
									if(mode === 'edit'){
										that.goEditMode();
									}else{
										that.displayAlert();
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
						that.commonService.enduserService.getAlert(that.userDetail.user_id,"")
							.subscribe( result => that.alerts = result.results);
					}
										
					that.commonService.adminService.getCountry()
						.subscribe( res => that.countries = res.results);
					
					that.commonService.adminService.getProductType("")
						.subscribe( productTypes => {
								that.productTypes = productTypes.results;
								/*that.commonService.adminService.getBrand("")
									.subscribe( brands => {
										that.brands = brands.results;
										var product_type_id = "";
										var brand_id = "";
										if(that.productTypes.length > 0)
											product_type_id = that.productTypes[0].product_type_id;
										if(that.brands.length > 0)
											brand_id = that.brands[0].brand_id;
										////////	
										that.commonService.adminService.getModel(product_type_id,brand_id)
											.subscribe( models => {
												that.models = models.results;
												var model = "";
												if(that.models.length > 0)
													model = that.models[0].model;
												that.commonService.adminService.getVariant(product_type_id,brand_id,model)
													.subscribe( variants => that.variants = variants.results);
											});
									});*/
						});
				});
				this.sharedService.onElementHeightChange();		
      }
	  
	  
	  onAlertSelect(evt,data){
		this.router.navigate(['/Container/Alert',data.alert_id]);
	  }
	  
	  displayAlert(){
		//this.item = alert;
		this.hidden = {view: true, add: false};
        this.disabled = {field: true}; 
	  }
	  
	onEdit(evt,doc){
		this.router.navigate(['/Container/Alert',doc.alert_id,'edit']);
	}
	
	goEditMode(){
		this.hidden = {view: true, add: false};
		this.disabled = {field: false};
		//this.item = doc;
	}
		
	onDelete(evt,doc){
		var that = this;
		this.sharedService.openMessageBox("C","Are you sure you want to delete?",function(flag){
			if(flag){		   
				  doc.deleted = true;
				  that.commonService.enduserService.updateAlert(doc)
					 .subscribe( data => {					
						if(data.statusCode=="S"){
							that.loadAlerts();
						}
						else{
							that.sharedService.openMessageBox("E","Unable to delete.",null);
						}		  
				  });
			}
		});			
	}
	  
	  
	onPrdTypSelect(evt){
		//this.item.product_type_name = evt.product_type_name;
		this.selectedPrdTyp = evt.product_type_id;
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
		this.selectedBrand = evt;
		//var product_type_id = this.item.product_type_id;
		//var brand_id = this.item.brand_id;
		//var model = this.item.model;
		//var variant = this.item.variant;
		this.models = [];
		this.variants = [];
		this.commonService.adminService.getModel(this.selectedPrdTyp,this.selectedBrand)
			.subscribe( models => {
				this.models = models.results;
			});
		//this.commonService.adminService.getVariant(product_type_id,brand_id,model)
			//.subscribe( variants => this.variants = variants.product);
	}
	onModelSelect(evt){
		//this.item.model = evt.model;
		this.selectedModel = evt.model
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
	

      onAlertAdd(evt){
			this.router.navigate(['/Container/Alert','blank','create']);
      }
	  
	  goCreateMode(){
		this.hidden = {view: true, add: false};
        this.disabled = {field: false};
	  }

      onAlertSave(evt){
			this.item.user_id = this.userDetail.user_id;
			if(this.item.product_type_name)
				this.item.product_type_name = this.item.product_type_name.product_type_name;
			if(this.item.model)
				this.item.model = this.item.model.model;
			if(this.item.variant)
				this.item.variant = this.item.variant.variant;
			if(this.item.alert_id){
				this.commonService.enduserService.updateAlert(this.item)
				  .subscribe( data => {	
					//debugger;
					if(data.statusCode=="S"){
						this.onAlertSaveCancel("");
					}
					else{
						this.sharedService.openMessageBox("E","Unable to save.",null);
					}		  
				  }); 
			}
			else{
				this.commonService.enduserService.addAlert(this.item)
				  .subscribe( data => {	
					//debugger;
					if(data.statusCode=="S"){
						this.onAlertSaveCancel("");
					}
					else{
						this.sharedService.openMessageBox("E","Unable to save.",null);
					}		  
				  }); 
			}
      }
	  
	  loadAlerts(){
		this.commonService.enduserService.getAlert(this.userDetail.user_id,"")
			.subscribe( result => this.alerts = result.results);
	  }

      onAlertSaveCancel(evt){
             /*this.hidden = {view: false, add: true};
			 this.commonService.enduserService.getAlert(this.userDetail.user_id,"")
					.subscribe( result => this.alerts = result.results);*/
		this.router.navigateByUrl('/Container/Alert');
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
