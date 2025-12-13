/**
 * Ответ API, содержащий список целей
 */
export interface TargetResponse {
  data: Target[];
}

/**
 * Представляет одну цель из API
 */
export interface Target {
  description: string;
  bloggerId: number;
  priority: number;
  createdAt: number;
  id: number;
  targetSum: number;
  currentSum: number;
  finishTime: number | null;
  bloggerUrl: string;
  type: TargetType;
}

/**
 * Структура данных формы запроса для создания новой цели
 */
export interface NewTarget {
  blog_url: string;
  description: string;
  target_sum: number;
}

/**
 * Структура данных формы запроса для обновления существующей цели
 */
export interface UpdateTarget {
  target_id: number;
  description: string;
  target_sum: number;
}

export enum TargetType {
  Money = 'money',
  Subscribers = 'subscribers',
}

