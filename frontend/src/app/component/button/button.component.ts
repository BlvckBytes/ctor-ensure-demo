import { Component, HostBinding, HostListener, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {

  @Input() text = 'Button';
  @Input() submit = false;

  @Input()
  @HostBinding('class.--disabled')
  disabled = false;
}
