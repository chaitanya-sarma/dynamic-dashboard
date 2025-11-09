# Dashboard Builder - Angular 18+

**Version**: 1.7.0  
**Author**: Chaitanya Sarma

A fully functional, customizable drag-and-drop dashboard application built with Angular 18+ using standalone components and signals. Features variable-size widgets that can be moved and resized, similar to Windows Phone (Lumia) home screen.

![Dashboard Builder](https://img.shields.io/badge/Angular-18%2B-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5%2B-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-1.7.0-brightgreen)

## ✨ Features

### Core Functionality
- ✅ **Drag & Drop**: Click and drag widgets to reposition them anywhere on the grid
- ✅ **Resize**: Drag bottom-right corner to resize widgets (1×1 to 12×8 grid units)
- ✅ **Variable Sizes**: Widgets can be any size combination
- ✅ **Collision Detection**: Real-time collision detection prevents overlapping
- ✅ **12-Column Grid**: Flexible grid system with 100px row height
- ✅ **Grid Visualization**: Toggle grid overlay to see layout structure

### Widget Management
- ✅ **Add Widget**: Create new widgets with custom title, type, color, and size
- ✅ **Widget Types**: Choose from multiple widget types (Metrics & Charts, Text Widget)
- ✅ **Color Picker**: Select from 16 beautiful pastel colors
- ✅ **Remove Widget**: Delete widgets with confirmation
- ✅ **Edit Title**: Double-click widget title to edit inline
- ✅ **Refresh Widget**: Click refresh button to update widget data
- ✅ **Drag Handle**: Dedicated grip handle for moving widgets
- ✅ **Auto-Placement**: Automatically finds available space for new widgets

### State Management
- ✅ **Persistence**: Auto-saves to localStorage
- ✅ **Export/Import**: Export and import dashboard layouts as JSON
- ✅ **Reset**: Restore default layout with one click

### User Experience
- ✅ **Keyboard Shortcuts**: Quick actions with keyboard (A to add, G to toggle grid)
- ✅ **Visual Feedback**: Smooth animations and preview during drag/resize
- ✅ **Modern UI**: Clean, professional design with hover effects
- ✅ **Desktop Optimized**: Designed for desktop/laptop screens (1200px+ width)
- ✅ **Mouse-Driven**: Intuitive drag-and-drop with visual feedback

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Angular CLI 18+

### Installation

```bash
# Clone the repository
cd angular-dashboard-app

# Install dependencies
npm install

# Start the development server
npm start
```

Navigate to `http://localhost:4200` in your browser.

## 📖 Usage Guide

### Basic Operations

#### Adding a Widget
1. Click the **"Add Widget"** button in the toolbar (or press **A**)
2. Enter a title for your widget
3. Select a widget type from the dropdown (Metrics & Charts or Text Widget)
4. Choose a color from the 16 available pastel colors
5. Click **"Add Widget"** to confirm

The widget will automatically be sized based on its type and placed in the first available space on the dashboard.

#### Moving Widgets
1. Hover over a widget to reveal the **drag handle** (grip icon, top-right area)
2. Click and hold the drag handle
3. Drag to a new position - you'll see a preview of where it will land
4. Release to drop in place
   - **Dark preview**: Valid position
   - **Red preview**: Collision detected (drop will be cancelled)

#### Resizing Widgets
1. Hover over a widget to reveal the resize handle (bottom-right corner)
2. Click and drag the handle diagonally
3. The preview shows the new size
4. Release to apply the new size
   - **Blue preview**: Valid size
   - **Red preview**: Collision detected (resize will be cancelled)

#### Editing Widget Title
1. Double-click the widget title
2. The title becomes editable
3. Type your new title
4. Press **Enter** or click outside to save

#### Removing Widgets
1. Hover over a widget to reveal the **×** button (top-right corner)
2. Click the × button
3. Confirm the deletion

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **A** | Add new widget |
| **G** | Toggle grid overlay |
| **Enter** | Save when editing widget title |
| **Esc** | Cancel when editing widget title |

### Toolbar Actions

| Button | Description |
|--------|-------------|
| **Add Widget** | Opens dialog to create a new widget |
| **Grid** | Toggles grid visualization overlay |
| **Export** | Downloads current layout as JSON file |
| **Import** | Loads layout from JSON file |
| **Reset** | Restores default sample layout |

## 🏗️ Architecture

### Technology Stack

- **Framework**: Angular 18+ (Standalone Components)
- **State Management**: Angular Signals
- **Language**: TypeScript 5.5+
- **Styling**: Component-scoped CSS
- **Drag & Drop**: Custom mouse event implementation
- **Persistence**: Browser localStorage + JSON export/import

### Project Structure

```
src/app/
├── models/
│   └── widget.model.ts          # Widget interface, Grid config, Color palette
├── services/
│   └── dashboard.service.ts     # State management with signals, CRUD operations
├── components/
│   ├── dashboard/
│   │   └── dashboard.component.ts   # Main dashboard with drag/drop/resize logic
│   └── widget/
│       └── widget.component.ts      # Individual widget component (placeholder)
└── app.component.ts             # Root component
```

### Key Concepts

#### Grid System
- **12 columns** for flexible layouts
- **100px row height** (configurable)
- **16px gap** between widgets
- Widgets span multiple columns and rows

#### Widget Model
```typescript
interface Widget {
  id: string;                              // Unique identifier
  title: string;                           // Display title
  gridPosition: { col: number; row: number };  // 0-indexed position
  gridSize: { colSpan: number; rowSpan: number };  // Size in grid units
  color: string;                           // Hex color
}
```

#### Collision Detection
The application uses rectangle overlap detection to prevent widgets from overlapping during drag and resize operations.

```typescript
// Simplified collision check
checkCollision(position, size, excludeId): boolean {
  // Check if target area overlaps with any existing widget
  // Returns true if collision detected
}
```

## 🎨 Customization

### Changing Grid Configuration

Edit `src/app/models/widget.model.ts`:

```typescript
export const GRID_CONFIG = {
  columns: 12,           // Change number of columns
  rowHeight: 100,        // Change row height in pixels
  gap: 16,               // Change gap between widgets
  minWidgetSize: 1,      // Minimum widget size
  maxWidgetCols: 12,     // Maximum column span
  maxWidgetRows: 8       // Maximum row span
};
```

### Customizing Widget Appearance

Widgets are placeholder components. You can customize them in `src/app/components/widget/widget.component.ts`:

```typescript
// Modify the template to add your content
template: `
  <div class="widget-container" [style.background-color]="widget.color">
    <!-- Add your custom widget content here -->
    <div class="custom-content">
      {{ widget.title }}
    </div>
  </div>
`
```

## 🔧 Advanced Features

### Export/Import Layouts

Export your dashboard configuration:

```typescript
exportLayout() {
  const config = this.dashboardService.exportConfiguration();
  // Returns JSON string with version, timestamp, and widgets
}
```

Import a saved layout:

```typescript
importLayout(jsonString: string) {
  this.dashboardService.importConfiguration(jsonString);
}
```

### Programmatic Widget Management

Add widgets programmatically:

```typescript
const newWidget: Widget = {
  id: Date.now().toString(),
  title: 'My Widget',
  gridPosition: { col: 0, row: 0 },
  gridSize: { colSpan: 2, rowSpan: 1 },
  color: '#667eea'
};

dashboardService.addWidget(newWidget);
```

### Auto-Placement Algorithm

The service automatically finds available positions:

```typescript
const position = dashboardService.findAvailablePosition({
  colSpan: 2,
  rowSpan: 2
});
// Returns first available position in top-to-bottom, left-to-right order
```

## 🐛 Troubleshooting

### Widgets Not Dragging
- Ensure you're clicking on the widget body, not on buttons or resize handle
- Check browser console for errors
- Verify mouse events are not being prevented

### Layout Not Saving
- Check browser localStorage permissions
- Open browser DevTools → Application → Local Storage
- Look for key: `dashboard-widgets-v2`

### Collision Detection Issues
- Toggle grid overlay (press G) to visualize layout
- Check widget positions don't overlap in saved state
- Reset to default layout if corrupted

### Performance Issues with Many Widgets
- The app is optimized for 50-100 widgets
- For larger dashboards, consider:
  - Reducing animations (check browser settings for "prefers-reduced-motion")
  - Using simpler widget designs
  - Paginating or filtering widgets

## 🌐 Browser Support

| Browser | Support |
|---------|---------|
| Chrome/Edge | ✅ Full support |
| Firefox | ✅ Full support |
| Safari | ✅ Full support |
| IE11 | ❌ Not supported |

### Accessibility & Device Support

**Desktop-First Design**: This application is optimized for desktop and laptop use with a mouse. The minimum recommended screen width is **1200px**.

**Not Currently Supported**:
- ❌ **Screen Readers**: The application does not include ARIA labels or screen reader support
- ❌ **Keyboard-Only Navigation**: Drag-and-drop requires mouse input
- ❌ **Touch Devices**: Not optimized for tablets or mobile devices
- ❌ **Small Screens**: Grid has fixed 1200px minimum width

**Future Considerations**: These features may be added in future versions based on user demand.

## 📝 Development

### Build for Production

```bash
npm run build:prod
```

Output will be in the `dist/` directory.

### Run Tests

```bash
npm test
```

### Code Quality

```bash
# Lint
ng lint

# Format
npm run format
```

## 📚 Documentation

- **[README.md](README.md)** - User guide and feature overview (this file)
- **[DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)** - Complete developer guide: architecture, adding widgets, customization
- **[LESSONS_LEARNED.md](LESSONS_LEARNED.md)** - Architectural decisions and best practices

## 🚦 Future Enhancements

Potential features for future versions:

- [ ] Undo/Redo functionality with action history
- [ ] More widget types (charts, calendars, tasks, weather, etc.)
- [ ] Widget templates/library
- [ ] Multi-page dashboards with tabs
- [ ] Dark mode support
- [ ] Widget locking (prevent accidental moves)
- [ ] Snap-to-widget alignment
- [ ] Copy/duplicate widgets
- [ ] Touch device support
- [ ] Responsive layout for mobile devices
- [ ] Widget grouping
- [ ] Custom widget types with data binding
- [ ] Responsive design for tablets and mobile
- [ ] Screen reader support and ARIA labels
- [ ] Keyboard-only navigation
- [ ] Touch device support
- [ ] Real-time collaboration
- [ ] Cloud storage for layouts

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👏 Acknowledgments

- Inspired by Windows Phone (Lumia) home screen design
- Built with Angular 18+ and modern web standards
- Uses Angular Signals for reactive state management

## 📧 Support

For questions or issues, please open an issue on GitHub or contact the maintainers.

---

**Made with ❤️ using Angular 18+**
