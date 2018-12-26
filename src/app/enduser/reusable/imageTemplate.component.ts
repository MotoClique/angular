//
import {Component,OnInit,Input} from '@angular/core';
import { Injectable }     from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import {Router} from '@angular/router';
import { CommonService } from '../../common.service';
import { SharedService } from '../../shared.service';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
declare var jQuery:any;

@Component({
      selector: 'image-template',
      templateUrl: './imageTemplate.component.html',
      styleUrls: ['./imageTemplate.component.css'],
      providers: [CommonService]
})

@Injectable()
export class AppImageTemplate implements OnInit {
		selected_transc_id: string = "";
		userDetail: any = {};
		transactionItem: any;
		localData: any;
		thumbnails: any = [];
		currentImage: any = {no_image: true};
		showUploadImageDialog: boolean = false;
		showBidConfirmDialog: boolean = false;
		newImages: any = [];
		self: any = this;
		fav: any = [];
		time_left: string = "";
		timer: any ;
		//@Input() bid;
		@Input() item;
		//@Input() ownItem;
		@Input() parentComponent;
		@Input() editMode;
		isCordova: boolean = false;
		
    constructor(private router: Router, private http: Http, private commonService: CommonService, private sharedService: SharedService) {
           
	}

    ngOnInit(){
		var that = this;
      // this.transactionItem = this.item;	   
	   this.sharedService.getUserProfile(function(user){
					that.userDetail = user;
	   });
	   this.resizeImage();
	   
	   jQuery(window).resize(function(e){		   
		   that.resizeImage();
	   });
	   
	   this.isCordova = this.sharedService.isCordovaApp();
	   /*jQuery('#imageWholeContainer').load(function(e){		   
		   that.resizeImage();
	   });*/
    }
	
	startTimer(validTo){
		this.time_left = '---';
		if(this.timer)
			clearInterval(this.timer);
		if(validTo){
			var that = this;
			that.timer = setInterval(function(){
				that.time_left = '';
				var current:any = new Date();
				var date_part = (validTo.split('T'))[0];
				var time_part = (validTo.split('T'))[1];
				
				var date_split:any = (date_part)?date_part.split('/'):[];
				var time_split:any = (time_part)?time_part.split(':'):[];
				var to:any = new Date();
				if(date_split[0] && date_split[1] && date_split[2] && time_split[0] && time_split[1])
					to = new Date(date_split[1]+'/'+date_split[0]+'/'+date_split[2] +' '+time_split[0]+':'+time_split[1]+':00' );
				var milliseconds:number = to - current;
				if(milliseconds > 0){
					var seconds:any = (milliseconds / 1000) % 60;
					seconds = parseInt(seconds) ;
					var minutes:any  = (milliseconds / (1000*60)) % 60;
					minutes = parseInt(minutes);
					var hours:any = (milliseconds / (1000*60*60)) % 24;
					hours = parseInt(hours);				
					var days:any = (milliseconds / (1000*60*60*24));
					days = parseInt(days);
					
					that.time_left = (days+' days '+hours+' hrs '+minutes+' mins '+seconds+' secs').toString();
				}
				else{
					clearInterval(that.timer);
				}
			}, 1000);
		}
	}
	
	  
	resizeImage(){
		var height = jQuery('#imageWholeContainer').height(); //document.body.clientHeight;
		var width = jQuery('#imageWholeContainer').width(); //document.body.clientWidth;
		var frame = jQuery('#imageFrame');
		if(frame){
		   frame.css('width', (width - 40)+"px");
		   frame.css('height', ((width - 40)/2)+"px");
		}
	}
	
	move_left(){
		document.getElementById('imageScrollContainer').scrollLeft -= 30
	}
	
	move_right(){
		document.getElementById('imageScrollContainer').scrollLeft += 30
	}
	
