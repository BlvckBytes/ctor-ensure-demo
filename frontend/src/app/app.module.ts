import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { PanelComponent } from './component/panel/panel.component';
import { UserService } from './service/user.service';
import { ValidationService } from './service/validation.service';
import { TextboxComponent } from './component/textbox/textbox.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from './component/button/button.component';

@NgModule({
  declarations: [
    AppComponent,
    PanelComponent,
    TextboxComponent,
    ButtonComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
  ],
  providers: [
    UserService,
    ValidationService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
