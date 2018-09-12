import { Component, OnInit, ViewEncapsulation } from '@angular/core';
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
  
  ngOnInit(){
	  jQuery("#brandlogo").fadeOut(2000,function(){
      jQuery("#approot").fadeIn(2000,function(){});
    });
  }
  
}
