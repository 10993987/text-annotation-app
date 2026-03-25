import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Annotation } from '../models/annotation.model';

@Injectable({
  providedIn: 'root'
})
export class AnnotationService {
  private readonly STORAGE_KEY = 'annotations';
  private annotationsSubject = new BehaviorSubject<Annotation[]>([]);

  constructor() {
    this.loadAnnotations();
  }

  private loadAnnotations(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    const annotations = stored ? JSON.parse(stored) : [];
    this.annotationsSubject.next(annotations);
  }

  private saveAnnotations(annotations: Annotation[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(annotations));
    this.annotationsSubject.next(annotations);
  }

  getAnnotationsByArticle(articleId: string): Observable<Annotation[]> {
    return new Observable(subscriber => {
      this.annotationsSubject.subscribe(annotations => {
        subscriber.next(annotations.filter(a => a.articleId === articleId));
      });
    });
  }

  addAnnotation(annotation: Omit<Annotation, 'id' | 'createdAt'>): Observable<Annotation> {
    const newAnnotation: Annotation = {
      ...annotation,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };
    const current = this.annotationsSubject.value;
    this.saveAnnotations([...current, newAnnotation]);
    return new Observable(subscriber => subscriber.next(newAnnotation));
  }

  updateAnnotation(id: string, updates: Partial<Annotation>): Observable<Annotation | null> {
    const current = this.annotationsSubject.value;
    const index = current.findIndex(a => a.id === id);
    if (index === -1) return new Observable(subscriber => subscriber.next(null));
    
    const updated = { ...current[index], ...updates };
    current[index] = updated;
    this.saveAnnotations([...current]);
    return new Observable(subscriber => subscriber.next(updated));
  }

  deleteAnnotation(id: string): Observable<boolean> {
    const current = this.annotationsSubject.value;
    this.saveAnnotations(current.filter(a => a.id !== id));
    return new Observable(subscriber => subscriber.next(true));
  }

  deleteAnnotationsByArticle(articleId: string): Observable<boolean> {
    const current = this.annotationsSubject.value;
    this.saveAnnotations(current.filter(a => a.articleId !== articleId));
    return new Observable(subscriber => subscriber.next(true));
  }
}
