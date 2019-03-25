//Home Page Component
import {Component,OnInit,ViewChild, HostListener} from '@angular/core';
import { Injectable }     from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import {Router} from '@angular/router';
import { CommonService } from '../common.service';
import { SharedService } from '../shared.service';
import { AppTileTemplate } from './reusable/tileTemplate.component';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
declare var jQuery:any;
declare var $:any;

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
      templateUrl: './home.component.html',
      styleUrls: ['./home.component.css'],
      providers: [CommonService]
})

@Injectable()
export class AppHome implements OnInit {
		id:string = "AppHome";
		cities: any;
		types: any;
		userDetail: any = {};
		city : string = "";
		type: string = "All";
		search: string = "";
		results: any = [];
		searchResponse: any = {};
		suggestion: any = [];
		searchSelected: any = {};
		city_suggestion: any = [];
		citySelected: any = {};
		self: any = this;
		loading: boolean = false;
		lastScroll: any = 0;
		noMoreData: boolean = false;
		screenAccess:any = [];
		newChatTimer:any;
    bidTimer: any;
		bid_start_in: string = '';
		chats: any = {count: 0, access: false};
		showSubMenu: boolean = false;
		postTabAccess: any =[];
		@ViewChild('postTypeTabGroup') postTypeTabGroup;
		
