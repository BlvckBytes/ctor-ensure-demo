# ctor-ensure-demo

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

This project demonstrates how an intended usecase of [ctor-ensure](https://github.com/BlvckBytes/ctor-ensure) might look like, with both the backend and the frontend as example implementations.

## Table of Contents

* [Backend](#backend)
  * [Installation](#installation)
  * [Overview](#overview)
  * [Database](#database)
  * [Exception Mapping](#exception-mapping)
  * [Validation Endpoint](#validation-endpoint)
  * [Model Definition](#model-definition)
* [Frontend](#frontend)
  * [Installation](#installation-1)
  * [Overview](#overview-1)
  * [Components](#components)
  * [Validation Service](#validation-service)

## Backend

### Installation

```
cd ctor-ensure-example/backend
yarn install
yarn run start
```

### Overview

The framework used is called `NestJS`.

* 📃 main.ts Entrypoint
* 📃 app.module.ts Main module
* 📂 config
  * 📃 ctor-ensure.exception.filter Exception mapper
* 📂 controller
  * 📃 user.controller.ts User C/R/D
  * 📃 validation.controller.ts Generic model validator
* 📂 model
  * 📃 topics.enum.ts User interest topics
  * 📃 user.model.ts User model and schema

### Database

To keep things simple, I just use an `in-memory` array storage. `UUIDs` are generated randomly, and there is no change functionality yet, but it would be quite easy to implement.

### Exception Mapping

Since `ctor-ensure` throws an exception, if a class didn't pass validation, I've created a mapper for it, to provide a proper error-overview to the caller.

```typescript
@Catch(CtorEnsureException)
export class CtorEnsureExceptionFilter implements ExceptionFilter {
  catch(ex: CtorEnsureException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    // Group errors by field-name
    const validationErrors = {};
    const fieldErrors = {};
    ex.errors.forEach((error) => {
      fieldErrors[error.field] = [].concat(
        ...(fieldErrors[error.field] || []),
        [error.description],
      );
    });
    validationErrors[ex.displayName] = fieldErrors;

    // Create a 400 response
    ctx.getResponse<Response>().status(400).json({
      statusCode: 400,
      timestamp: new Date().toISOString(),
      validationErrors,
    });
  }
}
```

This just groups errors by the field-name, returns a `400`, the current timestamp and the validation errors.

### Validation Endpoint

`ctor-ensure` provides a function called `validateCtor`, which validates a constructor from a model by it's `displayname` by using any plain object's fields. I exposed this functionallity as a REST endpoint, which passes the `name` as a URL-parameter and the body as the request-body itself.

```typescript
@Controller('validate')
export class ValidationController {

  @Post(':name')
  @HttpCode(200)
  validateModel(
    @Param('name') name: string,
    @Body() body: any,
  ) {
    const res = validateCtor(name, body);

    // This model has not been registered using @CtorEnsure
    if (res === null)
      throw new BadRequestException('Model not found!');

    return res;
  }
}
```

The frontend will call this endpoint every time the form changed, using `user` as a name and the form's value as the body. Afterwards, it can extract the field errors and append them to the form elements.

### Model Definition

The model itself is quite simple, which resembles a user-account, having it's username, email, age and a list of interests. Those interests can be chosen only from the keys of the enum `Topic`. I enabled `multipleErrorsPerField` to provide a better overview of the schema in frontend error displays.

```typescript
@CtorEnsure({
  displayname: 'user',
  multipleErrorsPerField: true,
})
export default class UserModel {
  constructor(
    public id: string,

    @ValidatedArg('username', [
      ENSURE_ALPHANUM(),
      ENSURE_MINMAXLEN(10, 30),
    ])
    public username: string,

    @ValidatedArg('email', [
      ENSURE_EMAIL(),
    ])
    public email: string,

    @ValidatedArg('age', [
      ENSURE_INT(),
      ENSURE_MINMAXNUMBER(18, 100),
    ])
    public age: number,

    @ValidatedArg('interests', [
      ENSURE_ISARRAY(true, true, true),
      ENSURE_ARRAYSIZEMIN(1),
      ENSURE_ENUM(Topic),
    ])
    public interests: Topic[],
  ) {}

  // Parse the model from any request body
  static fromBody(body: any): UserModel {
    return new UserModel(
      null, body.username, body.email, body.age, body.interests,
    );
  }
}
```

This should be nothing special to you, if you're already familiar with `ctor-ensure`. As you can see, I created the method `fromBody`, which just takes in any plain object and converts it to a `UserModel` by field-extraction, always leaving the UUID as null. It doesn't matter if those fields actually exist, as the validator can of course handle null and undefined values very well.

## Frontend

### Installation

```
cd ctor-ensure-example/frontend
yarn install
yarn run start
```

### Overview

The framework used is called `Angular`.

* 📃 main.ts Entrypoint
* 📂 app
  * 📃 app.module.ts Main module
  * 📃 app.component.ts Main component
  * 📂 component Interactive components
    * Contents omitted, not relevant
  * 📂 model
    * 📃 validation-error.model.ts Validation error
    * 📃 user.model.ts User model
  * 📂 service
    * 📃 user.service.ts User C/R/D
    * 📃 validation.service.ts Form validation

### Components

I have created a few example components, which work quite well with this kind of usecase. In my opinion, the only component worth discussing is the `textbox`. Besides all the magic of cosmetics, what's really important is it's ability to respond to it's control's state of validity visually.

Multiple classes get bound to the host-element, based on boolean values, which I call modifiers.

```typescript
@HostBinding('class.--has-content')
hasContent = false;

@HostBinding('class.--valid')
isValid = false;

@HostBinding('class.--invalid')
isInvalid = false;
```

`--has-content` floats the label outside of the box, `--valid` makes the box green and `--invalid` red, as expected.

It's important to not overwhelm the user by having all fields invalid as soon as the page loads up, which is why I only display errors on a field after it has been messed with (touched, changed). Both of those events trigger the `updateModifiers` routine.

```typescript
private updateModifiers() {
  // Neither empty nor null
  this.hasContent = this.control.value !== '' && this.control.value !== null;

  // Needs to be touched or have content in order to be applied
  this.isValid = (this.control.touched || this.hasContent) && this.control.valid;
  this.isInvalid = (this.control.touched || this.hasContent) && !this.control.valid;

  this.cd.detectChanges();
}
```

Now, it's just a case of calling this method at the right time. For this, I combine touching, value-changes and validity-changes (set by the validation-service) into a single observable and also call it on init of the component.

```typescript
private subs = new SubSink();
private touched$ = new BehaviorSubject(false);

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
```

This way, the textbox will always keep up with it's state visually.

### Validation Service

Since there can easily be many different models to be validated, I created a generic validation service that can serve all of these cases. First of all, you just create a form-group like you're used to:

```typescript
this.creationForm = fb.group({
  username: '',
  email: '',
  age: '',
  interests: '',
});
```

The contents of this form are string-values, as they will be most of the time with forms. The model expects the age to be an integer and the interests to be an array, which is why you sometimes need a mapper-function too.

```typescript
formMapper(input: any) {
  // Map interests to array based on comma-delimiters
  const interests = (input.interests?.split(',') as string[])?.map(val => val.trim());
  const mapped = {
    username: input.username,
    email: input.email,
    age: Number.parseInt(input.age),
    interests,
  };
  return mapped;
}
```

This function takes in any object (the form's value) and responds with a mapped object. It is used in two places: with the validation-service and locally, with actually calling POST.

That's all you need! Now, just inject the `ValidationService` into your component, and call the following method on it:

```typescript
validation.attachToForm('user', this.creationForm, this.formMapper);
```

It attaches live backend validation using the model `user` to the form group, using the mapper we talked about earlier. It's an optional argument, just in case. Now, the form and it's controls won't be valid until they actually match up with the schema defined in the backend.

Let's look into the magic behind this. First of all, there's just a method which calls the REST endpoint for validating objects as models.

```typescript
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
```

Calling this whenever the form changed using `user` as the model and `form.value` as the value will respond with an array of errors, containing the field-name and a description each. But of course, we don't want to send out requests on every mouse-click or keystroke, which is why I came up with this way of going about it:

```typescript
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

    // "Artificial" initial call
    of(form.value)
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
```

The `.subscribe` block, which internally actually calls the backend and updates the errors as well as the error-cache only gets called once initially, and when: The form-value actually changed AND there has been a time-window of `400ms` between changes or since the last change, to kind of debounce keystrokes. Every call outside of this debounce will receive the cached list of errors.

Errors are appended to the form's control by name, so the form control names need to correspond to the model fields. The `updateErrros` routine is quite simple.

```typescript
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
```

It sets errors on the control if any are present, and just calls update otherwise. Update will re-evaluate actually attached validators, and thus remove the "artificially" added errors from this function. It's a cleaner way than just setting errors to `null`.

As you might have spot already, errors are just an array of descriptions which are appended to the error object of the control, using the key `ctorEnsure`. Those are rendered within the textbox as follows:

```html
<!-- Only render errors when control has been touched or changed -->
<!-- This helps to not overwhelm the user -->
<div
  class="errors"
  *ngIf="control.touched || control.dirty"
>
  <!-- Iterate all errors from ctorEnsure (descriptions) -->
  <p
    *ngFor="let error of control.errors?.ctorEnsure || []"
  >
    <!-- Print error description -->
    {{error}}
  </p>
</div>
```