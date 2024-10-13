import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { Case } from 'src/app/models/case';
import { MessageShowService } from 'src/app/services/message-show.service';

@Component({
  selector: 'app-create-case',
  standalone: true,
  imports: [
    InputTextModule,
    ReactiveFormsModule,
    ButtonModule,
    CommonModule,
    DropdownModule,
    FloatLabelModule,
  ],
  providers: [MessageShowService],
  templateUrl: './create-case.component.html',
  styleUrl: './create-case.component.css',
})
export class CreateCaseComponent {
  @Output() createEvent = new EventEmitter();
  fileError = false;
  selectedFile: File | null = null;
  uploadedFiles: any[] = [];
  order: any;
  caseForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    number: new FormControl('', [Validators.required]),
  });
  constructor(
  ) {}

  onFileSelected(event: any): void {
    this.selectedFile = event.files[0];
  }

  onSubmit(_case: Case): void {
    this.caseForm.markAllAsTouched();
    if (!this.caseForm.valid) {
      return;
    }
   this.createCase(_case);
  }

  async createCase(case_par: any) {
    let _case = new Case();
    _case.name = case_par.name;
    _case.number = case_par.number;

    this.caseForm.controls['name'].setValue('');
    this.caseForm.controls['number'].setValue('');
    this.createEvent.emit(_case);
  }

}
