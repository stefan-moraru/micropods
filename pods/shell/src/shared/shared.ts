import translations from './translations';
import pubSub from './pubSub';

const micropods = {
  translations,
  pubSub,
};

declare global {
  interface Window {
    micropods: typeof micropods;
  }
}

window.micropods = micropods;
