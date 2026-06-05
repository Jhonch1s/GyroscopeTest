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
    image: require('../../assets/common/backgrounds/pokmeon.png'),
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
    image: require('../../assets/common/backgrounds/pokmeon.png'),
    description: 'Pika Pika.',
  },
  {
    id: 'c6',
    name: 'Gengar',
    rarity: 'Raro',
    image: require('../../assets/common/backgrounds/pokmeon.png'),
    description: 'Se esconde en las sombras.',
  },
  {
    id: 'c7',
    name: 'Bob Esponja',
    rarity: 'Común',
    image: require('../../assets/common/images/bob.jpg'),
    description: '¿Quién vive en la piña debajo del mar?',
  },
  {
    id: 'c8',
    name: 'Guerrero Común',
    rarity: 'Común',
    image: require('../../assets/common/images/6_1x1.jpg'),
    description: 'Un guerrero listo para cualquier combate básico.',
  },
  {
    id: 'c9',
    name: 'Campeón Raro',
    rarity: 'Raro',
    image: require('../../assets/rare/images/7_1x1.jpg'),
    description: 'Habilidades afinadas y listas para la batalla.',
  },
  {
    id: 'c10',
    name: 'Místico Épico',
    rarity: 'Épico',
    image: require('../../assets/epic/images/8_1x1.jpg'),
    description: 'Una presencia majestuosa de poder inconmensurable.',
  },
  {
    id: 'c11',
    name: 'Ancestral Legendario',
    rarity: 'Legendario',
    image: require('../../assets/legendary/images/9_1x1.jpg'),
    description: 'Una fuerza cósmica que trasciende el tiempo.',
  },
  {
    id: 'c12',
    name: 'Artefacto Dorado',
    rarity: 'Legendario',
    image: require('../../assets/legendary/images/image3.png'),
    description: 'Un objeto legendario envuelto en misterio.',
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
  unlockedCards: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c12'], // Cartas que ya tiene
};
