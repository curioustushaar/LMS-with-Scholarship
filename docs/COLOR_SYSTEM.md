# Color System Documentation - LMS Admin

## 🎨 Global Color Variables

All color codes have been extracted and organized into CSS variables in `src/app/globals.css`.

---

## 📋 Color Categories

### 1️⃣ **Brand Colors (Primary Theme)**

| Variable | Value | Usage |
|----------|-------|-------|
| `--brand-primary` | `#C81E4E` | Main brand color (primary red) |
| `--brand-primary-light` | `#D91E5B` | Lighter shade for gradients |
| `--brand-primary-dark` | `#A01840` | Darker shade for hover states |
| `--brand-red` | `#C81E4E` | Legacy support |
| `--brand-pink` | `#D91E5B` | Legacy support |

**CSS Classes:**
- `.bg-brand` - Brand background
- `.text-brand` - Brand text color
- `.bg-brand-gradient` - Brand gradient background
- `.btn-primary` - Primary button with gradient

**Tailwind Usage:**
```jsx
className="bg-brand-primary text-white"
className="border-brand-primary"
className="text-brand-light"
```

---

### 2️⃣ **Success Colors (Green)**

| Shade | Variable | Value |
|-------|----------|-------|
| 50 | `--success-50` | `#f0fdf4` |
| 100 | `--success-100` | `#dcfce7` |
| 500 | `--success-500` | `#22c55e` |
| 600 | `--success-600` | `#16a34a` |
| 800 | `--success-800` | `#166534` |

**CSS Classes:**
- `.badge-success` - Green badge
- `.alert-success` - Success alert box

**Tailwind Usage:**
```jsx
className="bg-success-100 text-success-800"
className="border-success-500"
```

**Use Cases:**
- Approved status
- Completion indicators
- Success messages
- Active badges

---

### 3️⃣ **Warning Colors (Yellow)**

| Shade | Variable | Value |
|-------|----------|-------|
| 50 | `--warning-50` | `#fefce8` |
| 100 | `--warning-100` | `#fef9c3` |
| 500 | `--warning-500` | `#eab308` |
| 800 | `--warning-800` | `#854d0e` |

**CSS Classes:**
- `.badge-warning` - Yellow badge
- `.alert-warning` - Warning alert box

**Tailwind Usage:**
```jsx
className="bg-warning-100 text-warning-800"
```

**Use Cases:**
- Pending status
- Caution messages
- Draft items

---

### 4️⃣ **Danger Colors (Red)**

| Shade | Variable | Value |
|-------|----------|-------|
| 50 | `--danger-50` | `#fef2f2` |
| 100 | `--danger-100` | `#fee2e2` |
| 500 | `--danger-500` | `#ef4444` |
| 800 | `--danger-800` | `#991b1b` |

**CSS Classes:**
- `.badge-danger` - Red badge
- `.alert-danger` - Error alert box

**Tailwind Usage:**
```jsx
className="bg-danger-50 text-danger-800"
className="text-danger-500" // For required asterisks
```

**Use Cases:**
- Rejected status
- Error messages
- Delete actions
- Required field indicators

---

### 5️⃣ **Info Colors (Blue)**

| Shade | Variable | Value |
|-------|----------|-------|
| 50 | `--info-50` | `#eff6ff` |
| 100 | `--info-100` | `#dbeafe` |
| 500 | `--info-500` | `#3b82f6` |
| 800 | `--info-800` | `#1e40af` |

**CSS Classes:**
- `.badge-info` - Blue badge
- `.alert-info` - Info alert box

**Tailwind Usage:**
```jsx
className="bg-info-100 text-info-800"
```

**Use Cases:**
- Submitted status
- Information messages
- Help text

---

### 6️⃣ **Progress Colors (Orange)**

| Shade | Variable | Value |
|-------|----------|-------|
| 100 | `--progress-100` | `#ffedd5` |
| 500 | `--progress-500` | `#f97316` |
| 800 | `--progress-800` | `#9a3412` |

**CSS Classes:**
- `.badge-progress` - Orange badge

**Tailwind Usage:**
```jsx
className="bg-progress-100 text-progress-800"
```

**Use Cases:**
- In-progress status
- Loading indicators

---

### 7️⃣ **Gray Scale (Neutral)**

