export type Rarity = "common" | "rare" | "epic" | "legendary";

type AssetCategory = "backgrounds" | "images" | "textures";

interface AssetPart {
  rarity: Rarity;
  file: string;
  key: string;
}

export interface CardParts {
  rarity: Rarity;
  background: AssetPart;
  center: AssetPart;
  normal: AssetPart;
  name: string;
  text: string;
}

const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 40,
  rare: 20,
  epic: 20,
  legendary: 20,
};

const ASSET_POOLS: Record<Rarity, Record<AssetCategory, string[]>> = {
  common: {
    backgrounds: ["bg_01.png", "bg_02.png", "bg_03.png"],
    images: ["img_01.jpg", "img_02.png", "img_03.png", "img_04.png", "img_05.png"],
    textures: ["tex_01.jpg"],
  },
  rare: {
    backgrounds: ["bg_01.png"],
    images: ["img_01.png", "img_02.png", "img_03.png"],
    textures: ["tex_01.jpg"],
  },
  epic: {
    backgrounds: ["bg_01.png"],
    images: ["img_01.jpg", "img_02.png", "img_03.png"],
    textures: ["tex_01.png"],
  },
  legendary: {
    backgrounds: ["bg_01.png", "bg_02.png"],
    images: ["img_01.png", "img_02.png", "img_03.png", "img_04.png", "img_05.png"],
    textures: ["tex_01.jpg"],
  },
};

const CARD_NAMES: Record<Rarity, string[]> = {
  common: [
    "Campesino Valiente",
    "Espada Oxidada",
    "Escudo de Madera",
    "Botella de Agua",
    "Mapa Rasgado",
    "Flecha Simple",
    "Capa Andrajosa",
    "Piedra de Afilar",
    "Vela Encendida",
    "Cuerda Desgastada",
  ],
  rare: [
    "Caballero de Plata",
    "Arco Encantado",
    "Poción Azul",
    "Grimorio Menor",
    "Amuleto del Alba",
    "Daga Rúnica",
    "Coraza de Tormenta",
    "Esencia de Fuego",
  ],
  epic: [
    "Dragón de las Sombras",
    "Furia del Trueno",
    "Corona del Rey Caído",
    "Hoja del Vacío",
    "Titán de Obsidiana",
    "Llama Eterna",
    "Reliquia Prohibida",
  ],
  legendary: [
    "Excalibur Celestial",
    "Fénix Renacido",
    "Devorador de Mundos",
    "Grial del Infinito",
    "Cosmos Viviente",
    "Último Amanecer",
  ],
};

const CARD_TEXTS: Record<Rarity, string[]> = {
  common: [
    "Una carta sencilla pero confiable en los momentos difíciles.",
    "No todas las leyendas nacen con poder. Algunas lo forjan.",
    "El primer paso de todo héroe comienza aquí.",
    "Aunque parezca simple, tiene más valor del que aparenta.",
    "Todo gran ejército necesita soldados comunes.",
    "Lo ordinario puede ser extraordinario en las manos correctas.",
  ],
  rare: [
    "Forjada en los talleres de la montaña, bañada en luz lunar.",
    "Su brillo azul revela un poder latente esperando despertar.",
    "Solo los dignos pueden empuñar su verdadero poder.",
    "Dicen que susurra secretos a quien la posee.",
    "Un artefacto poco común, codiciado por muchos.",
  ],
  epic: [
    "El suelo tiembla cuando esta carta se invoca.",
    "Su poder distorsiona la realidad a su alrededor.",
    "Forjada con fragmentos de estrellas extintas.",
    "Los enemigos huyen solo con ver su resplandor.",
    "Una reliquia de una era olvidada, aún temida.",
  ],
  legendary: [
    "Solo ha sido vista tres veces en toda la historia conocida.",
    "Su poder trasciende los límites de la comprensión mortal.",
    "El cosmos mismo se inclina ante su presencia.",
    "Quien la posee, posee el destino del mundo.",
    "Una fuerza primordial que existió antes que el tiempo.",
  ],
};

function rollRarity(): Rarity {
  const total = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
  let random = Math.random() * total;

  for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
    random -= weight;
    if (random <= 0) {
      return rarity as Rarity;
    }
  }

  return "common";
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rollAsset(rarity: Rarity, category: AssetCategory): AssetPart {
  const pool = ASSET_POOLS[rarity][category];
  if (pool.length === 0) {
    return rollAsset("common", category);
  }
  const file = pool[Math.floor(Math.random() * pool.length)];
  return { rarity, file, key: `${rarity}/${file}` };
}

export function generateCardParts(): CardParts {
  const rarity = rollRarity();
  return {
    rarity,
    background: rollAsset(rarity, "backgrounds"),
    center: rollAsset(rarity, "images"),
    normal: rollAsset(rarity, "textures"),
    name: pickRandom(CARD_NAMES[rarity]),
    text: pickRandom(CARD_TEXTS[rarity]),
  };
}
