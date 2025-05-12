import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { CaseFile } from 'src/app/models/file';
import { FileService } from 'src/app/services/file.service';

@Component({
  selector: 'app-document-viewer',
  standalone: true,
  imports: [NgxExtendedPdfViewerModule],
  templateUrl: './document-viewer.component.html',
  styleUrl: './document-viewer.component.css'
})
export class DocumentViewerComponent {
  @Input() caseFile: CaseFile;
  pdfUrl: string;
  public formattedJsonHtml: string = '';
  public entities: any;
  public narrative: string = '';
 constructor(
    private fileService: FileService,
  ) {}

 ngOnChanges(changes: SimpleChanges): void {
    // Check if `order` has changed and has a value
    if (changes['caseFile'] && this.caseFile && (this.caseFile._id !== changes['caseFile'].previousValue?._id)) {
      this.loadPdf();
    }  
  }

async loadPdf() {
  this.pdfUrl = null;
  try {
    const pdfBlob = await this.fileService.getPdf(this.caseFile._id).toPromise();
    const blobUrl = URL.createObjectURL(pdfBlob);
    this.pdfUrl = blobUrl;
    this.parseRawText();
  } catch (error) {
    console.error("Failed to load PDF:", error);
  }
}

generateFormattedHtml(obj: any): string {
  if (typeof obj !== 'object' || obj === null) {
    return `<i>${obj}</i>`;
  }

  if (Array.isArray(obj)) {
    return `<ul>${obj.map(item => `<li>${this.generateFormattedHtml(item)}</li>`).join('')}</ul>`;
  }

  return `<ul>${Object.entries(obj).map(
    ([key, value]) =>
      `<li><strong>${key}:</strong> ${this.generateFormattedHtml(value)}</li>`
  ).join('')}</ul>`;
}

parseRawText(): void {
  const jsonMatch = this.caseFile.extractedEntities.match(/```json\s+([\s\S]+?)\s+```/);
  const narrativeMatch = this.caseFile.extractedEntities.match(/Redacted Narrative:\s*(.+)/s);

  if (jsonMatch) {
    try {
      this.entities = JSON.parse(jsonMatch[1]);
      this.formattedJsonHtml = this.generateFormattedHtml(this.entities);
    } catch (e) {
      console.error('Invalid JSON:', e);
      this.entities = {};
    }
  }

  this.narrative = narrativeMatch ? narrativeMatch[1].trim() : '';
}

  prettyJson(json: any): string {
    return JSON.stringify(json, null, 2);
  }

}


