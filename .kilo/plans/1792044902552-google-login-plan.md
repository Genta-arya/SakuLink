# Plan: Google Login for SakuLink

## Goals
Add Google Sign-In provider to the existing login flow. Keep email/password login intact. Make Google login button visually consistent with the existing login page design.

## Tech Stack Facts
- React + Vite + TailwindCSS
- Firebase Auth (email/password already used in `src/services/auth.service.js`)
- Firebase Firestore for user docs
- `lucide-react` for icons, `sonner` for toast
- Tailwind theme colors: `accent-main` = `#8B5CF6` (violet/indigo), `text-ink`, `bg-base`

## Decisions (user-confirmed)
- Google provider already enabled in Firebase Console
- Button design: **Minimalist outline** — gray border, white bg, Google "G" icon, text gray
- Auto-create Firestore `users` doc for new Google users (same fields as `register`)
- Use loading spinner + `sonner` toast for errors

## Tasks (ordered)

### 1. Add `googleLogin` to `auth.service.js`
File: `src/services/auth.service.js`

- Import `GoogleAuthProvider`, `signInWithPopup` from `firebase/auth`
- Add method `googleLogin: async () =>`:
  - Create `GoogleAuthProvider` instance
  - Call `signInWithPopup(auth, provider)`
  - On result, check if Firestore doc exists at `users/{uid}`. If not, create it with:
    ```
    displayName, email, createdAt: new Date(),
    preferences: { theme: 'light', cardDensity: 'comfortable' }
    ```
  - Return `user` (from `userCredential.user`)
- Return the user object so caller can `navigate('/')`

### 2. Update `LoginPage.jsx`
File: `src/pages/LoginPage.jsx`

- Import `ChromePicker` or just use SVG Google "G" logo inline (recommended: inline SVG, no new asset)
- Import `toast` from `sonner`
- Import a loading icon from `lucide-react` (e.g., `Loader2`)
- Add `googleLoading` state (`useState(false)`)
- Add `handleGoogleLogin` async function:
  ```js
  const handleGoogleLogin = async () => {
    setGoogleError('');
    setGoogleLoading(true);
    try {
      await authService.googleLogin();
      navigate('/');
    } catch (err) {
      setGoogleError(err.message || 'Gagal login dengan Google.');
    } finally {
      setGoogleLoading(false);
    }
  };
  ```
- Add visual divider "ATAU" between form and Google button
- Add Google button below submit button:
  ```jsx
  <button
    type="button"
    onClick={handleGoogleLogin}
    disabled={googleLoading}
    className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
  >
    {googleLoading ? <Loader2 size={18} className="animate-spin" /> : <GoogleIcon />}
    {googleLoading ? 'Memproses...' : 'Masuk dengan Google'}
  </button>
  ```
- Google "G" icon inline SVG (standard Google colors): use 18x18 SVG

### 3. (Optional) Move logo — current `img src={nav}` is `w-96`, looks too large on login. Not blocking, but recommended: change to `w-48` or `w-64`. Leave as-is unless user requests.

## Validation
- Run `npm run lint` (oxlint) — no errors
- Start `npm run dev` — open `/login`
- Click Google button → popup opens → select account → redirected to `/`
- New Google user appears in Firestore `users` collection with expected fields

## Risks / Edge Cases
- Firestore rules: if write-to-`users/{uid}` rule fails, Google login errors. Verify Firestore rules allow authenticated write to `users/{uid}`
- User already exists in Firestore but signed in via Google: skip doc creation
- If `signInWithPopup` blocked by popup blocker (rare on localhost), fallback not needed for MVP

## Rollback
- Revert changes to `auth.service.js` and `LoginPage.jsx`
- No new dependencies added
