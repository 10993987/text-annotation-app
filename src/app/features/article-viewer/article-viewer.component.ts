import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService } from '../../core/services/article.service';
import { AnnotationService } from '../../core/services/annotation.service';
import { Article } from '../../core/models/article.model';
import { Annotation } from '../../core/models/annotation.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-article-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="viewer-container">
      <div class="viewer-header">
        <button class="btn-back" (click)="goBack()">← Назад</button>
        <h1>{{ article?.title }}</h1>
        <button class="btn-edit" (click)="editArticle()">Редактировать</button>
      </div>

      <div class="content-wrapper">
        <div 
          #contentContainer
          class="article-content"
          [innerHTML]="highlightedContent"
          (mouseup)="onTextSelect($event)"
        ></div>
      </div>

      <div *ngIf="showAnnotationModal" class="modal-overlay" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h3>Добавить аннотацию</h3>
          <div class="selected-text">
            <strong>Выделенный текст:</strong>
            <p>{{ selectedText }}</p>
          </div>
          <div class="form-group">
            <label>Цвет подчеркивания:</label>
            <div class="color-options">
              <button 
                *ngFor="let color of colors"
                class="color-option"
                [style.backgroundColor]="color"
                [class.selected]="selectedColor === color"
                (click)="selectedColor = color"
              ></button>
            </div>
          </div>
          <div class="form-group">
            <label>Примечание:</label>
            <textarea 
              [(ngModel)]="annotationNote"
              placeholder="Введите ваше примечание..."
              rows="4"
            ></textarea>
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" (click)="closeModal()">Отмена</button>
            <button class="btn-primary" (click)="saveAnnotation()">Сохранить</button>
          </div>
        </div>
      </div>

      <div *ngIf="showTooltip" class="annotation-tooltip" [style.top.px]="tooltipPosition.y" [style.left.px]="tooltipPosition.x">
        <div class="tooltip-content">
          <strong>Примечание:</strong>
          <p>{{ currentTooltipNote }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .viewer-container {
      max-width: 900px;
      margin: 0 auto;
    }

    .viewer-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .viewer-header h1 {
      flex: 1;
      margin: 0;
      color: #333;
    }

    .btn-back, .btn-edit {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .btn-back {
      background: #6c757d;
      color: white;
    }

    .btn-edit {
      background: #007bff;
      color: white;
    }

    .content-wrapper {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .article-content {
      line-height: 1.8;
      font-size: 1.1rem;
      color: #333;
      user-select: text;
    }

    .article-content ::ng-deep mark {
      background: transparent;
      text-decoration: underline;
      text-decoration-thickness: 3px;
      cursor: pointer;
      position: relative;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      min-width: 400px;
      max-width: 500px;
    }

    .selected-text {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 4px;
      margin: 1rem 0;
    }

    .selected-text p {
      margin: 0.5rem 0 0 0;
      color: #666;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: bold;
    }

    .color-options {
      display: flex;
      gap: 0.5rem;
    }

    .color-option {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.2s;
    }

    .color-option.selected {
      border-color: #333;
      transform: scale(1.1);
    }

    textarea {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      resize: vertical;
    }

    .modal-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
      margin-top: 1rem;
    }

    .annotation-tooltip {
      position: fixed;
      background: #333;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-size: 0.9rem;
      max-width: 300px;
      z-index: 1001;
      pointer-events: none;
      animation: fadeIn 0.2s;
    }

    .tooltip-content p {
      margin: 0.5rem 0 0 0;
      font-size: 0.85rem;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-5px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }
  `]
})
export class ArticleViewerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('contentContainer') contentContainer!: ElementRef;
  
  article: Article | null = null;
  annotations: Annotation[] = [];
  highlightedContent = '';
  
  showAnnotationModal = false;
  selectedText = '';
  selectedRange: Range | null = null;
  selectedColor = '#ffeb3b';
  annotationNote = '';
  
  showTooltip = false;
  tooltipPosition = { x: 0, y: 0 };
  currentTooltipNote = '';
  
  colors = ['#ffeb3b', '#ff9800', '#f44336', '#4caf50', '#2196f3', '#9c27b0'];
  
  private subscriptions: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private articleService: ArticleService,
    private annotationService: AnnotationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadArticle(id);
      this.loadAnnotations(id);
    }
  }

  ngAfterViewInit(): void {
    this.setupTooltipListeners();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadArticle(id: string): void {
    this.articleService.getArticleById(id).subscribe(article => {
      if (article) {
        this.article = article;
        this.updateHighlightedContent();
      } else {
        this.goBack();
      }
    });
  }

  private loadAnnotations(articleId: string): void {
    this.annotationService.getAnnotationsByArticle(articleId).subscribe(annotations => {
      this.annotations = annotations;
      this.updateHighlightedContent();
    });
  }

  private updateHighlightedContent(): void {
    if (!this.article) return;
    
    let content = this.escapeHtml(this.article.content);
    const sortedAnnotations = [...this.annotations].sort((a, b) => b.startOffset - a.startOffset);
    
    for (const annotation of sortedAnnotations) {
      const before = content.substring(0, annotation.startOffset);
      const selected = content.substring(annotation.startOffset, annotation.endOffset);
      const after = content.substring(annotation.endOffset);
      
      content = `${before}<mark data-annotation-id="${annotation.id}" style="text-decoration-color: ${annotation.color}">${selected}</mark>${after}`;
    }
    
    this.highlightedContent = content;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  onTextSelect(event: MouseEvent): void {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    
    const selectedText = selection.toString().trim();
    if (selectedText.length === 0) return;
    
    const range = selection.getRangeAt(0);
    const containerElement = this.contentContainer.nativeElement;
    
    if (containerElement.contains(range.commonAncestorContainer)) {
      this.selectedText = selectedText;
      this.selectedRange = range.cloneRange();
      this.showAnnotationModal = true;
    }
  }

  saveAnnotation(): void {
    if (!this.selectedRange || !this.article) return;
    
    const startOffset = this.getTextOffset(this.selectedRange.startContainer, this.selectedRange.startOffset);
    const endOffset = this.getTextOffset(this.selectedRange.endContainer, this.selectedRange.endOffset);
    
    const annotation = {
      articleId: this.article.id,
      startOffset,
      endOffset,
      text: this.selectedText,
      color: this.selectedColor,
      note: this.annotationNote
    };
    
    this.annotationService.addAnnotation(annotation).subscribe(() => {
      if (this.article) {
        this.loadAnnotations(this.article.id);
      }
      this.closeModal();
    });
  }

  private getTextOffset(node: Node, offset: number): number {
    let position = 0;
    const walker = document.createTreeWalker(
      this.contentContainer.nativeElement,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let currentNode;
    while ((currentNode = walker.nextNode())) {
      if (currentNode === node) {
        return position + offset;
      }
      position += currentNode.textContent?.length || 0;
    }
    
    return position;
  }

  private setupTooltipListeners(): void {
    const container = this.contentContainer.nativeElement;
    
    container.addEventListener('mouseover', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'MARK') {
        const annotationId = target.getAttribute('data-annotation-id');
        const annotation = this.annotations.find(a => a.id === annotationId);
        
        if (annotation) {
          this.currentTooltipNote = annotation.note;
          this.tooltipPosition = { x: event.clientX + 10, y: event.clientY + 10 };
          this.showTooltip = true;
        }
      }
    });
    
    container.addEventListener('mouseout', () => {
      this.showTooltip = false;
    });
  }

  closeModal(): void {
    this.showAnnotationModal = false;
    this.selectedText = '';
    this.selectedRange = null;
    this.annotationNote = '';
    this.selectedColor = '#ffeb3b';
    window.getSelection()?.removeAllRanges();
  }

  editArticle(): void {
    if (this.article) {
      this.router.navigate(['/editor', this.article.id]);
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}