		getThumbnails(prd_id){
			this.item.user_id = this.userDetail.user_id;
			this.selected_transc_id = "";
			this.thumbnails = [];
			this.currentImage = {no_image: true};
			if(!(this.item.color))
				this.item.color = "";
			if(!(this.item.year_of_reg))
				this.item.year_of_reg = "";
			this.commonService.adminService.getPrdThumbnail(prd_id,this.item.color,this.item.year_of_reg)
			  .subscribe( prdThumbnails => {			  
					  var prdThumbnail = prdThumbnails.results;
					  this.thumbnails = [];
					  if(prdThumbnail.length > 0){
						  //for(var i = 0; i < prdThumbnail.length; i++){
							//if(prdThumbnail[i].default){
								var base64string_th = this.arrayBufferToBase64(prdThumbnail[0].thumbnail.data);
								var imageData_th = "data:"+prdThumbnail[0].type+";base64,"+base64string_th;
								this.thumbnails.push({index: 0, image_id: prdThumbnail[0].image_id, type:prdThumbnail[0].type, data: imageData_th, thumbnail: base64string_th, name: prdThumbnail[0].name, newImageLink: 0, newImage:true, default: prdThumbnail[0].default, selected: false});
								this.item.number_of_image = (this.thumbnails.length).toString();
								//break;
							//}
						  //}
						  this.getDefaultMasterImage(this.thumbnails[0]);
					  }
					  this.resizeImage();
			  });
		}
		
		getDefaultMasterImage(image){
			this.newImages = [];
			this.commonService.adminService.getPrdImage(image.image_id,"")
				  .subscribe( prdImages => {			  
						  var prdImage = prdImages.results;
						  if(prdImage.length > 0){
							  jQuery.each(this.thumbnails, function(i,v){
								  v.selected = false;
							  });
							  var base64string = this.arrayBufferToBase64(prdImage[0].data.data);
							  if(!(prdImage[0].data.data))
								  this.currentImage.no_image = true;
							  else
								  this.currentImage.no_image = false;
							  this.currentImage.data = "data:"+prdImage[0].type+";base64,"+base64string;
							  this.currentImage.fav = false;
							  this.currentImage.index = image.index;
							  this.currentImage.default = image.default;
							  image.selected = true;
							  
							  var newImage = {
								  transaction_id: "",
								  data: base64string,
								  type: prdImage[0].type,
								  name: "",
								  default: image.default
							  };
							  this.newImages.push(newImage);
						  }
				  });
		}
		
		getTransactionThumbnails(transaction_id){
			var that = this;
			this.selected_transc_id = transaction_id;
			this.thumbnails = [];
			this.currentImage = {no_image: true};
			this.commonService.enduserService.getThumbnail("",transaction_id)
			  .subscribe( prdThumbnails => {			  
					  var prdThumbnail = prdThumbnails.results;
					  this.thumbnails = [];
					  if(prdThumbnail.length > 0){
						  var defaultFound = false;
						  for(var i = 0; i < prdThumbnail.length; i++){					  
							var base64string_th = this.arrayBufferToBase64(prdThumbnail[i].thumbnail.data);
							var imageData_th = "data:"+prdThumbnail[i].type+";base64,"+base64string_th;
							var entry = jQuery.extend(true, {}, prdThumbnail[i]);;
							entry.index = i;
							entry.data = imageData_th;
							entry.thumbnail = base64string_th;
							entry.selected = false;
							this.thumbnails.push(entry);
							if(entry.default){
								this.getImage(entry);
								defaultFound = true;
							}
						  }
						  if(!defaultFound)
							this.getImage(this.thumbnails[0]);
					  }
					  
					  /*this.commonService.enduserService.getFav(this.userDetail.user_id)
					  .subscribe( res => {			  
							  this.fav = res.results;
							  jQuery.each(this.fav,function(i,v){
								  if((v.type == "Sale" && v.bid_sell_buy_id == that.item.sell_id)
									|| (v.type == "Buy" && v.bid_sell_buy_id == that.item.buy_req_id)
										|| (v.type == "Bid" && v.bid_sell_buy_id == that.item.bid_id)){
									  that.currentImage.fav = true;
								  }
							  });
					  });*/
					 that.getFav();
					 that.resizeImage();
					if(that.item.bid_id && that.item.bid_status === "Active"){
						that.startTimer(that.item.bid_valid_to);
					}
					else{
						that.time_left = '';
					}
			  });
			  
			
		}
		
