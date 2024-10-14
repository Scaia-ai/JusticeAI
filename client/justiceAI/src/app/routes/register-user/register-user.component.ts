import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { RegistrationUser } from 'src/app/models/registration-user';
import { MessageShowService } from 'src/app/services/message-show.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-register-user',
  standalone: true,
  imports: [
    InputTextModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputMaskModule,
    CommonModule,
  ],
  providers: [UserService, MessageShowService],
  templateUrl: './register-user.component.html',
  styleUrl: './register-user.component.css',
})
export class RegisterUserComponent {
  user: RegistrationUser;
  registerForm: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required]),
    email: new FormControl('', [
      Validators.required,
      Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'),
    ]),
    firstName: new FormControl('', [Validators.required]),
    phoneNumber: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    password: new FormControl('', [
      Validators.required,
      Validators.pattern(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/
      ),
      Validators.minLength(8),
    ]),
    confirmPassword: new FormControl('', [Validators.required]),
    registrationType: new FormControl('0', [Validators.required]),
  });

  constructor(
    private router: Router,
    private messageService: MessageShowService,
    private userService: UserService,
    @Inject(DOCUMENT) private document: any,

  ) {}

  ngAfterViewInit() {
    this.document.querySelector('body').classList.add('register');
  }
  async onSubmit(user: RegistrationUser): Promise<void> {
    this.registerForm.markAllAsTouched();
    if (!this.registerForm.valid) {
      return;
    }

    try {
      this.user = await this.userService.register(user);
      this.messageService.showSuccess('User registered succesfully!');
      setTimeout(() => {
        this.router.navigate(['login']);
      }, 2000);
    } catch (errorResponse) {
      this.messageService.showError(errorResponse);
    } finally {
    }
  }

  cancel() {
    this.router.navigate(['login']);
  }
}
