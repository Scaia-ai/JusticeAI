import {
  Component,
  ElementRef,
  Inject,
  Injectable,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UserLoginRequest } from 'src/app/models/user-login-request';
import { Title } from '@angular/platform-browser';
import { MessageShowService } from 'src/app/services/message-show.service';
import { InputTextModule } from 'primeng/inputtext';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    InputTextModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
  ],
  providers: [AuthenticationService, LocalStorageService, MessageShowService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass'],
})
@Injectable()
export class LoginComponent implements OnInit {
  forgotPasword: boolean = false;
  showPassword = false;
  requestEmailSentSuccessfull: boolean = false;
  loginForm: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  error: string | null | undefined;
  isLoading: boolean;
  @ViewChild('email', {}) inputEmail: ElementRef;

  constructor(
    private titleService: Title,
    private router: Router,
    @Inject(DOCUMENT) private document: any,
    private authenticationService: AuthenticationService,
    private messageService: MessageShowService
  ) {
    this.titleService.setTitle('JusticeAI - Login');
  }

  ngAfterViewInit() {
    this.document.querySelector('body').classList.add('login');
  }

  ngOnInit(): void {}

  async onSubmit(request: UserLoginRequest): Promise<void> {
    this.loginForm.markAllAsTouched();
    if (!this.loginForm.valid) {
      return;
    }
    try {
      this.isLoading = true;
      let loginSuccess = await this.authenticationService.login(request);
      if (loginSuccess) {
        this.router.navigate(['cases']);
      }
    } catch (errorResponse) {
      this.messageService.showError(errorResponse);
    } finally {
      this.isLoading = false;
    }
  }

  toggleShowPassword(show: boolean) {
    this.showPassword = show;
  }

  signUp() {
    this.router.navigate(['register']);
  }
}