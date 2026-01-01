
export enum GameState {
  SETUP = 'SETUP',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED',
  REPORT = 'REPORT'
}

export type PuzzleType = 'MULTIPLE_CHOICE' | 'CODE_ENTRY' | 'ORDERING' | 'MATCHING' | 'IMAGE_RIDDLE';

export interface MatchingPair {
  left: string;
  right: string;
}

export interface Puzzle {
  id: string;
  type: PuzzleType;
  title: string;
  description: string;
  clue: string;
  question: string;
  options?: string[];
  correctAnswer?: number;
  correctCode?: string;
  itemsToOrder?: string[];
  correctSequence?: number[];
  matchingPairs?: MatchingPair[];
  isTimed?: boolean;
  timeLimit?: number;
  explanation: string;
  imageUrl?: string;
}

export interface EscapeRoomData {
  topic: string;
  puzzles: Puzzle[];
  narrative: string;
  totalRooms: number;
  sources: { title: string; uri: string }[];
}

export interface UserProgress {
  currentRoom: number;
  score: number;
  attempts: number;
  startTime: number;
}
