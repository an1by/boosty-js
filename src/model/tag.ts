/**
 * Полный ответ поиска тегов
 */
export interface SearchTagsFullResponse {
  extra: Extra;
  data: SearchTagsData;
}

/**
 * Дополнительные данные поиска тегов
 */
export interface Extra {
  offset: string;
  is_last: boolean;
}

/**
 * Ответ поиска тегов
 */
export interface SearchTagsData {
  search_tags: SearchTag[];
}

/**
 * Ответ тегов
 */
export interface TagsResponse {
  data: Tag[];
}

/**
 * Тег из поиска
 */
export interface SearchTag {
  rank: number;
  tag: Tag;
}

/**
 * Тег
 */
export interface Tag {
  title: string;
  id: number;
}

