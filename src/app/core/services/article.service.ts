import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Article } from '../models/article.model';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private readonly STORAGE_KEY = 'articles';
  private articlesSubject = new BehaviorSubject<Article[]>([]);

  constructor() {
    this.loadArticles();
  }

  private loadArticles(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    const articles = stored ? JSON.parse(stored) : [];
    this.articlesSubject.next(articles);
  }

  private saveArticles(articles: Article[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(articles));
    this.articlesSubject.next(articles);
  }

  getArticles(): Observable<Article[]> {
    return this.articlesSubject.asObservable();
  }

  getArticleById(id: string): Observable<Article | null> {
    return this.articlesSubject.pipe(
      map(articles => articles.find(a => a.id === id) || null)
    );
  }

  createArticle(article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Observable<Article> {
    const newArticle: Article = {
      ...article,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const current = this.articlesSubject.value;
    this.saveArticles([...current, newArticle]);
    return of(newArticle);
  }

  updateArticle(id: string, updates: Partial<Article>): Observable<Article | null> {
    const current = this.articlesSubject.value;
    const index = current.findIndex(a => a.id === id);
    if (index === -1) return of(null);
    
    const updated = {
      ...current[index],
      ...updates,
      updatedAt: new Date()
    };
    current[index] = updated;
    this.saveArticles([...current]);
    return of(updated);
  }

  deleteArticle(id: string): Observable<boolean> {
    const current = this.articlesSubject.value;
    this.saveArticles(current.filter(a => a.id !== id));
    return of(true);
  }
}