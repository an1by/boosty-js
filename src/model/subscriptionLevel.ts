/**
 * Ответ API, содержащий список уровней подписки
 */
export interface SubscriptionLevelResponse {
  data: SubscriptionLevel[];
}

/**
 * Представляет один уровень подписки из API
 */
export interface SubscriptionLevel {
  id: number;
  name: string;
  price: number;
  currencyPrices: Record<string, number>;
  isLimited: boolean;
  isArchived: boolean;
  deleted: boolean;
  isHidden: boolean;
  createdAt: number;
  ownerId: number;
  promos?: Promo[];
  data: DataBlock[];
  externalApps?: ExternalApps;
}

/**
 * Представляет промо-кампанию, прикрепленную к уровню подписки
 */
export interface Promo {
  id: number;
  type: string;
  description?: string | null;
  startTime: number;
  endTime?: number | null;
  isFinished: boolean;
  access: Access;
  count: Count;
  discount: Discount;
  trial?: Trial;
}

export interface Trial {
  days: number;
}

/**
 * Права доступа, предоставляемые промо-кампанией
 */
export interface Access {
  accessOtherLevelSubscriber: boolean;
  newSubscriber: boolean;
  oldPaidSubscriber: boolean;
}

/**
 * Лимиты активации для промо-кампании
 */
export interface Count {
  activation: number;
  maxActivation?: number | null;
}

/**
 * Детали скидки, предлагаемой промо-кампанией
 */
export interface Discount {
  price: number;
  percent: number;
  currencyPrices: Record<string, number>;
}

/**
 * Представляет блок контента (текст или изображение)
 */
export type DataBlock =
  | {
      type: 'text';
      content: string;
      modificator: string;
    }
  | {
      type: 'image';
      id: string;
      url: string;
      rendition: string;
      width: number;
      height: number;
      size: number;
    };

/**
 * Данные внешних приложений
 */
export interface ExternalApps {
  discord: DiscordApp;
  telegram: TelegramApp;
}

/**
 * Данные приложения Discord
 */
export interface DiscordApp {
  isConfigured: boolean;
  data?: DiscordData | null;
}

/**
 * Данные Discord
 */
export interface DiscordData {
  role: DiscordRole;
}

/**
 * Описание роли Discord
 */
export interface DiscordRole {
  id: string;
  name: string;
}

/**
 * Данные приложения Telegram
 */
export interface TelegramApp {
  is_configured: boolean;
}
