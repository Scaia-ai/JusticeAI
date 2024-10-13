import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Error } from '../models/error';
import { MessageService } from 'primeng/api';

@Injectable()
export class MessageShowService {
  constructor(private messageService: MessageService) {}

  showError(errorResponse: any): void {
    if (Array.isArray(errorResponse.error) && errorResponse?.error?.length) {
      errorResponse.error.forEach((error: Error) => {
        if (error && !error.message && error['Message']) {
          error.message = error['Message'];
        }
        if (
          error?.message?.indexOf('Your authentication token has expired') == -1
        ) {
          this.messageService.add({
            severity: 'error',
            summary: error.message,
            detail: '',
            key: 'bl',
            life: 3000,
          });
        }
      });
    } else if (!errorResponse.ignoreMessage) {
      if (!environment.production) {
        console.log(errorResponse);
      }

      this.messageService.add({
        severity: 'error',
        summary:
          `Error loading. ` +
          (errorResponse.message ? errorResponse.message : errorResponse),
        detail: '',
        key: 'bl',
        life: 3000,
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: errorResponse,
        detail: '',
        key: 'bl',
        life: 3000,
      });
    }
  }

  showErrorMessage(errorMessage: any): void {
    this.messageService.add({
      severity: 'error',
      summary: errorMessage,
      detail: '',
      key: 'bl',
      life: 3000,
    });
  }

  showWarning(errorResponse: any): void {
    if (errorResponse.error.length) {
      errorResponse.error.forEach((error: Error) => {
        this.messageService.add({
          severity: 'warn',
          summary: error.message,
          detail: '',
          key: 'bl',
          life: 3000,
        });
      });
    }
  }

  showSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: message,
      detail: '',
      key: 'bl',
      life: 3000,
    });
  }

  showInfo(message: string): void {
    this.messageService.add({
      severity: 'info',
      summary: message,
      detail: '',
      key: 'bl',
      life: 3000,
    });
  }
}