| Shade | Variable | Value | Usage |
|-------|----------|-------|-------|
| 50 | `--gray-50` | `#f9fafb` | Very light backgrounds |
| 100 | `--gray-100` | `#f3f4f6` | Light backgrounds |
| 300 | `--gray-300` | `#d1d5db` | Borders |
| 500 | `--gray-500` | `#6b7280` | Secondary text |
| 800 | `--gray-800` | `#1f2937` | Primary text |

**Tailwind Usage:**
```jsx
className="bg-gray-50 text-gray-800"
className="border-gray-300"
```

---

### 8️⃣ **Semantic Variables**

#### Background Colors:
```css
--bg-primary: #ffffff     /* White backgrounds */
--bg-secondary: #f5f5f5   /* Light gray backgrounds */
--bg-tertiary: #f9fafb    /* Very light backgrounds */
--bg-dark: #1f2937        /* Dark backgrounds */
```

**Tailwind Usage:**
```jsx
className="bg-primary"
className="bg-secondary"
```

#### Text Colors:
```css
--text-primary: #111827   /* Main text */
--text-secondary: #6b7280 /* Secondary text */
--text-tertiary: #9ca3af  /* Muted text */
--text-light: #ffffff     /* Light text */
--text-brand: var(--brand-primary)
```

**Tailwind Usage:**
```jsx
className="text-primary"
className="text-secondary"
```

#### Border Colors:
```css
--border-light: #e5e7eb
--border-medium: #d1d5db
--border-dark: #9ca3af
--border-brand: var(--brand-primary)
```

**Tailwind Usage:**
```jsx
className="border-light"
className="border-brand"
```

---

## 🎨 Pre-built Component Classes

### Buttons:
```jsx
<button className="btn-primary">Primary Button</button>
<button className="btn-secondary">Secondary Button</button>
```

### Cards:
```jsx
<div className="card">Card Content</div>
```

### Form Inputs:
```jsx
<input className="input-field" />
```

### Tabs:
```jsx
<button className="tab-active">Active Tab</button>
<button className="tab-inactive">Inactive Tab</button>
```

### Badges:
```jsx
<span className="badge-success">Success</span>
<span className="badge-warning">Warning</span>
<span className="badge-danger">Danger</span>
<span className="badge-info">Info</span>
<span className="badge-progress">In Progress</span>
```

### Alerts:
```jsx
<div className="alert-success">Success message</div>
<div className="alert-warning">Warning message</div>
<div className="alert-danger">Error message</div>
<div className="alert-info">Info message</div>
```

---

## 📝 Migration Guide

### Before (Hardcoded):
```jsx
className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B]"
className="text-[#C81E4E]"
className="bg-green-100 text-green-800"
```

### After (Using Variables):
```jsx
className="bg-brand-gradient"
className="text-brand"
className="bg-success-100 text-success-800"
```

Or using CSS classes:
```jsx
className="btn-primary"
className="badge-success"
className="alert-danger"
```

---

## ✅ Benefits

1. **Consistency**: Single source of truth for all colors
2. **Maintainability**: Change one variable, update entire app
3. **Theming**: Easy to implement dark mode or alternative themes
4. **Performance**: Reusable CSS classes reduce bundle size
5. **Developer Experience**: Semantic naming makes code readable

---

## 🔄 Usage Examples

### Status Badge (Before & After):

**Before:**
```jsx
<span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
  Approved
</span>
```

**After:**
```jsx
<span className="badge-success">Approved</span>
```

### Brand Button (Before & After):

**Before:**
```jsx
<button className="bg-gradient-to-r from-[#C81E4E] to-[#D91E5B] text-white px-6 py-3 rounded-lg">
  Submit
</button>
```

**After:**
```jsx
<button className="btn-primary">Submit</button>
```

---

## 📁 File Locations

- **CSS Variables**: `src/app/globals.css`
- **Tailwind Config**: `tailwind.config.ts`
- **Documentation**: `COLOR_SYSTEM.md` (this file)

---

## 🎯 Quick Reference

| Use Case | CSS Class | Tailwind Class |
|----------|-----------|----------------|
| Primary button | `.btn-primary` | `bg-brand-primary` |
| Success badge | `.badge-success` | `bg-success-100 text-success-800` |
| Error message | `.alert-danger` | `bg-danger-50 border-danger-200` |
| Brand text | `.text-brand` | `text-brand-primary` |
| Card container | `.card` | `bg-primary rounded-xl shadow-md` |
| Input field | `.input-field` | - |

---

**Maintained by:** LMS Admin Team  
**Last Updated:** February 17, 2026
