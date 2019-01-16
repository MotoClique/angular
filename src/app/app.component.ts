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
		
		var actualRoutePath = (routePath.split('/')); 
		actualRoutePath = "/"+actualRoutePath[actualRoutePath.length-2]+"/"+actualRoutePath[actualRoutePath.length-1];
		
		var previousRoutePath = '';		
		if(that.sharedService.sharedObj.currentContext){
			previousRoutePath = that.sharedService.sharedObj.currentContext.router.url;			
			//that.sharedService.sharedObj.currentContext.done = true;
			//Two time back button to close app in mobile
			if(that.sharedService.isCordovaApp() && that.sharedService.sharedObj.currentContext.id === "AppHome"){
				if(that.backNavCount > 0){
					that.sharedService.openMessageBox("C","Are you sure you want to close the app?",function(flag){
						if(flag){
							var appNav : any = navigator || {app:{}};
							appNav.app.exitApp();
						}
						else{
							that.backNavCount = 0;
						}
					});
				}
				else{
					delete that.sharedService.sharedObj.backUpData.home;
					that.backNavCount += 1;
					//that.sharedService.openMessageBox("I","Press back one more time to close the app.",null)
				}
			}
			if(that.sharedService.sharedObj.currentContext.id === "AppHome"){
				var routeSubscription = that.router.events.subscribe((val) => {
					if(val instanceof NavigationEnd){
						routeSubscription.unsubscribe();
						that.router.navigateByUrl('/Container/Home');
					}
				});	
			}
		}
		if( (routePath.includes("/edit") || routePath.includes("/create") || routePath.includes("/participate")) ){
				//&& (previousRoutePath.includes("/Container/Sell") || previousRoutePath.includes("/Container/Buy") || previousRoutePath.includes("/Container/Bid") || previousRoutePath.includes("/Container/Service"))){			
			window.history.go(-2);				
		}
		/*else if( (actualRoutePath === "/Container/Favourite" || actualRoutePath === "/Container/Sell" || actualRoutePath === "/Container/Buy" || actualRoutePath === "/Container/Bid" || actualRoutePath === "/Container/Service" || actualRoutePath === "/Container/ChatInbox") 
			&& (previousRoutePath.includes("/Container/Sell") || previousRoutePath.includes("/Container/Buy") || previousRoutePath.includes("/Container/Bid") || previousRoutePath.includes("/Container/Service") || previousRoutePath.includes("/Container/ChatDetail")) ){
			
		}
		else if( (routePath.includes("/Container/Sell") || routePath.includes("/Container/Buy") || routePath.includes("/Container/Bid") || routePath.includes("/Container/Service")) 
			&& (previousRoutePath.includes("/edit") || previousRoutePath.includes("/create")) ){
			
		}
		else{
			var routeSubscription = that.router.events.subscribe((val) => {
				if(val instanceof NavigationEnd){
					routeSubscription.unsubscribe();
					that.router.navigateByUrl('/Container/Home');
				}
			});			
		}*/
    });
  }
  
}
