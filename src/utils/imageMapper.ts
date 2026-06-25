const imageMap: Record<string, any> = {
  "common/bg_01.png": require("../../assets/common/backgrounds/bg_01.png"),
  "common/bg_02.png": require("../../assets/common/backgrounds/bg_02.png"),
  "common/bg_03.png": require("../../assets/common/backgrounds/bg_03.png"),
  "common/img_01.jpg": require("../../assets/common/images/img_01.jpg"),
  "common/img_02.png": require("../../assets/common/images/img_02.png"),
  "common/img_03.png": require("../../assets/common/images/img_03.png"),
  "common/img_04.png": require("../../assets/common/images/img_04.png"),
  "common/img_05.png": require("../../assets/common/images/img_05.png"),
  "common/tex_01.jpg": require("../../assets/common/textures/tex_01.jpg"),
  "rare/bg_01.png": require("../../assets/rare/backgrounds/bg_01.png"),
  "rare/img_01.png": require("../../assets/rare/images/img_01.png"),
  "rare/img_02.png": require("../../assets/rare/images/img_02.png"),
  "rare/img_03.png": require("../../assets/rare/images/img_03.png"),
  "rare/tex_01.jpg": require("../../assets/rare/textures/tex_01.jpg"),
  "rare/grain.webp": require("../../assets/rare/textures/grain.webp"),
  "rare/glitter.png": require("../../assets/rare/textures/glitter.png"),
  "epic/bg_01.png": require("../../assets/epic/backgrounds/bg_01.png"),
  "epic/img_01.jpg": require("../../assets/epic/images/img_01.jpg"),
  "epic/img_02.png": require("../../assets/epic/images/img_02.png"),
  "epic/img_03.png": require("../../assets/epic/images/img_03.png"),
  "epic/tex_01.png": require("../../assets/epic/textures/tex_01.png"),
  "epic/illusion.png": require("../../assets/epic/textures/illusion.png"),
  "legendary/bg_01.png": require("../../assets/legendary/backgrounds/bg_01.png"),
  "legendary/bg_02.png": require("../../assets/legendary/backgrounds/bg_02.png"),
  "legendary/img_01.png": require("../../assets/legendary/images/img_01.png"),
  "legendary/img_02.png": require("../../assets/legendary/images/img_02.png"),
  "legendary/img_03.png": require("../../assets/legendary/images/img_03.png"),
  "legendary/img_04.png": require("../../assets/legendary/images/img_04.png"),
  "legendary/img_05.png": require("../../assets/legendary/images/img_05.png"),
  "legendary/tex_01.jpg": require("../../assets/legendary/textures/tex_01.jpg"),
  "legendary/cosmos-bottom.png": require("../../assets/legendary/textures/cosmos-bottom.png"),
  "legendary/cosmos-middle.png": require("../../assets/legendary/textures/cosmos-middle.png"),
  "legendary/cosmos-top.png": require("../../assets/legendary/textures/cosmos-top.png"),
  "buffkirk.jpg": require("../../assets/images/buffkirk.jpg"),
  "sobre/sobre.png": require("../../assets/sobre/sobre.png"),
};

export const getLocalImage = (assetKey: string | null | undefined): any => {
  if (!assetKey) {
    return imageMap["common/bg_01.png"];
  }
  
  if (imageMap[assetKey]) {
    return imageMap[assetKey];
  }

  // Fallback: buscar si alguna llave termina con el assetKey 
  // (útil si la base de datos guardó "img_01.jpg" en lugar de "common/img_01.jpg")
  const foundKey = Object.keys(imageMap).find(key => key.endsWith(assetKey));
  if (foundKey) {
    return imageMap[foundKey];
  }

  return imageMap["common/bg_01.png"];
};

export const mapRarityToDb = (rarity: string): string => {
  switch (rarity) {
    case "common": return "Comun";
    case "rare": return "Raro";
    case "epic": return "Epico";
    case "legendary": return "Legendario";
    default: return "Comun";
  }
};

export const mapDbToRarity = (categoria: string): "common" | "rare" | "epic" | "legendary" => {
  switch (categoria?.toLowerCase()) {
    case "comun": case "común": return "common";
    case "raro": return "rare";
    case "epico": case "épico": return "epic";
    case "legendario": return "legendary";
    default: return "common";
  }
};
