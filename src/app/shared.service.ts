import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
//import 'rxjs/add/observable/of';
import {Router, ActivatedRoute} from '@angular/router';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from './authentication.service';
import { MatSnackBar } from '@angular/material';
import { SuccessSnackBarComponent, ErrorSnackBarComponent, InfoSnackBarComponent } from './customSnackBar.component';
declare var jQuery:any;

@Injectable()
export class SharedService {
	sharedObj: any = {userProfile: {}, postItem:{}, configParams:{}, backUpData: {}};
	containerContext: any;
	token: string = "";
	fullhost: string = "";
	callCount: number = 0;
	
	constructor(private auth: AuthenticationService, private http: HttpClient, public snackBar: MatSnackBar, public router: Router, public angularLocation:Location){
		this.fullhost = this.auth.fullhost;
	}
	
	getUserProfile(callback){
		var that = this;
		if(!(that.sharedObj["userProfile"].user_id)){
			var userDetail = that.auth.getUserDetails();
			that.call('getprofile', "post", {user_id:userDetail.user_id}, true)
				   .subscribe( data => {
            if(data.unknown_device)
                 that.noDeviceRegistrationMessageBox(data.msg);		
            if(data.results && data.results.length>0)
							that.sharedObj["userProfile"] = data.results[0];
						else
							that.sharedObj["userProfile"] = {};
						//ref = data.results[0];
						callback(that.sharedObj.userProfile);
			});
		}
		else{
			//ref = that.sharedObj.userProfile;
			callback(that.sharedObj.userProfile);
		}		
	}
	
	call(entity, method, obj, admin) {
		if(!(entity.includes("image/") && method==='get') && (entity !== "searchload") && !(entity.includes("chatDetail/") && method==='get') && (entity !== "freshChatCount")){
			this.setBusyWithCountCheck(true);
			this.callCount = this.callCount - (-1);
		}
		this.token = this.auth.getToken();
		let url = "";
		if(admin){
			url = this.fullhost+'/api/';
		}
		else{
			url = this.fullhost+'/api/public/node/';
		}
		let base;
    
		if(obj)
		   obj.device_reg_id = (!(localStorage.getItem('device-token')))?'empty':localStorage.getItem('device-token');
    

		if (method === 'post') {
		  base = this.http.post(url+entity, obj, { headers: { Authorization: `Bearer ${this.token}` }});
		} 
		else if (method === 'put') {
		  base = this.http.put(url+entity, obj, { headers: { Authorization: `Bearer ${this.token}` }});
		}
		else if (method === 'get') {
		  base = this.http.get(url+entity, { headers: { Authorization: `Bearer ${this.token}` }});
		}
		else if (method === 'delete') {
		  base = this.http.delete(url+entity, { headers: { Authorization: `Bearer ${this.token}` }});
		} 

		const request = base.map((res: any) => {
			if(!(entity.includes("image/") && method==='get') && (entity !== "searchload") && !(entity.includes("chatDetail/") && method==='get') && (entity !== "freshChatCount")){
				this.callCount = this.callCount - 1;
				this.setBusyWithCountCheck(false);
			}
			return res;
		})
		.catch((err: any) => {
			if(!(entity.includes("image/") && method==='get') && (entity !== "searchload") && !(entity.includes("chatDetail/") && method==='get') && (entity !== "freshChatCount")){
				this.callCount = this.callCount - 1;
				this.setBusyWithCountCheck(false);
			}
			var message = "Error: Unable to process your request. Please refresh your page.";
      if(err.statusCode === 'F')
         message = err.msg;
			else if(err.error.error && err.error.error.message)
				message = err.error.error.message;
			this.openMessageBox('E',message,'refresh');
		});

		return request;
	}
  
  setBusyWithCountCheck(state){
		var that = this;
		if(state)
			document.getElementById("loaderContainer").style.display = "block";
		else{
			setTimeout(function(){
				if(that.callCount <= 0)
					document.getElementById("loaderContainer").style.display = "none"; 
			}, 500);
      jQuery("#brandlogo").fadeOut(2000,function(){
			  jQuery("#approot").fadeIn(2000,function(){});
			});
    }
	}
	
