import { Component, inject, input, output, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private accountService = inject(AccountService);
  // usersFromHomeComponent = input.required<any>();
  registerCancel = output<boolean>();
  // @Output() registerCancel = new EventEmitter();
  //@Input() usersFromHomeComponenet: any;
  model: any = {};

  register() {
    this.accountService.register(this.model).subscribe(
      (response: any) => {
        console.log(response);
        this.cancel();
      },
      (error: any) => {
        console.log(error);
      },
      () => {
        console.log('Complete');
      }
    )
  }

  cancel() {
    console.log('Cancelled');
    this.registerCancel.emit(false);
  }
}
