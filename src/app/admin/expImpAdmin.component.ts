//
import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import { CommonService } from '../common.service';
import { SharedService } from '../shared.service';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
declare var jQuery:any;
import * as XLSX from 'xlsx';

interface hidden {
  view: boolean,
  add: boolean
}


@Component({
   //selector: 'app-root',
   templateUrl: './expImpAdmin.component.html',
   styleUrls: ['./expImpAdmin.component.css'],
   providers: [CommonService]
})
export class AppExpImpAdmin implements OnInit {
	router: Router;
	hidden: hidden;
	showDBTableListDialog: boolean = false;
	dbTables: any = [];
	tableToExportImport: string = "";
	toUpload: any = [];
	localData: any = {};
	showUploadExcelDialog: boolean = false;
	totalRecords: number = 0;
	excelfileInput:any;
	
	constructor(private commonService: CommonService, private sharedService: SharedService, private http: Http, router: Router) { 
		this.router = router;
		var that = this;
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
  
	ngOnInit() {
		this.sharedService.sharedObj.containerContext.title = "Export/Import Database Table";
		this.hidden = {view: false, add: true};
	}
	
	openDBTableList(evt){
		this.dbTables = this.localData['dbTables'];
		this.showDBTableListDialog = true;
	}
	
	onTableSelect(evt,table){
		this.tableToExportImport = table.name;
		this.showDBTableListDialog = false;
	}
	
	onExportTable(evt){
		/*this.commonService.adminService.exportTable(this.tableToExportImport)
		.subscribe( data => {
			
		});*/
		if(this.tableToExportImport){
			window.open(this.sharedService.fullhost+"/api/exportToCsv/"+this.tableToExportImport,"_blank");
		}
	}
	
	onImportTable(evt){
		if(this.tableToExportImport){
			this.showUploadExcelDialog = true;
		}
	}
  
	onDownoadTemplateClick(evt){
		window.open("/assets/upload_template.xlsx","_blank");
	}
	
	onTabClick(evt){
		
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
				var workbook = XLSX.read(data, {type: (rABS ? 'binary' : 'array'), raw:true});
				var jsn:any = [];
				jsn = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);//workbook.SheetNames[0]]);
				that.toUpload = (jsn)?jsn:[];
				that.totalRecords = (jsn)?jsn.length:0;
			};
			if(rABS) reader.readAsBinaryString(f); else reader.readAsArrayBuffer(f);
		}
	}
	
	onUploadSubmit(evt){	
		var that = this;
		if(this.toUpload.length>0){
				var tableData = {
					collection: that.tableToExportImport,
					data: that.toUpload
				};
				this.commonService.adminService.importTable(tableData)
					.subscribe( data => {
						if(data.statusCode=="S"){
							
							this.sharedService.openMessageBox("S",data.msg,null);
						}
						else{
							this.sharedService.openMessageBox("E",data.msg,null);
						}
				});
		}
	}
}
