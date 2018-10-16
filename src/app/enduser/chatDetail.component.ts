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

@Component({
      //selector: 'app-root',
      templateUrl: './chatDetail.component.html',
      styleUrls: ['./chatDetail.component.css'],
      providers: [CommonService]
})

@Injectable()
export class AppChatDetail implements OnInit {
	userDetail: any = {};
	localData: any = {};
	chat_id: string = "";
	chatDetail: any = [];
	item: any = {};
	typedText: string = "";
	lastChatCount: number = 0;
	fetchChatTimer: any;

    constructor(private router: Router, private route: ActivatedRoute, private http: Http, private commonService: CommonService, private sharedService: SharedService) {
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
				var that = this;
				this.sharedService.sharedObj.containerContext.title = "My Chat";
				if(!(this.sharedService.sharedObj.postItem.user_id))
					this.router.navigateByUrl('/Container/ChatInbox');
				this.sharedService.getUserProfile(function(user){
					that.userDetail = user;
					var id = that.route.snapshot.params.id;
					var mode = that.route.snapshot.params.mode;
					if(mode === 'create'){						
						that.commonService.enduserService.getChatInbox(that.userDetail.user_id,id)
							.subscribe( data => {
								if(data.results.length > 0){//Continue with existing chat
									that.sharedService.sharedObj.postItem = jQuery.extend(true, {}, data.results[0]);
									that.router.navigate(['/Container/ChatDetail',data.results[0].chat_id]);
								}
								else{//Create new chat
									that.item =  jQuery.extend(true, {},that.sharedService.sharedObj.postItem);
									that.chatDetail = [];
									if(that.item.user_id){
										that.item.to_user = that.item.user_id;
										that.sharedService.call('profile/?user_id='+that.item.user_id, "get", null, true)
										   .subscribe( data => {
												if(data.results && data.results.length>0)
													that.item.to_user_name = data.results[0].name;
										   });
									}
									
									that.item.from_user = that.userDetail.user_id;
									that.item.from_user_name = that.userDetail.name;
								}
						});
					}					
					else if(id){
						that.item =  jQuery.extend(true, {},that.sharedService.sharedObj.postItem);
						that.chat_id = id;
						that.commonService.enduserService.getChatDetail(id,"","")
							.subscribe( data => {
								if(data.results.length > 0){
									that.chatDetail = data.results;
									that.lastChatCount = that.chatDetail.length;
								}
								else{
									that.sharedService.openMessageBox("E","No data found.",null);
								}								
								
								that.initiateCallTimer();
								that.checkNewMsgRow();
						});
					}							
					
				});					
    }
	
	checkNewMsgRow() {
		var that = this;
		if(jQuery('.chatMsgRowConatiner').children().length == this.lastChatCount){
			var height_diff = jQuery('#idchatdetail').height() - jQuery('.chatMsgRowConatiner').height();
			if(height_diff > 0)
				jQuery('.chatMsgRowConatiner').css('margin-top',height_diff);
			
			var chatdetail_div = document.getElementById("idchatdetail");
			chatdetail_div.scrollTop = chatdetail_div.scrollHeight;
		}
		else{
			setTimeout(function(){		  
				that.checkNewMsgRow();
			},50);
		}
	}
	
	initiateCallTimer(){
		var that = this;
		this.fetchChatTimer = setInterval(function(){
			that.getChatDetail(that.chat_id);
		}, 10000);
	}
	
	getChatDetail(chat_id){
		var that = this;
		that.commonService.enduserService.getChatDetail(chat_id,"","")
			.subscribe( data => {
				if(data.results.length > 0){
					that.chatDetail = data.results;
					if(that.lastChatCount < that.chatDetail.length){//If new message came
						that.lastChatCount = that.chatDetail.length;
						that.checkNewMsgRow();
					}
					//that.lastChatCount = that.chatDetail.length;
				}
				else{
					that.sharedService.openMessageBox("E","No data found.",null);
				}
		});
	}
	  
