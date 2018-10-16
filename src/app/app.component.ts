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
	  window.addEventListener('popstate', function(event:any){
      if((event.target.location.pathname).includes("/edit"))
        window.history.go(-1)
    });
  }
  
}
