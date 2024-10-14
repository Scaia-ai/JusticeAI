import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Case } from '../models/case';
import { environment } from '../../environments/environment';
import { Chat } from '../models/chat';
import { CaseQuestion } from '../models/case-question';

@Injectable()
export class CaseService {
  apiUrl = environment.baseApiUrl

  constructor(private httpClient: HttpClient) {}

  async getCases(): Promise<Case[]> {
    const res: any = await firstValueFrom(
      this.httpClient.get<Case[]>(this.apiUrl + '/api/case/getAll')
    );
    return res.data;
  }

  async createCase(_case: Case): Promise<string> {
    const res: any = await firstValueFrom(
      this.httpClient.post<string>(this.apiUrl  + '/api/case/create', _case)
    );
    return res.data;
  }

  async deleteCase(caseId: string): Promise<void> {
    await firstValueFrom(this.httpClient.delete(this.apiUrl + '/api/case/delete/' + caseId));
  }

  async getAnswer(
    question: string,
    chatHistory: [][],
    caseId: string
  ): Promise<Chat> {
    let caseQuestion = new CaseQuestion(); 
    caseQuestion.question = question;
    caseQuestion.caseId = caseId;
    caseQuestion.chatHistory = chatHistory;
    const answerResult = await firstValueFrom(
      this.httpClient.post<object>(this.apiUrl + '/api/justiceai/getAnswer', caseQuestion)
    );
    var answer = new Chat();
    answer.isQuestion = false;
    answer.text = answerResult['data']['answer'];
    answer.sources = answerResult['data']['sources'];
    return answer;
  }


  async removeCaseFromIndex(
    caseId: string
  ) {
    await firstValueFrom(
      this.httpClient.post<object>(this.apiUrl + '/api/justiceai/cleanIndexByCase', {
        caseId: caseId
      })
    );
  }
}