	ownerTypeFormatter(typ){
		var owner = '-';
		switch(typ){
			case 'First':
				owner = '1';
				break;
				
			case 'Second':
				owner = '2';
				break;
				
			case 'Third':
				owner = '3';
				break;
				
			case 'Fourth':
				owner = '4';
				break;
				
			case 'Fifth':
				owner = '5';
				break;
				
			case 'Sixth':
				owner = '6';
				break;
				
			case 'Seventh':
				owner = '7';
				break;
				
			case 'Eight':
				owner = '8';
				break;
				
			case 'Ninth':
				owner = '9';
				break;
				
			case 'Tenth':
				owner = '10';
				break;
				
			default:
				owner = '-';
				break;
		}
		return owner;
	}
	
	sendText(evt){
		if(this.typedText){
			var that = this;
			var chat:any = {};
			chat.from_user = this.userDetail.user_id;
			chat.from_user_name = this.userDetail.name;
						
			chat.text = this.typedText;		
			chat.post_type = this.item.post_type;
			if(chat.post_type === 'Sale')
				chat.post_id = this.item.sell_id;
			else if(chat.post_type === 'Buy')
				chat.post_id = this.item.buy_req_id;
			else if(chat.post_type === 'Bid')
				chat.post_id = this.item.bid_id;
			else if(chat.post_type === 'Service')
				chat.post_id = this.item.service_id;
			
			if(this.chatDetail.length>0){//Continue existing chat
				chat.chat_id = this.chatDetail[0].chat_id;
				that.chat_id = this.chatDetail[0].chat_id;
				if(this.item.from_user === this.userDetail.user_id){
					chat.to_user_name = this.item.to_user_name;
					chat.to_user = this.item.to_user;	
				}
				else{
					chat.to_user_name = this.item.from_user_name;
					chat.to_user = this.item.from_user;	
				}
				
				that.commonService.enduserService.sendChat(chat)
				.subscribe( data => {
					if(data.statusCode==='S'){
						that.typedText = '';
						that.chat_id = data.results.chat_id;
						that.chatDetail.push(data.results);
						that.lastChatCount = that.chatDetail.length;
						that.checkNewMsgRow();
						if(!(that.fetchChatTimer))
							that.initiateCallTimer();
					}
					else{
						that.sharedService.openMessageBox("E",data.msg,null);
					}
				});
			}
			else{//Create New Chat
				chat.chat_id = "";
				if(that.item.to_user){
					chat.to_user = that.item.to_user;
					chat.to_user_name = that.item.to_user_name;
					that.commonService.enduserService.sendChat(chat)
						.subscribe( data => {
							if(data.statusCode==='S'){
								that.typedText = '';
								that.chat_id = data.results.chat_id;
								that.chatDetail = [];
								that.chatDetail.push(data.results);
								that.lastChatCount = that.chatDetail.length;
								that.checkNewMsgRow();
								if(!(that.fetchChatTimer))
									that.initiateCallTimer();
							}
							else{
								that.sharedService.openMessageBox("E",data.msg,null);
							}
					});
				}
				
			}
		}
	}
	
	chatFormatDate(d){
		var dateObj = new Date(d);
		var inputDate = new Date(d);
		inputDate.setHours(0,0,0,0);
		var todayDate = new Date();
		todayDate.setHours(0,0,0,0);
		var dateDisplay = '';
		if(inputDate > todayDate || inputDate < todayDate)
			dateDisplay = ' '+dateObj.getDate()+'-'+(dateObj.getMonth() - (-1))+'-'+dateObj.getFullYear();
		else
			dateDisplay = ' today';
		
		var hrs = dateObj.getHours();
		var mins:any = dateObj.getMinutes();
		if(mins < 10) mins = '0'+mins;
		var time = '';
		if(hrs > 12){
			time = (hrs - 12)+':'+mins+'PM';
		}
		else{
			if(hrs === 0)
				time = '12:'+mins+'AM';
			else
				time = hrs+':'+mins+'AM';			
		}
			
		dateDisplay = time+dateDisplay;
		return dateDisplay;
	}
	
	formatThumbnail(thumbnail){
		if(thumbnail && thumbnail.data){
			return thumbnail.data;
		}
		else if(thumbnail && thumbnail.thumbnail){
			var base64string_th = this.arrayBufferToBase64(thumbnail.thumbnail.data);
			var imageData_th = "data:"+thumbnail.type+";base64,"+base64string_th;
			return imageData_th;
		}
		else{
			return '';
		}
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
	
	ngOnDestroy(){
		clearInterval(this.fetchChatTimer);		
	}
 
}
