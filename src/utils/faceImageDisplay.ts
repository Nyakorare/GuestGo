/**
 * Face image display utilities
 * Handles decryption and display of face images from the database
 */

import { processFaceImageForDisplay } from './imageCompression';

/**
 * Display face image in an img element
 * @param imgElement - The img element to display the face image in
 * @param encryptedData - Encrypted face image data from database
 * @param fallbackSrc - Fallback image source if decryption fails
 */
export function displayFaceImage(
  imgElement: HTMLImageElement, 
  encryptedData: string | null, 
  fallbackSrc: string = '/placeholder-face.png'
): void {
  if (!encryptedData) {
    imgElement.src = fallbackSrc;
    imgElement.alt = 'No face image available';
    return;
  }

  try {
    // Decrypt and process the face image data
    const decryptedDataUrl = processFaceImageForDisplay(encryptedData);
    imgElement.src = decryptedDataUrl;
    imgElement.alt = 'Face image';
  } catch (error) {
    console.error('Error displaying face image:', error);
    imgElement.src = fallbackSrc;
    imgElement.alt = 'Face image unavailable';
  }
}

/**
 * Create a face image element with proper styling
 * @param encryptedData - Encrypted face image data from database
 * @param className - CSS classes to apply
 * @param fallbackSrc - Fallback image source
 * @returns HTML img element
 */
export function createFaceImageElement(
  encryptedData: string | null,
  className: string = 'w-16 h-16 rounded-full object-cover border-2 border-gray-300',
  fallbackSrc: string = '/placeholder-face.png'
): HTMLImageElement {
  const img = document.createElement('img');
  img.className = className;
  img.alt = 'Face image';
  
  displayFaceImage(img, encryptedData, fallbackSrc);
  
  return img;
}

/**
 * Get face image data URL for use in other contexts
 * @param encryptedData - Encrypted face image data from database
 * @returns Decrypted data URL or null if decryption fails
 */
export function getFaceImageDataUrl(encryptedData: string | null): string | null {
  if (!encryptedData) {
    return null;
  }

  try {
    return processFaceImageForDisplay(encryptedData);
  } catch (error) {
    console.error('Error getting face image data URL:', error);
    return null;
  }
}
