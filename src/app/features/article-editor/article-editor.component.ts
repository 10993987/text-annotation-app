import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService } from '../../core/services/article.service';

@Component({
  selector: 'app-article-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="editor-container">
      <div class="editor-header">
        <button class="btn-back" (click)="goBack()">← Назад</button>
        <h1>{{ isNew ? 'Создание статьи' : 'Редактирование статьи' }}</h1>
        <button class="btn-save" (click)="saveArticle()" [disabled]="!title || !content">
          Сохранить
        </button>
      </div>

      <div class="editor-content">
        <div class="form-group">
          <label for="title">Название статьи</label>
          <input
            id="title"
            type="text"
            [(ngModel)]="title"
            placeholder="Введите название статьи..."
            class="title-input"
          />
        </div>

        <div class="form-group">
          <label for="content">Содержание</label>
          <textarea
            id="content"
            [(ngModel)]="content"
            placeholder="Введите текст статьи..."
            rows="15"
            class="content-textarea"
          ></textarea>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .editor-container {
      max-width: 900px;
      margin: 0 auto;
    }

    .editor-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .editor-header h1 {
      flex: 1;
      margin: 0;
      color: #333;
    }

    .btn-back, .btn-save {
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

    .btn-save {
      background: #28a745;
      color: white;
    }

    .btn-save:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .editor-content {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: bold;
      color: #333;
    }

    .title-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    .content-textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      font-family: inherit;
      resize: vertical;
    }
  `]
})
export class ArticleEditorComponent implements OnInit {
  isNew = true;
  articleId: string | null = null;
  title = '';
  content = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private articleService: ArticleService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isNew = false;
      this.articleId = id;
      this.loadArticle(id);
    }
  }

  private loadArticle(id: string): void {
    this.articleService.getArticleById(id).subscribe(article => {
      if (article) {
        this.title = article.title;
        this.content = article.content;
      } else {
        this.goBack();
      }
    });
  }

  saveArticle(): void {
    if (!this.title || !this.content) return;

    if (this.isNew) {
      this.articleService.createArticle({ title: this.title, content: this.content }).subscribe(article => {
        this.router.navigate(['/viewer', article.id]);
      });
    } else if (this.articleId) {
      this.articleService.updateArticle(this.articleId, {
        title: this.title,
        content: this.content
      }).subscribe(() => {
        this.router.navigate(['/viewer', this.articleId]);
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}