	setBusy(state){
		if(state)
			document.getElementById("loaderContainer").style.display = "block";
		else
			setTimeout(function(){ document.getElementById("loaderContainer").style.display = "none"; }, 500);			
	}
	
	
	validateFields(form){
		if(form){
			var that = this;
			var status = true;
			//Validate Input Element
			var inputs = form.getElementsByTagName("input");                                       
			jQuery.each(inputs,function(i,v){
						   if(v.required
							&& !(v.hidden)
							   && !(jQuery.trim(v.value)) ){  
								v.focus();
								v.blur();
								status = false;
						   }
			});
			
			//Validate TextArea Element
			var textareas = form.getElementsByTagName("textarea");                                       
			jQuery.each(textareas,function(i,v){
						   if(v.required
							&& !(v.hidden)
							   && !(jQuery.trim(v.value)) ){  
								v.focus();
								v.blur();
								status = false;
						   }
			});
												
			//Validate Select Element
			var selects = form.getElementsByTagName("mat-select");
		   jQuery.each(selects,function(i,v){
						   if(v.getAttribute('aria-required')=='true'
							&& !(v.hidden)
							   && !(jQuery.trim(v.getAttribute('data-val'))) ){
								v.focus();
								v.blur();
								status = false;
						   }
		   });
		   if(!status)
			   this.openMessageBox("E","Please fill all the required fields.",null);
		   
		   return status;
		}
		else{
			return false;
		}
    }
                              
    clearHighlight(ele){
        
    }
                               
    openMessageBox(type,msg,callback){
		var that = this;
		var duration = 2000;
		if(msg && msg.length){
			duration = Math.round((msg.length)/6) * 1000;
		}
		
		if(type == "S"){
			var message = ''+msg;
			this.snackBar.openFromComponent(SuccessSnackBarComponent, {
			  duration: duration,
			  data: {message: message}
			});
		}
		else if(type == "E"){
			var message = ''+msg;
			if(callback){
        if(callback === 'refresh'){
					var snackBarRef = this.snackBar.openFromComponent(ErrorSnackBarComponent, {
						duration: duration,
						data: {message: message, action: 'Refresh'}
					});
					snackBarRef.onAction().subscribe(() => {
            localStorage.setItem("lastRoute",that.router.url);
						that.angularLocation.back();
						//location.reload();
					});
				}
				else{
          var snackBarRef = this.snackBar.openFromComponent(ErrorSnackBarComponent, {
            duration: duration,
            data: {message: message, action: 'Show'}
          });
          snackBarRef.onAction().subscribe(() => {
            callback();
          });
        }
			}
			else{
				this.snackBar.openFromComponent(ErrorSnackBarComponent, {
					duration: duration,
					data: {message: message}
				});
			}
		}
		else if(type == "I"){
			var message = ''+msg;
			this.snackBar.openFromComponent(InfoSnackBarComponent, {
				duration: duration,
				data: {message: message}
			});
		}
		else{
			this.createMessageBox(type,msg,callback);
		}
	}
	
