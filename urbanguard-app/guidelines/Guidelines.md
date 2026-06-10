# UrbanGuard Design System

## Aesthetic Stance

**Swiss + Data-Dense Civic Utility**

This mobile app combines Swiss functionalism (precise alignment, strict hierarchy, minimal decoration) with the clarity demanded by civic infrastructure reporting. The interface prioritizes legibility, trustworthiness, and speed of interaction over visual flourish.

## Typography

- **Display**: Inter (neo-grotesque, functional, government-appropriate)
- **Body**: Inter (maintains consistency across all UI elements)
- **Mono**: JetBrains Mono (for numeric data, coordinates, IDs)

## Color Palette

**Light Mode (Primary):**
- Background: `#F8F9FA` (soft neutral gray, reduces eye strain on mobile)
- Surface: `#FFFFFF` (cards, drawers, overlays)
- Primary: `#0066CC` (civic blue, trustworthy, accessible)
- Primary Hover: `#0052A3`
- Danger/Priority: `#D32F2F` (for high-severity incidents)
- Warning: `#F57C00` (medium-priority)
- Success: `#388E3C` (resolved incidents)
- Text Primary: `#1A1A1A`
- Text Secondary: `#616161`
- Border: `rgba(0, 0, 0, 0.12)`

**Map Pins:**
- High Priority (8-10): `#D32F2F`
- Medium Priority (5-7): `#F57C00`
- Low Priority (1-4): `#FBC02D`
- Resolved: `#388E3C`

## Layout Principles

1. **Mobile-first**: All interactions optimized for thumb reach and touch targets (minimum 44×44px)
2. **Map dominance**: Full-screen map with floating UI elements to maximize spatial context
3. **Bottom-sheet pattern**: Primary incident details in a draggable bottom drawer
4. **Consistent spacing**: 8px grid (8, 16, 24, 32px increments)
5. **High contrast**: All text meets WCAG AA standards (4.5:1 minimum)

## Component Patterns

### Floating Search Bar
- Height: 56px
- Border radius: 28px
- Shadow: `0 2px 8px rgba(0, 0, 0, 0.12)`
- Background: white with slight backdrop blur
- Horizontal padding: 16px
- Icons: 24×24px, touch target 44×44px

### Map Pins
- Size: 40×48px (larger than typical to accommodate severity indicators)
- Drop shadow for elevation
- White border (2px) for visibility against varied map backgrounds
- Severity number badge in white text

### Bottom Sheet
- Header handle: 32×4px, centered, 8px from top
- Corner radius: 16px (top only)
- Content padding: 24px horizontal, 16px vertical
- Shadow: `0 -4px 16px rgba(0, 0, 0, 0.1)`

### Status Badges
- Height: 24px
- Border radius: 4px
- Padding: 4px 8px
- Font size: 12px
- Font weight: 600
- All caps

### Primary CTA Button
- Height: 48px
- Border radius: 8px
- Full width within container
- Background: primary blue
- Font weight: 600

### Bottom Navigation
- Height: 64px (includes safe area padding)
- Item spacing: evenly distributed
- Icon size: 24×24px
- Active state: primary color
- Inactive state: `#9E9E9E`
- Center FAB: 56×56px, elevated 8px above nav bar

## Interactions

- Tap feedback: 0.15s opacity shift to 0.6
- Bottom sheet drag: spring animation (stiffness: 300, damping: 30)
- Map pan/zoom: native gesture handling
- Nav transition: 0.2s ease-in-out

## Accessibility

- All interactive elements: minimum 44×44px touch target
- Color contrast: 4.5:1 for text, 3:1 for UI components
- Focus indicators: 2px solid ring in primary color
- Screen reader labels for all icons and map pins
- Emergency/priority items: redundant color + text + icon coding
