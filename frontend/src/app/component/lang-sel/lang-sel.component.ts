import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Language } from '../button/language.interface';

@Component({
  selector: 'app-lang-sel',
  templateUrl: './lang-sel.component.html',
  styleUrls: ['./lang-sel.component.scss']
})
export class LangSelComponent implements OnInit {

  @Input() currLang$?: BehaviorSubject<string>;
  langs: Language[];

  constructor() {
    this.langs = [
      // Default lange = empty suffix
      { representation: 'English', value: '' },
      // German language = DE suffix
      { representation: 'Deutsch', value: 'DE' },
    ]
  }

  ngOnInit(): void {
    // Initially push the first language as default
    this.currLang$?.next(this.langs[0].value);
  }
}