      constructor(private router: Router, private http: Http, private commonService: CommonService, private sharedService: SharedService) {
              var that = this;;
                     this.getJSON().subscribe(data => {
                                           that.types = data.alertTypes;
                                           that.cities = data.cities;
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
        this.sharedService.sharedObj.containerContext.title = "";	
		this.sharedService.sharedObj.currentContext = this;
		this.sharedService.getUserProfile(function(user){
			that.userDetail = user;
			var access = user.screenAccess;	
			for(var i = 0; i<access.length; i++){
				if((access[i].name).toLowerCase().indexOf('sell') != -1){
					access[i].iconSrc = "assets/sale_icon.png";
					access[i].id = ((access[i].name).replace(/ /g,"")).toLowerCase()+"_link" ;
					that.screenAccess.push(access[i]);
					
					if(access[i].applicable && access[i].for_nav)
						that.postTabAccess.push("Sale");
				}
				else if((access[i].name).toLowerCase().indexOf('buy') != -1){
					access[i].iconSrc = "assets/buy_icon.png";
					access[i].id = ((access[i].name).replace(/ /g,"")).toLowerCase()+"_link" ;
					that.screenAccess.push(access[i]);
					
					if(access[i].applicable && access[i].for_nav)
						that.postTabAccess.push("Buy");
				}
				else if((access[i].name).toLowerCase().indexOf('bid') != -1){
					access[i].iconSrc = "assets/bid_icon.png";
					access[i].id = ((access[i].name).replace(/ /g,"")).toLowerCase()+"_link" ;
					that.screenAccess.push(access[i]);
					
					if(access[i].applicable && access[i].for_nav)
						that.postTabAccess.push("Bid");
				}
				else if((access[i].name).toLowerCase().indexOf('service') != -1){
					access[i].iconSrc = "assets/service_icon.png";					
					access[i].id = ((access[i].name).replace(/ /g,"")).toLowerCase()+"_link" ;
					that.screenAccess.push(access[i]);
					
					if(access[i].applicable && access[i].for_nav)
						that.postTabAccess.push("Service");
				}
				else if((access[i].name).toLowerCase().indexOf('chat') != -1){
					that.chats.access = true;
					//access[i].iconSrc = "assets/chat_icon.png";					
					//access[i].id = ((access[i].name).replace(/ /g,"")).toLowerCase()+"_link" ;
					//that.screenAccess.push(access[i]);
				}
			}
			that.screenAccess.sort((a: any, b: any)=> {return a.sequence - b.sequence;});//ascending sort
			that.getNewChatCount();
      
			that.type = (that.postTabAccess[0])?that.postTabAccess[0]:'All';
			
			if(that.sharedService.sharedObj.backUpData['home'] && that.sharedService.sharedObj.backUpData['home'].type){
				that.type = that.sharedService.sharedObj.backUpData['home'].type;
				that.searchResponse = that.sharedService.sharedObj.backUpData['home'].search[that.type].searchResponse;
				that.results = that.sharedService.sharedObj.backUpData['home'].search[that.type].results;				
				that.noMoreData = that.sharedService.sharedObj.backUpData['home'].search[that.type].noMoreData;
				
				that.searchSelected = that.sharedService.sharedObj.backUpData['home'].searchSelected;
				that.citySelected = that.sharedService.sharedObj.backUpData['home'].citySelected;
				that.search = that.searchSelected.text;
				that.city = that.citySelected.text;
				
				that.postTypeTabGroup.selectedIndex = that.postTabAccess.indexOf(that.type);
				
			}
			else{
				that.sharedService.sharedObj.backUpData['home'] = {};
				that.onSearch(null);
			}
		});
		document.addEventListener("click", function (e) {
			that.suggestion = [];
			that.city_suggestion = [];
		});
		
		//For Search Field Key Press Event
		$('#searchInput').keyup(function(e){
				var listItems = $(".searchSuggestions");
				var key = e.keyCode;
				var selected = $('.autocomplete-selected').eq(0);
				var current;
      
				if(key !== 13){
					that.searchSelected = {
						product_type_name: that.search,
						brand_name: that.search,
						model: that.search,
						variant: that.search,
						text: that.search
					};
				}
	  
				if ( key == 8 ){ // Backspace key
					if(!(that.search)){//If empty
						that.searchResponse = {sale:{},buy:{},bid:{},service:{}};
						that.results = [];
						that.searchSelected = {};
						that.loadResult(that.searchSelected);
					}
				}
					
				if ( key == 13 ){ // Enter key
					that.searchResponse = {sale:{},buy:{},bid:{},service:{}};
					that.results = [];
					
					that.loadResult(that.searchSelected);
				}
					
				if ( key != 40 && key != 38 ) return;
				listItems.removeClass('autocomplete-selected');

				if ( key == 40 ){ // Down key
					if ( selected.length === 0 || selected.is(':last-child') ) {
						current = listItems.eq(0);
					}
					else {
						current = selected.next();
					}
					that.search = current.text();
					that.searchSelected = {
							product_type_name: current.data('product_type_name'),
							brand_name: current.data('brand_name'),
							model: current.data('model'),
							variant: current.data('variant'),
							text: current.text()
					};
				}
				else if ( key == 38 ){ // Up key
					if ( selected.length === 0 || selected.is(':first-child') ) {
						current = listItems.last();						
					}
					else {
						current = selected.prev();
					}
					that.search = current.text();
					that.searchSelected = {
							product_type_name: current.data('product_type_name'),
							brand_name: current.data('brand_name'),
							model: current.data('model'),
							variant: current.data('variant'),
							text: current.text()
					};
				}
				current.addClass('autocomplete-selected');
		});​
		
		
		//For Location Field Key Press Event
		$('#cityInput').keyup(function(e){
				var listItems = $(".citySuggestions");
				var key = e.keyCode;
				var selected = $('.city-selected').eq(0);
				var current;
      
				if(key !== 13){
					that.citySelected =  {
							country: that.city,
							state: that.city,
							city: that.city,
							location: that.city,
							text: that.city
					};
				}
      
				if ( key == 8 ){ // Backspace key
					if(!(that.city)){//If empty
						that.searchResponse = {sale:{},buy:{},bid:{},service:{}};
						that.results = [];
						that.searchSelected = {};
						that.loadResult(that.searchSelected);
					}
				}
					
				if ( key == 13 ){ // Enter key
					that.searchResponse = {sale:{},buy:{},bid:{},service:{}};
					that.results = [];
					that.loadResult(that.searchSelected);
				}
					
				if ( key != 40 && key != 38 ) return;
				listItems.removeClass('city-selected');

				if ( key == 40 ){ // Down key
					if ( selected.length === 0 || selected.is(':last-child') ) {
						current = listItems.eq(0);						
					}
					else {
						current = selected.next();
					}
					that.city = current.text();
					that.citySelected =  {
							country: current.data('country'),
							state: current.data('state'),
							city: current.data('city'),
							location: current.data('location'),
							text: current.text()
					};
				}
				else if ( key == 38 ){ // Up key
					if ( selected.length === 0 || selected.is(':first-child') ) {
						current = listItems.last();
					}
					else {
						current = selected.prev();
					}
					that.city = current.text();
					that.citySelected =  {
							country: current.data('country'),
							state: current.data('state'),
							city: current.data('city'),
							location: current.data('location'),
							text: current.text()
					};
				}
				current.addClass('city-selected');
		});​
		
	}
	
	ngAfterViewInit(){
		var that = this;
		if(that.sharedService.sharedObj.backUpData['home']){
				var y_axis = that.sharedService.sharedObj.backUpData['home'].y_axis;
				if(y_axis){
					document.getElementsByClassName('scrollContainerStyle')[0].scrollTo(0,y_axis);
					that.sharedService.sharedObj.backUpData['home'].y_axis = null;
				}
		}
	}
		  
	suggest(evt){
			var key = evt.keyCode;
			if ( key != 40 && key != 38 && key != 13 ){
				var that = this;
				this.suggestion = [];
				//this.searchSelected = {};
				var location = (this.citySelected.location !== undefined)?this.citySelected.location:"" ;
				var city = (this.citySelected.city !== undefined)?this.citySelected.city:"" ;
				var type = (this.type === "All")? "" : this.type ;
				this.commonService.enduserService.search(this.search,city,location,type)
					.subscribe( data => {			  
						  this.suggestion = data.results;
						//  if(this.suggestion.length > 0)
							//  this.searchSelected = this.suggestion[0];
					});
			}
	  }
	  
	  onSuggestSelect(evt,selected){
		  this.searchSelected = selected;
		  this.searchResponse = {sale:{},buy:{},bid:{},service:{}};
		  this.results = [];
		  this.loadResult(selected);
	  }
	  
	  loadResult(selected){
		document.getElementById("homeSearchLoaderContainer").style.display = "block";
		this.loading = true;
		if(!(this.results) || this.results.length<=0){
			  this.lastScroll = 0;
			  this.noMoreData = false;
		}
		var that = this;
		this.search = selected.text;
		this.city = (this.citySelected.text !== undefined)?this.citySelected.text:"" ;
		this.suggestion = [];
		this.city_suggestion = [];
		var queries = {
			product_type_name: selected.product_type_name,
			brand_name: selected.brand_name,
			model: selected.model,
			variant: selected.variant
		};
		var type = (this.type === "All")? "" : this.type ;
		var city = (this.citySelected.city !== undefined)?this.citySelected.city:"" ;
		var location = (this.citySelected.location !== undefined)?this.citySelected.location:"" ;
		var limit = 10;
		if(this.type === "All")
			limit = 3;
		var sale = {count: this.searchResponse.sale.count, skip: this.searchResponse.sale.skip, limit: limit},
		buy = {count: this.searchResponse.buy.count, skip: this.searchResponse.buy.skip, limit: limit},
		bid = {count: this.searchResponse.bid.count, skip: this.searchResponse.bid.skip, limit: limit},
		service = {count: this.searchResponse.service.count, skip: this.searchResponse.service.skip, limit: limit};
		var userFilter = this.sharedService.sharedObj.userFilter;
		this.commonService.enduserService.searchload(queries,type,city,location,sale,buy,bid,service,userFilter)
		.subscribe( data => {
			if(data.chatCount){
				this.chats.count = data.chatCount;
			}
			
			this.sharedService.sharedObj.containerContext.bidIsLive = data.bidIsLive;
      if(!(data.bidIsLive)){
				this.startBidTimer(data.bidSlotFrom);
			}
			if(data.statusCode === 'F'){
				if(data.noSubscription){
				  this.sharedService.noSubscriptionMessageBox(data.msg,function(){
					that.router.navigateByUrl('/Container/BuySubscription');
				  });
				}
				else if(data.noAddress){
				  this.sharedService.noAddressMessageBox(data.msg,function(){
					that.router.navigateByUrl('/Container/Address/blank/create');
				  });
				}
				else{
				  var message = "Unable to load data.";
				  if(data.msg)
					message = data.msg;
				  this.sharedService.openMessageBox("E",message,null);
				}
			}
			else{
							if(data.completed){
								this.noMoreData = true;
							}
							this.searchResponse = data;
							this.results = this.results.concat(data.results);
							jQuery.each(this.results,function(i,v){
							  if(!(v.data)){
								//v.fav = false;
								//v.price = v.net_price;
								v.currency = "INR";
								v.no_image = "1";
								var transc_id = "";
								if(v.type === "Sale") transc_id = v.sell_id; 
								if(v.type === "Buy") transc_id = v.buy_req_id; 
								if(v.type === "Bid") transc_id = v.bid_id; 
								if(v.type === "Service") transc_id = v.service_id;
								//that.getFav(v,transc_id);
								v.busy = true;
								that.getResultImage(v,transc_id);
							  }
						  });
						  this.results.sort((a: any, b: any)=> {
													//var fromd = a.createdAt.split('/');
													//var fromdObj = new Date(fromd[2]+'-'+fromd[1]+'-'+fromd[0]);
													//var tod = b.createdAt.split('/');
													//var todObj = new Date(tod[2]+'-'+tod[1]+'-'+tod[0]);
													var fromdObj = new Date(a.createdAt);
													var todObj = new Date(b.createdAt);
													if (fromdObj < todObj)
													  return 1;
													if (fromdObj > todObj)
													  return -1;
													return 0;
												});//descending sort
												
							if(this.sharedService.sharedObj.backUpData){
								this.sharedService.sharedObj.backUpData['home'].type = this.type;
								this.sharedService.sharedObj.backUpData['home'].searchSelected = this.searchSelected;
								this.sharedService.sharedObj.backUpData['home'].citySelected = this.citySelected;
								if(!(this.sharedService.sharedObj.backUpData['home'].search)){
									this.sharedService.sharedObj.backUpData['home'].search = {};
								}
								this.sharedService.sharedObj.backUpData['home'].search[this.type] = {};
								this.sharedService.sharedObj.backUpData['home'].search[this.type].condition = ((this.city)?this.city:'') +'/'+ ((this.search)?this.search:'');
								this.sharedService.sharedObj.backUpData['home'].search[this.type].searchResponse = this.searchResponse;
								this.sharedService.sharedObj.backUpData['home'].search[this.type].results = this.results;
								this.sharedService.sharedObj.backUpData['home'].search[this.type].noMoreData = this.noMoreData;	
							}
						  
						  this.loading = false;
			}
			document.getElementById("homeSearchLoaderContainer").style.display = "none";
		});
	  }
	  
	  onSearch(evt){
		  this.onSuggestSelect(evt,this.searchSelected);
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
	
	suggestCity(evt){
		var key = evt.keyCode;
		if ( key != 40 && key != 38 && key != 13 ){
			var that = this;
			this.city_suggestion = [];
			//this.citySelected = {};
			this.commonService.enduserService.searchLoc(this.city)
				.subscribe( data => {			  
					this.city_suggestion = data.results;
					 //if(this.city_suggestion.length > 0)
						  //this.citySelected = this.city_suggestion[0];
				});
		}
	}
	
	onCitySuggestSelect(evt,selected){
		this.citySelected = selected;
		this.city = selected.text;	
		this.city_suggestion = [];
		this.searchResponse = {sale:{},buy:{},bid:{},service:{}};
		this.results = [];
		this.loadResult(this.searchSelected);
	}
	
	onCitySearch(evt){
		this.onCitySuggestSelect(evt,this.citySelected);
	}
	
	
	getResultImage(item,transaction_id){
		  this.commonService.enduserService.getImage("","",transaction_id)
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
	
	
	onItemSelect(item){
		if(this.sharedService.sharedObj.backUpData['home']){
			this.sharedService.sharedObj.backUpData['home'].y_axis = document.getElementsByClassName('scrollContainerStyle')[0].scrollTop;
		}
		
		if(item.type == "Sale"){
			if(item.user_id == this.userDetail.user_id)
				this.router.navigate(['/Container/Sell',item.sell_id,'edit']);
			else
				this.router.navigate(['/Container/Sell',item.sell_id]);
		}
		else if(item.type == "Buy"){
			if(item.user_id == this.userDetail.user_id)
				this.router.navigate(['/Container/Buy',item.buy_req_id,'edit']);
			else
				this.router.navigate(['/Container/Buy',item.buy_req_id]);
		}
		else if(item.type == "Bid"){
			if(item.user_id == this.userDetail.user_id)
				this.router.navigate(['/Container/Bid',item.bid_id,'edit']);
			else
				this.router.navigate(['/Container/Bid',item.bid_id]);
		}
		else if(item.type == "Service"){
			if(item.user_id == this.userDetail.user_id)
				this.router.navigate(['/Container/Service',item.service_id,'edit']);
			else
				this.router.navigate(['/Container/Service',item.service_id]);
		}
	}
	
	
	onTypeSelect(evt){
		this.onSuggestSelect(evt,this.searchSelected);
	}
	
	onFav(evt,item){
		
	}
	
	reloadItems(){
		this.onSuggestSelect(null,this.searchSelected);
	}
	
	
	onRemoveCitySearch(evt){
		this.citySelected = {};
		this.searchResponse = {sale:{},buy:{},bid:{},service:{}};
		this.results = [];
		this.loadResult(this.searchSelected);
		this.city = "";
	}
	
	onRemoveSearch(evt){
		this.searchSelected = {};
		this.searchResponse = {sale:{},buy:{},bid:{},service:{}};
		this.results = [];
		this.loadResult(this.searchSelected);
		this.search = "";
	}
	
	
	paginate(){
		this.loadResult(this.searchSelected);
	}
	
	
	@HostListener('scroll', ['$event'])
	handleScroll(event) {
		var elem = jQuery(event.currentTarget);
		if(!this.loading && !this.noMoreData){
			var scroll = elem.scrollTop();
			if (scroll > this.lastScroll) {	//When scroll down									
				var pos = elem.scrollTop() + elem[0].offsetHeight;
				var max = elem[0].scrollHeight + (elem[0].scrollHeight * 0.15);
				var min = elem[0].scrollHeight - (elem[0].scrollHeight * 0.15);
				// pos/max will give you the distance between scroll bottom and and bottom of screen in percentage.
				if(pos <= max && pos >= min )   {
					console.log('almost reached');//
					this.paginate();
				}
			}
		}
    
    this.controlHomePageFooter(elem);
		this.lastScroll = elem.scrollTop();
	}
	
	
	controlHomePageFooter(elem){
		var scroll = elem.scrollTop();
		if (scroll > this.lastScroll) {	//When scrolled down	
			jQuery('#homeFooter').removeClass('on-canvas-home');
		}
		else{ //When scrolled up	
			jQuery('#homeFooter').addClass('on-canvas-home');
		}
	}
	
	onMyPost(evt){
		this.router.navigateByUrl('/Container/MyPost');
	}
	onPost(evt){
		this.showSubMenu = !(this.showSubMenu);
	}
	onChat(evt){
		this.router.navigateByUrl('/Container/ChatInbox');
	}
	
	onNav(evt){
		var link = evt.currentTarget.id;
		var that = this;
		switch(link){									
			case "sell_link":
				that.sharedService.sharedObj.postItem = {};
				that.router.navigateByUrl('/Container/Sell/new');
				break;
			case "bid_link":
				that.sharedService.sharedObj.postItem = {};
				that.router.navigateByUrl('/Container/Bid/new');
				break;
			case "buy_link":
				that.sharedService.sharedObj.postItem = {};
				that.router.navigateByUrl('/Container/Buy/new');
				break;
			case "service_link":
				that.sharedService.sharedObj.postItem = {};
				that.router.navigateByUrl('/Container/Service/new');
				break;
		}
	}
	
	getNewChatCount(){
		var that = this;
		this.commonService.enduserService.getNewChatCount()
			.subscribe( data => {
				if(data.statusCode === 'S'){            
					for(var i=0; i<this.screenAccess.length; i++){
						if((this.screenAccess[i].name).toLowerCase().indexOf('chat') != -1){
							this.screenAccess[i].count = data.count;
							break;
						}
					}
				}
				else{
					//this.sharedService.openMessageBox("E",'',null);
				}
		});
	}
	
	checkNewChat(){
		var that = this;
		this.newChatTimer = setInterval(function(){
			that.getNewChatCount();
		},10000);
	}
	
	onPostTypeTabClick(evt){
		if(this.type !== evt.tab.textLabel){
		  this.type = evt.tab.textLabel;
		  
		  if( (this.type == 'Bid') || 
        !(this.sharedService.sharedObj.backUpData['home']) ||
			!(this.sharedService.sharedObj.backUpData['home'].search[this.type]) ||
				this.sharedService.sharedObj.backUpData['home'].search[this.type].condition !== ((this.city)?this.city:'')+'/'+((this.search)?this.search:'') ){
					this.onSuggestSelect(evt,this.searchSelected);
			}
			else{
					this.sharedService.sharedObj.backUpData['home'].type = this.type;
					this.searchResponse = this.sharedService.sharedObj.backUpData['home'].search[this.type].searchResponse;
					this.results = this.sharedService.sharedObj.backUpData['home'].search[this.type].results;				
					this.noMoreData = this.sharedService.sharedObj.backUpData['home'].search[this.type].noMoreData;
			}
		}
	}
  
  startBidTimer(bidSlotFrom){
		this.bid_start_in = '---';
		if(this.bidTimer)
			clearInterval(this.bidTimer);
		if(bidSlotFrom){
			var that = this;
			that.bidTimer = setInterval(function(){
				that.bid_start_in = '';
				var current:any = new Date();				
				var to:any = new Date(bidSlotFrom);
				var milliseconds:number = to - current;
				if(milliseconds > 0){
					var seconds:any = (milliseconds / 1000) % 60;
					seconds = parseInt(seconds) ;
					var minutes:any  = (milliseconds / (1000*60)) % 60;
					minutes = parseInt(minutes);
					var hours:any = (milliseconds / (1000*60*60)) % 24;
					hours = parseInt(hours);				
					var days:any = (milliseconds / (1000*60*60*24));
					days = parseInt(days);
					
					that.bid_start_in = (days+' days '+hours+' hrs '+minutes+' mins '+seconds+' secs').toString();
				}
				else{
					//Refresh Bid Page
					clearInterval(that.bidTimer);
					that.reloadItems();
				}
			}, 1000);
		}
	}
	
	ngOnDestroy(){
		clearInterval(this.newChatTimer);
    clearInterval(this.bidTimer);
	}
		
}
