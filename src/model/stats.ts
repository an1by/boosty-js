/**
 * Точка данных статистики
 */
export interface Point {
  day: number;
  year: number;
  count: number;
  month: number;
}

/**
 * Статистика блога
 */
export interface Stats {
  postSaleMoney: Point[];
  upSubscribers: Point[];
  messagesSale: Point[];
  decSubscribers: Point[];
  postsSale: Point[];
  donationsMoney: Point[];
  giftsSaleSaleMoney: Point[];
  messagesSaleMoney: Point[];
  totalMoney: Point[];
  decFollowers: Point[];
  incSubscribersMoney: Point[];
  recurrentsMoney: Point[];
  recurrents: Point[];
  referalMoney: Point[];
  referalMoneyOut: Point[];
  incFollowers: Point[];
  referal: Point[];
  donations: Point[];
  incSubscribers: Point[];
  giftsSale: Point[];
  upSubscribersMoney: Point[];
  holds: Point[];
}

/**
 * Текущая статистика блога
 */
export interface Current {
  paidCount: number;
  followersCount: number;
  hold: number;
  income: number;
  balance: number;
  payoutSum: number;
}

