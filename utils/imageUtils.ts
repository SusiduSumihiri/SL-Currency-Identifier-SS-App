
interface Base64ConversionResult {
  base64: string;
  mimeType: string;
}

export const fileToBase64 = (file: File): Promise<Base64ConversionResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // The result includes a data URI prefix (e.g., 'data:image/jpeg;base64,')
      // We need to extract just the base64 part.
      const base64Data = result.split(',')[1];
      if (base64Data) {
        resolve({ base64: base64Data, mimeType: file.type });
      } else {
        reject(new Error("Failed to read base64 data from file."));
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
  });
};
