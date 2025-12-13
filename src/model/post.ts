import { User, Reactions, Tag } from './index';

/**
 * Ответ API, содержащий список постов
 */
export interface PostsResponse {
  data: Post[];
  extra: Extra;
}

/**
 * Дополнительные данные (offset, is_last)
 */
export interface Extra {
  offset: string;
  is_last: boolean;
}

/**
 * Представляет один пост, полученный из Boosty API
 */
export interface Post {
  user: User;
  is_pinned: boolean;
  is_blocked: boolean;
  has_access: boolean;
  data: MediaData[];
  is_record: boolean;
  content_counters: ContentCounter[];
  donators: Donators;
  show_views_counter: boolean;
  created_at: number;
  is_published: boolean;
  is_liked: boolean;
  tags: Tag[];
  is_comments_denied: boolean;
  count: Count;
  publish_time: number;
  title: string;
  sort_order: number;
  price: number;
  id: string;
  comments: Comments;
  donations: number;
  teaser: MediaData[];
  is_waiting_video: boolean;
  int_id: number;
  is_deleted: boolean;
  updated_at: number;
  signed_query: string;
  advertiser_info?: unknown;
  currency_prices: CurrencyPrices;
  is_showcase_visible: boolean;
}

/**
 * Флаги пользователя
 */
export interface Flags {
  show_post_donations: boolean;
}

/**
 * Данные видео медиа
 */
export interface VideoData {
  url: string;
}

/**
 * Видео, размещенное на платформе OK.ru
 */
export interface OkVideoData {
  upload_status?: string | null;
  width: number;
  status: string;
  title: string;
  url: string;
  preview_id?: string | null;
  player_urls: PlayerUrl[];
  id: string;
  vid: string;
  preview: string;
  height: number;
  time_code: number;
  show_views_counter: boolean;
  duration: number;
  complete: boolean;
  views_counter: number;
  default_preview: string;
  failover_host: string;
}

/**
 * Данные аудио медиа
 */
export interface AudioData {
  show_views_counter: boolean;
  upload_status?: string | null;
  complete: boolean;
  time_code: number;
  size: number;
  id: string;
  url: string;
  artist?: string | null;
  album?: string | null;
  file_type?: string | null;
  title: string;
  track?: string | null;
  duration?: number | null;
}

/**
 * Данные изображения медиа
 */
export interface ImageData {
  url: string;
  width: number;
  height: number;
  preview?: string | null;
  id: string;
}

/**
 * Данные текста медиа
 */
export interface TextData {
  modificator: string;
  content: string;
}

/**
 * Данные смайла медиа
 */
export interface SmileData {
  small_url: string;
  medium_url: string;
  large_url: string;
  name: string;
  id: string;
  is_animated: boolean;
}

/**
 * Данные ссылки медиа
 */
export interface LinkData {
  explicit: boolean;
  content: string;
  url: string;
}

/**
 * Данные файла медиа
 */
export interface FileData {
  id: string;
  title: string;
  url: string;
  complete: boolean;
  size: number;
}

/**
 * URL видеоплеера с информацией о типе
 */
export interface PlayerUrl {
  type: string;
  url: string;
}

/**
 * Счетчик для определенного типа контента внутри поста
 */
export interface ContentCounter {
  type: string;
  count: number;
  size: number;
}

/**
 * Информация о донаторах
 */
export interface Donators {
  extra: ExtraFlag;
  data: unknown[];
}

/**
 * Контейнер дополнительных флагов
 */
export interface ExtraFlag {
  is_last: boolean;
}

/**
 * Обертка комментариев
 */
export interface Comments {
  extra: ExtraFlag;
  data: unknown[];
}

/**
 * Сводка счетчиков поста
 */
export interface Count {
  comments: number;
  reactions: Reactions;
  likes: number;
}

/**
 * Информация о ценах в валютах
 */
export interface CurrencyPrices {
  rub: number;
  usd: number;
}

/**
 * Данные списка медиа
 */
export interface ListData {
  style: string;
  items: ListItem[];
}

/**
 * Данные элемента списка
 */
export interface ListItem {
  data: MediaData[];
  items: ListItem[];
}

/**
 * Контейнер данных медиа
 */
export type MediaData =
  | { type: 'video'; data: VideoData }
  | { type: 'ok_video'; data: OkVideoData }
  | { type: 'audio_file'; data: AudioData }
  | { type: 'image'; data: ImageData }
  | { type: 'text'; data: TextData }
  | { type: 'smile'; data: SmileData }
  | { type: 'link'; data: LinkData }
  | { type: 'file'; data: FileData }
  | { type: 'list'; data: ListData }
  | { type: string; data?: unknown };

