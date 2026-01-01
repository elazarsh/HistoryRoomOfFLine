
import { EscapeRoomData } from '../types';
import mevashrim from './topics/mevashrim';
import herzl from './topics/herzl';
import aliyah1 from './topics/aliyah1';
import aliyah2 from './topics/aliyah2';

// Central registry of all topics imported from separate TS data modules
// This ensures compatibility with browser-native ES modules without requiring special JSON loaders.
export const LOCAL_ARCHIVES: Record<string, EscapeRoomData> = {
  'מבשרי הציונות וחיבת ציון': mevashrim,
  'הרצל והתנועה הציונית': herzl,
  'העלייה הראשונה והיישוב הישן': aliyah1,
  'העלייה השנייה והלאומיות הערבית': aliyah2
};
