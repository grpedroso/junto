import { I18n } from 'i18n-js';
import ptBR from './pt-BR';

/**
 * So pt-BR por ora. O i18n existe desde o dia 1 para nenhuma string nascer
 * hardcoded na UI -- custa pouco agora e evita reescrever tela depois.
 */
export const i18n = new I18n({ 'pt-BR': ptBR });

i18n.defaultLocale = 'pt-BR';
i18n.locale = 'pt-BR';
i18n.enableFallback = true;

export const t = (chave: string, opcoes?: Record<string, unknown>) =>
  i18n.t(chave, opcoes);

export default i18n;
