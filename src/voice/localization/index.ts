/**
 * Localization Registry and Formatter
 * Supports English ('en') and Hindi ('hi'), structured for extensible language additions.
 */

import { enLocalization } from './en';
import { hiLocalization } from './hi';
import { PageId } from '../routeRegistry';

export { enLocalization, hiLocalization };

export type SupportedLanguage = 'en' | 'hi' | 'pa' | 'ta' | 'bn' | 'mr';

export const LOCALIZATIONS: Record<string, typeof enLocalization> = {
  en: enLocalization,
  hi: hiLocalization as any,
};

export function getLocalization(lang: string = 'en') {
  return LOCALIZATIONS[lang] || LOCALIZATIONS.en;
}

export function t(
  key: string,
  lang: string = 'en',
  params: Record<string, string | number> = {}
): string {
  const loc = getLocalization(lang);
  let template = (loc.strings as Record<string, string>)[key] || (enLocalization.strings as Record<string, string>)[key] || key;

  for (const [paramKey, value] of Object.entries(params)) {
    template = template.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value));
  }

  return template;
}

export function getLocalizedPageName(pageId: PageId, lang: string = 'en'): string {
  const loc = getLocalization(lang);
  return (loc.pageNames as Record<string, string>)[pageId] || enLocalization.pageNames[pageId] || pageId;
}
