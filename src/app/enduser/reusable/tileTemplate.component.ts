import {Component,OnInit,Input,Output,EventEmitter} from '@angular/core';
import { Injectable }     from '@angular/core';
import {Router} from '@angular/router';
import { CommonService } from '../../common.service';
import { SharedService } from '../../shared.service';
declare var jQuery:any;

@Component({
      selector: 'tile-template',
      templateUrl: './tileTemplate.component.html',
      styleUrls: ['./tileTemplate.component.css'],
      providers: [CommonService]
})

@Injectable()
export class AppTileTemplate implements OnInit {		
		userDetail: any = {};
		localData: any;
		time_left: any = "";
		timer: any;
		@Input() item;
		@Input() parentComponent;
		@Output() openItem = new EventEmitter();
		
    constructor(private router: Router, private commonService: CommonService, private sharedService: SharedService) {
           
	}

    ngOnInit(){
		var that = this;
		if(this.item.sell_id)
			this.item.transactionTyp = 'Sale';
		else if(this.item.buy_req_id)
			this.item.transactionTyp = 'Buy';
		else if(this.item.bid_id){
			this.item.transactionTyp = 'Bid';
			if(this.item.bid_status === "Active")
				this.startTimer(this.item.bid_valid_to);
		}
		else if(this.item.service_id)
			this.item.transactionTyp = 'Service';
		
		if(this.item.createdAt){
			var dateArray = this.item.createdAt.split('/');
			var monthList = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
			this.item.createdOn = dateArray[0]+ " " + monthList[dateArray[1]];
		}
		
		this.sharedService.getUserProfile(function(user){
				that.userDetail = user;
		});
    }
	
	open(evt,data) {
        this.openItem.emit(data);
    }
	
	startTimer(validTo){
		this.time_left = '---';
		if(this.timer)
			clearInterval(this.timer);
		if(validTo){
			var that = this;
			that.timer = setInterval(function(){
				that.time_left = '';
				var current:any = new Date();
				var date_part = (validTo.split('T'))[0];
				var time_part = (validTo.split('T'))[1];
				
				var date_split:any = (date_part)?date_part.split('/'):[];
				var time_split:any = (time_part)?time_part.split(':'):[];
				var to:any = new Date();
				if(date_split[0] && date_split[1] && date_split[2] && time_split[0] && time_split[1])
					to = new Date(date_split[1]+'/'+date_split[0]+'/'+date_split[2] +' '+time_split[0]+':'+time_split[1]+':00' );
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
					
					that.time_left = (days+' days '+hours+' hrs '+minutes+' mins '+seconds+' secs').toString();
				}
				else{
					clearInterval(that.timer);
				}
			}, 1000);
		}
	}
	
	onFavClick(evt){
		if(this.item.sell_id || this.item.buy_req_id || this.item.bid_id || this.item.service_id){
			var newFav:any = {};
			newFav.user_id = this.userDetail.user_id;		
			newFav.deleted = false;		
			newFav.createdBy = this.userDetail.user_id;
			newFav.changedBy = this.userDetail.user_id;
			if(this.item.sell_id){
				newFav.bid_sell_buy_id = this.item.sell_id;
				newFav.type = "Sale";
			}
			if(this.item.buy_req_id){
				newFav.bid_sell_buy_id = this.item.buy_req_id;
				newFav.type = "Buy";
			}
			if(this.item.bid_id){
				newFav.bid_sell_buy_id = this.item.bid_id;
				newFav.type = "Bid";
			}
			if(this.item.service_id){
				newFav.bid_sell_buy_id = this.item.service_id;
				newFav.type = "Service";
			}
			
			if(evt.target.id == "fav"){
				this.removeFav(newFav);
							
			}
			if(evt.target.id == "not-fav"){			
				this.commonService.enduserService.addFav(newFav)
					.subscribe( res => {					    
						if(res.statusCode=="S"){
							//this.parentComponent.reloadItems();
              this.item.fav = true;
							this.sharedService.openMessageBox("S","Marked as your favourite.",null);
						}
						else{
							this.sharedService.openMessageBox("E","Unable to mark as favourite.",null);
						}
					});
			}
		}
		if (!evt) var evt:any = window.event;
			evt.cancelBubble = true;
		if (evt.stopPropagation) evt.stopPropagation();
	}
	
	
	removeFav(newFav){
		var that = this;
		this.sharedService.openMessageBox("C","Are you sure you want to remove the item from your favourite list?",function(flag){
			if(flag){
				newFav._id = that.item.fav_id;
				that.commonService.enduserService.deleteFav(newFav)
					.subscribe( res => {					    
						if(res.ok === 1){
							that.sharedService.closeMessageBox();
							//that.parentComponent.reloadItems();
              that.item.fav = false;
							that.sharedService.openMessageBox("S","Removed from your favourite.",null);
						}
						else{
							that.sharedService.openMessageBox("E","Unable to remove from favourite.",null);
						}
					});
			}
		});
	}
}
