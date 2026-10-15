# Plan: Collections as Default Home

## Goal
Make Collections the primary/default landing page when users open the app (route `/`). Library (all links) moves to `/library`.

## Current State
- Default route `/` → `LibraryPage` (shows all user links)
- Collections accessible via `/collections`
- Desktop sidebar: Semua Link → Favorit → Terbaru → Koleksi → Settings
- Mobile BottomNav: [Semua, Favorit] + [Plus button] + [Koleksi, Settings]

## Decisions
- ✅ Collections becomes index route (`{ index: true, element: <CollectionsPage /> }`)
- ✅ Library moves to `/library` route
- ✅ Mobile BottomNav reordered: **Koleksi → Library → Favorit → Settings**
- ✅ Desktop sidebar reordered to match nav priority

## Tasks (ordered)

### 1. Update Router (`src/app/router.jsx`)
- Change route at `index: true` from `<LibraryPage />` → `<CollectionsPage />`
- Add new route: `{ path: 'library', element: <LibraryPage /> }`
- Keep all other routes unchanged (collections/:id, favorites, recent, settings, link/:id)

### 2. Update Mobile BottomNav (`src/components/layout/BottomNav.jsx`)
Replace:
```js
const leftNavItems = [
  { icon: Library, label: 'Semua', path: '/' },
  { icon: Heart, label: 'Favorit', path: '/favorites' },
];

const rightNavItems = [
  { icon: Layers, label: 'Koleksi', path: '/collections' },
  { icon: Settings, label: 'Pengaturan', path: '/settings' },
];
```

With:
```js
const leftNavItems = [
  { icon: Layers, label: 'Koleksi', path: '/' },
  { icon: Library, label: 'Library', path: '/library' },
  { icon: Heart, label: 'Favorit', path: '/favorites' },
];

const rightNavItems = [
  { icon: Settings, label: 'Pengaturan', path: '/settings' },
];
```

**Rationale:** Koleksi now paling kiri (primary), Library second, Favorit third. Settings stays right edge.

### 3. Update Desktop Sidebar (`src/App.jsx` lines 81-110)
Replace current nav items (Semua Link, Favorit, Terbaru, Koleksi) with new order:
- Koleksi → `/`
- Library → `/library`  
- Favorit → `/favorites`
- Terbaru → `/recent` (keep)

Update label "Semua Link" → "Library" (or keep "Semua Link" if preferred, but should match mobile).

**Note:** Desktop sidebar will show: Koleksi, Library, Favorit, Terbaru, then below divider: Pengaturan, Logout.

### 4. Check & Update App.jsx Logic (`src/App.jsx` line 35)
Line 35: `const isHomepage = location.pathname === "/";`

**Current behavior:** Shows sort dropdown only on homepage. Since "/" is now Collections (not Library), verify:
- Does Collections page need sort? (Check CollectionsPage.jsx — currently no sort UI)
- If NO: Disable sort on "/" (keep as-is or change condition)
- If YES: Add sort UI to CollectionsPage

**Recommendation:** Keep as-is for now (sort will show on Collections page but CollectionsPage doesn't use it — harmless).

## Validation
1. Run app → logged-in user lands on Collections page (not Library)
2. Mobile BottomNav shows: Koleksi [Library, Favorit] [Settings] (Koleksi paling kiri)
3. Desktop sidebar shows: Koleksi, Library, Favorit, Terbaru, [divider], Pengaturan, Logout
4. Click "Library" on nav → `/library` route loads LibraryPage (all links)
5. Direct URL `/library` works
6. All other routes (/collections/:id, /favorites, /settings) work unchanged
7. Lint & build pass

## Risks / Edge Cases
- **Existing user sessions/bookmarks:** Users with "/" bookmarks now land on Collections instead of Library. This is intentional.
- **Desktop sidebar width:** Adding "Library" label (longer than "Semua") might squeeze layout slightly on narrow screens. Test responsiveness.
- **Sort dropdown:** Currently shows on "/" (Collections). Not used by Collections page, but harmless. Can optimize later if needed.

## Rollback
- Revert router: `{ index: true, element: <LibraryPage /> }`
- Revert BottomNav arrays
- Revert App.jsx sidebar links

## Open Questions
- **None** — all design decisions confirmed by user.
