import {
  Component,
  ElementRef,
  Input,
  QueryList,
  ViewChildren,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { CommonModule } from '@angular/common';
import { Chat } from 'src/app/models/chat';
import { CaseService } from 'src/app/services/case.service';
import { MessageShowService } from 'src/app/services/message-show.service';
import { Case } from 'src/app/models/case';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-case-chat',
  standalone: true,

  imports: [
    InputTextModule,
    PanelModule,
    ButtonModule,
    FormsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [MessageShowService, CaseService],
  templateUrl: './case-chat.component.html',
  styleUrl: './case-chat.component.css',
})
export class CaseChatComponent {
  justiceAIForm: FormGroup = new FormGroup({
    question: new FormControl(''),
  });
  caseId: string;
  @Input() case: Case;

  isLoading: boolean;
  userMessage: String;
  @ViewChildren('questionInput') questionInput: QueryList<ElementRef>;

  constructor(private caseService: CaseService) {}
  async onSubmit(): Promise<void> {
    var questionText = this.justiceAIForm.controls['question'].value;
    if (questionText.trim() == '') {
      return;
    }
    if(!this.case.chat)
      this.case.chat = [];
    this.isLoading = true;
    this.justiceAIForm.controls['question'].disable();
    try {
      let chatHistory = [];
      for (let i = 0; i < this.case.chat.length; i += 2) {
        chatHistory.push([
          this.case.chat[i].text,
          this.case.chat[i + 1].text,
        ]);
      }
      var question = new Chat();
      question.isQuestion = true;
      question.text = questionText;
      this.case.chat.push(question);
      this.justiceAIForm.controls['question'].setValue('');
      var answer = new Chat();
      answer.isQuestion = false;
      answer.text = ' ... ';
      this.case.chat.push(answer);
      var answerResult = await this.caseService.getAnswer(
        questionText,
        chatHistory,
        this.case._id
      );
      answer.text = answerResult.text;
    } catch (errorResponse) {
    } finally {
      this.isLoading = false;
      this.justiceAIForm.controls['question'].enable();
    }
  }
}
