# ShoreSquad - Beach Cleanup Community App

Rally your crew, track weather, and hit the next beach cleanup!

## 🌊 Project Overview

ShoreSquad is a web application that mobilizes young people to clean beaches through interactive mapping, real-time weather data, and social crew features. It combines environmental impact with community building.

### Brand Values
- **Dope & Energetic** - Fun, youth-focused language and design
- **Accessible** - Inclusive for all skill levels and abilities
- **Data-Driven** - Real-time weather and location intelligence
- **Community-First** - Social features and team dynamics

## 🎨 Design System

### Color Palette
- **Primary Ocean Blue** (#0066CC) - Trust, water
- **Vibrant Teal** (#00BCD4) - Modern, eco-forward
- **Coral** (#FF6B6B) - Energy and action
- **Seafoam Green** (#2ECC71) - Environmental growth
- **Sandy Beach** (#F4D03F) - Warmth and optimism

### Typography
- Font: Poppins (Modern, geometric, youth-friendly)
- Weight: 400 (Regular), 600 (Semibold), 700 (Bold), 800 (Extra Bold)

## ⚡ Features & Technology

### Interactive Features
1. **Interactive Map** - Leaflet.js for beach cleanup locations
2. **Geolocation** - Find cleanups near your location
3. **Real-Time Weather** - Open-Meteo API for coastal forecasts
4. **Crew Management** - Build and manage eco-warrior teams
5. **Impact Tracking** - Stats on cleanups, trash removed, squad growth
6. **Local Storage** - Persist crew data and statistics

### Performance Optimizations
- Lazy loading for images
- Service Worker for offline support
- Debounced event handlers
- Optimized animations (prefers-reduced-motion support)
- Mobile-first responsive design

### Accessibility (WCAG AA)
- Semantic HTML5
- ARIA labels and live regions
- Focus management
- Keyboard navigation
- High contrast colors (4.5:1 ratio)
- Reduced motion preferences
- Clear form labels

## 📁 Project Structure

```
ShoreSquad/
├── index.html           # HTML5 boilerplate
├── css/
│   └── styles.css      # Complete design system + responsive styles
├── js/
│   ├── app.js          # Main application logic
│   └── sw.js           # Service Worker (offline support)
├── .gitignore          # Git configuration
├── .vscode/
│   └── launch.json     # Live Server debug config
└── README.md           # This file
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Live Server extension (VS Code) or local HTTP server
- Node.js (optional, for build tools in future)

### Installation

1. Clone or download the repository:
```bash
git clone https://github.com/yourusername/ShoreSquad.git
cd ShoreSquad
```

2. Install Live Server (VS Code):
   - Open VS Code Extensions (Ctrl+Shift+X / Cmd+Shift+X)
   - Search "Live Server"
   - Install by Ritwick Dey
   - Right-click `index.html` → "Open with Live Server"

3. Or use Python's built-in server:
```bash
python -m http.server 5500
```

4. Navigate to `http://localhost:5500`

## 💻 JavaScript Features & APIs

### Geolocation API
```javascript
navigator.geolocation.getCurrentPosition(position => {
    const { latitude, longitude } = position.coords;
    // Update map to user location
});
```

### Fetch API with Weather
```javascript
fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}...`)
    .then(response => response.json())
    .then(data => updateWeatherUI(data));
```

### LocalStorage for Persistence
```javascript
localStorage.setItem('crews', JSON.stringify(appState.crews));
const crews = JSON.parse(localStorage.getItem('crews'));
```

### Service Worker (Offline Support)
- Caches assets on first visit
- Serves cached content when offline
- Updates cache in background

### Intersection Observer (Lazy Loading)
- Lazy loads images on viewport visibility
- Improves initial page load performance

## 🎯 UX Design Principles Implemented

### 1. Mobile-First Design
- Touch-friendly button sizes (48px minimum)
- Stackable layout on small screens
- Responsive typography

### 2. Intuitive Navigation
- Sticky header for easy navigation
- Clear CTA hierarchy (Primary > Secondary)
- Hamburger menu for mobile

### 3. Micro-interactions
- Hover effects on buttons and cards
- Smooth transitions and animations
- Loading spinners for async operations

### 4. Performance
- Sub-3 second initial load
- Lazy loading for non-critical assets
- Optimized CSS animations

### 5. Accessibility
- WCAG AA color contrast (4.5:1 minimum)
- Keyboard navigation (Tab, Enter, Escape)
- Screen reader support with ARIA labels
- Focus indicators on all interactive elements

### 6. Visual Hierarchy
- Size, color, and spacing guide attention
- Important info uses primary colors
- Secondary info in muted colors

## 📊 Data Structures

### Crew Object
```javascript
{
    id: 1234567890,
    name: "Beach Warriors",
    members: [
        { name: "Alex", avatar: "👤" },
        { name: "Jordan", avatar: "👤" }
    ],
    cleanups: 5,
    trashCollected: 142,
    joinDate: "12/1/2025"
}
```

### Cleanup Event
```javascript
{
    id: 1,
    title: "Sunset Beach Cleanup",
    lat: 34.0,
    lng: -118.5,
    date: "2025-12-15",
    time: "09:00 AM",
    description: "Monthly cleanup event..."
}
```

## 🔧 Development Commands

### Using Live Server (VS Code)
- Right-click `index.html` → "Open with Live Server"
- Auto-reloads on file changes
- Shows live URL in status bar

### Using npm (Future setup)
```bash
npm install
npm run dev      # Development server
npm run build    # Production build
npm run lint     # Code quality check
```

## 🧪 Testing in Browser Console

```javascript
// View app state
ShoreSquad.state

// Create test crew
ShoreSquad.createTestCrew()

// Simulate cleanup activity
ShoreSquad.simulateCleanup()

// Track stats updates
console.log(ShoreSquad.state.stats)
```

## 🌐 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 90+     | ✅ Full Support |
| Firefox | 88+     | ✅ Full Support |
| Safari  | 14+     | ✅ Full Support |
| Edge    | 90+     | ✅ Full Support |
| Mobile  | Latest  | ✅ Optimized |

## 📝 Git Workflow

### Initial Setup
```bash
git init
git add .
git commit -m "Initial ShoreSquad project setup"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### Daily Workflow
```bash
git status
git add <files>
git commit -m "Descriptive message"
git push
```

### .gitignore Patterns
```
node_modules/          # NPM dependencies
.DS_Store             # macOS files
*.log                 # Log files
dist/                 # Build output
.env                  # Environment variables
.vscode/              # VS Code config (optional)
```

## 🚀 Deployment

### GitHub Pages
```bash
# Push to gh-pages branch
git subtree push --prefix . origin gh-pages
```

### Netlify
1. Connect GitHub repository
2. Build command: (leave blank)
3. Publish directory: `/`
4. Deploy!

### Vercel
1. Import project from GitHub
2. Vercel auto-detects static site
3. Deploy with one click

## 📱 Progressive Web App (Future)

Add to manifest.json for PWA support:
```json
{
    "name": "ShoreSquad",
    "short_name": "ShoreSquad",
    "description": "Beach Cleanup Community",
    "start_url": "/",
    "display": "standalone",
    "theme_color": "#0066CC"
}
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - feel free to use ShoreSquad for your beach cleanup initiatives!

## 🌊 Questions & Support

- 📧 Email: hello@shoresquad.com
- 🐦 Twitter: @ShoreSquadApp
- 💬 Discord: [Join our community]

---

**Rally your crew. Protect our shores. Make waves together! 🌊♻️**
