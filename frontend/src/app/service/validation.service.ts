import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { ValidationError } from "../model/validation-error.model";
import { BehaviorSubject, merge, Observable, of } from "rxjs";
import { FormGroup } from "@angular/forms";
import { debounceTime, distinctUntilChanged, map, take, tap } from "rxjs/operators";

@Injectable()
export class ValidationService {

  constructor (
    private http: HttpClient,
  ) {}

  /**
   * Validate any given object by it's corresponding model-name
   * Models are decorated with @CtorEnsure in the backend
   * @param model Model's displayname
   * @param value Value to validate
   * @param lang Language of validation errors
   * @returns An array of errors, empty if value is valid
   */
  validateObject(model: string, value: any, lang = ''): Observable<ValidationError[]> {
    const params = new HttpParams().set('lang', lang);
    return this.http.post<ValidationError[]>(`${environment.apiUrl}/validate/${model}`, value, {
      // Only apply lang param if it's not empty
      params: lang === '' ? undefined : params,
    });
  }

  /**
   * Attach a live backend-validation to a given form
   * @param model Model's displayname, registered in backend using @CtorEnsure
   * @param form Form to attach to
   * @param mapper Mapper used for submitting
   */
  attachToForm(
    model: string,
    form: FormGroup,
    mapper?: (input: any) => any,
    // Default language if no subject provided
    lang$: BehaviorSubject<string> = new BehaviorSubject(''),
  ) {
    const prev$ = new BehaviorSubject<ValidationError[]>([]);

    merge(
      // Unique-ified, debounced, cached form value change
      form.valueChanges.pipe(
        // Filter out calls where form is unchanged
        distinctUntilChanged((x, y) => Object.keys(x).every(it => x[it] === y[it])),

        // Instantly re-set previous validation result
        tap(() => {
          this.updateErrors(form, prev$)
        }),

        // Debounce with a delay of 400ms
        debounceTime(400)
      ),

      // Language changes trigger form value re-evaluation
      // in order to get the new language messages
      lang$.pipe(map(() => form.value)),

      // "Artificial" initial call
      of(form.value)
    )
    .subscribe(v => {
      // Get the currently applied language from language subject
      lang$.pipe(take(1)).subscribe(lang => {
        // Update errors using the result from API
        this.updateErrors(form,
          this.validateObject(model, mapper ? mapper(v) : v, lang)
          // Cache result by tapping
          .pipe(tap(res => prev$.next(res)))
        );
      })
    });
  }

  /**
   * Update the error-state of a form-group's controls, based on the
   * result of a given observable
   * @param form Form to update
   * @param res Validation result
   */
  private updateErrors(form: FormGroup, res: Observable<ValidationError[]>) {
    // Terminate after one element
    res.pipe(take(1)).subscribe(errors => {

      // Iterate all controls by their name
      Object.keys(form.controls).forEach(ctl => {

        // Get control instance and it's errors from list
        const targ = form.controls[ctl];
        const errs = errors.filter(it => it.field === ctl);

        // Errors found, set
        if (errs.length > 0)
          targ.setErrors({ ctorEnsure: errs.map(it => it.description) });

        // No errors, reset through updating
        // (this falls back to sync validators' state)
        else
          targ.updateValueAndValidity();
      });
    });
  };
}