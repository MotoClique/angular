//
import {Component, OnInit} from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import {Router} from '@angular/router';
import { CommonService } from '../common.service';
import { SharedService } from '../shared.service';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
declare var jQuery:any;
import * as XLSX from 'xlsx';

interface hidden {
  view: boolean,
  add: boolean,
  image: boolean,
  spec: boolean
}
interface disabled {
  product_id: boolean,
  others: boolean,
  upload: boolean
}
interface newItem {
	product_id: string, 
	product_type_id: string,
	product_type_name: string,
	brand_id: string,
	brand_name: string,
	model: string,
	variant: string,
	image_path: string,	
	defaultImageColor: string,
	year_from: string,
	year_to: string,
	changedAt: string,
	changedBy: string,
	createdAt: string,
	createdBy: string,
	deleted: boolean
}
interface newImage {
  product_id: string,
  data: string,
  type: string,
  name: string,
  default: boolean
}
interface newThumbnail {
  product_id: string,
  type: string,
  name: string,
  color: string,
  year_from: string,
  year_to: string,
  thumbnail: string,
  image_id: string,
  default: boolean
}


@Component({
    //selector: 'app-root',
    templateUrl: './productAdmin.component.html',
   styleUrls: ['./productAdmin.component.css'],
   providers: [CommonService]
})
export class AppProductAdmin implements OnInit {
	hidden: hidden;
	disabled: disabled;
	newItem: newItem;
	prdTyps: any;
	brands: any;
	editMode: boolean = false;
	newImage: newImage;
	newThumbnail: newThumbnail;
	uploadValidation: any = {state: null, msg:""};
	products: Array<{
		_id?: string,
		product_id: string, 
		product_type_id: string,
		product_type_name: string,
		brand_id: string,
		brand_name: string,
		model: string,
		variant: string,
		image_path: string
	}>;
	selectedPrdTyp: any;
	selectedBrand: any;
	thumbnails: any;
	showDialog: boolean = false;
	selectedPrd: any = {};
	specs: Array<{
		_id?: string,
		product_id: string, 
		specification_field_id: string,
		specification_field_name: string,
		specification_field_value: string
	}>;
	showSpecDialog: boolean = false;
	specFields: Array<{
		_id?: string,
		specification_field_id: string,
		specification_field_name: string
	}>;
	selectedSpecField: any;
	specFieldValue: string = "";
	showCopySpecDialog: boolean = false;
	uploadColor: string = "";
	uploadYearFrom: string = "";
	uploadYearTo: string = "";
	colors: any = [];
	years: any = [];
	showUploadExcelDialog: boolean  = false;
	products_to_upload: any = [];
	specs_to_upload: any = [];
	images_to_upload: any = [];
	showUploadPreviewDialog: boolean = false;
	hasDiscrepancy: boolean = true;
	sheetToUpload: string = "";
	term: string = '';
	spec_term: string = '';
	prd_term: string = '';
	
