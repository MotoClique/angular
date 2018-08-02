//
import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import { CommonService } from '../common.service';
import { SharedService } from '../shared.service';

interface hidden {
  view: boolean,
  add: boolean
}
interface disabled {
  app_id: boolean,
  app_name: boolean
}
interface newItem {
	app_id: string, 
	app_name: string,
	changedAt: string,
	changedBy: string,
	createdAt: string,
	createdBy: string,
	deleted: boolean
}


@Component({
    //selector: 'app-root',
    templateUrl: './applicationAdmin.component.html',
   styleUrls: ['./applicationAdmin.component.css'],
   providers: [CommonService]
})
export class AppApplicationAdmin implements OnInit {
	router: Router;
	hidden: hidden;
	disabled: disabled;
	newItem: newItem;
	editMode: boolean = false;
	applications: Array<{
		_id?: string,
		app_id: string,
		app_name: string
	}>;
	term: string = '';
	
	constructor(private commonService: CommonService, private sharedService: SharedService, router: Router) { 
	this.router = router;
  }
  
	ngOnInit() {
		this.sharedService.sharedObj.containerContext.title = "Application";
		this.hidden = {view: false, add: true};
		this.disabled = {app_id: true, app_name: false};
		this.newItem = {
						app_id:"", 
						app_name:"",
						changedAt:"",
						changedBy:"",
						createdAt:"00/00/0000",
						createdBy:"",
						deleted:false
						};
	  	  this.commonService.adminService.getApplication("")
		  .subscribe( applications => this.applications = applications.results);
  }
  onAddClick(evt){
	  this.hidden.view = true;
	  this.hidden.add = false;
	  this.disabled.app_name = false;
	  this.editMode = false;
	  this.newItem = {
						app_id:"", 
						app_name:"",
						changedAt:"",
						changedBy:"",
						createdAt:"00/00/0000",
						createdBy:"",
						deleted:false
						};
  }
  onAddCancel(evt){
	  this.hidden.view = false;
	  this.hidden.add = true;
	  this.commonService.adminService.getApplication("")
		  .subscribe( applications => this.applications = applications.results);
  }
  
  onSave(evt){
		if(this.editMode)
			this.onEditSave(evt)
		else
			this.onAddSave(evt);
	  }
  onAddSave(evt){
	  this.commonService.adminService.addApplication(this.newItem)
		   .subscribe( data => {	
		    
			if(data.statusCode=="S"){
				this.onAddCancel("");
			}
			else{
				alert("Unable to save");
			}		  
		  });
  }
  onEditSave(evt){
	  this.commonService.adminService.updateApplication(this.newItem)
		   .subscribe( data => {	
		    
			if(data.statusCode=="S"){
				this.onAddCancel("");
			}
			else{
				alert("Unable to update");
			}		  
		  });
  }
  onAppClick(evt,obj){
	  this.hidden.view = true;
	  this.hidden.add = false;	  
	  this.disabled.app_name = true;
	  this.newItem = obj;
  }
  onEdit(evt,doc){
	  this.hidden.view = true;
	  this.hidden.add = false;	  
	  this.disabled.app_name = false;
	  this.editMode = true;
	  this.newItem = doc;
  }
  onDelete(evt,doc){
	var that = this;
	this.sharedService.openMessageBox("C","Are you sure you want to delete it?",function(flag){
		if(flag){
		  doc.deleted = true;
		  that.commonService.adminService.updateApplication(doc)
			.subscribe( data => {	
				that.sharedService.closeMessageBox();
				if(data.statusCode=="S"){
					that.onAddCancel("");
				}
				else{
					alert("Unable to delete");
				}		  
			  }); 
		}
	});
  }
}
