export type Rarity = 'Común' | 'Raro' | 'Épico' | 'Legendario';
export type Difficulty = 'Fácil' | 'Media' | 'Difícil' | 'Extrema';

export interface Card {
  id: string;
  name: string;
  rarity: Rarity;
  image: string; // URL o path temporal para hardcode
  description: string;
}

export interface Activity {
  id: string;
  title: string;
  difficulty: Difficulty;
  completed: boolean;
  rewardRarity: Rarity;
}

export interface User {
  id: string;
  username: string;
  avatar: string;
  unlockedCards: string[]; // Array de Card IDs
}
