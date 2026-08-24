import { I18n } from 'i18n-js';
import ptBR from './pt-BR';

/**
 * Only pt-BR for now. The i18n layer exists from day one so no string is ever
 * born hardcoded in the UI -- it costs little now and saves rewriting screens.
 */
export const i18n = new I18n({ 'pt-BR': ptBR });

i18n.defaultLocale = 'pt-BR';
i18n.locale = 'pt-BR';
i18n.enableFallback = true;

export const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);

export default i18n;
