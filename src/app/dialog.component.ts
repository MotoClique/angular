import { Component, OnInit, Input, Output, OnChanges, EventEmitter } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
declare var jQuery:any;

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css'],
  animations: [
    trigger('dialog', [
      transition('void => *', [
        style({ transform: 'scale3d(.3, .3, .3)' }),
        animate(100)
      ]),
      transition('* => void', [
        animate(100, style({ transform: 'scale3d(.0, .0, .0)' }))
      ])
    ])
  ]
})
export class DialogComponent implements OnInit {
  @Input() closable = true;
  @Input() visible: boolean;
  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() { }
  
  ngOnChanges(){
	  if(jQuery(".mat-toolbar").length>0){
		  if(this.visible)
			jQuery(".mat-toolbar")[0].style.zIndex = 1;  
		  else
			jQuery(".mat-toolbar")[0].style.zIndex = 2;  
	  }
  }
  
  close() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }
}