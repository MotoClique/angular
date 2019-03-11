//My Post page Component
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
      templateUrl: './myPost.component.html',
      styleUrls: ['./myPost.component.css'],
      providers: [CommonService]
})

@Injectable()
export class AppMyPost implements OnInit {
	userDetail: any = {};
	localData: any = {};
	activeLink: string = 'Sell';
	@ViewChild('myPostTabGroup') myPostTabGroup;

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
					var router_url = that.router.url;
					var routes = router_url.split('/');
					if(routes && routes.length>3)
						that.activeLink = routes[routes.length - 1];
					else{
						that.activeLink = "Sell";
						that.router.navigateByUrl('/Container/MyPost/Sell');
					}
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
	
}
