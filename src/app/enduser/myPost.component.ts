//My Post page Component
import {Component,OnInit,ViewChild,HostListener} from '@angular/core';
import { Injectable }     from '@angular/core';
import { MatTabChangeEvent } from '@angular/material';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import {Router, ActivatedRoute, Event, NavigationEnd} from '@angular/router';
import { CommonService } from '../common.service';
import { SharedService } from '../shared.service';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
declare var jQuery:any;

@Component({
      //selector: 'app-root',
      templateUrl: './myPost.component.html',
      styleUrls: ['./myPost.component.css'],
      providers: [CommonService]
})

@Injectable()
export class AppMyPost implements OnInit {
	userDetail: any = {};
	localData: any = {};
	activeLink: string = 'Sell';
	screenAccess: any = [];
	showSubMenu: boolean = false;
	myRouterEvent: any;

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
				this.sharedService.sharedObj.currentContext = this;				
				this.sharedService.getUserProfile(function(user){
					that.userDetail = user;
					var access = user.screenAccess;	
					for(var i = 0; i<access.length; i++){
						if((access[i].name).toLowerCase().indexOf('sell') != -1 && (access[i].applicable) && (access[i].for_nav)){
							var screen = JSON.parse(JSON.stringify(access[i]));
							screen.iconSrc = "assets/sale_icon.png";
							screen.id = ((access[i].name).replace(/ /g,"")).toLowerCase()+"_mypost_link" ;
							screen.name = "Sell";
							that.screenAccess.push(screen);
						}
						else if((access[i].name).toLowerCase().indexOf('buy') != -1 && (access[i].applicable) && (access[i].for_nav)){
							var screen = JSON.parse(JSON.stringify(access[i]));
							screen.iconSrc = "assets/buy_icon.png";
							screen.id = ((access[i].name).replace(/ /g,"")).toLowerCase()+"_mypost_link" ;
							screen.name = "Buy";
							that.screenAccess.push(screen);
						}
						else if((access[i].name).toLowerCase().indexOf('bid') != -1 && (access[i].applicable) && (access[i].for_nav)){
							var screen = JSON.parse(JSON.stringify(access[i]));
							screen.iconSrc = "assets/bid_icon.png";
							screen.id = ((access[i].name).replace(/ /g,"")).toLowerCase()+"_mypost_link" ;
							screen.name = "Bid";
							that.screenAccess.push(screen);
						}
						else if((access[i].name).toLowerCase().indexOf('service') != -1 && (access[i].applicable) && (access[i].for_nav)){
							var screen = JSON.parse(JSON.stringify(access[i]));
							screen.iconSrc = "assets/service_icon.png";
							screen.id = ((access[i].name).replace(/ /g,"")).toLowerCase()+"_mypost_link" ;
							screen.name = "Service";
							that.screenAccess.push(screen);
						}
					}
					that.screenAccess.sort((a: any, b: any)=> {return a.sequence - b.sequence;});//ascending sort
					
					that.myRouterEvent = that.router.events.subscribe( (event: Event) => {
						if (event instanceof NavigationEnd) {
							var router_url = that.router.url;
							var routes = router_url.split('/');
							if(routes && routes.length>3)
								that.activeLink = routes[routes.length - 1];
							else{
								that.activeLink = "Sell";
							}
						}
					 });
				});				
    }
	
	ngDoCheck(){
		this.sharedService.sharedObj.containerContext.title = "My Posts";
	}
	  
	onTabClick(evt) {
		var tabname= evt.target.innerText;
		if(tabname == "Sell"){
			this.router.navigateByUrl('/Container/MyPost/Sell');
			this.activeLink = tabname;
		}
		else if(tabname == "Buy"){
			this.router.navigateByUrl('/Container/MyPost/Buy');
			this.activeLink = tabname;
		}
		else if(tabname == "Bid"){
			this.router.navigateByUrl('/Container/MyPost/Bid');
			this.activeLink = tabname;
		}
		else if(tabname == "Service"){
			this.router.navigateByUrl('/Container/MyPost/Service');
			this.activeLink = tabname;
		}
	}
	
	onPost(evt){
		this.showSubMenu = !(this.showSubMenu);
	}
	
	onNav(evt){
		var link = evt.currentTarget.id;
		var that = this;
		switch(link){									
			case "sell_mypost_link":
				that.sharedService.sharedObj.postItem = {};
				that.router.navigateByUrl('/Container/Sell/new');
				break;
			case "bid_mypost_link":
				that.sharedService.sharedObj.postItem = {};
				that.router.navigateByUrl('/Container/Bid/new');
				break;
			case "buy_mypost_link":
				that.sharedService.sharedObj.postItem = {};
				that.router.navigateByUrl('/Container/Buy/new');
				break;
			case "service_mypost_link":
				that.sharedService.sharedObj.postItem = {};
				that.router.navigateByUrl('/Container/Service/new');
				break;
		}
	}
	
	ngOnDestroy(){
		this.myRouterEvent.unsubscribe();
	}
	
}