		getFav(){
			var that = this;
			var transc_id = "";
			if(this.item.sell_id) transc_id = this.item.sell_id;
			if(this.item.buy_req_id) transc_id = this.item.buy_req_id;
			if(this.item.bid_id) transc_id = this.item.bid_id;
			if(this.item.service_id) transc_id = this.item.service_id;
			this.commonService.enduserService.getFav(that.userDetail.user_id,transc_id)
			  .subscribe( res => {			  
						that.fav = res.results;
						if(that.fav && that.fav.length > 0){
							if(that.fav[0].bid_sell_buy_id === transc_id)
								that.currentImage.fav = true;
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
	
	getImage(image){
		this.currentImage.busy = true;
		//if(this.parentComponent.editMode){
			if(image.newImage){
				jQuery.each(this.thumbnails, function(i,v){
					v.selected = false;
				});
				var img = this.newImages[image.newImageLink];
				//var base64string = this.arrayBufferToBase64(img.data);
				if(!(img.data))
					this.currentImage.no_image = true;
				else
					this.currentImage.no_image = false;
				this.currentImage.data = "data:"+img.type+";base64,"+img.data;
				//this.currentImage.fav = false;
				this.currentImage.index = image.index;
				this.currentImage.default = image.default;
				image.selected = true;
				
				this.currentImage.busy = false;
			//}
			/*else{
				this.commonService.adminService.getPrdImage(image.image_id,"")
				  .subscribe( prdImages => {			  
						  var prdImage = prdImages.results;
						  if(prdImage.length > 0){
							  jQuery.each(this.thumbnails, function(i,v){
								  v.selected = false;
							  });
							  var base64string = this.arrayBufferToBase64(prdImage[0].data.data);
							  if(!(prdImage[0].data.data))
								  this.currentImage.no_image = true;
							  else
								  this.currentImage.no_image = false;
							  this.currentImage.data = "data:"+prdImage[0].type+";base64,"+base64string;
							  //this.currentImage.fav = false;
							  this.currentImage.index = image.index;
							  this.currentImage.default = image.default;
							  image.selected = true;
						  }
				  });
			}*/
		}
		else{
			this.commonService.enduserService.getImage(this.userDetail.user_id,image.image_id,this.selected_transc_id)
			  .subscribe( prdImages => {			  
					  var prdImage = prdImages.results;
					  if(prdImage.length > 0){
						  jQuery.each(this.thumbnails, function(i,v){
							  v.selected = false;
						  });
						  var base64string = this.arrayBufferToBase64(prdImage[0].data.data);
						  if(!(prdImage[0].data.data))
							  this.currentImage.no_image = true;
						  else
							  this.currentImage.no_image = false;
						  this.currentImage.data = "data:"+prdImage[0].type+";base64,"+base64string;
						  //this.currentImage.fav = false;
						  this.currentImage.index = image.index;
						  this.currentImage.default = image.default;
						  image.selected = true;
					  }
					  this.currentImage.busy = false;
			  });
		}
	}
	
	onFav(evt){
		if(this.item.sell_id || this.item.buy_req_id || this.item.bid_id || this.item.service_id){
			var newFav:any = {};
			newFav.user_id = this.userDetail.user_id;		
			newFav.deleted = false;		
			newFav.createdBy = this.userDetail.user_id;
			newFav.changedBy = this.userDetail.user_id;
			if(this.item.sell_id){
				newFav.bid_sell_buy_id = this.item.sell_id;
				newFav.type = "Sale";
			}
			if(this.item.buy_req_id){
				newFav.bid_sell_buy_id = this.item.buy_req_id;
				newFav.type = "Buy";
			}
			if(this.item.bid_id){
				newFav.bid_sell_buy_id = this.item.bid_id;
				newFav.type = "Bid";
			}
			if(this.item.service_id){
				newFav.bid_sell_buy_id = this.item.service_id;
				newFav.type = "Service";
			}
			
			if(evt.target.id == "fav" && this.fav.length > 0){
				newFav._id = this.fav[0]._id;
				this.commonService.enduserService.deleteFav(newFav)
					.subscribe( res => {					    
						if(res.ok === 1){
							this.currentImage.fav = false;
							this.sharedService.openMessageBox("S","Removed.",null);
						}
						else{
							this.sharedService.openMessageBox("E","Unable to remove.",null);
						}
					});			
			}
			if(evt.target.id == "not-fav"){			
				this.commonService.enduserService.addFav(newFav)
					.subscribe( res => {					    
						if(res.statusCode=="S"){
							//this.currentImage.fav = true;
							this.getFav();
							this.sharedService.openMessageBox("S","Marked as your favourite.",null);
						}
						else{
							this.sharedService.openMessageBox("E","Unable to mark as favourite.",null);
						}
					});
			}
		}
	}
	
	/*onDefault(evt){		
		if(!this.currentImage.default){
			jQuery.each(this.thumbnails, function(i,v){
				v.default = false;
			});
			jQuery.each(this.newImages, function(i,v){
				v.default = false;
			});
			this.currentImage.default = true;
			this.thumbnails[this.currentImage.index].default = true;
			this.newImages[this.thumbnails[this.currentImage.index].newImageLink].default = true;
		}
	}*/
	
	
	onDefault(evt,thumbnail){
		//if(!thumbnail.default){
			jQuery.each(this.thumbnails, function(i,v){
				v.default = false;
			});
			jQuery.each(this.newImages, function(i,v){
				v.default = false;
			});
			if(thumbnail.selected)
				this.currentImage.default = true;
			thumbnail.default = true;
			this.newImages[thumbnail.newImageLink].default = true;
		//}
	}
	
	
	
	thumbnailSelect(evt,thumbnail){
		 this.getImage(thumbnail);
	}
	
	prevImage(evt){
		var indx = this.currentImage.index;
		indx = indx - 1;
		if(indx >= 0){
			this.getImage(this.thumbnails[indx]);
		}
	}
	nextImage(evt){
		var indx = this.currentImage.index;
		indx = indx - (-1);
		if(indx >= 0 && indx < this.thumbnails.length){
			this.getImage(this.thumbnails[indx]);
		}
	}
	
	onParticipate(evt){
		this.commonService.enduserService.getBidBy(this.userDetail.user_id,this.item.bid_id)
		  .subscribe( res => {
				if(res.results.length > 0){
					this.onParticipateYes(null);
				}
				else
					this.showBidConfirmDialog = true;
		});
	}
	onParticipateYes(evt){
		this.showBidConfirmDialog = false;
		//this.parentComponent.participate = true;
		this.parentComponent.bidItem = this.item;
		this.parentComponent.bidItem.bid_hike_by = (this.item.min_bid_hike)?this.item.min_bid_hike: '0';
    this.parentComponent.bidItem.previous_bid_amount = (this.item.current_bid_amount)?this.item.current_bid_amount: this.item.bid_amount;
		this.parentComponent.bidItem.current_bid_amount = (this.item.current_bid_amount)?(this.item.current_bid_amount - (- this.parentComponent.bidItem.bid_hike_by)): (this.item.bid_amount - (- this.parentComponent.bidItem.bid_hike_by));
		
		this.sharedService.sharedObj.postItem = jQuery.extend(true, {}, this.parentComponent.bidItem);
		this.router.navigate(['/Container/Bid',this.item.bid_id,'participate']);
	}
	
	onParticipateNo(evt){
		this.showBidConfirmDialog = false;
	}
	
	addImage(){
		this.showUploadImageDialog = true;
	}
	
	
	onUpload(evt){ 
        var that = this; 
        var files = evt.target.files; 
		//var file = files[0];
		var loopCount = 0;
		jQuery.each(files,function(indx,file){
			if (file) { 
					var fileName = file.name; 
					var fileType = file.type; 
					var fileSize = file.size; 
					//Read file
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
						  var resizedImage = that.resizeImageUsingCanvas(image,"image"); // send it to canvas for actual image
						  var resizedThumbnail = that.resizeImageUsingCanvas(image,"thumbnail"); // send it to canvas for thumbnail
						  var stringImage = resizedImage.replace(/^data:image\/[a-z]+;base64,/, "");
						  var stringThumbnail = resizedThumbnail.replace(/^data:image\/[a-z]+;base64,/, "");
						
						  var newThumbnail = {
							  transaction_id: "",
							  type: fileType,
							  name: "",
							  thumbnail: stringThumbnail,
							  data: resizedThumbnail,
							  image_id: "",							  
							  index: (that.thumbnails.length ),
							  selected: false,
							  newImage: true,
							  newImageLink: (that.newImages.length),
							  default: (that.thumbnails.length === 0)?true:false
						  };
						  that.thumbnails.push(newThumbnail);
						  that.item.number_of_image = (that.thumbnails.length).toString();
						  
						  var newImage = {
							  transaction_id: "",
							  data: stringImage,
							  type: fileType,
							  name: "",
							  default: (that.thumbnails.length === 1)?true:false
						  };
						  that.newImages.push(newImage);
						  
						  loopCount = loopCount - (-1);
						  if(loopCount === files.length){
							  that.getImage(that.thumbnails[that.thumbnails.length - 1]);
						  }
                      };
					  
					}; 
				
			}
		});
		this.showUploadImageDialog = false;	
	}
	
	resizeImageUsingCanvas(img,type) {
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
						  var imageData_th = "data:"+fileType+";base64,"+compressed;
						  var newThumbnail = {
							  transaction_id: "",
							  type: fileType,
							  name: "",
							  thumbnail: compressed,
							  data: imageData_th,
							  image_id: "",							  
							  index: (that.thumbnails.length - (-1)),
							  selected: false,
							  newImage: true,
							  newImageLink: (that.newImages.length),
							  default: false
						  };
						  that.thumbnails.push(newThumbnail);
						  that.item.number_of_image = (that.thumbnails.length).toString();
						  
						  var newImage = {
							  transaction_id: "",
							  data: base64Data,
							  type: fileType,
							  name: "",
							  default: false
						  };
						  that.newImages.push(newImage);
                      });
					  
					} 
				this.showUploadImageDialog = false;	
			} 
	}*/
	
	/*onImageUpload(evt){
		//Upload Image
		var image_name = this.selectedPrd.product_type_name +"_"+ this.selectedPrd.brand_name +"_"+ this.selectedPrd.model +"_"+ this.selectedPrd.variant+"_"+this.uploadColor;
		this.newImage.product_id = this.selectedPrd.product_id;
		this.newImage.name = image_name;
		this.commonService.adminService.addPrdImage(this.newImage)
		   .subscribe( res_image => {	
				    
					if(res_image.statusCode=="S"){
						//Upload Thumbnail
						this.newThumbnail.product_id = this.selectedPrd.product_id;
						this.newThumbnail.name = image_name;
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
		
	}*/
	
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
	
	
	removeImage(evt,thumbnail){
		var that = this;
		this.sharedService.openMessageBox("C","Are you sure you want to delete the image?",function(flag){
			if(flag){
				//Clear the current image if its selected one
				if(thumbnail.selected){
					var indx = that.currentImage.index;
					indx = indx - (-1);
					if(indx >= 0 && indx < that.thumbnails.length){//Set Next Image Selected
						that.getImage(that.thumbnails[indx]);
					}
					else if(that.thumbnails[0]){//Set First Image Selected
						that.getImage(that.thumbnails[0]);
					}
					else{//Remove Selected Image completely
						that.currentImage = {};
					}
				}
				if(thumbnail.newImage){//If newly added then delete completely
					//that.deleteObj(that.newImages[thumbnail.newImageLink], that.newImages);
					that.deleteObj(thumbnail, that.thumbnails);
				}
				else{//If existing one then mark				
					//that.newImages[thumbnail.newImageLink].markForDelete = true;
					thumbnail.markForDelete = true;
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
	
	ownerTypeFormatter(typ){
		var owner = '-';
		switch(typ){
			case 'First':
				owner = '1';
				break;
				
			case 'Second':
				owner = '2';
				break;
				
			case 'Third':
				owner = '3';
				break;
				
			case 'Fourth':
				owner = '4';
				break;
				
			case 'Fifth':
				owner = '5';
				break;
				
			case 'Sixth':
				owner = '6';
				break;
				
			case 'Seventh':
				owner = '7';
				break;
				
			case 'Eight':
				owner = '8';
				break;
				
			case 'Ninth':
				owner = '9';
				break;
				
			case 'Tenth':
				owner = '10';
				break;
				
			default:
				owner = '-';
				break;
		}
		return owner;
	}
  
  previewImage(data){
		var Window:any;
		Window = window || {};
		Window.preview_image = data;
		jQuery('#previewImageIframe').remove();
		document.getElementById('previewImageIframeContainer').innerHTML = '<iframe id="previewImageIframe" src="preview.html" style="height:100%; width:100%; border:none;" ></iframe>';
		jQuery('#previewImageContainer').show();
	}
	closePreviewImage(){
		jQuery('#previewImageIframe').remove();
		jQuery('#previewImageContainer').hide();
	}
	
	onImageBrowse(evt){
		var that = this;
		var Window:any;
		Window = window || {};
		if(Window.imagePicker){
			Window.imagePicker.hasReadPermission(
				function(permission) {
					if(permission){
						that.openImageBrowser();
					}
					else{
						Window.imagePicker.requestReadPermission();
						that.openImageBrowser();
					}
				}
			);
		}
	}
	
	openImageBrowser(){
		var that = this;
		var Window:any;
		Window = window || {};
		that.showUploadImageDialog = false;
		Window.imagePicker.getPictures(
				function(results) {
					var loopCount = 0;
					jQuery.each(results,function(i,v){						
						var image = new Image();
						image.src = v;
						image.onload = function() {
						  var resizedImage = that.resizeImageUsingCanvas(image,"image"); // send it to canvas for actual image
						  var resizedThumbnail = that.resizeImageUsingCanvas(image,"thumbnail"); // send it to canvas for thumbnail
						  var stringImage = resizedImage.replace(/^data:image\/[a-z]+;base64,/, "");
						  var stringThumbnail = resizedThumbnail.replace(/^data:image\/[a-z]+;base64,/, "");
							var fileType:any = '';							
							if (v.indexOf(".png") !== -1) fileType = "image/png";
							else if (v.indexOf(".jpg") !== -1 || v.indexOf(".jpeg") !== -1)
								fileType = "image/jpeg";
							else if(v.indexOf(".gif") !== -1)
								fileType = "image/gif";
						  var newThumbnail = {
							  transaction_id: "",
							  type: fileType,
							  name: "",
							  thumbnail: stringThumbnail,
							  data: resizedThumbnail,
							  image_id: "",							  
							  index: (that.thumbnails.length ),
							  selected: false,
							  newImage: true,
							  newImageLink: (that.newImages.length),
							  default: (that.thumbnails.length === 0)?true:false
						  };
						  that.thumbnails.push(newThumbnail);
						  that.item.number_of_image = (that.thumbnails.length).toString();
						  
						  var newImage = {
							  transaction_id: "",
							  data: stringImage,
							  type: fileType,
							  name: "",
							  default: (that.thumbnails.length === 1)?true:false
						  };
						  that.newImages.push(newImage);
						  
						  loopCount = loopCount - (-1);
						  if(loopCount === results.length){
							that.getImage(that.thumbnails[that.thumbnails.length - 1]);
						  }
						  
						  that.deleteTempFile(v);
                      };
					});
					that.showUploadImageDialog = false;
				}, function (error) {
					that.sharedService.openMessageBox("E","Unable to browse. "+error,null);	
				},
				{
					maximumImagesCount: 10
				}
			);
	}
	
	
	deleteTempFile(file) {
		var that = this;
		var Window:any;
		Window = window || {};
		if (!file || file.lastIndexOf('/') === -1) {
			that.sharedService.openMessageBox("E","No file path specified. Temp File could not be deleted.",null);
			return false;
		}

		//var path = 'file:///data/user/0/com.motocliquetest.meanapp/cache';
		var path  = file.substring(0,file.lastIndexOf('/'));
		var fileName = file.substring((file.lastIndexOf('/') - (-1)));
		Window.resolveLocalFileSystemURL(path, function(fileSystem){
			fileSystem.getFile(fileName, {create: false}, function(fileEntry){
				fileEntry.remove(function(success){
						//alert(success);
					}, function(error){
						//alert("deletion failed: " + error);
						that.sharedService.openMessageBox("E","Unable to remove temp file. "+error,null);	
					});   
			}, 
			function(e){
				//alert(e);
				that.sharedService.openMessageBox("E","Unable to remove temp file. "+e,null);	
			});
		 }, 
		 function(e){
			//alert(e);
			that.sharedService.openMessageBox("E","Unable to remove temp file. "+e,null);	
		 });
	}
		
}