	constructor(private router: Router, private http: Http, private commonService: CommonService, private sharedService: SharedService) {
					var that = this;;
                     this.getJSON().subscribe(data => {
                                           that.colors = data.color;
										   
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
  
	ngOnInit() {
		this.sharedService.sharedObj.containerContext.title = "Products";
		this.hidden = {view: false, add: true, image: true, spec: true};
		this.disabled = {
			product_id: true,
			others: false,
			upload: false
		};
		this.newItem = {
						product_id: "", 
						product_type_id: "",
						product_type_name: "",
						brand_id: "",
						brand_name: "",
						model: "",
						variant: "",
						image_path: "",
						defaultImageColor: "",
						year_from: "",
						year_to: "",
						changedAt:"",
						changedBy:"",
						createdAt:"00/00/0000",
						createdBy:"",
						deleted:false
						};
	  	  this.commonService.adminService.getProduct("","","")
		  .subscribe( products => this.products = products.results);
  }
  onAddClick(evt){
	  this.commonService.adminService.getProductType("")
		  .subscribe( prdTyps => this.prdTyps = prdTyps.results);
		this.commonService.adminService.getBrand("")
		  .subscribe( brands => this.brands = brands.results);
	  this.hidden.view = true;
	  this.hidden.add = false;
	  this.hidden.image = true;
	  this.hidden.spec = true;
	  this.disabled = {
			product_id: true,
			others: false,
			upload: false
	  };
	  this.editMode = false;
	  this.newImage = {
		  product_id: "",
		  data: "",
		  type: "",
		  name: "",
		  default: false
	  };
	  this.newThumbnail = {
		  product_id: "",
		  type: "",
		  name: "",
		  color: "",
		  year_from: "",
		  year_to: "",
		  thumbnail: "",
		  image_id: "",
		  default: false
	  };
	  this.newItem = {
						product_id: "", 
						product_type_id: "",
						product_type_name: "",
						brand_id: "",
						brand_name: "",
						model: "",
						variant: "",
						image_path: "",
						defaultImageColor: "",
						year_from: "",
						year_to: "",
						changedAt:"",
						changedBy:"",
						createdAt:"00/00/0000",
						createdBy:"",
						deleted:false
						};
		this.selectedPrdTyp = null;
		this.selectedBrand = null;
  }
  onAddCancel(evt){
	  this.hidden.view = false;
	  this.hidden.add = true;
	  this.hidden.image = true;
	  this.hidden.spec = true;
	  this.commonService.adminService.getProduct("","","")
		  .subscribe( products => this.products = products.results);
  }
  
  onSave(evt){
		if(this.editMode)
			this.onEditSave(evt)
		else
			this.onAddSave(evt);
	}
  
  onAddSave(evt){
	  this.newItem.product_type_id = this.selectedPrdTyp.product_type_id;
	  this.newItem.product_type_name = this.selectedPrdTyp.product_type_name;
	  var image_name = '';
	  var color:any = '';
	  var year_from:any = 0;
	  var year_to:any = 0;
	  if(this.selectedPrdTyp.product_type_name === 'Service'){
		  this.newItem.brand_id = this.selectedBrand.product_type_id;
		  this.newItem.brand_name = this.selectedBrand.product_type_name;
		  image_name = this.newItem.product_type_name +"_"+ this.newItem.brand_name +"_"+ this.newItem.model;
	  }
	  else{
		  this.newItem.brand_id = this.selectedBrand.brand_id;
		  this.newItem.brand_name = this.selectedBrand.brand_name;
		  image_name = this.newItem.product_type_name +"_"+ this.newItem.brand_name +"_"+ this.newItem.model +"_"+ this.newItem.variant+"_"+this.newItem.defaultImageColor+"_"+this.newItem.year_from+"_"+this.newItem.year_to;
		  color = this.newItem.defaultImageColor;
		  year_from = this.newItem.year_from;
		  year_to = this.newItem.year_to;
	  }
	  
	  this.commonService.adminService.addProduct(this.newItem)
		   .subscribe( data => {	
		    
			if(data.statusCode=="S"){
				//Upload Image
				this.newImage.product_id = data.product.product_id;
				this.newImage.name = image_name;
				this.newImage.default = true;
				this.commonService.adminService.addPrdImage(this.newImage)
				   .subscribe( res_image => {	
				    
					if(res_image.statusCode=="S"){
						//Upload Thumbnail
						this.newThumbnail.product_id = data.product.product_id;
						this.newThumbnail.name = image_name;
						this.newThumbnail.color = color;
						this.newThumbnail.year_from = year_from;
						this.newThumbnail.year_to = year_to;
						this.newThumbnail.image_id = res_image.prdImage.image_id;
						this.newThumbnail.default = true;
						this.commonService.adminService.addPrdThumbnail(this.newThumbnail)
						   .subscribe( res_thumbnail => {	
						    
							if(res_thumbnail.statusCode=="S"){
								
								this.onAddCancel("");
							}
							else{
								alert("Unable to save thumbnail.");
							}		  
						  });
						this.onAddCancel("");
					}
					else{
						alert("Unable to save image.");
					}		  
				  });
				this.onAddCancel("");
			}
			else{
				alert("Unable to save");
			}		  
		  });
  }
  
  onEditSave(evt){
	  this.newItem.product_type_id = this.selectedPrdTyp.product_type_id;
	  this.newItem.product_type_name = this.selectedPrdTyp.product_type_name;
	  if(this.selectedPrdTyp.product_type_name === 'Service'){
		  this.newItem.brand_id = this.selectedBrand.product_type_id;
		  this.newItem.brand_name = this.selectedBrand.product_type_name;
	  }
	  else{
		  this.newItem.brand_id = this.selectedBrand.brand_id;
		  this.newItem.brand_name = this.selectedBrand.brand_name;
	  }
	  //var image_name = this.newItem.product_type_name +"_"+ this.newItem.brand_name +"_"+ this.newItem.model +"_"+ this.newItem.variant+"_"+this.newItem.defaultImageColor;
	  this.commonService.adminService.updateProduct(this.newItem)
		   .subscribe( data => {		    
			if(data.statusCode=="S"){
				
			}
			else{
				alert('');
			}
		});
  }
  
  onPrdClick(evt,obj){
	  this.hidden.view = true;
	  this.hidden.add = false;
	  this.hidden.image = true;
	  this.hidden.spec = true;
	  this.disabled = {
			product_id: true,
			others: true,
			upload: true
	  };
	  this.newItem = obj;
  }
  onEdit(evt,doc){
	  this.hidden.view = true;
	  this.hidden.add = false;
	  this.hidden.image = true;
	  this.hidden.spec = true;
	  this.disabled = {
			product_id: true,
			others: false,
			upload: true
	  };
	  this.editMode = true;
	  this.newItem = doc;
	  var that = this;
	  this.commonService.adminService.getProductType("")
		  .subscribe( prdTyps => {
			  this.prdTyps = prdTyps.results;
			  jQuery.each(this.prdTyps,function(i,v){
				  if(doc.product_type_name === 'Service'){
					  if(v.product_type_id === doc.brand_id){
						  that.selectedBrand = v;
					  }
				  }
				  
				  if(v.product_type_id === doc.product_type_id){
						  that.selectedPrdTyp = v;
				  }
			  });
		  });
	  this.commonService.adminService.getBrand("")
		  .subscribe( brands => {
			  this.brands = brands.results;
			  jQuery.each(this.brands,function(i,v){
				  if(v.brand_id === doc.brand_id){
					  that.selectedBrand = v;
				  }
			  });
		  });
	  
  }
  onDelete(evt,doc){
	var that = this;
	this.sharedService.openMessageBox("C","Are you sure you want to delete it?",function(flag){
		if(flag){
			  doc.deleted = true;
			  that.commonService.adminService.updateProduct(doc)
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
  
  onPrdTypChange(){
	this.newItem.product_type_id = this.selectedPrdTyp.product_type_id;
	this.newItem.product_type_name = this.selectedPrdTyp.product_type_name;
  }
  
  
onUpload(evt){ 
    var that = this; 
    var files = evt.target.files; 
	var file = files[0];
	if (files && file) { 
		var fileName = file.name; 
		var fileType = file.type; 
		var fileSize = file.size; 
		//Read Image
		var binaryString = ""; 
		var reader = new FileReader(); 
		reader.readAsArrayBuffer(file); 
		reader.onload = function(e:any) {
            var blob = new Blob([e.target.result]); // create blob...
            //window.URL = window.URL || window.webkitURL;
            var blobURL = window.URL.createObjectURL(blob); // and get it's URL

            var image = new Image();
            image.src = blobURL;
            image.onload = function() {
              var resizedImage = that.resizeImage(image,"image"); // send it to canvas for actual image
              var resizedThumbnail = that.resizeImage(image,"thumbnail"); // send it to canvas for thumbnail
              var stringImage = resizedImage.replace(/^data:image\/[a-z]+;base64,/, "");
              var stringThumbnail = resizedThumbnail.replace(/^data:image\/[a-z]+;base64,/, "");
              that.newImage = {
                  product_id: "",
                  data: stringImage,
                  type: fileType,
                  name: "",
                  default: false
              };
              that.newThumbnail = {
                  product_id: "",
                  type: fileType,
                  name: "",
                  color: "",
                  year_from: "",
                  year_to: "",
                  thumbnail: stringThumbnail,
                  image_id: "",
                  default: false
              };
            }
		}
	} 
}
resizeImage(img,type) {
    var max_width = 500;
    var max_height = 300;
    var canvas = document.createElement('canvas');
	var width = 0;
	var height = 0;
	
	if(type==='thumbnail'){
		width = 100;
		height = 100;
	}
	else{
		width = img.width;
		height = img.height;

		// calculate the width and height, constraining the proportions
		if (width > height) {
		  if (width > max_width) {
			height = Math.round(height *= max_width / width);
			width = max_width;
		  }
		} else {
		  if (height > max_height) {
			width = Math.round(width *= max_height / height);
			height = max_height;
		  }
		}
	}

    // resize the canvas and draw the image data into it
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg",0.7); // get the data from canvas as 70% JPG 
}
  
  
  /*onUpload(evt){ 
        var that = this; 
        var files = evt.target.files; 
		var file = files[0];
		if (files && file) { 
					var fileName = file.name; 
					var fileType = file.type; 
					var fileSize = file.size; 
					//extend FileReader 
					//FileReader.prototype.content = "";
					if (!FileReader.prototype.readAsBinaryString) { 
							FileReader.prototype.readAsBinaryString = function (file) { 
							   var binary = ""; 
							   var pt = this; 
							   var reader = new FileReader();      
							   reader.onload = function (e) { 
											var bytes = new Uint8Array(reader.result); 
											var length = bytes.byteLength; 
											for (var i = 0; i < length; i++) { 
													   binary += String.fromCharCode(bytes[i]); 
											} 
											pt.result = binary; 
											jQuery(pt).trigger('onload'); 
									} 
									reader.readAsArrayBuffer(file); 
							} 
					} 
					var binaryString = ""; 
					var reader = new FileReader(); 
					reader.readAsBinaryString(file); 
					reader.onload = function(e) {
						var binaryString = reader.result; 
						var base64Data = btoa(binaryString); 
						var base64string = "data:"+fileType+";base64,"+base64Data; 
						that.resizeBase64Img(base64string, 100, 100).then(function(newImg){
                            var compressed = newImg.replace(/^data:image\/[a-z]+;base64,/, "");
                             
							
							that.newImage = {
							  product_id: "",
							  data: base64Data,
							  type: fileType,
							  name: "",
							  default: false
						  };
						  that.newThumbnail = {
							  product_id: "",
							  type: fileType,
							  name: "",
							  color: "",
							  year_from: "",
							  year_to: "",
							  thumbnail: compressed,
							  image_id: "",
							  default: false
						  };
                      });
					  
					  
					  //that.newItem.image_path = fileName;
					} 
					
			} 
	}*/
	
	getImage(evt,img){
		this.commonService.adminService.getPrdImage(img.image_id,"")
		  .subscribe( prdImages => {			  
				  var prdImage = prdImages.results;
				  if(prdImage.length > 0){
					  var base64string = this.arrayBufferToBase64(prdImage[0].data.data);
					  var image = new Image();
						image.src = "data:"+prdImage[0].type+";base64,"+base64string;
						var w = window.open("");
						w.document.write(image.outerHTML);
				  }
		  });
		
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
	
	onImageClick(evt,prd){
		this.selectedPrd = prd;
		this.hidden.view = true;
		this.hidden.add = true;
		this.hidden.image = false;
		this.hidden.spec = true;
		this.getThumbnails(prd.product_id);
	}
	
	getThumbnails(prd_id){
		this.thumbnails = [];
		this.commonService.adminService.getPrdThumbnail(prd_id,"","")
		  .subscribe( prdThumbnails => {			  
				  var prdThumbnail = prdThumbnails.results;
				  if(prdThumbnail.length > 0){
					  for(var i = 0; i < prdThumbnail.length; i++){					  
						var base64string_th = this.arrayBufferToBase64(prdThumbnail[i].thumbnail.data);
						var imageData_th = "data:"+prdThumbnail[i].type+";base64,"+base64string_th;
						this.thumbnails.push({_id: prdThumbnail[i]._id, image_id: prdThumbnail[i].image_id, thumbnail: imageData_th, name: prdThumbnail[i].name, default: prdThumbnail[i].default});
					  }
				  }
		  });		
	}
	
	
	resizeBase64Img(base64, width, height) {
                                var canvas = document.createElement("canvas");
                                canvas.width = width;
                                canvas.height = height;
                                var context = canvas.getContext("2d");
                                var deferred = jQuery.Deferred();
                                var img = new Image();
                                img.onload = function() {
                                                context.scale(width/img.width,  height/img.height);
                                                context.drawImage(img, 0, 0);
                                                deferred.resolve(img.src = canvas.toDataURL());  
                                };
                                img.src = base64;
                               
                                return deferred.promise();   
    }
	
	onImageCancel(evt){
		this.hidden.view = false;
		this.hidden.add = true;
		this.hidden.image = true;
		this.hidden.spec = true;
	}
	onAddImage(evt){
		this.showDialog = true;
	}
	onImageUpload(evt){
		//Upload Image
		var image_name =  '';
		var color:any = '';
		var year_from:any = 0;
		var year_to:any = 0;
		if(this.selectedPrd.product_type_name === 'Service'){
			image_name = this.selectedPrd.product_type_name +"_"+ this.selectedPrd.brand_name +"_"+ this.selectedPrd.model;
		}
		else{
			image_name = this.selectedPrd.product_type_name +"_"+ this.selectedPrd.brand_name +"_"+ this.selectedPrd.model +"_"+ this.selectedPrd.variant+"_"+this.uploadColor+"_"+this.uploadYearFrom+"_"+this.uploadYearTo;
			color = this.uploadColor;
			year_from = this.uploadYearFrom;
			year_to = this.uploadYearTo;
		}
		
		this.newImage.product_id = this.selectedPrd.product_id;
		this.newImage.name = image_name;
		this.commonService.adminService.addPrdImage(this.newImage)
		   .subscribe( res_image => {	
				    
					if(res_image.statusCode=="S"){
						//Upload Thumbnail
						this.newThumbnail.product_id = this.selectedPrd.product_id;
						this.newThumbnail.name = image_name;
						this.newThumbnail.color = color;
						this.newThumbnail.year_from = year_from;
						this.newThumbnail.year_to = year_to;
						this.newThumbnail.image_id = res_image.prdImage.image_id;
						this.commonService.adminService.addPrdThumbnail(this.newThumbnail)
						   .subscribe( res_thumbnail => {	
						    
							if(res_thumbnail.statusCode=="S"){								
								this.getThumbnails(this.selectedPrd.product_id);
							}
							else{
								alert("Unable to save thumbnail.");
							}		  
						  });
						
					}
					else{
						alert("Unable to save image.");
					}		  
		  });
		this.showDialog = false;
	}
	removeImage(evt,thumbn){
		var that = this;
		this.sharedService.openMessageBox("C","Are you sure you want to delete the image?",function(flag){
			if(flag){
				that.commonService.adminService.deletePrdThumbnail(thumbn)
				  .subscribe( res => {
					  that.getThumbnails(that.selectedPrd.product_id);
				  });			
				that.sharedService.closeMessageBox();
			}
		});
	}
	
	onSeeSpecClick(evt, prd){
		this.selectedPrd = prd;
		this.hidden.view = true;
		this.hidden.add = true;
		this.hidden.image = true;
		this.hidden.spec = false;
		this.commonService.adminService.getProductSpec(prd.product_id)
		  .subscribe( prdSpecs => {
			  this.specs = prdSpecs.results;
		  });
	}
	onSpecDelete(evt,doc){
		  var that = this;
		  doc.deleted = true;
		  this.commonService.adminService.updateProductSpec(doc)
			   .subscribe( data => {	
			    
				if(data.statusCode=="S"){
					this.onAddCancel("");
				}
				else{
					alert("Unable to delete");
				}		  
			  }); 
	  }
	onSpecAddClick(evt){
		this.commonService.adminService.getPrdTypSpecFieldMap(this.selectedPrd.product_type_id)
		  .subscribe( specificationFields => this.specFields = specificationFields.results);
		
		this.showSpecDialog = true;
		this.specFieldValue = "";
		this.selectedSpecField = {};
	}
	
	onSpecAdd(evt){
		var that = this;
		this.showSpecDialog = false;
		var prdSpec = {
			product_id: that.selectedPrd.product_id,
			specification_field_id: that.selectedSpecField.specification_field_id,
			specification_field_name: that.selectedSpecField.specification_field_name,
			specification_field_value: that.specFieldValue,
			deleted: false,
			createdBy: "",
			createdAt: "",
			changedBy: "",
			changedAt: ""
		};
		this.commonService.adminService.addProductSpec(prdSpec)
		   .subscribe( data => {	
		    
			if(data.statusCode=="S"){
				that.commonService.adminService.getProductSpec(that.selectedPrd.product_id)
				  .subscribe( prdSpecs => {
					  that.specs = prdSpecs.results;
				  });
			}
			else{
				alert('Unable to add.');
			}
		   });
	}
	onSpecCopyClick(evt){
		this.showCopySpecDialog = true;
	}
	
	onPrdCopySelect(evt,prd){
		var that = this;
		this.showCopySpecDialog = false;
		this.commonService.adminService.getProductSpec(prd.product_id)
		  .subscribe( prdSpecs => {
			  var specsCopy = prdSpecs.results;
			  if(specsCopy.length > 0){
				  jQuery.each(specsCopy,function(i,v){
					  delete v._id;
					  v.product_id = that.selectedPrd.product_id;
				  });
				  this.commonService.adminService.addMultiProductSpec(specsCopy)
				   .subscribe( data => {	
				    
					if(data.statusCode=="S"){
						that.commonService.adminService.getProductSpec(that.selectedPrd.product_id)
						  .subscribe( prdSpecs => {
							  that.specs = prdSpecs.results;
						  });
					}
					else{
						alert('Unable to add.');
					}
				   });
			  }
		  });
	}
	onSpecCancel(evt){
		this.hidden.view = false;
		this.hidden.add = true;
		this.hidden.image = true;
		this.hidden.spec = true;
	}
	
	
	onUploadFromExcelClick(evt){
		this.showUploadExcelDialog = true;
		//document.getElementById('prdExcelUploadInput').setAttribute('value',null) ;
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
				if(that.sheetToUpload === 'Product'){
					jsn = XLSX.utils.sheet_to_json(workbook.Sheets['Product']);//workbook.SheetNames[0]]);
					
					that.prepareUploadData(jsn,that.sheetToUpload);
				}
				else if(that.sheetToUpload === 'Specification'){
					jsn = XLSX.utils.sheet_to_json(workbook.Sheets['Specification']);//workbook.SheetNames[0]]);
					
					that.prepareUploadData(jsn,that.sheetToUpload);
				}
				else if(that.sheetToUpload === 'Image'){
					jsn = XLSX.utils.sheet_to_json(workbook.Sheets['Image']);//workbook.SheetNames[0]]);
					
					that.prepareUploadData(jsn,that.sheetToUpload);
				}
			};
			if(rABS) reader.readAsBinaryString(f); else reader.readAsArrayBuffer(f);
		}
	}
	
	setUploadData(data){
		if(this.sheetToUpload === 'Product'){
			this.products_to_upload = data;
			this.products_to_upload.forEach(function(currentItem, index, arr){
				if(!(currentItem.row))
					currentItem.row = currentItem.__rowNum__ - (-1);
			});
		}
		if(this.sheetToUpload === 'Specification'){
			this.specs_to_upload = data;
			this.specs_to_upload.forEach(function(currentItem, index, arr){
				if(!(currentItem.row))
					currentItem.row = currentItem.__rowNum__ - (-1);
			});
		}
		if(this.sheetToUpload === 'Image'){
			this.images_to_upload = data;
			this.images_to_upload.forEach(function(currentItem, index, arr){
				if(!(currentItem.row))
					currentItem.row = currentItem.__rowNum__ - (-1);
			});
		}
	}
	
	prepareUploadData(jsn,sheetToUpload){
		var that = this;
		
		if(jsn.length && jsn.length>0){
			that.setUploadData(jsn);
		}
		else{
			that.setUploadData([]);
		}
		
		if(jsn.length && jsn.length>1000){
			that.setUploadData([]);
			that.sharedService.openMessageBox("E",'Maximum of 1000 products can only be uploaded at a time.',null);
		}
		else{			
			that.validateUploadData(sheetToUpload);
		}
	}
	
	getUploadData(){
		var to_upload = [];
		if(this.sheetToUpload === 'Product')
			to_upload = this.products_to_upload
		if(this.sheetToUpload === 'Specification')
			to_upload = this.specs_to_upload
		if(this.sheetToUpload === 'Image')
			to_upload = this.images_to_upload
		
		return to_upload;
	}
	
	validateUploadData(sheetToUpload){
		var that = this;
		//var to_upload = this.getUploadData();
		var uploadData:any = {
			data: this.getUploadData(),
			sheet: sheetToUpload
		};
		this.commonService.adminService.validateUploadData(uploadData)
			.subscribe( data => {
				this.setUploadData(data.results);
				if(data.statusCode=="S"){
					this.uploadValidation = {state: 'S', msg: data.msg};	
				}
				else{
					this.uploadValidation = {state: 'E', msg: data.msg};					
					//if(data.results){						
						
					//}
					//else{
					//	this.sharedService.openMessageBox("E",data.msg,null);
					//}
				}
				this.showUploadPreviewDialog = true;
				this.checkDiscrepancy(this.getUploadData());
			});
	}
	
	checkDiscrepancy(to_upload){
		var hasDiscrepancy = false;
		if(to_upload.length===0)
			hasDiscrepancy = true;
		for(var i = 0; i<to_upload.length; i++){
			if(to_upload[i].msg){
				hasDiscrepancy = true;
				break;
			}
		}
		if(hasDiscrepancy)
			this.hasDiscrepancy = true;
		else
			this.hasDiscrepancy = false;
	}
	
	onMultipleImageUpload(evt){ 
        var that = this; 
		var count = 0;
        var files = evt.target.files;
		jQuery.each(files,function(f,file){
			//var file = files[f];
			if (file) { 
						var fileName = file.name; 
						var fileType = file.type; 
						var fileSize = file.size; 
						//extend FileReader 
						//FileReader.prototype.content = "";
						if (!FileReader.prototype.readAsBinaryString) { 
								FileReader.prototype.readAsBinaryString = function (file) { 
								   var binary = ""; 
								   var pt = this; 
								   var reader = new FileReader();      
								   reader.onload = function (e) { 
												var bytes = new Uint8Array(reader.result); 
												var length = bytes.byteLength; 
												for (var i = 0; i < length; i++) { 
														   binary += String.fromCharCode(bytes[i]); 
												} 
												pt.result = binary; 
												jQuery(pt).trigger('onload'); 
										} 
										reader.readAsArrayBuffer(file); 
								} 
						} 
						var binaryString = ""; 
						var reader = new FileReader(); 
						reader.readAsBinaryString(file); 
						reader.onload = function(e) {
							var binaryString = reader.result; 
							var base64Data = btoa(binaryString); 
							var base64string = "data:"+fileType+";base64,"+base64Data; 
							that.resizeBase64Img(base64string, 100, 100).then(function(newImg){
								var compressed = newImg.replace(/^data:image\/[a-z]+;base64,/, "");
								 
								var splitName = fileName.split('_');
								var product_id = '';
								var msg = '';
								if(splitName.length > 3){
									product_id = splitName[0]+'_'+splitName[1]+'_'+splitName[2]+'_'+splitName[3];									
								}
								if(splitName.length < 7){
									msg = 'Invalid file name';
								}
								var newImage = {
								  product_id: product_id,
								  data: base64Data,
								  type: fileType,
								  name: "",
								  msg: msg,
								  default: false
								};
								/*var newThumbnail = {
								  product_id: "",
								  type: fileType,
								  name: "",
								  color: "",
								  year_from: "",
								  year_to: "",
								  thumbnail: compressed,
								  image_id: "",
								  default: false
								};*/
								that.images_to_upload.push(newImage);
								
								count = count - (-1);
								if(count === files.length)
									that.prepareUploadData(that.images_to_upload,that.sheetToUpload);
						  });
						  
						} 
						
			}
		});		
	}
	
	onUploadSubmit(evt){
		if(this.products_to_upload.length>0){
			this.commonService.adminService.addMultipleProduct(this.products_to_upload)
			.subscribe( data => {
				if(data.statusCode=="S"){
					this.sharedService.openMessageBox("S",data.msg,null);
				}
				else{
					this.sharedService.openMessageBox("E",data.msg,null);
				}
			});
		}
		else if(this.specs_to_upload.length>0){
			this.commonService.adminService.addMultiProductSpec(this.specs_to_upload)
			.subscribe( data => {
				if(data.statusCode=="S"){
					this.sharedService.openMessageBox("S",data.msg,null);
				}
				else{
					this.sharedService.openMessageBox("E",data.msg,null);
				}
			});
		}
		else if(this.images_to_upload.length>0){
			/*this.commonService.adminService.addMultiProductImage(this.images_to_upload)
			.subscribe( data => {
				if(data.statusCode=="S"){
					this.sharedService.openMessageBox("S",data.msg,null);
				}
				else{
					this.sharedService.openMessageBox("E",data.msg,null);
				}
			});*/
			this.uploadMultipleImages();
		}
	}
	
	uploadMultipleImages(){
		var that = this;
		var count = 0;
		if(this.images_to_upload.length>0){
			this.sharedService.setBusy(true);
		}
		jQuery.each(this.images_to_upload, function(i,v){
			var images = []; images.push(v);
			that.commonService.adminService.addMultiProductImage(images)
			.subscribe( data => {
				count = count - (-1);
				if(data.statusCode=="S"){
					//that.sharedService.openMessageBox("S",data.msg,null);
				}
				else{
					//that.sharedService.openMessageBox("E",data.msg,null);
				}
				
				if(count === that.images_to_upload.length)
					this.sharedService.setBusy(false);
			});
		});
	}
	
	
	onDeleteUploadData(evt,to_upload,index){
		to_upload.splice(index, 1);
		this.checkDiscrepancy(to_upload);
	}
	
	onDownoadTemplateClick(evt){
		window.open("/assets/product_template.xlsx","_blank");
	}


}
