import { Activity, Card, User } from '../types';

export const mockCards: Card[] = [
  {
    id: 'c1',
    name: 'Kirko Básico',
    rarity: 'Común',
    image: require('../../assets/images/buffkirk.jpeg'),
    description: 'La forma básica y trabajadora de Kirko.',
  },
  {
    id: 'c2',
    name: 'Kirko Entrenador',
    rarity: 'Raro',
    image: require('../../assets/images/buffkirk.jpeg'),
    description: 'Levantando 200kg sin sudar.',
  },
  {
    id: 'c3',
    name: 'Mewtwo (Ejemplo)',
    rarity: 'Épico',
    image: require('../../assets/images/pokmeon.png'),
    description: 'Un ente cósmico.',
  },
  {
    id: 'c4',
    name: 'Kirko Dorado',
    rarity: 'Legendario',
    image: require('../../assets/images/buffkirk.jpeg'),
    description: 'El pináculo del esfuerzo físico.',
  },
  {
    id: 'c5',
    name: 'Pikachu',
    rarity: 'Común',
    image: require('../../assets/images/pokmeon.png'),
    description: 'Pika Pika.',
  },
  {
    id: 'c6',
    name: 'Gengar',
    rarity: 'Raro',
    image: require('../../assets/images/pokmeon.png'),
    description: 'Se esconde en las sombras.',
  }
];

export const initialActivities: Activity[] = [
  {
    id: 'a1',
    title: 'Caminar 5,000 pasos',
    difficulty: 'Fácil',
    completed: false,
    rewardRarity: 'Común',
  },
  {
    id: 'a2',
    title: 'Hacer 30 min de ejercicio',
    difficulty: 'Media',
    completed: false,
    rewardRarity: 'Raro',
  },
  {
    id: 'a3',
    title: 'Correr 10 km',
    difficulty: 'Difícil',
    completed: false,
    rewardRarity: 'Épico',
  },
  {
    id: 'a4',
    title: 'Sobrevivir al lunes',
    difficulty: 'Extrema',
    completed: false,
    rewardRarity: 'Legendario',
  },
];

export const mockUser: User = {
  id: 'u1',
  username: 'JorgeKirko47',
  avatar: require('../../assets/images/buffkirk.jpeg'),
  unlockedCards: ['c1', 'c5'], // Cartas que ya tiene
};