	createMessageBox(type,msg,callback){
        var that = this;
        if(!document.getElementById('global_msg_dialog_container')){
            //Create Dialog Wrapper/Container
            var c = document.createElement('DIV');
            c.setAttribute("id", "global_msg_dialog_container");
                                            
           //Create Dialog Overlay
           var o = document.createElement('DIV');
           o.setAttribute("id", "global_msg_dialog_overlay");
           o.className = 'global_msg_dialog_overlay';
           //jQuery("#global_msg_dialog_overlay").addClass("global_msg_dialog_overlay");
           o.addEventListener("click", that.closeMessageBox);
           c.appendChild(o);
                                                               
           //Create Dialog Content Area
           var d = document.createElement('DIV');
           d.setAttribute("id", "global_msg_dialog");
           d.className = 'global_msg_dialog';
           //jQuery("#global_msg_dialog").addClass("global_msg_dialog");
           c.appendChild(d);
                                                                         
           //Create Dialog Header
           var h = document.createElement('DIV');
           h.className = 'global_msg_dialog_header';
           var i = document.createElement('SPAN');//Header Icon
           h.appendChild(i);
		   var title = document.createElement('SPAN');//Header Title
           h.appendChild(title);
           d.appendChild(h);
		   
		   //Create Dialog Close Button
           /*var b = document.createElement('BUTTON');
           b.className = "global_msg_dialog__close-btn";
           b.innerHTML = "&times;";
           b.addEventListener("click", that.closeMessageBox);
           h.appendChild(b);*/
                                                    
          //Create Message Paragraph
			var p = document.createElement('P');
            p.innerHTML = msg;
            p.className = 'global_msg_dialog_text';
            d.appendChild(p);
			
           if(type == "S"){
               i.className= 'glyphicon glyphicon-ok';
			   i.style.color = 'green';
               title.innerHTML+= " Successful";
           }
		   else if(type == "E"){
               i.className= 'glyphicon glyphicon-alert';
			   i.style.color = 'red';
               title.innerHTML+= " Error";
           }
           else if(type == "I"){
               i.className= 'glyphicon glyphicon-info-sign';
               title.innerHTML+= " Information";
           }
		   else if(type == "W"){
               i.className= 'glyphicon glyphicon-warning-sign';
			   i.style.color= '#ede807';
               title.innerHTML+= " Warning";
			   
			   var f = document.createElement('DIV');
			   f.className= 'global_msg_dialog_footer';
			   var ok = document.createElement('BUTTON');
			   ok.addEventListener("click", callback);
			   ok.innerHTML+= "Ok";
			   f.appendChild(ok);
			   
			   var cancel = document.createElement('BUTTON');
			   cancel.addEventListener("click", that.closeMessageBox);
			   cancel.innerHTML+= "Cancel";
			   f.appendChild(cancel);
			   
			   d.appendChild(f);
           }
			else if(type == "C"){
               i.className= 'glyphicon glyphicon-question-sign';			   
               title.innerHTML+= " Confirmation";
			   
			   var f = document.createElement('DIV');
			   f.className= 'global_msg_dialog_footer';
			   var yes = document.createElement('BUTTON');
			   yes.addEventListener("click", function(){that.closeMessageBox(); callback(true);});
			   yes.innerHTML+= "Yes";
			   yes.style.backgroundColor = "green";
			   f.appendChild(yes);
			   
			   var no = document.createElement('BUTTON');
			   no.addEventListener("click", function(){that.closeMessageBox(); callback(false);});
			   no.innerHTML+= "No";
			   no.style.backgroundColor = "#E71B03";
			   f.appendChild(no);
			   
			   d.appendChild(f);
           }
         
                                            
            document.body.appendChild(c);//Append to Body
        }
     }

     closeMessageBox(){
          if(document.getElementById('global_msg_dialog_container')){
               jQuery("#global_msg_dialog_container").remove();
          }
	 }
	 
	 unSaveDataCheck(callback,context){
		 var that = this;
		 if(context.editMode){
			 var msg = "Your unsaved data will be lost. Do you want to proceed?";
			 this.openMessageBox('C',msg,function(confirmed){
					 that.closeMessageBox(); 
					 callback.apply(context,[confirmed]);
				 });
		 }
		 else{
			callback.apply(context,[true]);
		 }
	 }
	 
	 
	/*showFooter(){
		if(jQuery('.footerStyle') && !(jQuery('.footerStyle').hasClass('on-canvas'))){
			jQuery('.footerStyle').addClass('on-canvas');
			setTimeout(function(){ 
					jQuery('.footerStyle').removeClass('on-canvas'); 
			}, 14000);
		}
	}
	
	fixedFooter(){
		var elem = jQuery(".scrollContainerStyle");
		if(elem.length>0){
			if(!(elem[0].scrollHeight > elem.height())){//No Scrollbar
				jQuery('.footerStyle').addClass('on-canvas');
			}
			else{
				jQuery('.footerStyle').removeClass('on-canvas');
			}
		}
	}
	 
	onElementHeightChange(){
		var elm = jQuery(".scrollContainerStyle")[0];
		if(elm){
			var lastHeight = elm.scrollHeight, newHeight;
			var that = this;
			(function run(){
				newHeight = elm.scrollHeight;
				if( lastHeight != newHeight )
					that.fixedFooter();
				lastHeight = newHeight;

				if( elm.onElementHeightChangeTimer )
				  clearTimeout(elm.onElementHeightChangeTimer);

				elm.onElementHeightChangeTimer = setTimeout(run, 200);
			})();
		}
	}*/
	
