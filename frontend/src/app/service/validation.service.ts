import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { ValidationError } from "../model/validation-error.model";
import { BehaviorSubject, merge, Observable, of } from "rxjs";
import { FormGroup } from "@angular/forms";
import { debounceTime, distinctUntilChanged, take, tap } from "rxjs/operators";

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
   * @returns An array of errors, empty if value is valid
   */
  validateObject(model: string, value: any): Observable<ValidationError[]> {
    return this.http.post<ValidationError[]>(`${environment.apiUrl}/validate/${model}`, value)
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
    mapper?: (input: any) => any
  ) {
    const prev$ = new BehaviorSubject<ValidationError[]>([]);

    // Merge value change and "artificial" initial call
    merge(form.valueChanges, of(form.value))
    .pipe(
      // Filter out calls where form is unchanged
      distinctUntilChanged((x, y) => Object.keys(x).every(it => x[it] === y[it])),

      // Instantly re-set previous validation result
      tap(() => {
        this.updateErrors(form, prev$)
      }),

      // Debounce with a delay of 500ms
      debounceTime(500)
    )
    .subscribe(v => {
      // Update errors using the result from API
      this.updateErrors(form,
        this.validateObject(model, mapper ? mapper(v) : v)
        // Cache result by tapping
        .pipe(tap(res => prev$.next(res)))
      );
    });
  }

  /**
   * Update the error-state of a form-group's controls, based on the
   * result of a given observable
   * @param form Form to update
   * @param res Validation result
   */
  private updateErrors(form: FormGroup, res: Observable<ValidationError[]>) {
    res.pipe(take(1)).subscribe(errors => {
      Object.keys(form.controls).forEach(ctl => {
        const targ = form.controls[ctl];
        const errs = errors.filter(it => it.field === ctl);

        if (errs.length > 0)
          targ.setErrors({ ctorEnsure: errs.map(it => it.description) });
        else
          targ.updateValueAndValidity();
      });
    });
  };
}