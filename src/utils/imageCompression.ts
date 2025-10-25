/**
 * Image compression utilities for face image data
 * Compresses base64 image data to reduce database storage requirements
 */

/**
 * Compress a base64 image data URL to reduce size
 * @param dataUrl - The base64 data URL to compress
 * @param quality - Compression quality (0.1 to 1.0, default 0.7)
 * @param maxWidth - Maximum width for resizing (default 200)
 * @param maxHeight - Maximum height for resizing (default 200)
 * @returns Compressed base64 data URL
 */
export function compressImageDataUrl(
  dataUrl: string, 
  quality: number = 0.6, 
  maxWidth: number = 120, 
  maxHeight: number = 120
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      
      img.onload = () => {
        try {
          // Calculate new dimensions while maintaining aspect ratio
          let { width, height } = calculateDimensions(img.width, img.height, maxWidth, maxHeight);
          
          // Create canvas for compression
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          // Set canvas size
          canvas.width = width;
          canvas.height = height;
          
          // Fill with white background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          
          // Draw and compress the image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to compressed JPEG (smaller than PNG)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          
          console.log(`Image compressed: ${dataUrl.length} -> ${compressedDataUrl.length} bytes (${Math.round((1 - compressedDataUrl.length / dataUrl.length) * 100)}% reduction)`);
          
          resolve(compressedDataUrl);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image for compression'));
      };
      
      img.src = dataUrl;
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Calculate new dimensions while maintaining aspect ratio
 */
function calculateDimensions(
  originalWidth: number, 
  originalHeight: number, 
  maxWidth: number, 
  maxHeight: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;
  
  let width = originalWidth;
  let height = originalHeight;
  
  // Scale down if too wide
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }
  
  // Scale down if too tall
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }
  
  return {
    width: Math.round(width),
    height: Math.round(height)
  };
}

/**
 * Encrypt/obfuscate base64 data for additional security
 * This is a simple XOR encryption - for production, use proper encryption
 * @param data - Base64 string to encrypt
 * @param key - Encryption key (default: simple key)
 * @returns Encrypted base64 string
 */
export function encryptBase64(data: string, key: string = 'guestgo_face_2024'): string {
  try {
    // Convert to bytes
    const dataBytes = new TextEncoder().encode(data);
    const keyBytes = new TextEncoder().encode(key);
    
    // XOR encryption
    const encrypted = new Uint8Array(dataBytes.length);
    for (let i = 0; i < dataBytes.length; i++) {
      encrypted[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    // Convert back to base64
    return btoa(String.fromCharCode(...encrypted));
  } catch (error) {
    console.error('Encryption failed:', error);
    return data; // Return original if encryption fails
  }
}

/**
 * Decrypt base64 data
 * @param encryptedData - Encrypted base64 string
 * @param key - Decryption key (must match encryption key)
 * @returns Decrypted base64 string
 */
export function decryptBase64(encryptedData: string, key: string = 'guestgo_face_2024'): string {
  try {
    // Validate input
    if (!encryptedData || typeof encryptedData !== 'string') {
      console.warn('Invalid encrypted data provided to decryptBase64');
      return encryptedData;
    }

    // Check if the data looks like it might be unencrypted (starts with data:)
    if (encryptedData.startsWith('data:image/')) {
      return encryptedData;
    }

    // Validate base64 format
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(encryptedData)) {
      console.warn('Data does not appear to be valid base64, returning as-is');
      return encryptedData;
    }

    // Convert from base64
    const encryptedBytes = new Uint8Array(
      atob(encryptedData).split('').map(char => char.charCodeAt(0))
    );
    const keyBytes = new TextEncoder().encode(key);
    
    // XOR decryption (same as encryption)
    const decrypted = new Uint8Array(encryptedBytes.length);
    for (let i = 0; i < encryptedBytes.length; i++) {
      decrypted[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    // Convert back to string
    const result = new TextDecoder().decode(decrypted);
    
    // Validate that the result looks like a data URL
    if (!result.startsWith('data:image/')) {
      console.warn('Decrypted data does not appear to be a valid image data URL');
      return encryptedData; // Return original if decryption doesn't produce expected format
    }
    
    return result;
  } catch (error) {
    console.error('Decryption failed:', error);
    return encryptedData; // Return original if decryption fails
  }
}

/**
 * Process face image data for storage (compress + encrypt)
 * @param dataUrl - Original base64 data URL
 * @returns Processed data ready for database storage
 */
export async function processFaceImageForStorage(dataUrl: string): Promise<string> {
  try {
    // First compress the image to very small size for database storage
    const compressed = await compressImageDataUrl(dataUrl, 0.5, 100, 100);
    
    // Then encrypt it
    const encrypted = encryptBase64(compressed);
    
    console.log(`Face image processed for storage: ${dataUrl.length} -> ${encrypted.length} bytes (${Math.round((1 - encrypted.length / dataUrl.length) * 100)}% reduction)`);
    
    return encrypted;
  } catch (error) {
    console.error('Error processing face image for storage:', error);
    throw error;
  }
}

/**
 * Check if data appears to be encrypted
 * @param data - Data to check
 * @returns True if data appears encrypted
 */
export function isDataEncrypted(data: string): boolean {
  if (!data || typeof data !== 'string') {
    return false;
  }
  
  // If it starts with data:image/, it's likely unencrypted
  if (data.startsWith('data:image/')) {
    return false;
  }
  
  // If it's valid base64 and doesn't start with data:, it might be encrypted
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  return base64Regex.test(data);
}

/**
 * Process face image data for display (decrypt + decompress)
 * @param storedData - Encrypted data from database
 * @returns Decrypted data URL ready for display
 */
export function processFaceImageForDisplay(storedData: string): string {
  try {
    // Validate input
    if (!storedData || typeof storedData !== 'string') {
      console.warn('Invalid stored data provided to processFaceImageForDisplay');
      return storedData;
    }

    // Check if data is already unencrypted
    if (!isDataEncrypted(storedData)) {
      return storedData;
    }

    // First decrypt
    const decrypted = decryptBase64(storedData);
    
    // Validate the decrypted result
    if (!decrypted || decrypted === storedData) {
      console.warn('Decryption returned original data, data may not be encrypted');
      // If the data looks like it's already a data URL, return it
      if (storedData.startsWith('data:image/')) {
        return storedData;
      }
      // Otherwise, this might be corrupted data
      throw new Error('Unable to decrypt face image data');
    }
    
    // Return as data URL (already compressed)
    return decrypted;
  } catch (error) {
    console.error('Error processing face image for display:', error);
    return storedData; // Return original if processing fails
  }
}
