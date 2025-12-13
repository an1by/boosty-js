import { Post } from './post';

/**
 * Ответ витрины
 */
export interface ShowcaseResponse {
  data: ShowcaseData;
  extra: Extra;
}

/**
 * Данные витрины
 */
export interface ShowcaseData {
  showcaseItems: ShowcaseItem[];
}

/**
 * Дополнительные данные витрины
 */
export interface Extra {
  offset: number;
  blogId: number;
  counters: Counters;
  isEnabled: boolean;
  isLast: boolean;
}

/**
 * Счетчики витрины
 */
export interface Counters {
  visibleTotal: number;
  visiblePostsCount: number;
  visibleBundlesCount: number;
}

/**
 * Элемент витрины
 */
export interface ShowcaseItem {
  showcaseItemId: number;
  itemType: string;
  isVisible: boolean;
  itemId: string;
  post: Post;
  position: number;
}
