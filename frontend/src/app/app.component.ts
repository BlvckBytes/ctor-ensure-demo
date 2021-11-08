import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from './model/user.model';
import { UserService } from './service/user.service';
import { ValidationService } from './service/validation.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  creationForm: FormGroup;
  users$?: Observable<User[]>;
  lang$: BehaviorSubject<string>;

  get fcUsername() {
    return this.getFC('username');
  }

  get fcEmail() {
    return this.getFC('email');
  }

  get fcAge() {
    return this.getFC('age');
  }

  get fcInterests() {
    return this.getFC('interests');
  }

  private getFC(name: string): FormControl {
    return this.creationForm.get(name) as FormControl;
  }

  constructor(
    private userService: UserService,
    validation: ValidationService,
    fb: FormBuilder,
  ) {
    this.lang$ = new BehaviorSubject('');

    // Load existing users from backend
    this.updateUsers();

    // Create form group
    this.creationForm = fb.group({
      username: '',
      email: '',
      age: '',
      interests: '',
    });

    // Attach validation for user-model using the formMapper
    validation.attachToForm('user', this.creationForm, this.formMapper, this.lang$);
  }

  // Map the form's value to the model's datastructure
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

  // Form submit routine
  userSubmit() {
    if (!this.creationForm.valid) return;
    
    // Create user from mapped form data
    this.userService.createUser(
      this.formMapper(this.creationForm.value)
    )
    // Update user list after creation
    .subscribe(() => this.updateUsers());

    // Reset form
    this.creationForm.reset();
  }

  // Fetch users from API
  private updateUsers() {
    this.users$ = this.userService.getUsers();
  }

  // Delete a user and re-fetch users
  deleteUser(user: User) {
    this.userService.deleteUser(user.id).subscribe(() => this.updateUsers());
  }
}
