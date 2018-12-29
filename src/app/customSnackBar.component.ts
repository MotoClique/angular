//SnackBar Component
import {Component, Inject} from '@angular/core';
import {MAT_SNACK_BAR_DATA, MatSnackBarRef} from '@angular/material';


//For Success Message
@Component({
  //selector: '',
  template: '<div class="successSnackBar"><span class="glyphicon glyphicon-ok"></span> {{data.message}}</div>',
  styles: ['.successSnackBar { color: #000000; text-align: center; }'],
})
export class SuccessSnackBarComponent {
	 constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any, private snackBarRef: MatSnackBarRef<SuccessSnackBarComponent>) { }
}



//For Error Message
@Component({
  //selector: '',
  template: '<div class="errorSnackBar"><span class="glyphicon glyphicon-alert"></span> {{data.message}}</div> <div *ngIf="data.action" style="display:flex; justify-content:flex-end;"><button mat-button color="accent" (click)="onActionClick($event)">{{data.action}}</button></div>',
  styles: ['.errorSnackBar { color: #000000; text-align: center; }'],
})
export class ErrorSnackBarComponent {
	 constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any,  private snackBarRef: MatSnackBarRef<ErrorSnackBarComponent>) { }
	 
	 onActionClick(evt){
		this.snackBarRef.dismissWithAction();
	 }
}



//For Information Message
@Component({
  //selector: '',
  template: '<div class="infoSnackBar"><span class="glyphicon glyphicon-info-sign"></span> {{data.message}}</div>',
  styles: ['.infoSnackBar { color: #000000; text-align: center; }'],
})
export class InfoSnackBarComponent {
	 constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any,  private snackBarRef: MatSnackBarRef<InfoSnackBarComponent>) { }
}
