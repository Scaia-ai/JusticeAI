import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { MessageShowService } from 'src/app/services/message-show.service';
import { CreateCaseComponent } from '../create-case/create-case.component';
import { CaseService } from 'src/app/services/case.service';
import { Case } from 'src/app/models/case';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { BlockUIModule } from 'primeng/blockui';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PanelModule } from 'primeng/panel';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Router } from '@angular/router';
import { CaseFilesComponent } from '../case-files/case-files.component';
import { FileService } from 'src/app/services/file.service';
import { CaseFile } from 'src/app/models/file';
import { CaseChatComponent } from '../case-chat/case-chat.component';

@Component({
  selector: 'app-case-list',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    DialogModule,
    CreateCaseComponent,
    ConfirmDialogModule,
    CaseFilesComponent,
    BlockUIModule,
    ProgressSpinnerModule,
    CaseChatComponent,
    PanelModule,
  ],
  providers: [
    MessageShowService,
    CaseService,
    ConfirmationService,
    AuthenticationService,
  ],
  templateUrl: './case-list.component.html',
  styleUrl: './case-list.component.css',
})
export class CaseListComponent implements OnInit {
  visible: boolean = false;
  visible_files: boolean = false;
  visible_chat: boolean =false;
  loading = false;
  cases: Case[] = [];
  caseFiles: CaseFile[] = [];
  selectedCase: Case;
  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageShowService,
    private router: Router,
    private caseService: CaseService,
    private fileService: FileService,
    private authenticationService: AuthenticationService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadCases();
  }

  async loadCases() {
    try {
      this.cases = await this.caseService.getCases();
    } catch (errorResponse) {
      this.messageService.showError(errorResponse);
    }
  }

  openCaseChat(_case): void {
    this.selectedCase = _case;
    this.visible_chat = true;
  }

  createCase(): void {
    this.visible = true;
  }

  async saveCase(_case) {
    try {
      this.visible = false;
      this.loading = true;
      var id = await this.caseService.createCase(_case);
      _case._id = id;
      this.cases.push(_case);
      this.messageService.showSuccess('Case created succesfully');
    } catch (error) {
      this.messageService.showError(error);
    } finally {
      this.loading = false;
    }
  }

  deleteCase(caseId): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this case?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      acceptIcon: 'none',
      rejectIcon: 'none',

      accept: async () => {
        await this.caseService.deleteCase(caseId);
        await this.caseService.removeCaseFromIndex(caseId);
        this.cases = this.cases.filter((_case) => _case._id !== caseId);
      },
      reject: () => {},
    });
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['login']);
  }

  async loadFiles(caseId) : Promise<CaseFile[]> {
    try {
      return await this.fileService.getFilesByCase(caseId);
    } catch (errorResponse) {
      this.messageService.showError(errorResponse);
    }
    return null;
  }

  async openCaseFiles(_case) 
  {
    this.caseFiles = await this.loadFiles(_case._id);
    this.selectedCase = _case;
    this.visible_files = true;
  }
}
