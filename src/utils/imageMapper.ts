const imageMap: Record<string, any> = {
  'pokmeon.png': require('../../assets/common/backgrounds/pokmeon.png'),
  'buffkirk.jpeg': require('../../assets/images/buffkirk.jpeg'),
  'bob.jpg': require('../../assets/common/images/bob.jpg'),
  '6_1x1.jpg': require('../../assets/common/images/6_1x1.jpg'),
  '7_1x1.jpg': require('../../assets/rare/images/7_1x1.jpg'),
  '8_1x1.jpg': require('../../assets/epic/images/8_1x1.jpg'),
  '9_1x1.jpg': require('../../assets/legendary/images/9_1x1.jpg'),
  'image3.png': require('../../assets/legendary/images/image3.png'),
  // agregamos imagenes
};

export const getLocalImage = (imageName: string | null | undefined): any => {
  if (!imageName || !imageMap[imageName]) {

    return imageMap['pokmeon.png']; 
  }
  return imageMap[imageName];
};
