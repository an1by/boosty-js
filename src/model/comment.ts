import { MediaData, ReactionCounter, Reactions } from './index';

/**
 * Ответ комментариев
 */
export interface CommentsResponse {
  data: Comment[];
  extra: Extra;
}

/**
 * Контейнер дополнительных флагов
 */
export interface Extra {
  isFirst: boolean;
  isLast: boolean;
}

/**
 * Один комментарий
 */
export interface Comment {
  id: string;
  intId: number;
  post: PostRef;
  author: Author;
  createdAt: number;
  updatedAt?: number | null;
  isDeleted: boolean;
  isBlocked: boolean;
  isUpdated: boolean;
  replyCount: number;
  replies?: Replies | null;
  data: MediaData[];
  reactions: Reactions;
  reactionCounters: ReactionCounter[];
  parentId?: number | null;
  replyId?: number | null;
  replyToUser?: Author | null;
}

/**
 * Ссылка на пост
 */
export interface PostRef {
  id: string;
}

/**
 * Автор комментария
 */
export interface Author {
  id: number;
  name: string;
  hasAvatar: boolean;
  avatarUrl: string;
}

/**
 * Ответы на комментарий
 */
export interface Replies {
  data: Comment[];
  extra: Extra;
}

/**
 * Блок комментария
 */
export type CommentBlock =
  | { type: 'text'; content: string; modificator?: string }
  | { type: 'smile'; name: string };

/**
 * Создать текстовый блок комментария
 */
export function createTextBlock(text: string): CommentBlock {
  return {
    type: 'text',
    content: JSON.stringify([text, 'unstyled', []]),
    modificator: '',
  };
}

/**
 * Создать блок окончания текста
 */
export function createTextEndBlock(): CommentBlock {
  return {
    type: 'text',
    content: '',
    modificator: 'BLOCK_END',
  };
}

/**
 * Создать блок смайла
 */
export function createSmileBlock(name: string): CommentBlock {
  return {
    type: 'smile',
    name,
  };
}