	showFooter(){
		jQuery('.footerStyle').removeClass('on-canvas');
		jQuery('.footerStyle').addClass('on-canvas');
	}
	hideFooter(){
		jQuery('.footerStyle').removeClass('on-canvas');
	}
	onElementHeightChange(){
		var elm = jQuery(".scrollContainerStyle")[0];
		if(elm){
			this.showFooter();
		}
	}
	
	
	validateForInteger(evt){
		if(evt.target.nodeName === 'INPUT'){
			var val = evt.target.value;
			evt.target.value = val.replace(/\D/g,'');
		}
	}

	noSubscriptionMessageBox(msg,callback){
		if(!document.getElementById('noSubscriptionMessageBox')){
            //Create Dialog Wrapper/Container
            var msgBox = document.createElement('DIV');
            msgBox.setAttribute("id", "noSubscriptionMessageBox");
                                            
           //Create Dialog Overlay
           var omsgBox = document.createElement('DIV');
           omsgBox.setAttribute("id", "noSubscriptionMessageBox_overlay");
           omsgBox.className = 'global_msg_dialog_overlay';
           msgBox.appendChild(omsgBox);
                                                               
           //Create Dialog Content Area
           var dmsgBox = document.createElement('DIV');
           dmsgBox.setAttribute("id", "noSubscriptionMessageBox_content");
           dmsgBox.className = 'global_msg_dialog';
           msgBox.appendChild(dmsgBox);
		   
		   //Create Message Paragraph
			var pmsgBox = document.createElement('P');
            pmsgBox.innerHTML = msg;
            pmsgBox.className = 'global_msg_dialog_text';
            dmsgBox.appendChild(pmsgBox);
		   
		   //Create Footer
		    var fmsgBox = document.createElement('DIV');
			fmsgBox.className= 'global_msg_dialog_footer';
			var dummyButton = document.createElement('BUTTON');
			fmsgBox.appendChild(dummyButton);
			var subscribeButton = document.createElement('BUTTON');
			subscribeButton.addEventListener("click", function(){
				if(callback){
					callback();
          jQuery("#noSubscriptionMessageBox").remove();
        }
			});
			subscribeButton.innerHTML+= "Subscribe";
			fmsgBox.appendChild(subscribeButton);
			dmsgBox.appendChild(fmsgBox);
		   
		   document.body.appendChild(msgBox);//Append to Body
		}
		else{
			jQuery("#noSubscriptionMessageBox").remove();
		}
	}
  
  noDeviceRegistrationMessageBox(msg){
    var that = this;
		if(!document.getElementById('noDeviceRegistrationMessageBox')){
            //Create Dialog Wrapper/Container
            var msgBox = document.createElement('DIV');
            msgBox.setAttribute("id", "noDeviceRegistrationMessageBox");
                                            
           //Create Dialog Overlay
           var omsgBox = document.createElement('DIV');
           omsgBox.setAttribute("id", "noDeviceRegistrationMessageBox_overlay");
           omsgBox.className = 'global_msg_dialog_overlay';
           msgBox.appendChild(omsgBox);
                                                               
           //Create Dialog Content Area
           var dmsgBox = document.createElement('DIV');
           dmsgBox.setAttribute("id", "noDeviceRegistrationMessageBox_content");
           dmsgBox.className = 'global_msg_dialog';
           msgBox.appendChild(dmsgBox);
		   
		   //Create Message Paragraph
			var pmsgBox = document.createElement('P');
            pmsgBox.innerHTML = msg;
            pmsgBox.className = 'global_msg_dialog_text';
            dmsgBox.appendChild(pmsgBox);
		   
		   //Create Footer
		    var fmsgBox = document.createElement('DIV');
			fmsgBox.className= 'global_msg_dialog_footer';
			var dummyButton = document.createElement('BUTTON');
			fmsgBox.appendChild(dummyButton);
			var logOutButton = document.createElement('BUTTON');
			logOutButton.addEventListener("click", function(){
				that.auth.logout();
        jQuery("#noDeviceRegistrationMessageBox").remove();
			});
			logOutButton.innerHTML+= "Log Out";
			fmsgBox.appendChild(logOutButton);
			dmsgBox.appendChild(fmsgBox);
		   
		   document.body.appendChild(msgBox);//Append to Body
		}
		else{
			jQuery("#noDeviceRegistrationMessageBox").remove();
		}
	}
  
  isCordovaApp(){
    var Window:any;
    Window = window || {};
    return !!Window.cordova;
  }
	
	
	//Testing purpose to be removed later
	testDataCreation(test){
		
	}

 
}
