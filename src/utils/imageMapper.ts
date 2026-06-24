const imageMap: Record<string, any> = {
  "common/bg_01.png": require("../../assets/common/backgrounds/bg_01.png"),
  "common/img_01.jpg": require("../../assets/common/images/img_01.jpg"),
  "common/img_02.jpg": require("../../assets/common/images/img_02.jpg"),
  "common/img_03.png": require("../../assets/common/images/img_03.png"),
  "common/tex_01.jpg": require("../../assets/common/textures/tex_01.jpg"),
  "rare/bg_01.png": require("../../assets/rare/backgrounds/bg_01.png"),
  "rare/img_01.jpg": require("../../assets/rare/images/img_01.jpg"),
  "rare/tex_01.jpg": require("../../assets/rare/textures/tex_01.jpg"),
  "rare/grain.webp": require("../../assets/rare/textures/grain.webp"),
  "rare/glitter.png": require("../../assets/rare/textures/glitter.png"),
  "epic/bg_01.png": require("../../assets/epic/backgrounds/bg_01.png"),
  "epic/img_01.jpg": require("../../assets/epic/images/img_01.jpg"),
  "epic/illusion.png": require("../../assets/epic/textures/illusion.png"),
  "legendary/bg_01.png": require("../../assets/legendary/backgrounds/bg_01.png"),
  "legendary/img_01.jpg": require("../../assets/legendary/images/img_01.jpg"),
  "legendary/img_02.png": require("../../assets/legendary/images/img_02.png"),
  "legendary/img_03.png": require("../../assets/legendary/images/img_03.png"),
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
