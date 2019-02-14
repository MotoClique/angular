//
import {Component,OnInit,ElementRef,Input,ViewChild} from '@angular/core';
import { Injectable }     from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import {Router} from '@angular/router';
import { MatTabChangeEvent } from '@angular/material';
import {DateAdapter, NativeDateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core'

import { CommonService } from '../../common.service';
import { SharedService } from '../../shared.service';
import {Observable} from 'rxjs/Rx';
import { AuthenticationService } from '../../authentication.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
declare var jQuery:any;
declare var gMap:any;

export const MY_DATE_FORMATS = {
  parse: {
      dateInput: {month: 'short', year: 'numeric', day: 'numeric'}
  },
  display: {
      dateInput: 'input',
      monthYearLabel: {year: 'numeric', month: 'short'},
      dateA11yLabel: {year: 'numeric', month: 'long', day: 'numeric'},
      monthYearA11yLabel: {year: 'numeric', month: 'long'},
  }
};

export class MyDateAdapter extends NativeDateAdapter {
   format(date: Date, displayFormat: Object): string {
       if (displayFormat == "input") {
           let day = date.getDate();
           let month = date.getMonth() + 1;
           let year = date.getFullYear();
           return this._to2digit(day) + '/' + this._to2digit(month) + '/' + year;
       } else {
           return date.toDateString();
       }
   }

   private _to2digit(n: number) {
       return ('00' + n).slice(-2);
   } 
}

@Component({
    selector: 'dynamic-form',
    templateUrl: './dynamicForm.component.html',
    styleUrls: ['./dynamicForm.component.css'],
    providers: [CommonService,
		{provide: DateAdapter, useClass: MyDateAdapter},
		{provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS}
	]
})

@Injectable()
export class AppDynamicForm implements OnInit {
		current_product_id: string = "";
		localData: any;
		hidden: any;
		disabled: any;
		fields: any = [];
		screenConfig: any = {};
		userDetail: any = {};
		showFilterScreen: boolean = false;
		showFilterFieldDialog: boolean = false;
		selectedFilterField: any = {};
		selectList: any = [];
		token: string = "";
		bidBy: any = [];
		selectedCategory: string = "";
		address: any = [];
		contactDetail: any = {};
		showAddressListDialog: boolean = false;
		showDialog: boolean = false;
		showParticipantMemberDialog: boolean = false;
		participantMemberDetail: any = {};
		hours: any = [];
		minutes: any = [];
		prodSpecs: any = [];
		showValueHelpDialog: boolean = false;
		showStateListDialog: boolean = false;
		showValueHelpListDialog: boolean = false;
		valueHelp: any = [];
		@Input() item;
		//@Input() ownItem;
		@Input() parentComponent;
		@Input() editMode;
		@ViewChild('dynamicTabGroup') dynamicTabGroup;
		
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
				this.localData = this.sharedService.sharedObj.localData;
				this.showFilterScreen = false;
                this.hidden = {view: false, add: true};
                this.disabled = {field: false};
				this.sharedService.getUserProfile(function(user){
					that.userDetail = user;
				});
				
				for(var i=0; i < 60; i++){
					var count = i.toString();
					if(i<9)
						count = '0'+count;
					
					if(i < 24)
						this.hours.push(count);
					this.minutes.push(count);
				}
      }
	  
	  
	  generateField(screen){
		  this.current_product_id = this.item.product_id;
		  var that = this;
		  this.screenConfig = {};
		  this.fields = [];
		  this.commonService.adminService.getFieldRights("","",screen)
			.subscribe( result => {
				if(result.error){
					that.sharedService.openMessageBox("E","Error in fetching.",null);
				}
				else{
					that.loadProductSpec(that.current_product_id,function(prdSpecs){
						  var fieldConfig = result.results;
						  jQuery.each(fieldConfig,function(i,v){
							if(v.field_category){
							  var category = (v.field_category).replace(/\s/g,'');
							  if(!(that.screenConfig[category])){
								that.screenConfig[category] = []
							  }
							  var o = jQuery.extend(true, {}, v);
							  o.type = "text";							  
							  o.value = (that.item[v.field_path] != undefined)? that.item[v.field_path] : "";
                if(!(o.value)){
                  jQuery.each(prdSpecs,function(prdSpec_i,prdSpec_v){
                    if(prdSpec_v.specification_field_name === o.field){
                    o.value = prdSpec_v.specification_field_value;
                    }
                  });   
                }
							  o.name = (v.field).replace(/\s/g,'');
							  o.field_type = (v.field_type).toLowerCase();
							  o.option = [];

							  if(o.screen !== 'Filter'){
								if(o.field_path === 'product_type_id'
								  || o.field_path === 'product_type_name'
								  || o.field_path === 'brand_id'
								  || o.field_path === 'brand_name'
								  || o.field_path === 'model'
								  || o.field_path === 'variant'
								  || o.field_path === 'color'
								  || o.field_path === 'current_bid_amount'){
								  o.editable = false;
								}
							  }
							  if(o.screen === 'Buy'){
								if(o.field_path === 'year_of_reg')
								  o.field = o.field + ' (Greater than)';
								if(o.field_path === 'net_price')
								  o.field = o.field + ' (Less than)';
								if(o.field_path === 'km_done')
								  o.field = o.field + ' (Less than)';
							  }

							  if(o.field_path === 'min_bid_hike'){
								o.editable = false;
							  }

							  if(o.field_type === 'datetime'){
								if(o.value){
								  var val = (o.value).split('T');
								  if(val[0]){
									var dateSplit = (val[0]).split('/');
									o.date = new Date(dateSplit[1] +'/'+ dateSplit[0] +'/'+ dateSplit[2]);
								  }
								  if(val[1]){
									o.hour = (val[1].split(':'))[0];
									o.minute = (val[1].split(':'))[1];
								  }
								}
								else{
								  var todayDateObj = new Date(); todayDateObj.setDate(todayDateObj.getDate() - (-1));
								  o.date = todayDateObj;
								  o.hour = '00';
								  o.minute = '00';
								}
							  }
							  
							  if(o.field_type === 'date'){
								var dateSplit = (o.value).split('/');
								o.date = new Date(dateSplit[1] +'/'+ dateSplit[0] +'/'+ dateSplit[2]);
							  }

							  (that.screenConfig[category]).push(o);
							}
						  });

						  this.fields = this.screenConfig["Detail"];
						  jQuery.each(this.screenConfig,function(key,value){
							//Sort Fields sequence
							value.sort((a: any, b: any)=> {return a.field_sequence - b.field_sequence;});//ascending sort

							jQuery.each(value,function(i,v){
							  if(v.field_type == 'select')
								that.fetchSelectOption(v);
							});
						  });
						  this.fields = this.screenConfig["Detail"];
						  this.dynamicTabGroup.selectedIndex = 0;
						  //var ele = document.getElementById('detail');
						  //this.setSelectedTab(ele);
					});
				}
			});
	}
	  
	  fetchSelectOption(fieldData){
		  var that = this;
		  if(fieldData.field_source){
			  var data = [];
			  var key = "name";
			  var value = "name";
			  var source_split = fieldData.field_source.split('+');
			  if(fieldData.field_from_config){
				  if(source_split[0] == "year_of_reg"){
					  var years = [];
                      var y = this.localData.years.from;
                      var cy = (new Date()).getFullYear();
                      if(Number(y) < Number(cy)){
							do {
                                 years.push( {name: Number(y)});
                                 y = y - (- 1);
                               }
                            while (y != cy);
                      }
                      years.push( {name: Number(cy)});//Add Current Year
					  data = years;
				  }
				  else
					data = this.localData[source_split[0]];
			  }
			  else{
				  var service = (source_split[0]).split('/');
				  //if(service.length === 1){
					var url:string = source_split[0];
					var key:string = source_split[1];
					var value:string = source_split[2];
					jQuery.ajax({
						  url:that.sharedService.fullhost+"/api/"+url,
						  type:"GET",
						  async: false,
						  beforeSend: function (xhr) {
							  xhr.setRequestHeader ("Authorization", "Bearer "+that.token);
							},
						  success: function(res,err){
							  data = res.results;
						  }
					});
					/*this.sharedService.call(url, "get", null, true)
						.subscribe( res => {
							data = res.results;
						});*/
				  /*}
				  else{
					  this.onFieldFocus(null,fieldData);
				  }*/
			  }
			  
			  if(data){
				  for(var j = 0; j < data.length; j++){
					  fieldData.option.push({key: data[j][key], value: data[j][value]});
				  }
			  }
		  }
	  }
	  
	  generateDisplayField(screen,item){
		  var that = this;
		  this.current_product_id = item.product_id;
		  this.screenConfig = {};
		  this.fields = [];
		  this.commonService.adminService.getFieldRights("","",screen)
			.subscribe( result => {
				if(result.error){
					that.sharedService.openMessageBox("E","Error in fetching.",null);
				}
				else{
					var fieldConfig = result.results;
					jQuery.each(fieldConfig,function(i,v){
						if(v.field_category){
							var category = (v.field_category).replace(/\s/g,'');
							if(!(that.screenConfig[category])){
								that.screenConfig[category] = []
							}
							var o = jQuery.extend(true, {}, v);
							o.type = "text";
							o.value = item[v.field_path];
							o.name = (v.field).replace(/\s/g,'');
							o.field_type = (v.field_type).toLowerCase();
							o.option = [];
							
							if(o.screen === 'Buy'){
								if(o.field_path === 'year_of_reg')
									o.field = o.field + ' (Greater than)';
								if(o.field_path === 'net_price')
									o.field = o.field + ' (Less than)';
								if(o.field_path === 'km_done')
									o.field = o.field + ' (Less than)';
							}
							
							(that.screenConfig[category]).push(o);
						}
					});
					
					jQuery.each(this.screenConfig,function(key,value){
						//Sort Fields sequence
						value.sort((a: any, b: any)=> {return a.field_sequence - b.field_sequence;});//ascending sort
					});
					
					this.fields = this.screenConfig["Detail"];
					this.dynamicTabGroup.selectedIndex = 0;
					//var ele = document.getElementById('detail');
					//this.setSelectedTab(ele);
				}
			});
	  }
	  
	  onTabClick(event: MatTabChangeEvent) {
			var tabname= event.tab.textLabel;
			if(tabname == "Details"){
				 this.fields = this.screenConfig["Detail"];
				 var mandatFieldCheck = this.sharedService.validateFields(jQuery('.detail-form')[0]);
			}
			if(tabname == "Specification"){
				 //this.fields = this.screenConfig["Specification"];
				 this.getProductSpecs(this.current_product_id);
			}
			if(tabname == "Contact"){
				 //this.fields = this.screenConfig["Contact"];
				 //this.getContactDetails();
				 //if(this.item.address_id)
					if(this.contactDetail && this.contactDetail.address_id){
						var map_point = this.contactDetail.map_point.split("/");
						this.loadGoogleMap(map_point[0],map_point[1]);
					}
					else
						this.loadContact(this.item.address_id);
				 //else
					 //this.loadContact('');
			}
			if(tabname == "Participants"){
				 this.fields = [];
				 this.getPartipants();
			}
	  }
	  
	  
	  
	  loadContact(address_id){
		  var that = this;
		  if(address_id){
				this.commonService.enduserService.getAddress("",address_id)
					.subscribe( result => {
						if(result.results.length>0){
							this.contactDetail = result.results[0];
							//this.contactDetail.name = this.item.name;
							//this.contactDetail.mobile = this.item.mobile;
							
							var map_point = result.results[0].map_point.split("/");
							this.loadGoogleMap(map_point[0],map_point[1]);
						}
						else{
							that.sharedService.openMessageBox("E","No contact details found.",null);	
						}
				});
		  }
		  else{
				this.commonService.enduserService.getAddress(this.userDetail.user_id,"")
					.subscribe( result => {
						if(result.results.length>1 && this.editMode){
							this.showAddressListDialog = true;							
							this.showDialog = true;
							this.address = result.results;
						}
						else if(result.results.length===1){
							this.contactDetail = result.results[0];
							//this.contactDetail.name = this.userDetail.name;
							//this.contactDetail.mobile = this.userDetail.mobile;
							this.item.country = result.results[0].country;
							this.item.state = result.results[0].state;
							this.item.city = result.results[0].city;
							this.item.location = result.results[0].locality;
							
							var map_point = result.results[0].map_point.split("/");
							this.loadGoogleMap(map_point[0],map_point[1]);
							
							this.item.address_id = result.results[0].address_id;
						}
						else{
							that.sharedService.openMessageBox("E","You have no Contact details maintained.",null);	
						}
				});
		  }
		  //this.serviceContact;
	  }
	  
	  onAddressSelect(evt,address){
		this.contactDetail = address;
		//this.contactDetail.name = this.userDetail.name;
		//this.contactDetail.mobile = this.userDetail.mobile;
		this.item.name = this.userDetail.name;
		this.item.mobile = this.userDetail.mobile;
		this.item.country = address.country;
		this.item.state = address.state;
		this.item.city = address.city;
		this.item.location = address.locality;
		
		var map_point = address.map_point.split("/");
		this.loadGoogleMap(map_point[0],map_point[1]);
		this.item.address_id = address.address_id;
		
		this.showAddressListDialog = false;
		this.showDialog = false;
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
	  
	  /*navSelect(evt){
		var ele = evt.target;
		
		//ele.className += " active";		
		if(ele.id == "detail"){
			 this.fields = this.screenConfig["Detail"];
		}
		if(ele.id == "spec"){
			 //this.fields = this.screenConfig["Specification"];
			 this.getProductSpecs(this.current_product_id);
		}
		if(ele.id == "contact"){
			 this.fields = this.screenConfig["Contact"];
			 this.getContactDetails();
		}
		if(ele.id == "participant"){
			 this.fields = [];
			 this.getPartipants();
		}
		this.setSelectedTab(ele);
	  }
	  
	  setSelectedTab(ele){
			var navbar = document.getElementById('id_navbar');
			for(var i = 0; i < navbar.children.length; i++){
				(navbar.children[i].children[0]).classList.remove("active");
			}
			
			ele.className += " active";		
			this.selectedCategory = ele.id;
	  }*/
	  
	  getProductSpecs(id){
		  var that = this;
		  this.fields = [];
		  if(id){
			  this.loadProductSpec(id,function(data){
				  jQuery.each(data,function(i,v){
							var spec_name = (v.specification_field_name)?v.specification_field_name:'';
							var o = {
								field : v.specification_field_name,
								field_path : "",
								type : "text",
								value : v.specification_field_value,
								name : (spec_name).replace(/\s/g,''),
								field_type : "input",
								field_required : false,
								editable : false,	
								visible : true
							};
							that.fields.push(o);					
					});
			  });
		  }
	  }
  
    loadProductSpec(id,callback){
		if(this.prodSpecs && this.prodSpecs.length>0){
			callback.apply(this,[this.prodSpecs]);
		}
		else{
		  this.commonService.adminService.getProductSpec(id)
			  .subscribe( prdSpecs => {
			if(prdSpecs.results){
				this.prodSpecs = prdSpecs.results;
			   callback.apply(this,[prdSpecs.results]);
			}
			else
			   callback.apply(this,[[]]);
		  });
		}
    }
	  
	  /*getContactDetails(){
			var that = this;
			var user_id = (this.item.user_id)?this.item.user_id:this.userDetail.user_id;
			this.sharedService.call('profile/?user_id='+user_id, "get", null, true)
				   .subscribe( data => {
						if(data.results.length>0){
							var profile = data.results[0];
							jQuery.each(that.fields,function(i,v){	
								var f = profile[v.field_path];
								v.value = (f != undefined)? f : '';
						   });
						}
			});
	  }*/
	  
	  getPartipants(){
		  this.bidBy = [];
		  this.commonService.enduserService.getBidBy("",this.item.bid_id)
			 .subscribe( data => {
			  this.bidBy = data.results;
        this.bidBy.sort(function(a, b){
				if(a.bid_date_time && b.bid_date_time){
					var aDateSplit = (a.bid_date_time.split(' ')[0]).split('/');
					var aDateObj = aDateSplit[2]+'-'+aDateSplit[1]+'-'+aDateSplit[0]+'T'+a.bid_date_time.split(' ')[1];
					var bDateSplit = (b.bid_date_time.split(' ')[0]).split('/');
					var bDateObj = bDateSplit[2]+'-'+bDateSplit[1]+'-'+bDateSplit[0]+'T'+b.bid_date_time.split(' ')[1];
					
					if (aDateObj < bDateObj)
						return 1;
					else if (aDateObj > bDateObj)
						return -1;
					return 0;
				}
				else{
					return 0;
				}
			});//descending sort
			});
	  }
	  
	updateData(evt,field){
		var that = this;
		if(field.field_path == "list_price"
			|| field.field_path == "net_price"
				|| field.field_path == "discount"
					|| field.field_path == "tax"
						|| field.field_path == "bid_amount"
							|| field.field_path == "km_done"){
			if(evt.target.nodeName === 'INPUT'){
				var val = evt.target.value;
				field.value = val.replace(/\D/g,'');
			}
		}
		
		
		if(field.field_path == "list_price"
			|| field.field_path == "discount"
				|| field.field_path == "tax"){
			var lp: any = '0';
			var d: any = '0';
			var t: any = '0';
			jQuery.each(this.fields, function(i,v){
				if(v.field_path == 'list_price')
					lp = (v.value)?v.value:'0';
				if(v.field_path == 'discount')
					d = (v.value)?v.value:'0';
				if(v.field_path == 'tax')
					t = (v.value)?v.value:'0';
			  });
			var d_per: any = (d/100).toString();
			d = (lp * d_per).toString();
			var t_per: any = (t/100).toString();
			t = (lp * t_per.toString()).toString();
			var net = (lp - d - (- t)).toString();
			jQuery.each(this.fields, function(i,v){
				if(v.field_path == 'net_price'){
					v.value = net;
				}
			});
			this.parentComponent.item['net_price'] = net;
		}
		else if(field.field_path == "bid_amount"){
			jQuery.each(this.fields, function(i,v){
				if(v.field_path == 'min_bid_hike'){
					if(that.sharedService.sharedObj.configParams['bid_hike_type'] === 'pc'){
						var pc = (!isNaN(that.sharedService.sharedObj.configParams['bid_hike_value']))?that.sharedService.sharedObj.configParams['bid_hike_value']:'0';
						v.value = Math.round(field.value * (pc/100));
					}
					else{
						v.value = that.sharedService.sharedObj.configParams['bid_hike_value'];
					}
				}
				else if(v.field_path == 'current_bid_amount'){
					v.value = (field.value == undefined)?"NA":field.value ;
				}
			});
			this.parentComponent.item['current_bid_amount'] = (field.value == undefined)?"NA":field.value ;
		}
		else{
			this.parentComponent.item[field.field_path] = (field.value == undefined)?"NA":field.value ;
		}
		/*if(field.field_path == "city")
			this.parentComponent.item.city = (field.value == undefined)?"NA":field.value ;
		if(field.field_path == "year_of_reg")
			this.parentComponent.item.year_of_reg = (field.value == undefined)?"NA":field.value;
		if(field.field_path == "km_done")
			this.parentComponent.item.km_done = (field.value == undefined)?"NA":field.value ;
		if(field.field_path == "fuel_type")
			this.parentComponent.item.fuel_type = (field.value == undefined)?"NA":field.value ;
		if(field.field_path == "amount")
			this.parentComponent.item.amount = (field.value == undefined)?"NA":field.value ;*/
	}
	
	onFieldFocus(evt,field){
		var that = this;
		var source_split = field.field_source.split('+');
		var service = (source_split[0]).split('/');
		if(service.length > 1){
			var filterField = source_split[0].substring(source_split[0].lastIndexOf("?")+1,source_split[0].lastIndexOf("="));
			var url:string = source_split[0];
			var key:string = source_split[1];
			var value:string = source_split[2];
			field.option = [];
			var filterValue: any;
			jQuery.each(that.fields, function(i,v){
				if(v.field_path == filterField)
					filterValue = v.value;
			  });
			if(filterValue){
				if(filterValue instanceof Array){//If multiple value
					jQuery.each(filterValue, function(i,v){
						jQuery.ajax({
							  url:that.sharedService.fullhost+"/api/"+url+ v,
							  type:"GET",
							  async: false,
							  beforeSend: function (xhr) {
								  xhr.setRequestHeader ("Authorization", "Bearer "+that.token);
								},
							  success: function(res,err){
								  var data = res.results;
								  for(var j = 0; j < data.length; j++){
									  field.option.push({key: data[j][key], value: data[j][value]});
								  }
							  }
						});
					});
				}
				else{
					jQuery.ajax({
						  url:that.sharedService.fullhost+"/api/"+url+ filterValue,
						  type:"GET",
						  async: false,
						  beforeSend: function (xhr) {
							  xhr.setRequestHeader ("Authorization", "Bearer "+that.token);
							},
						  success: function(res,err){
							  var data = res.results;
							  for(var j = 0; j < data.length; j++){
								  field.option.push({key: data[j][key], value: data[j][value]});
							  }
						  }
					});
				}
			}
		}
	}
	
	
	generateFilterField(screen){
		  //this.current_product_id = this.item.product_id;
		  var that = this;
		  //this.screenConfig = {};
		  this.fields = [];
		  this.commonService.adminService.getFieldRights("","",screen)
			.subscribe( result => {
				if(result.error){
					that.sharedService.openMessageBox("E","Error in fetching.",null); 
				}
				else{
					var fieldConfig = result.results;
					jQuery.each(fieldConfig,function(i,v){
						//if(v.field_category){
							//var category = (v.field_category).replace(/\s/g,'');
							//if(!(that.screenConfig[category])){
							//	that.screenConfig[category] = []
							//}
							var o = jQuery.extend(true, {}, v);
							o.type = "text";
							//o.value = (that.item[v.field_path] != undefined)? that.item[v.field_path] : "";
							o.name = (v.field).replace(/\s/g,'');
							o.field_type = (v.field_type).toLowerCase();
							o.option = [];
							
							that.fields.push(o);
						//}
					});
					
					this.fields.sort((a: any, b: any)=> {return a.field_sequence - b.field_sequence;});//ascending sort
					jQuery.each(this.fields,function(i,v){
						jQuery.each(that.item,function(indx,val){
							if(v.field_path === val.filter_field){
								if(v.field_type === 'select'){
									if(!(v.value))
										v.value = [];
									
									v.value.push(val.filter_value);
								}
								else{
									v.value = val.filter_value;
								}
							}
						});
						if(v.field_type == 'select')
							that.fetchSelectOption(v);
					});
					//});
					//this.fields = this.screenConfig["Detail"];
					//this.dynamicTabGroup.selectedIndex = 0;
					//var ele = document.getElementById('detail');
					//this.setSelectedTab(ele);
				}
			});
	  }
	  
	  onAddressChangeClick(){
		  this.loadContact('');
	  }
	  
	  requiredFieldCheck(){
		  this.dynamicTabGroup.selectedIndex = 0;
		  return this.sharedService.validateFields(jQuery('.detail-form')[0]);
	  }
	
	onParticipantNameClick(evt,item){
		this.participantMemberDetail = {};
		this.showParticipantMemberDialog = true;
		this.commonService.getProfile(item.bid_by_user_id)
			.subscribe( result => {
				if(result.results && result.results.length > 0)
					this.participantMemberDetail = result.results[0];
			});
	}
  
  onDateTimeChange(evt,field){
    var dateObj = field.date;
    var hrs = field.hour;
    var mins = field.minute;
    var selectedDateObj = new Date(dateObj.getFullYear() +"/"+ (dateObj.getMonth() - (-1)) +"/"+ dateObj.getDate() +" "+ hrs +":"+ mins +":00");
    var minDateObj = new Date();
    minDateObj.setMinutes(minDateObj.getMinutes() - (-30));//30 minute before now
    if(selectedDateObj < minDateObj){
      this.sharedService.openMessageBox("E","Bid should be valid for atleast 30 minutes.",null);
      var todayDateObj = new Date(); todayDateObj.setDate(todayDateObj.getDate() - (-1));
		  field.date = todayDateObj;
			field.hour = '00';
			field.minute = '00';
    }
  }
  
  onDateChange(evt,field){
	var dateObj = field.date;
	field.value = dateObj.getDate() +"/"+ (dateObj.getMonth() - (-1)) +"/"+ dateObj.getFullYear() ;
  }
	
	
	
	
	
	
	
	
	
	
	


	/*onFilterFieldClick(evt,field){
		var that = this;
		this.selectedFilterField = field;
		this.selectList = [];	
		var values: any = [];
		values = this.selectedFilterField.value.split(', ');
		jQuery.each(this.selectedFilterField.option,function(i,v){			
			var itm:any = {};
			itm = jQuery.extend(true, {}, v);
			if(values.indexOf(itm.value) != -1)
				itm.checked = true;
			else
				itm.checked = false;
			that.selectList.push(itm);
		});
		this.showFilterFieldDialog = true;
	}	
	
	onFilterFieldValueSelect(){
		var that = this;
		var selectedItem:any = [];
		this.selectedFilterField.value = "";
		jQuery.each(this.selectList,function(i,v){
			if(v.checked){
				selectedItem.push(v);
				if(that.selectedFilterField.value)
					that.selectedFilterField.value += ", "+v.value;
				else
					that.selectedFilterField.value = v.value;
			}
		});
		this.showFilterFieldDialog = false;
	}*/
	
	onValueHelp(evt){
		this.showValueHelpDialog = true;
		this.showStateListDialog = true;
		this.showValueHelpListDialog = false;
	}
	onStateValueSelect(evt,val){
		this.showValueHelpDialog = true;
		this.showStateListDialog = false;
		this.showValueHelpListDialog = true;
	}
	onValueHelpSelect(evt,val){
		this.showValueHelpDialog = false;
		this.showStateListDialog = false;
		this.showValueHelpListDialog = false;
	}
		
}
