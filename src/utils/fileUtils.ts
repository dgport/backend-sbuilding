import fs from 'fs';

export const removeUploadedFile = (filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
   
    }
  } catch (error) {
    console.error(`Error removing file ${filePath}:`, error);
  }
};