import { Flags } from './post';

/**
 * Представляет пользователя или автора поста
 */
export interface User {
  blog_url: string;
  avatar_url: string;
  name: string;
  has_avatar: boolean;
  id: number;
  flags: Flags;
}
