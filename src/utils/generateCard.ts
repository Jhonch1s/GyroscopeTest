export type Rarity = "common" | "rare" | "epic" | "legendary";

type AssetCategory = "backgrounds" | "images" | "textures";

interface AssetPart {
  rarity: Rarity;
  file: string;
  key: string;
}

export interface CardParts {
  background: AssetPart;
  center: AssetPart;
  normal: AssetPart;
}

const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 40,
  rare: 20,
  epic: 20,
  legendary: 20,
};

//medio a la fuerza pero es lo que hay
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
    background: rollAsset(rarity, "backgrounds"),
    center: rollAsset(rarity, "images"),
    normal: rollAsset(rarity, "textures"),
  };
}
