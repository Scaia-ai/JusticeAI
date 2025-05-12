import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TableModule } from 'primeng/table';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { CaseFile } from 'src/app/models/file';
import { CommonModule } from '@angular/common';
import {
  HttpClient,
  HttpErrorResponse,
  HttpEventType,
} from '@angular/common/http';
import { Case } from 'src/app/models/case';
import { environment } from 'src/environments/environment';
import { FileService } from 'src/app/services/file.service';
import { ConfirmationService } from 'primeng/api';
import { BlockUIModule } from 'primeng/blockui';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DocumentViewerComponent } from '../document-viewer/document-viewer.component';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-case-files',
  standalone: true,
  imports: [TableModule, FileUploadModule, CommonModule,
    BlockUIModule,
    ProgressSpinnerModule,
    DialogModule,
    DocumentViewerComponent
  ],
  templateUrl: './case-files.component.html',
  styleUrl: './case-files.component.css'
})
export class CaseFilesComponent {
  fileError = false;
  selectedFile: File | null = null;
  uploadedFiles: any[] = [];
  @Input() case: Case;
  @Input() files: CaseFile[];
  @Output() viewDocumentEvent = new EventEmitter();

  @ViewChild('fileUpload') fileUpload: any;
  apiUrl = environment.baseApiUrl
  loading = false;
  spinner_message = '';

  constructor(
    private httpClient: HttpClient,
    private fileService: FileService,
    private confirmationService: ConfirmationService,
  ) {}

  onFileSelected(event: any): void {
    this.selectedFile = event.files[0];
  }
  deleteFile(fileId): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this file?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      acceptIcon: 'none',
      rejectIcon: 'none',

      accept: async () => {
        try {
            this.spinner_message = "Deleting file ...";
            this.loading = true;
            await this.fileService.deleteFile(fileId);
            await this.fileService.removeDocumentFromIndex(this.case._id, fileId);

            this.files = this.files.filter((file) => file._id !== fileId);
            this.loading = false;
        } catch (error) {
          console.error('Error deleting file:', error);
        }
        finally {
          this.loading = false;
        }
      },
      reject: () => {},
    });
  }

  viewFile(file) {
    this.viewDocumentEvent.emit(file);
  }

  uploadFile() {
    if (this.selectedFile) {
      this.spinner_message = "Uploading file ..."; 
      this.loading = true;
      this.fileError = false;
      let fileToUpload = this.selectedFile;
      let file = new CaseFile();
      file.name = fileToUpload.name;
      const formData = new FormData();
      formData.append('pdfFile', fileToUpload, fileToUpload.name);
      formData.append('name', fileToUpload.name);
      formData.append('case', this.case._id);
      this.httpClient
      .post(this.apiUrl + '/api/file/create', formData, {
        reportProgress: true,
        observe: 'events',
      })
      .subscribe({
        next: async (event) => {
          if (event.type === HttpEventType.Response) {
            console.log('Completed');
            this.selectedFile = null;
            this.uploadedFiles = [];
            this.fileUpload.clear();
            file._id = event.body["data"].toString();
            file = await this.fileService.getFileById(file._id);
            if(!this.files)
              this.files = [];
            this.files.push(file);
            this.loading = false;
          }
        },
        error: (err: HttpErrorResponse) => console.log(err),
      });    
    } else {
      console.log('No file selected');
      this.fileError = true;
    }
   
  };

}
