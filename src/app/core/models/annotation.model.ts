export interface Annotation {
    id: string;
    articleId: string;
    startOffset: number;
    endOffset: number;
    text: string;
    color: string;
    note: string;
    createdAt: Date;
}