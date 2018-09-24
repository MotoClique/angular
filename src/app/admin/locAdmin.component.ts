//
import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import { CommonService } from '../common.service';
import { SharedService } from '../shared.service';
declare var jQuery:any;
import * as XLSX from 'xlsx';

interface hidden {
  view: boolean,
  add: boolean
}


@Component({
    //selector: 'app-root',
    templateUrl: './locAdmin.component.html',
   styleUrls: ['./locAdmin.component.css'],
   providers: [CommonService]
})
export class AppLocAdmin implements OnInit {
	router: Router;
	hidden: hidden;
	disabled: any = {};
	newItem: any = {};
	locs: any = [];
	editMode: boolean = false;
	term: string = '';
  locationToUpload: any = [];
	totalRecords: number = 0;
	excelfileInput: any;
	showUploadExcelDialog:boolean = false;
	
	constructor(private commonService: CommonService, private sharedService: SharedService, router: Router) { 
	this.router = router;
  }
  
	ngOnInit() {
		this.sharedService.sharedObj.containerContext.title = "Locations";
		this.hidden = {view: false, add: true};
		this.disabled = {field: false};
		
	  	this.commonService.adminService.getLoc("","","","")
		  .subscribe( res => this.locs = res.results);
  }
  onAddClick(evt){
	  this.hidden.view = true;
	  this.hidden.add = false;
	  this.disabled.field = false;
	  this.editMode = false;
	  this.newItem = {
						country:"", 
						state:"",
						city:"",
						location:""
					};
  }
  onAddCancel(evt){
	  this.hidden.view = false;
	  this.hidden.add = true;
	  this.commonService.adminService.getLoc("","","","")
		  .subscribe( res => this.locs = res.results);
  }
  
  onSave(evt){
		if(this.editMode)
			this.onEditSave(evt)
		else
			this.onAddSave(evt);
	  }
  onAddSave(evt){
	  this.commonService.adminService.addLoc(this.newItem)
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
	  this.commonService.adminService.updateLoc(this.newItem)
		   .subscribe( data => {	
		    
			if(data.statusCode=="S"){
				this.onAddCancel("");
			}
			else{
				alert("Unable to update");
			}		  
		  });
  }
  
  onLocClick(evt,obj){
	  this.hidden.view = true;
	  this.hidden.add = false;	  
	  this.disabled.field = true;
	  this.newItem = obj;
  }
  onEdit(evt,doc){
	  this.hidden.view = true;
	  this.hidden.add = false;	  
	  this.disabled.field = false;
	  this.editMode = true;
	  this.newItem = doc;
  }
  onDelete(evt,doc){
	var that = this;
	this.sharedService.openMessageBox("C","Are you sure you want to delete it?",function(flag){
		if(flag){
		  doc.deleted = true;
		  that.commonService.adminService.updateLoc(doc)
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
  
  onDownoadTemplateClick(evt){
		window.open("/assets/product_template.xlsx","_blank");
	}
	
	onUploadFromExcelClick(evt){
		this.showUploadExcelDialog = true;
	}
	
	onExcelUpload(evt){
		var that = this;		
		var rABS = true; // true: readAsBinaryString ; false: readAsArrayBuffer
		var files = evt.target.files;
		if(files.length>0){
			var f = files[0];
			var reader = new FileReader();
			reader.onload = function(e:any) {
				var data = e.target.result;
				if(!rABS) data = new Uint8Array(data);
				var workbook = XLSX.read(data, {type: rABS ? 'binary' : 'array'});
				var jsn:any = [];
				jsn = XLSX.utils.sheet_to_json(workbook.Sheets['Location']);//workbook.SheetNames[0]]);
				that.locationToUpload = jsn;
			};
			if(rABS) reader.readAsBinaryString(f); else reader.readAsArrayBuffer(f);
		}
	}
	
	onUploadSubmit(evt){
		var toUpload = []; toUpload = this.locationToUpload;		
		if(toUpload.length>0){
			if(toUpload.length<=1000){
				this.commonService.adminService.addMultipleLocation(toUpload)
					.subscribe( data => {
						if(data.statusCode=="S"){
							this.totalRecords = 0;
							if(jQuery('#locExcelUploadInput')){
								jQuery('#locExcelUploadInput').val('');
							}
							this.showUploadExcelDialog = false;
							this.sharedService.openMessageBox("S",data.msg,null);
						}
						else{
							this.sharedService.openMessageBox("E",data.msg,null);
						}
				});
			}
			else{
				this.sharedService.openMessageBox("E","Maximum of 1000 entries can be uploaded at a time.",null);
			}
		}
	}
}
