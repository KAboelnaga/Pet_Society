import { Buffer } from 'buffer';
import CryptoJS from 'crypto-js';

// Function to decrypt messages using the same key as backend
export const decryptMessage = (encryptedMessage) => {
  if (!encryptedMessage) return '';
  
  // If the message is already decrypted (plain text), return it
  if (typeof encryptedMessage === 'string' && !encryptedMessage.includes('.')) {
    return encryptedMessage;
  }
  
  try {
    // Get the encryption key from environment variables
    const key = process.env.REACT_APP_ENCRYPTION_KEY;
    if (!key) {
      console.error('Encryption key not found');
      return encryptedMessage; // Return the original message if no key is found
    }

    // Handle both string and object formats
    let messageToDecrypt = encryptedMessage;
    if (typeof encryptedMessage === 'object' && encryptedMessage.encrypted_body) {
      messageToDecrypt = encryptedMessage.encrypted_body;
    }

    // First base64 decode the message
    const decoded = Buffer.from(messageToDecrypt, 'base64');
    
    // Convert to bytes for CryptoJS
    const wordArray = CryptoJS.lib.WordArray.create(decoded);
    
    // Decrypt using AES
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: wordArray },
      CryptoJS.enc.Base64.parse(key),
      {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    // Convert to string
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    return decryptedText || messageToDecrypt; // Return original if decryption fails
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedMessage; // Return the original message if decryption fails
  }
};

// Function to encrypt messages (for sending)
export const encryptMessage = (message) => {
  if (!message) return '';
  
  try {
    // Get the encryption key
    const key = process.env.REACT_APP_ENCRYPTION_KEY;
    if (!key) {
      throw new Error('Encryption key not found');
    }

    // Encrypt using AES
    const encrypted = CryptoJS.AES.encrypt(
      message,
      CryptoJS.enc.Base64.parse(key),
      {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    // Convert to base64
    return encrypted.toString();
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};
