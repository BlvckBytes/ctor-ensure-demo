import { FormGroup } from "@angular/forms";
import { merge } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { ValidationService } from "../service/validation.service";

/**
 * Async validator function factory, used to inject dependencies
 * @param validation Validation service to call backend
 * @param model Name of the model that's to be validated
 */
export const ctorEnsureValidator = (
  group: FormGroup,
  validation: ValidationService,
  model: string,
  mapper?: (input: any) => any,
) => {
  merge(
    group.valueChanges
  ).pipe(
    debounceTime(500)
  ).subscribe(() => {
    console.log('Calling');
    // Run the value through the provided mapper
    const value = mapper ? mapper(group.value) : group.value;

    // Call backend
    validation.validateObject(model, value)
      .subscribe(res => {
        for (const ctl in group.controls) {
          const tar = group.controls[ctl];
          const tarErrs = res.filter(it => it.field === ctl).map(it => it.description);
          console.log('Altering errors');
          tar.setErrors(tarErrs.length > 0 ? { ctorEnsure: tarErrs } : null);
        }
      })
  })
};