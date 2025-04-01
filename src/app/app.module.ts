import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SrjfComponent } from './srjf/srjf.component';
import { FormsModule } from '@angular/forms';
import { MultipleSrjfComponent } from './multiple-srjf/multiple-srjf.component';

@NgModule({
  declarations: [
    AppComponent,
    SrjfComponent,
    MultipleSrjfComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
