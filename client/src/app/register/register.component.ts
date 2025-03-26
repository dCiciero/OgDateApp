import { Component, inject, OnInit, output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { AccountService } from '../_services/account.service';

import { TextInputComponent } from "../_forms/text-input/text-input.component";
import { DatePickerComponent } from '../_forms/date-picker/date-picker.component';
import { Router } from '@angular/router';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, TextInputComponent, DatePickerComponent, JsonPipe],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup = new FormGroup({});
  private accountService = inject(AccountService);
  private fb = inject(FormBuilder)
  private router = inject(Router);
  
  registerCancel = output<boolean>();
  // @Output() registerCancel = new EventEmitter();
  //@Input() usersFromHomeComponenet: any;

  validationErrors: string[] | undefined;

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.registerForm = this.fb.group({
      gender: ['male'],
      username: ['', Validators.required],
      knownAs: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]],
      confirmPassword: ['', [Validators.required, this.compareValues('password')]]
    });
    this.registerForm.controls['password'].valueChanges.subscribe({
      next: () => {
        this.registerForm.controls['confirmPassword'].updateValueAndValidity();
      }
    });
  }

  compareValues(valuesToComapre: string): ValidatorFn {
    return (control: AbstractControl) => {
      return control.value === control.parent?.get(valuesToComapre)?.value ? null : { isMatching: true };
    }
  }
  register() {
    console.log(this.registerForm.value);
    const model = this.registerForm.value;
    console.log(model);
    const dob2 = this.getDateOnly(model.dateOfBirth);
    console.log(dob2);
    model.dateOfBirth = dob2;
    console.log(model);
    const dob = this.getDateOnly(this.registerForm.get('dateOfBirth')?.value);
    console.log(dob);
    this.registerForm.patchValue({ dateOfBirth: dob });
    console.log(this.registerForm.value);
    this.accountService.register(model).subscribe({
      next: _ => this.router.navigate(['/members']),
      error: error => this.validationErrors = error
    })
  }

  cancel() {
    console.log('Cancelled');
    this.registerCancel.emit(false);
  }

  private getDateOnly(dob: string | undefined) {
    if (!dob) return;
    return new Date(dob).toISOString().slice(0, 10);   //.split('T')[0]; 
  }
}
