//
import {Component,OnInit,ViewChild,HostListener} from '@angular/core';
import { Injectable }     from '@angular/core';
import { MatTabChangeEvent } from '@angular/material';
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
      templateUrl: './chatInbox.component.html',
      styleUrls: ['./chatInbox.component.css'],
      providers: [CommonService]
})

@Injectable()
export class AppChatInbox implements OnInit {
	userDetail: any = {};
	localData: any = {};
	allPost: any = [];
	filteredPost: any = [];
	@ViewChild('chatTabGroup') chatTabGroup;

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
				this.sharedService.sharedObj.containerContext.title = "My Chats";	
				this.sharedService.getUserProfile(function(user){
					that.userDetail = user;
					var id = that.route.snapshot.params.id;
					var mode = that.route.snapshot.params.mode;
					if(id && id !== 'blank'){
							that.commonService.enduserService.getChatInbox(id,"")
							  .subscribe( data => {
								if(data.statusCode === 'S'){
									that.allPost = data.results;
									that.filteredPost = jQuery.extend(true, [], that.allPost);
								}
								else{
									that.sharedService.openMessageBox("E",data.msg,null);
								}
								that.chatTabGroup.selectedIndex = 0;	
							});
					}					
					else{
						that.commonService.enduserService.getChatInbox(that.userDetail.user_id,"")
							.subscribe( data => {
								if(data.statusCode === 'S'){
									that.allPost = data.results;
									that.filteredPost = jQuery.extend(true, [], that.allPost);
								}
								else{
									that.sharedService.openMessageBox("E",data.msg,null);
								}
								that.chatTabGroup.selectedIndex = 0;	
						});
					}
				});				
    }
	
	ngAfterViewInit(){
		this.chatTabGroup.selectedIndex = 0;	
	}
	  
	  
	onChatSelect(evt,data){
		this.sharedService.sharedObj.postItem = jQuery.extend(true, {}, data);
		this.router.navigate(['/Container/ChatDetail',data.chat_id]);
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
  
	onTabClick(event: MatTabChangeEvent) {
		var tabname= event.tab.textLabel;
		if(tabname == "All"){
			this.filteredPost = jQuery.extend(true, [], this.allPost);
		}
		else if(tabname == "Sell"){
			this.filteredPost =  this.allPost.filter(function(currentValue, index, arr){
				return currentValue.post_type === 'Sale';
			});
		}
		else if(tabname == "Buy"){
			this.filteredPost =  this.allPost.filter(function(currentValue, index, arr){
				return currentValue.post_type === 'Buy';
			});
		}
		else if(tabname == "Bid"){
			this.filteredPost =  this.allPost.filter(function(currentValue, index, arr){
				return currentValue.post_type === 'Bid';
			});
		}
		else if(tabname == "Service"){
			this.filteredPost =  this.allPost.filter(function(currentValue, index, arr){
				return currentValue.post_type === 'Service';
			});
		}
	}
	
	formatThumbnail(thumbnail){
		if(thumbnail){
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
	
	formatDate(d){		
		if(d){
			var dateObj = new Date(d);
			var monthList = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
			return dateObj.getDate()+ " " + monthList[(dateObj.getMonth())];
		}
		return '';
	}

}
