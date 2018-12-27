import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {Router, ActivatedRoute, NavigationEnd} from '@angular/router';
import { SharedService } from './shared.service';
declare var jQuery:any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit{
  title = 'app started';
  showDialog = false;
  backNavCount: number = 0;
  
  constructor(private router: Router, private route: ActivatedRoute, private sharedService: SharedService){
	  this.router = router;
  }
  
  ngOnInit(){
	  var that = this;
	  window.addEventListener('popstate', function(event:any){
		var routePath = event.target.location.pathname;
		if(that.sharedService.sharedObj.currentContext){
			that.sharedService.sharedObj.currentContext.done = true;
			//Two time back button to close app in mobile
			if(that.sharedService.isCordovaApp() && that.sharedService.sharedObj.currentContext.id === "AppHome"){
				if(that.backNavCount > 0){
					var appNav : any = navigator || {app:{}};
					appNav.app.exitApp();
				}
				else{
					that.backNavCount += 1;
					that.sharedService.openMessageBox("I","Press back one more time to close the app.",null)
				}
			}
		}
		if(routePath.includes("/edit") || routePath.includes("/create")){			
			window.history.go(-2);			
		}
		else if (routePath === "/Container/Fav"
			|| routePath === "/Container/Sell"
				|| routePath === "/Container/Buy"
				|| routePath === "/Container/Bid"
				||routePath === "/Container/Service" ){
			
		}
		else{
			var routeSubscription = that.router.events.subscribe((val) => {
				if(val instanceof NavigationEnd){
					routeSubscription.unsubscribe();
					that.router.navigateByUrl('/Container/Home');
				}
			});			
		}
    });
  }
  
}
