import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Case } from '../models/case';
import { environment } from '../../environments/environment';

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

 
}
