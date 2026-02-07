# Image Loading Optimization - Home Page

## Optimizations Implemented ✅

### 1. **Hero Image - Eager Loading** 🚀

**File**: `frontend/src/pages/home.tsx`

The main hero background image now loads with highest priority:

```tsx
<img
  src={heroImage}
  alt="Tree Planting"
  className="w-full h-full object-cover"
  loading="eager" // Load immediately, don't wait
  decoding="async" // Don't block rendering while decoding
  fetchpriority="high" // Tell browser this is critical
/>
```

### 2. **Logo Image - Eager Loading** 🎨

The main logo in the hero section also loads immediately:

```tsx
<img
  src="/logo.png"
  alt="Gampahin Husmak"
  className="h-32 sm:h-48 md:h-64 w-auto object-contain"
  loading="eager"
  decoding="async"
  fetchpriority="high"
/>
```

### 3. **Forest Image - Lazy Loading** 🌲

The mission section image (below the fold) uses lazy loading:

```tsx
<img
  src={forestImage}
  alt="Green Gampaha"
  className="relative rounded-2xl shadow-xl w-full h-[350px] md:h-[500px] object-cover"
  loading="lazy" // Only load when user scrolls near it
  decoding="async" // Don't block rendering
/>
```

### 4. **Preload Hints in HTML** ⚡

**File**: `frontend/index.html`

Added preload hints to start downloading critical images before React even loads:

```html
<!-- Preload critical images for faster loading -->
<link rel="preload" as="image" href="/logo.png" fetchpriority="high" />
<link
  rel="preload"
  as="image"
  href="/attached_assets/generated_images/community_tree_planting_hero_image.png"
  fetchpriority="high"
/>
```

## Performance Benefits

### Before Optimization:

- Images loaded whenever React rendered them
- All images had same priority
- Browser didn't know which images were critical
- Hero images competed with other resources

### After Optimization:

✅ **Hero images start downloading immediately** (even before React loads)
✅ **Browser prioritizes critical images** (hero & logo)
✅ **Lazy loading saves bandwidth** (forest image only loads when needed)
✅ **Async decoding prevents blocking** (page rendering isn't blocked)
✅ **Faster perceived performance** (users see hero faster)

## How It Works

### Load Priority Order:

1. **Preload hints** → Browser starts downloading hero image & logo
2. **React loads** → Page structure renders
3. **Hero section** → Images are already downloading or loaded
4. **User scrolls** → Forest image lazy-loads when needed

### Real-World Impact:

- **First Contentful Paint (FCP)**: Faster
- **Largest Contentful Paint (LCP)**: Significantly improved
- **Time to Interactive (TTI)**: Not blocked by image decoding
- **Bandwidth savings**: Below-fold images only load when needed

## Files Modified
----------------------------------------------------------------------------
-| File                          | Changes                                 |-
-| ----------------------------- | --------------------------------------- |-
-| `frontend/src/pages/home.tsx` | Added loading priorities to all images  |-
-| `frontend/index.html`         | Added preload hints for critical images |-
----------------------------------------------------------------------------

## Technical Details

### Loading Attribute Values:

- **`loading="eager"`**: Load immediately (default for above-fold)
- **`loading="lazy"`**: Load when near viewport (below-fold)

### Decoding Attribute:

- **`decoding="async"`**: Decode image off main thread (non-blocking)

### Fetch Priority:

- **`fetchpriority="high"`**: Tell browser this resource is critical
- Browser prioritizes these over scripts, fonts, etc.

### Preload:

- **`<link rel="preload">`**: Start downloading before parser finds the `<img>`
- Early hint to browser for critical resources

## Testing

To verify the improvements:

1. Open browser DevTools → Network tab
2. Set throttling to "Fast 3G" or "Slow 3G"
3. Reload the page
4. Notice hero image and logo load faster
5. Forest image loads only when you scroll to it

## Additional Recommendations (Optional)

If you want even better performance:

### 1. Convert to WebP format:

```bash
# Can reduce image size by 25-35%
```

### 2. Use responsive images:

```tsx
<img
  srcSet="/hero-small.webp 640w, /hero-medium.webp 1024w, /hero-large.webp 1920w"
  sizes="100vw"
/>
```

### 3. Add blur placeholder:

```tsx
<img
  style={{ backgroundImage: "blur-data-url" }}
  // Shows blur while loading
/>
```

---

**Summary**: Hero images now load **immediately with highest priority**, while below-fold images **lazy-load to save bandwidth**. Preload hints ensure critical images start downloading **before React even loads**! 🚀
