//
import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import { CommonService } from '../common.service';
import { SharedService } from '../shared.service';
declare var jQuery:any;

@Component({
    //selector: 'app-root',
    templateUrl: './configAdmin.component.html',
   styleUrls: ['./configAdmin.component.css'],
   providers: [CommonService]
})
export class AppConfigAdmin implements OnInit {
	router: Router;
	editMode: boolean = false;
	parameters: any = [];
	term: string = '';
	
	constructor(private commonService: CommonService, private sharedService: SharedService, router: Router) { 
		this.router = router;
	}
  
	ngOnInit() {
		this.sharedService.sharedObj.containerContext.title = "Configuration Parameters";
	  	this.commonService.adminService.getAllParameter()
		  .subscribe( res => this.parameters = res.results);
  }
  onAddClick(evt){
	  this.parameters.push({parameter:"", value:"", dirty: true});
  }
  onAddCancel(evt){
	  this.commonService.adminService.getAllParameter()
		  .subscribe( res => this.parameters = res.results);
  }
  
  onSave(evt){
	  var that = this;
	  jQuery.each(this.parameters,function(i,v){
			if(v.dirty){
				that.commonService.adminService.addParameter(v)
				   .subscribe( data => {		    
					if(data.statusCode=="S"){
						that.onAddCancel("");
					}
					else{
						alert("Unable to save");
					}		  
				});
			}			
	  });
  }
  
  onDelete(evt,doc){
	var that = this;
	this.sharedService.openMessageBox("C","Are you sure you want to delete it?",function(flag){
		if(flag){
		  if(doc.dirty){
			  //delete doc;
			  that.deleteObj(doc, that.parameters);
		  }
		  else{
			  that.commonService.adminService.deleteParameter(doc)
				  .subscribe( data => {		    
						that.onAddCancel("");		  
				}); 
		  }
		  that.sharedService.closeMessageBox();
		}
	});
  }
  
  deleteObj(obj,array) {
		const index: number = array.indexOf(obj);
		if (index !== -1) {
			array.splice(index, 1);
		}        
  }
	
}
