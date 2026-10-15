const MASTER_KEY = 'sakulink-secure-encryption-key-2024'; // Static master key

async function deriveKey(userId) {
  const encoder = new TextEncoder();
  const masterKeyData = encoder.encode(MASTER_KEY);
  const saltData = encoder.encode(userId);

  const importedKey = await window.crypto.subtle.importKey(
    'raw',
    masterKeyData,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltData,
      iterations: 100000,
      hash: 'SHA-256',
    },
    importedKey,
    256
  );

  return window.crypto.subtle.importKey('raw', derivedBits, { name: 'AES-GCM' }, false, [
    'encrypt',
    'decrypt',
  ]);
}

export async function encryptUrl(url, userId) {
  if (!url) return null;

  try {
    const key = await deriveKey(userId);
    const encoder = new TextEncoder();
    const data = encoder.encode(url);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);

    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return arrayBufferToBase64(combined);
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
}

export async function decryptUrl(encryptedData, userId) {
  if (!encryptedData) return null;

  try {
    const key = await deriveKey(userId);
    const combined = base64ToArrayBuffer(encryptedData);
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const decrypted = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted);
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedData;
  }
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
