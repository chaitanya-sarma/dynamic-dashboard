# Development Guide

**Version**: 1.6.0  
**Last Updated**: 2025-11-09

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Project Structure](#project-structure)
3. [Architecture](#architecture)
4. [Adding New Widgets](#adding-new-widgets)
5. [Widget Colors](#widget-colors)
6. [Development Workflow](#development-workflow)
7. [Building & Deployment](#building--deployment)

---

## Quick Start

### Prerequisites
- Node.js 18+
- Angular CLI 18+

### Installation & Run
```bash
cd angular-dashboard-app
npm install
npm start
```

Application runs at `http://localhost:4200`

---

## Project Structure

```
angular-dashboard-app/
├── src/app/
│   ├── components/
│   │   ├── dashboard/           # Main dashboard container (grid logic)
│   │   ├── dashboard-header/    # Dashboard header (UI only)
│   │   ├── widget-template/     # Widget container (drag, resize, header)
│   │   ├── widgets/             # All widget implementations
│   │   │   ├── widget-1/        # Metrics & Charts
│   │   │   └── widget-2/        # Text Widget
│   │   └── debug-panel/         # Debug panel (temporary)
│   ├── models/
│   │   ├── widget.model.ts      # Widget types and config
│   │   └── widget-content.interface.ts  # Base interface
│   ├── services/
│   │   ├── dashboard.service.ts    # Widget state management
│   │   └── widget-registry.service.ts  # Widget registry
│   └── directives/
│       └── widget-content-host.directive.ts  # Dynamic loading
├── DEVELOPMENT_GUIDE.md         # This file
├── LESSONS_LEARNED.md           # Development lessons & bug fixes
└── README.md                    # User documentation
```

---

## Architecture

### Overview

The application uses a **simple, clean widget architecture**:

1. **Widget Template** - Container providing UI chrome (header, drag, resize)
2. **Widget Content** - Actual widget implementation (your custom logic)
3. **Widget Registry** - Maps widget types to components
4. **Dashboard Service** - Manages widget state

### Component Flow

```
App Component (global coordinator)
├── Export/Import/Reset (file I/O + confirmations)
└── Dashboard Component (grid & state management)
    ├── Dashboard Header (toolbar UI)
    └── Dashboard Container (grid)
        └── Widget Template (container)
            └── Dynamic Component Loader
                └── Widget Registry Lookup
                    └── Widget-1 or Widget-2 (content)
```

### Separation of Concerns

**App Component** - Global coordination, file I/O, confirmations  
**Dashboard Component** - Grid logic, drag/drop, collision detection  
**Dashboard Header** - Simple UI component, emits events  
**Widget Template** - Widget container with drag handle and controls  
**Widget Content** - Actual widget implementation (widget-1, widget-2, etc.)

### Key Files

#### 1. Widget Model
**File**: `src/app/models/widget.model.ts`

Defines:
- `WidgetType` - Available widget types
- `Widget` interface - Widget structure
- `WIDGET_TYPES` - Widget metadata
- `WIDGET_COLOR_PALETTE` - 16 pastel colors
- `getRandomWidgetColor()` - Color helper

#### 2. Base Interface
**File**: `src/app/models/widget-content.interface.ts`

```typescript
export abstract class BaseWidgetContent {
  abstract refresh(): void;
}
```

All widgets MUST implement this.

#### 3. Widget Registry
**File**: `src/app/services/widget-registry.service.ts`

Maps types to components:
```typescript
export const WIDGET_REGISTRY: Map<WidgetType, Type<any>> = new Map([
  ['widget-1', Widget1Component],
  ['widget-2', Widget2Component]
]);
```

#### 4. Dashboard Service
**File**: `src/app/services/dashboard.service.ts`

Manages:
- Widget CRUD operations
- Position calculations
- Collision detection
- LocalStorage persistence
- Default widget initialization

---

## Adding New Widgets

### Step 1: Create Component

Create folder: `src/app/components/widgets/widget-3/`

**widget-3.component.ts**:
```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseWidgetContent } from '../../../models/widget-content.interface';

@Component({
  selector: 'app-widget-3',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './widget-3.component.html',
  styleUrls: ['./widget-3.component.css']
})
export class Widget3Component extends BaseWidgetContent {
  myData = 'Hello World';
  
  refresh(): void {
    // Update your data here
    this.myData = `Updated at ${new Date().toLocaleTimeString()}`;
  }
}
```

### Step 2: Register Widget

**File**: `src/app/services/widget-registry.service.ts`

```typescript
// 1. Import
import { Widget3Component } from '../components/widgets/widget-3/widget-3.component';

// 2. Add to registry
export const WIDGET_REGISTRY: Map<WidgetType, Type<any>> = new Map([
  ['widget-1', Widget1Component],
  ['widget-2', Widget2Component],
  ['widget-3', Widget3Component]  // ← Add here
]);
```

### Step 3: Add Type Definition

**File**: `src/app/models/widget.model.ts`

```typescript
// 1. Add to WidgetType
export type WidgetType = 
  | 'widget-1'
  | 'widget-2'
  | 'widget-3';  // ← Add here

// 2. Add to WIDGET_TYPES array
export const WIDGET_TYPES: WidgetTypeMetadata[] = [
  // ... existing types
  {
    type: 'widget-3',
    label: 'My Widget',
    description: 'Does something cool',
    icon: 'star',
    defaultSize: { colSpan: 2, rowSpan: 2 }
  }
];
```

### Step 4: Done!

Widget now appears in the "Add Widget" dropdown.

---

## Widget Colors

### Color Picker

Users select from 16 pastel colors when adding widgets:
- Visual grid (8×2)
- Hover effects
- Selected indicator
- Pre-selected random color

### Color Palette

**File**: `src/app/models/widget.model.ts`

```typescript
export const WIDGET_COLOR_PALETTE = [
  '#e3f2fd', // Light Blue
  '#f3e5f5', // Light Purple
  '#e8f5e9', // Light Green
  '#fff3e0', // Light Orange
  '#fce4ec', // Light Pink
  '#e0f2f1', // Light Teal
  '#f1f8e9', // Light Lime
  '#fff9c4', // Light Yellow
  '#ffeaa7', // Light Peach
  '#dfe6e9', // Light Gray
  '#fab1a0', // Light Coral
  '#74b9ff', // Sky Blue
  '#a29bfe', // Light Lavender
  '#fd79a8', // Light Rose
  '#fdcb6e', // Light Gold
  '#e17055'  // Light Terracotta
];
```

### Customization

To change colors, edit `WIDGET_COLOR_PALETTE` array.

To assign specific colors by type:
```typescript
const typeColors = {
  'widget-1': '#e3f2fd',
  'widget-2': '#f3e5f5',
  'widget-3': '#e8f5e9'
};
```

---

## Development Workflow

### Running Development Server

```bash
npm start
```

Runs on `http://localhost:4200` with hot reload.

### Code Organization

- **Components**: UI logic and templates
- **Services**: State management and business logic
- **Models**: TypeScript interfaces and types
- **Directives**: Reusable DOM manipulation

### Adding Features

1. **Plan the feature** - Decide what needs to change
2. **Identify the right component**:
   - Header buttons/UI → `dashboard-header`
   - Grid behavior → `dashboard`
   - Widget chrome → `widget-template`
   - Widget content → `widgets/widget-x`
3. **Update models/interfaces** if needed
4. **Implement component logic** in the right place
5. **Add styles** to the component's CSS file
6. **Test functionality**
7. **Update documentation**

### Component Responsibilities

**Dashboard Header** (`dashboard-header/`):
- Header UI (title, buttons, toolbar)
- User actions (add, export, import, reset, debug)
- Emits events to dashboard component
- ❌ No business logic
- ❌ No state management

**Dashboard** (`dashboard/`):
- Grid layout and positioning
- Drag & drop logic
- Resize logic
- Collision detection
- Widget CRUD operations
- State management (via service)
- ❌ Should not handle header UI

**Widget Template** (`widget-template/`):
- Widget container (border, background)
- Title bar with controls
- Drag handle
- Resize handle
- Dynamic content loading
- ❌ No widget-specific logic

**Widgets** (`widgets/widget-x/`):
- Widget-specific functionality
- Data display
- Refresh logic
- ❌ No drag/drop or resize logic

### Debugging

**Debug Panel**: Click bug icon in dashboard header
- View widget state
- Inspect positions
- Check collisions
- Clear storage

### State Management

- Uses Angular Signals for reactivity
- LocalStorage for persistence
- Immutable state updates
- Deep cloning to prevent mutation

---

## Building & Deployment

### Build for Production

```bash
npm run build
```

Output: `dist/angular-dashboard-app/`

### Build Stats
```
Initial Bundle:
├── main.js: ~221 kB (59 kB gzipped)
├── polyfills.js: ~35 kB (11 kB gzipped)
└── styles.css: ~2 kB (680 bytes gzipped)
Total: ~258 kB (~71 kB gzipped)
```

### Deployment

1. Build for production
2. Deploy `dist/angular-dashboard-app/` folder
3. Configure server for SPA routing
4. Serve with:
   - Apache/Nginx
   - Netlify/Vercel
   - Firebase Hosting
   - AWS S3 + CloudFront

### Environment Configuration

Update `environment.ts` for different environments:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.example.com'
};
```

---

## Best Practices

### Code Style
- Use TypeScript strict mode
- Follow Angular style guide
- Use standalone components
- Prefer signals over observables for simple state

### Component Design
- Keep components small and focused
- Use smart/dumb component pattern
- Implement proper cleanup (OnDestroy)
- Use change detection strategically

### State Management
- Immutable updates only
- Use computed signals for derived state
- Keep state minimal
- Avoid deep nesting

### Performance
- Lazy load when possible
- Use trackBy in loops
- Minimize re-renders
- Profile with Angular DevTools

---

## Troubleshooting

### Common Issues

**Issue**: Widget not appearing in dropdown  
**Solution**: Check widget is registered in `widget-registry.service.ts` and type added to `widget.model.ts`

**Issue**: Refresh button not working  
**Solution**: Ensure widget extends `BaseWidgetContent` and implements `refresh()`

**Issue**: Colors not showing  
**Solution**: Check color value in widget data, verify CSS applies `background-color`

**Issue**: Build errors  
**Solution**: Run `npm run build` and check console for specific errors

### Getting Help

1. Check `LESSONS_LEARNED.md` for solved issues
2. Review component code
3. Use Debug Panel to inspect state
4. Check browser console for errors

---

## Resources

- [Angular Documentation](https://angular.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [RxJS Documentation](https://rxjs.dev/)

---

**Happy Coding!** 🚀

