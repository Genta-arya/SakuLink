export const getAuthErrorMessage = (error) => {
  const errorCode = error?.code || '';
  
  const errorMessages = {
    'auth/invalid-email': 'Format email tidak valid.',
    'auth/user-disabled': 'Akun ini telah dinonaktifkan.',
    'auth/user-not-found': 'Email atau password salah.',
    'auth/wrong-password': 'Email atau password salah.',
    'auth/invalid-credential': 'Email atau password salah.',
    'auth/email-already-in-use': 'Email sudah terdaftar. Silakan login.',
    'auth/weak-password': 'Password terlalu lemah. Minimal 6 karakter.',
    'auth/operation-not-allowed': 'Operasi tidak diizinkan.',
    'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi nanti.',
    'auth/network-request-failed': 'Koneksi internet bermasalah. Periksa jaringan Anda.',
    'auth/popup-closed-by-user': 'Login dibatalkan.',
    'auth/cancelled-popup-request': 'Login dibatalkan.',
    'auth/popup-blocked': 'Popup diblokir browser. Izinkan popup untuk login dengan Google.',
    'auth/unauthorized-domain': 'Domain tidak diizinkan untuk autentikasi.',
    'auth/account-exists-with-different-credential': 'Email sudah terdaftar dengan metode login lain.',
  };

  return errorMessages[errorCode] || error?.message || 'Terjadi kesalahan. Silakan coba lagi.';
};
