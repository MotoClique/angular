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
      templateUrl: './chatInbox.component.html',
      styleUrls: ['./chatInbox.component.css'],
      providers: [CommonService]
})

@Injectable()
export class AppChatInbox implements OnInit {
	userDetail: any = {};

    constructor(private router: Router, private route: ActivatedRoute, private http: Http, private commonService: CommonService, private sharedService: SharedService) {
                     this.router = router;
                     var that = this;;
                     this.getJSON().subscribe(data => {
                                                                                      
                                           //Generate Years
                                           that.years = [];
                                          var y = data.years.from;
                                           var cy = (new Date()).getFullYear();
                                           if(Number(y) < Number(cy)){
												do {
                                                       that.years.push( {name: y});
                                                       y = y - (- 1);
                                                }
                                                while (y != cy);
                                           }
                                           that.years.push( {name: cy});//Add Current Year
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
				this.sharedService.sharedObj.containerContext.title = "Chat Inbox";	
                this.item = {};
                this.hidden = {view: false, add: true};
                this.disabled = {field: false};
				this.sharedService.getUserProfile(function(user){
					that.userDetail = user;
					var id = that.route.snapshot.params.id;
					var mode = that.route.snapshot.params.mode;
					if(id && id !== 'blank'){
							that.commonService.enduserService.getAlert("",id)
							  .subscribe( data => {
								  if(data.results.length > 0){
									
								  }
								  else{
									 that.sharedService.openMessageBox("E","No data found.",null);
								  }
							});
					}					
					else{
						that.commonService.enduserService.getAlert(that.userDetail.user_id,"")
							.subscribe( result => that.alerts = result.results);
					}
										
					
				});
					
    }
	  
	  
	onChatSelect(evt,data){
		this.router.navigate(['/Container/ChatDetail',data.chat_id]);
	}


}
