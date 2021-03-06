//
import {Component,OnInit,HostListener} from '@angular/core';
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
      templateUrl: './favourite.component.html',
      styleUrls: ['./favourite.component.css'],
      providers: [CommonService]
})

@Injectable()
export class AppFav implements OnInit {
		showConfirmDialog: boolean = false;
		userDetail: any = {};
		results: any = [];
		unFavItem: any = {};
		self: any = this;

      constructor(private router: Router, private http: Http, private commonService: CommonService, private sharedService: SharedService) {
              var that = this;;
                     this.getJSON().subscribe(data => {
						 
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
		this.sharedService.sharedObj.currentContext = this;
        this.sharedService.sharedObj.containerContext.title = "My Favourite";	
		var that = this;
		this.results = [];
		this.sharedService.getUserProfile(function(user){
			that.userDetail = user;
			that.loadFavourites();
		});
				
	}
	
	
	loadFavourites(){
		this.commonService.enduserService.getFav(this.userDetail.user_id,"")
			  .subscribe( data => {			  
						this.results = data.results;
						this.sortFavList();
						this.getItemDetails();
			  });
	}
	
	getItemDetails(){
		var that = this;
    var favPost = [];
    var loopCount = 0;
		jQuery.each(this.results,function(i,v){
			v.fav = true;
			v.fav_id = v._id;
			if(v.type == "Sale"){
				that.commonService.enduserService.getSell("",v.bid_sell_buy_id,"",null,null,null)
				  .subscribe( data => {			  
						var res = data.results[0];
          if(res && res.active === 'X'){
						jQuery.each(res,function(key,val){
							if(key !== "_id")
								v[key] = val;
						});
						//v.price = res.net_price;
						//v.currency = "INR";
						//v.no_image = "1";
						v.transactionTyp = "Sale";
						that.commonService.enduserService.getImage("","",v.bid_sell_buy_id)
						  .subscribe( prdImages => {			  
								  var prdImage = prdImages.results;
								  if(prdImage.length > 0){
									  var base64string = that.arrayBufferToBase64(prdImage[0].data.data);
									  v.data = "data:"+prdImage[0].type+";base64,"+base64string;
								  }
              favPost.push(v);
              loopCount = loopCount - (-1);
              if(loopCount === that.results.length){
                that.results = favPost;
				that.sortFavList();
			  }
						  });
          }
          else{
            loopCount = loopCount - (-1);
            if(loopCount === that.results.length){
              that.results = favPost;
				that.sortFavList();
			}
          }
				  });
			}
			if(v.type == "Buy"){
				that.commonService.enduserService.getBuy("",v.bid_sell_buy_id,"",null,null,null)
				  .subscribe( data => {			  
						var res = data.results[0];
          if(res && res.active === 'X'){
						jQuery.each(res,function(key,val){
							if(key !== "_id")
								v[key] = val;
						});
						//v.price = res.net_price;
						//v.currency = "INR";
						//v.no_image = "1";
						v.transactionTyp = "Buy";
						that.commonService.enduserService.getImage("","",v.bid_sell_buy_id)
						  .subscribe( prdImages => {			  
								  var prdImage = prdImages.results;
								  if(prdImage.length > 0){
									  var base64string = that.arrayBufferToBase64(prdImage[0].data.data);
									  v.data = "data:"+prdImage[0].type+";base64,"+base64string;
								  }
              favPost.push(v);
              loopCount = loopCount - (-1);
              if(loopCount === that.results.length){
                that.results = favPost;
				that.sortFavList();
			  }
						  });
          }
          else{
            loopCount = loopCount - (-1);
            if(loopCount === that.results.length){
              that.results = favPost;
				that.sortFavList();
			}
          }
				  });
			}
			if(v.type == "Bid"){
				that.commonService.enduserService.getBid("",v.bid_sell_buy_id,"",null,null,null)
				  .subscribe( data => {			  
						var res = data.results[0];
						
						var bid_valid_to_dateObj = '';
						if(res.bid_valid_to){
							var val_split = (res.bid_valid_to).split('T');
							if(val_split[0]){//Date
								var dateSplit = (val_split[0]).split('/');
								bid_valid_to_dateObj = dateSplit[1] +'/'+ dateSplit[0] +'/'+ dateSplit[2];
							}
							if(val_split[1]){//Time
								bid_valid_to_dateObj = bid_valid_to_dateObj + ' ' + val_split[1];
							}
						}
						
          if(res && new Date(bid_valid_to_dateObj) >= new Date()){
						jQuery.each(res,function(key,val){
							if(key !== "_id")
								v[key] = val;
						});
						//v.price = res.net_price;
						//v.currency = "INR";
						//v.no_image = "1";
						v.transactionTyp = "Bid";
						that.commonService.enduserService.getImage("","",v.bid_sell_buy_id)
						  .subscribe( prdImages => {			  
								  var prdImage = prdImages.results;
								  if(prdImage.length > 0){
									  var base64string = that.arrayBufferToBase64(prdImage[0].data.data);
									  v.data = "data:"+prdImage[0].type+";base64,"+base64string;
								  }
              favPost.push(v);
              loopCount = loopCount - (-1);
              if(loopCount === that.results.length){
                that.results = favPost;
				that.sortFavList();
			  }
						  });
          }
          else{
            loopCount = loopCount - (-1);
            if(loopCount === that.results.length){
              that.results = favPost;
				that.sortFavList();
			}
          }
				  });
			}
			if(v.type == "Service"){
				that.commonService.enduserService.getService("",v.bid_sell_buy_id,"",null,null,null)
				  .subscribe( data => {			  
						var res = data.results[0];
          if(res && res.active === 'X'){
						jQuery.each(res,function(key,val){
							if(key !== "_id")
								v[key] = val;
						});
						//v.price = res.net_price;
						//v.currency = "INR";
						//v.no_image = "1";
						v.transactionTyp = "Service";
						that.commonService.enduserService.getImage("","",v.bid_sell_buy_id)
						  .subscribe( prdImages => {			  
								  var prdImage = prdImages.results;
								  if(prdImage.length > 0){
									  var base64string = that.arrayBufferToBase64(prdImage[0].data.data);
									  v.data = "data:"+prdImage[0].type+";base64,"+base64string;
								  }
              favPost.push(v);
              loopCount = loopCount - (-1);
              if(loopCount === that.results.length){
                that.results = favPost;
				that.sortFavList();
			  }
						  });
          }
          else{
            loopCount = loopCount - (-1);
            if(loopCount === that.results.length){
              that.results = favPost;
				that.sortFavList();
			}
          }
				  });
			}
		});
	}
	
	sortFavList(){
		this.results.sort(function(a, b){
			if(a.createdAt && b.createdAt){
					var aDateObj = new Date(a.createdAt);
					var bDateObj = new Date(b.createdAt);					
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
		if(item.type == "Sale"){
			this.router.navigate(['/Container/Sell',item.sell_id]);
		}
		if(item.type == "Buy"){
			this.router.navigate(['/Container/Buy',item.buy_req_id]);
		}
		if(item.type == "Bid"){
			this.router.navigate(['/Container/Bid',item.bid_id]);
		}
		if(item.type == "Service"){
			this.router.navigate(['/Container/Service',item.service_id]);
		}
	}
	
	reloadItems(){
		this.loadFavourites();
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
			this.sharedService.showFooter();
		}
		//}
	}
	
	
	/*onUnFavourite(evt,item){
		this.unFavItem = item;
		this.showConfirmDialog = true;
	}
	
	onUnFavYes(){
		if(this.unFavItem){
			this.commonService.enduserService.deleteFav(this.unFavItem)
			  .subscribe( data => {			  
				if(data.ok === 1){
					alert("Removed Successfully.");
					this.showConfirmDialog = false;
					this.loadFavourites();
				}
			});
		}
	}
	
	onUnFavNo(){
		this.showConfirmDialog = false;
	}*/
}
