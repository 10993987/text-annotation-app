import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ArticleService } from '../../core/services/article.service';
import { Observable } from 'rxjs';
import { Article } from '../../core/models/article.model';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="article-list-container">
      <div class="header">
        <h1>Мои статьи</h1>
        <button class="btn-primary" (click)="createNewArticle()">
          + Создать статью
        </button>
      </div>

      <div class="articles-grid">
        <div *ngIf="(articles$ | async)?.length === 0" class="empty-state">
          <p>У вас пока нет статей. Создайте первую!</p>
        </div>

        <div *ngFor="let article of articles$ | async" class="article-card">
          <h3>{{ article.title }}</h3>
          <div class="article-meta">
            <span>Создана: {{ article.createdAt | date:'dd.MM.yyyy' }}</span>
            <span>Обновлена: {{ article.updatedAt | date:'dd.MM.yyyy' }}</span>
          </div>
          <div class="article-preview">
            {{ article.content.substring(0, 150) }}{{ article.content.length > 150 ? '...' : '' }}
          </div>
          <div class="card-actions">
            <button class="btn-secondary" (click)="viewArticle(article.id)">Просмотр</button>
            <button class="btn-primary" (click)="editArticle(article.id)">Редактировать</button>
            <button class="btn-danger" (click)="deleteArticle(article.id)">Удалить</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .article-list-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    h1 {
      margin: 0;
      color: #333;
    }

    .articles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .article-card {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .article-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .article-card h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .article-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.85rem;
      color: #666;
      margin-bottom: 1rem;
    }

    .article-preview {
      color: #555;
      line-height: 1.5;
      margin-bottom: 1rem;
      min-height: 60px;
    }

    .card-actions {
      display: flex;
      gap: 0.5rem;
    }

    button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover {
      background: #0056b3;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #545b62;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn-danger:hover {
      background: #c82333;
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 3rem;
      background: #f8f9fa;
      border-radius: 8px;
      color: #666;
    }
  `]
})
export class ArticleListComponent implements OnInit {
  articles$: Observable<Article[]> | undefined;

  constructor(
    private articleService: ArticleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.articles$ = this.articleService.getArticles();
  }

  createNewArticle(): void {
    this.router.navigate(['/editor', 'new']);
  }

  viewArticle(id: string): void {
    this.router.navigate(['/viewer', id]);
  }

  editArticle(id: string): void {
    this.router.navigate(['/editor', id]);
  }

  deleteArticle(id: string): void {
    if (confirm('Вы уверены, что хотите удалить эту статью?')) {
      this.articleService.deleteArticle(id).subscribe();
    }
  }
}