# Logo Update Instructions - PokerMastery Rebranding

## 🎨 Logo Changes Required

### Current Status
- ✅ Code updated to reference `/assets/images/pokermastery-logo.png`
- ✅ Fallback text updated to "POKER MASTERY" (instead of "POKER GRINDER'S EDGE")
- ⚠️ **PENDING**: Physical logo file needs to be created/replaced

### Action Required

1. **Create/obtain the new PokerMastery logo** (PNG format, transparent background recommended)
2. **Place the logo file at**: `/public/assets/images/pokermastery-logo.png`
3. **Recommended specifications**:
   - Format: PNG with transparency
   - Max dimensions: 220x120 pixels (as defined in code)
   - Style: Clean, professional, readable even when semi-transparent (85% opacity)
   - Color scheme: Should work well on dark green felt background

### Current Code References

**File**: `web/src/components/poker/PokerTable.tsx:166-167`
```typescript
<img
  src="/assets/images/pokermastery-logo.png"
  alt="PokerMastery"
```

### Fallback Behavior

If the logo file doesn't exist, the table will display fallback text:
- Line 1: "POKER" (white, large)
- Line 2: "MASTERY" (green, large)
- Line 3: "HAND REPLAYER" (gray, small)

This ensures the app still works even without the logo file.

### Testing

After adding the logo:
1. Navigate to any hand replayer page
2. Check the center of the poker table
3. Logo should be visible with ~85% opacity over the green felt
4. Should not obstruct player positions or cards

---

**Date**: 2025-01-13
**Status**: ⚠️ PENDING - Logo file needs to be created
