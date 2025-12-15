// Экспортируем типы с явными именами для избежания конфликтов
export type {
  Post,
  PostsResponse,
  MediaData,
  VideoData,
  OkVideoData,
  AudioData,
  ImageData,
  TextData,
  SmileData,
  LinkData,
  FileData,
  PlayerUrl,
  ContentCounter,
  Donators,
  ExtraFlag,
  Comments,
  Count as PostCount,
  CurrencyPrices,
  ListData,
  ListItem,
  Extra as PostExtra,
  Flags,
} from './post';

export type {
  Comment,
  CommentsResponse,
  CommentBlock,
  PostRef,
  Author,
  Replies,
  Extra as CommentExtra,
} from './comment';

export type { User } from './user';
export type { Reactions, ReactionCounter } from './reaction';
export type {
  Tag,
  SearchTag,
  SearchTagsData,
  SearchTagsFullResponse,
  TagsResponse,
  Extra as TagExtra,
} from './tag';
export type { Target, TargetResponse, NewTarget, UpdateTarget } from './target';
export { TargetType } from './target';
export type {
  SubscriptionLevel,
  SubscriptionLevelResponse,
  Promo,
  Access,
  Count as PromoCount,
  Discount,
  DataBlock,
  ExternalApps,
  DiscordApp,
  DiscordData,
  DiscordRole,
  TelegramApp,
} from './subscription-level';
export type {
  Subscription,
  SubscriptionsResponse,
  SubscriptionLevelInfo,
  BlogInfo,
  BlogOwner,
  BlogFlags,
} from './subscription';
export type { SubscribersResponse, Subscriber } from './subscribers';
export type {
  ShowcaseResponse,
  ShowcaseData,
  Extra as ShowcaseExtra,
  Counters,
  ShowcaseItem,
} from './showcase';

// Экспортируем функции
export {
  createTextBlock,
  createTextEndBlock,
  createSmileBlock,
} from './comment';
