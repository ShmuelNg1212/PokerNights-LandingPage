/** The web app's production address and the pages the landing page sends people to. */
export const APP_ORIGIN = 'https://pokernights-five.vercel.app';
export const APP = `${APP_ORIGIN}/`;
export const LOGIN = `${APP_ORIGIN}/accounts/login/`;
export const CONTACT = '/contact/';

/** The nav's words and the home page sections they open, in page order. */
export const NAV = [
  { id: 'table', word: 'Log' },
  { id: 'steps', word: 'Steps' },
  { id: 'compare', word: 'Compare' },
  { id: 'features', word: 'Count-up' },
  { id: 'questions', word: 'Questions' },
] as const;
