import { MediaData, PlayerUrl, OkVideoData } from './model';

/**
 * Представляет один элемент контента, извлеченный из `Post` или `Comment`
 */
export type ContentItem =
  | { type: 'image'; url: string; id: string }
  | { type: 'video'; url: string }
  | { type: 'okVideo'; url: string; title: string; vid: string }
  | {
      type: 'audio';
      url: string;
      title: string;
      file_type?: string | null;
      size: number;
    }
  | { type: 'text'; modificator: string; content: string }
  | {
      type: 'smile';
      small_url: string;
      medium_url: string;
      large_url: string;
      name: string;
      is_animated: boolean;
    }
  | { type: 'link'; explicit: boolean; content: string; url: string }
  | { type: 'file'; url: string; title: string; size: number }
  | { type: 'list'; style: string; items: ContentItem[][] }
  | { type: 'unknown' };

/**
 * Извлекает элементы медиа из поста в вектор `ContentItem`
 */
export function extractContent(data: MediaData[]): ContentItem[] {
  const result: ContentItem[] = [];

  for (const media of data) {
    extractMedia(media, result);
  }

  return result;
}

/**
 * Извлекает элементы медиа из поста в вектор `ContentItem`
 *
 * Итерируется по `data: MediaData[]` и преобразует каждый вариант
 */
function extractMedia(media: MediaData, out: ContentItem[]): void {
  switch (media.type) {
    case 'image':
      out.push({
        type: 'image',
        url: media.data.url,
        id: (media.data as any).id,
      });
      break;
    case 'video':
      out.push({
        type: 'video',
        url: media.data.url,
      });
      break;
    case 'ok_video': {
      const okVideo = media.data as OkVideoData;
      const bestUrl = pickHigherQualityForVideo(okVideo.player_urls);
      if (bestUrl) {
        out.push({
          type: 'okVideo',
          url: bestUrl,
          title: okVideo.title,
          vid: okVideo.vid,
        });
      }
      break;
    }
    case 'audio_file': {
      const audio = media.data as any;
      out.push({
        type: 'audio',
        url: audio.url,
        title: audio.title,
        file_type: audio.file_type,
        size: audio.size,
      });
      break;
    }
    case 'text': {
      const text = media.data as any;
      out.push({
        type: 'text',
        content: text.content,
        modificator: text.modificator,
      });
      break;
    }
    case 'smile': {
      const smile = media.data as any;
      out.push({
        type: 'smile',
        small_url: smile.small_url,
        medium_url: smile.medium_url,
        large_url: smile.large_url,
        name: smile.name,
        is_animated: smile.is_animated,
      });
      break;
    }
    case 'link': {
      const link = media.data as any;
      out.push({
        type: 'link',
        explicit: link.explicit,
        content: link.content,
        url: link.url,
      });
      break;
    }
    case 'file': {
      const file = media.data as any;
      out.push({
        type: 'file',
        url: file.url,
        title: file.title,
        size: file.size,
      });
      break;
    }
    case 'list': {
      const list = media.data as any;
      const items: ContentItem[][] = [];
      for (const li of list.items) {
        const subItems: ContentItem[] = [];
        for (const d of li.data) {
          extractMedia(d as MediaData, subItems);
        }
        for (const nested of li.items) {
          const nestedItems: ContentItem[] = [];
          for (const d of nested.data) {
            extractMedia(d as MediaData, nestedItems);
          }
          if (nestedItems.length > 0) {
            subItems.push({
              type: 'list',
              style: list.style,
              items: [nestedItems],
            });
          }
        }
        items.push(subItems);
      }
      out.push({
        type: 'list',
        style: list.style,
        items,
      });
      break;
    }
    default:
      out.push({ type: 'unknown' });
      break;
  }
}

/**
 * Выбирает URL с наивысшим приоритетом из списка `PlayerUrl`
 *
 * Порядок приоритета качества: "ultra_hd", "full_hd", "high", "medium", "low".
 * Если ни один не совпадает или все URL пустые для этих типов, возвращает первый непустой URL.
 *
 * @param playerUrls - массив `PlayerUrl`, содержащий поля `type` и `url`
 * @returns `string` с выбранным URL, или `null`, если все URL пустые или список пуст
 */
export function pickHigherQualityForVideo(
  playerUrls: PlayerUrl[]
): string | null {
  const PRIORITY = ['ultra_hd', 'full_hd', 'high', 'medium', 'low'];

  for (const pref of PRIORITY) {
    const pu = playerUrls.find(
      (pu) => pu.type === pref && pu.url && pu.url.trim() !== ''
    );
    if (pu) {
      return pu.url;
    }
  }

  const fallback = playerUrls.find((pu) => pu.url && pu.url.trim() !== '');
  return fallback ? fallback.url : null;
}

