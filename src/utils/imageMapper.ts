const imageMap: Record<string, any> = {
  'pokmeon.png': require('../../assets/images/pokmeon.png'),
  'buffkirk.jpeg': require('../../assets/images/buffkirk.jpeg'),
  'paper1.jpg': require('../../assets/images/paper1.jpg'),
  // Add new images here as needed
};

/**
 * Returns the local require() mapping for an image string stored in the database.
 * If the image is not found, returns a fallback.
 */
export const getLocalImage = (imageName: string | null | undefined): any => {
  if (!imageName || !imageMap[imageName]) {
    // Return a default fallback if you have one, or just pokmeon as fallback
    return imageMap['pokmeon.png']; 
  }
  return imageMap[imageName];
};
