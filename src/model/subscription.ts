import { Promo } from './subscription-level';

/**
 * Ответ API, содержащий пагинированный список подписок
 */
export interface SubscriptionsResponse {
  data: Subscription[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Представляет одну подписку пользователя
 */
export interface Subscription {
  id: number;
  level_id: number;
  parent_id?: number | null;
  name: string;
  price: number;
  custom_price: number;
  period: number;
  on_time: number;
  off_time?: number | null;
  next_pay_time?: number | null;
  is_pause: boolean;
  is_suspended: boolean;
  is_archived: boolean;
  is_apple_payed: boolean;
  is_fee_paid: boolean;
  owner_id: number;
  subscription_level: SubscriptionLevelInfo;
  blog: BlogInfo;
  recommended_promo?: Promo | null;
}

/**
 * Базовая информация об уровне подписки
 */
export interface SubscriptionLevelInfo {
  id: number;
  name: string;
  price: number;
  currency_prices: Record<string, number>;
  is_limited: boolean;
  is_archived: boolean;
  is_hidden: boolean;
  deleted: boolean;
  owner_id: number;
  created_at: number;
  data: unknown[];
}

/**
 * Информация о блоге, связанная с подпиской
 */
export interface BlogInfo {
  blog_url: string;
  title: string;
  cover_url: string;
  has_adult_content: boolean;
  owner: BlogOwner;
  flags: BlogFlags;
}

/**
 * Базовая информация о владельце блога
 */
export interface BlogOwner {
  id: number;
  name: string;
  has_avatar: boolean;
  avatar_url: string;
}

/**
 * Флаги функций блога
 */
export interface BlogFlags {
  show_post_donations: boolean;
  has_adult_content: boolean;
  has_subscription_levels: boolean;
  forbidden_change_has_adult_content: boolean;
  has_targets: boolean;
  is_alien: boolean;
  allow_index: boolean;
  allow_google_index: boolean;
  accept_donation_messages: boolean;
  is_rss_feed_enabled: boolean;
}
