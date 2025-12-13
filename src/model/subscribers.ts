import { Promo, SubscriptionLevel } from './subscriptionLevel';

export interface SubscribersResponse {
  data: Subscriber[];
  total: number;
  limit: number;
  offset: number;
}

export interface Subscriber {
  id: number;
  name: string;
  email: string;
  avatarUrl: string;
  hasAvatar: boolean;
  isOfficial: boolean;
  isBlackListed: boolean;
  canWrite: boolean;
  payments: number;
  price: number;
  onTime: number;
  nextPayTime: number;
  subscribed: boolean;
  status: string;
  isFeePaid: boolean;
  level: SubscriptionLevel;
  promo?: Promo;
}
