/**
 * Сводка реакций
 */
export interface Reactions {
  dislike: number;
  heart: number;
  fire: number;
  angry: number;
  wonder: number;
  laught: number;
  sad: number;
  like: number;
}

/**
 * Счетчик реакций
 */
export interface ReactionCounter {
  type: string;
  count: number;
}
