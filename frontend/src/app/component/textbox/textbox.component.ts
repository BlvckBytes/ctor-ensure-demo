import { AfterViewInit, ChangeDetectorRef, Component, DoCheck, HostBinding, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, merge } from 'rxjs';
import { distinctUntilChanged, skip, startWith } from 'rxjs/operators';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-textbox',
  templateUrl: './textbox.component.html',
  styleUrls: ['./textbox.component.scss'],
})
export class TextboxComponent implements AfterViewInit, DoCheck, OnDestroy, OnInit {

  @Input() placeholder?: string = undefined;
  @Input() icon?: string = undefined;
  @Input() type = 'text';
  @Input() control!: FormControl;

  @HostBinding('class.--has-content')
  hasContent = false;

  @HostBinding('class.--valid')
  isValid = false;

  @HostBinding('class.--invalid')
  isInvalid = false;

  private subs = new SubSink();
  private touched$ = new BehaviorSubject(false);

  constructor (
    private cd: ChangeDetectorRef,
  ) {}

  ngDoCheck() {
    // Check if touched has changed
    if (this.touched$.value !== this.control.touched)
      this.touched$.next(true);
  }

  ngAfterViewInit() {
    this.subs.sink = merge(
      // Only call when touched changed
      this.touched$.pipe(
        startWith(false),
        distinctUntilChanged(),
        skip(1),
      ),
      // Also call on value or validity changes
      this.control.valueChanges,
      this.control.statusChanges,
    ).subscribe(() => this.updateModifiers());
  }

  ngOnInit(): void {
    this.updateModifiers();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  private updateModifiers() {
    // Neither empty nor null
    this.hasContent = this.control.value !== '' && this.control.value !== null;

    // Needs to be touched or have content in order to be applied
    this.isValid = (this.control.touched || this.hasContent) && this.control.valid;
    this.isInvalid = (this.control.touched || this.hasContent) && !this.control.valid;

    this.cd.detectChanges();
  }
}
