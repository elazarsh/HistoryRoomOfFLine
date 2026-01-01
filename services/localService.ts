
import { EscapeRoomData, Puzzle } from '../types';
import { LOCAL_ARCHIVES } from '../data/localArchives';

const STORAGE_KEY = 'kiro_archived_rooms';
const MAX_PUZZLES_PER_TOPIC = 50; 
const MAX_TOPICS = 20; 

export interface TopicReportItem {
  topic: string;
  staticCount: number;
  dynamicCount: number;
  total: number;
}

export const getAllTopicsReport = (): TopicReportItem[] => {
  const reportMap: Record<string, TopicReportItem> = {};

  // Add static topics
  Object.keys(LOCAL_ARCHIVES).forEach(topic => {
    reportMap[topic] = {
      topic,
      staticCount: LOCAL_ARCHIVES[topic].puzzles.length,
      dynamicCount: 0,
      total: LOCAL_ARCHIVES[topic].puzzles.length
    };
  });

  // Add/Merge dynamic topics (AI generated)
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const archives: Record<string, EscapeRoomData> = JSON.parse(saved);
      Object.keys(archives).forEach(dynamicKey => {
        const staticMatch = Object.keys(reportMap).find(s => 
          s.toLowerCase().trim() === dynamicKey.toLowerCase().trim()
        );

        if (staticMatch) {
          reportMap[staticMatch].dynamicCount = archives[dynamicKey].puzzles.length;
          reportMap[staticMatch].total = reportMap[staticMatch].staticCount + reportMap[staticMatch].dynamicCount;
        } else {
          reportMap[dynamicKey] = {
            topic: dynamicKey,
            staticCount: 0,
            dynamicCount: archives[dynamicKey].puzzles.length,
            total: archives[dynamicKey].puzzles.length
          };
        }
      });
    } catch (e) {}
  }

  return Object.values(reportMap).sort((a, b) => b.total - a.total);
};

export const getPuzzleCountForTopic = (topic: string): number => {
  const saved = localStorage.getItem(STORAGE_KEY);
  const localCount = LOCAL_ARCHIVES[topic]?.puzzles.length || 0;
  if (!saved) return localCount;
  try {
    const archives: Record<string, EscapeRoomData> = JSON.parse(saved);
    const key = topic.toLowerCase().trim();
    const dynamicCount = archives[key]?.puzzles.length || 0;
    return localCount + dynamicCount;
  } catch {
    return localCount;
  }
};

export const getSavedArchiveCount = (): number => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return 0;
  try {
    const parsed = JSON.parse(saved);
    return Object.keys(parsed).length;
  } catch {
    return 0;
  }
};

export const mergeToLocalArchive = (data: EscapeRoomData) => {
  const saved = localStorage.getItem(STORAGE_KEY);
  let archives: Record<string, EscapeRoomData> = {};
  
  if (saved) {
    try { archives = JSON.parse(saved); } catch (e) { archives = {}; }
  }
  
  const key = data.topic.toLowerCase().trim();
  
  if (!archives[key]) {
    archives[key] = { ...data, puzzles: [] };
  }
  
  const existingQuestions = new Set(archives[key].puzzles.map(p => p.question));
  const newUniquePuzzles = data.puzzles.filter(p => !existingQuestions.has(p.question));
  
  archives[key].puzzles = [...archives[key].puzzles, ...newUniquePuzzles].slice(0, MAX_PUZZLES_PER_TOPIC);
  
  const topicKeys = Object.keys(archives);
  if (topicKeys.length > MAX_TOPICS) {
    delete archives[topicKeys[0]];
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(archives));
};

function getRandomSubset<T>(array: T[], size: number): T[] {
  if (array.length <= size) return array;
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, size);
}

export const getLocalEscapeRoom = (topic: string): EscapeRoomData | null => {
  const searchTopic = topic.toLowerCase().trim();
  let pool: Puzzle[] = [];
  let baseMeta: Partial<EscapeRoomData> = {};

  const staticKeys = Object.keys(LOCAL_ARCHIVES);
  const bestStaticMatch = staticKeys.find(k => {
    const lowerK = k.toLowerCase();
    return searchTopic.includes(lowerK) || lowerK.includes(searchTopic);
  });

  if (bestStaticMatch) {
    pool = [...LOCAL_ARCHIVES[bestStaticMatch].puzzles];
    baseMeta = { ...LOCAL_ARCHIVES[bestStaticMatch] };
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const archives = JSON.parse(saved);
      const dynamicKey = Object.keys(archives).find(k => searchTopic.includes(k) || k.includes(searchTopic));
      if (dynamicKey) {
        const dynamicPuzzles = archives[dynamicKey].puzzles;
        const existingTexts = new Set(pool.map(p => p.question));
        const uniqueDynamic = dynamicPuzzles.filter((p: Puzzle) => !existingTexts.has(p.question));
        pool = [...pool, ...uniqueDynamic];
        if (!baseMeta.topic) baseMeta = { ...archives[dynamicKey] };
      }
    } catch (e) {}
  }
  
  if (pool.length === 0) return null;

  return {
    topic: baseMeta.topic || topic,
    narrative: baseMeta.narrative || "משימת חירום בלב ההיסטוריה.",
    puzzles: getRandomSubset(pool, 7),
    totalRooms: 7,
    sources: baseMeta.sources || []
  };
};
