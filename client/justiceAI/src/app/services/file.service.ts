import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { Case } from '../models/case';
import { environment } from '../../environments/environment';
import { setParams } from '../utilities/helper-functions';
import { CaseFile } from '../models/file';

@Injectable()
export class FileService {
  apiUrl = environment.baseApiUrl

  constructor(private httpClient: HttpClient) {}

  async getFilesByCase(caseId: string): Promise<CaseFile[]> {
    let params = new HttpParams();
    params = setParams(params, 'case', caseId);
    const res: any = await firstValueFrom(
      this.httpClient.get<Case[]>(this.apiUrl + '/api/file/getAll', { params })
    );
    return res.data;
  }

  async deleteFile(fileId: string): Promise<void> {
    await firstValueFrom(this.httpClient.delete(this.apiUrl + '/api/file/delete/' + fileId));
  }

  getPdf(fileId: string): Observable<Blob> {
    return this.httpClient.get(this.apiUrl + `/api/file/${fileId}/pdf`, {
      responseType: 'blob' 
    });
  }

  async getFileById(fileId: string): Promise<CaseFile> {
    const res: any = await firstValueFrom(
          this.httpClient.get<CaseFile>(this.apiUrl + `/api/file/${fileId}`)
       );
    return res.data;

  }

  async removeDocumentFromIndex(
    caseId: string,
    fileId: string
  ) {
 
    await firstValueFrom(
      this.httpClient.post<object>(this.apiUrl + '/api/justiceai/removeDocumentFromIndex', {
        caseId: caseId,
        documentId: fileId
      })
    );
  }
}
