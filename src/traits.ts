import { ContentItem } from './media-content';
import { Post, Comment } from './model';

/**
 * Общий трейт для сущностей с контентом
 */
export interface HasContent {
  extractContent(): ContentItem[];
}

/**
 * Общий трейт для сущностей с заголовком
 */
export interface HasTitle {
  safeTitle(): string;
}

/**
 * Общий трейт для сущностей с доступностью
 */
export interface IsAvailable {
  notAvailable(): boolean;
}

/**
 * Реализация IsAvailable для Post
 */
export function postNotAvailable(post: Post): boolean {
  return !post.has_access || post.data.length === 0;
}

/**
 * Реализация HasTitle для Post
 */
export function postSafeTitle(post: Post): string {
  if (!post.title || post.title.trim() === '') {
    return `untitled_${post.id}`;
  }
  return post.title;
}

/**
 * Реализация IsAvailable для Comment
 */
export function commentNotAvailable(comment: Comment): boolean {
  return comment.data.length === 0;
}
