# 🚀 ShoreSquad Quick Start Guide

## Launch in 30 Seconds

### Option 1: VS Code Live Server (Easiest)
1. **Open folder** in VS Code: `c:\C240 STUFF\ShoreSquad`
2. **Right-click** `index.html`
3. **Click** "Open with Live Server"
4. **Boom!** 🎉 Site opens at `http://localhost:5500`

### Option 2: Command Line
```bash
cd "c:\C240 STUFF\ShoreSquad"
python -m http.server 5500
```
Then open `http://localhost:5500` in your browser.

---

## 🧪 Try These Features

### 1. Interactive Map
- Click **"Start Cleanup Quest"** button
- Click **"📍 My Location"** to use geolocation
- Click beach markers to view cleanup details
- Click **"Join This Crew"** to register

### 2. Weather
- Scroll down to see live coastal weather
- Weather updates for multiple beach locations
- Real wind speed and temperature data

### 3. Crew Management
- Go to "Your Squad" section
- Enter crew name, click **"Create Crew"**
- Click **"Invite"** to add members
- Click **"Details"** to view crew stats

### 4. Impact Tracking
- View real-time stats at bottom
- Click **"Details"** to see all crew info
- Stats persist when you refresh the page

### 5. Test Mode (Console)
```javascript
// Open DevTools: F12 or Ctrl+Shift+I

ShoreSquad.createTestCrew()           // Create demo crew
ShoreSquad.simulateCleanup()          // Add cleanup event
ShoreSquad.state                       // View app data
```

---

## 📱 Responsive Design

### Mobile View
Resize browser window or use DevTools (F12 → Device Toolbar):
- ✅ Hamburger menu on small screens
- ✅ Touch-friendly buttons
- ✅ Stacked layout
- ✅ Full map functionality

### Desktop View
- ✅ Multi-column layouts
- ✅ Hover effects
- ✅ Optimized spacing

---

## 🎨 Design Features

### Colors Used
- 🔵 Ocean Blue: `#0066CC` (primary)
- 🩵 Vibrant Teal: `#00BCD4` (secondary)
- 🪸 Coral: `#FF6B6B` (action)
- 🟢 Seafoam Green: `#2ECC71` (success)

### Animations
- Wave effect in hero section
- Smooth button transitions
- Card hover effects
- Loading spinner

---

## ⚙️ Project Files Overview

| File | Purpose | Lines |
|------|---------|-------|
| `index.html` | Page structure | 400+ |
| `css/styles.css` | Styling & design | 1000+ |
| `js/app.js` | Functionality | 500+ |
| `sw.js` | Offline support | 60+ |
| `.gitignore` | Version control | 10 |
| `package.json` | Project metadata | 25 |
| `README.md` | Full documentation | 200+ |

---

## 🌐 APIs Used

| API | Purpose | Status |
|-----|---------|--------|
| Geolocation | Get user location | ✅ Active |
| Leaflet.js | Interactive maps | ✅ Active |
| Open-Meteo | Weather data | ✅ Active |
| LocalStorage | Save user data | ✅ Active |
| Service Worker | Offline support | ✅ Active |

---

## 🎯 Key Features

✨ **Interactive Map**
- Click markers to view cleanup details
- Geolocation to find nearby events
- Distance calculation to events

🌤️ **Real Weather**
- Live temperature data
- Wind speed tracking
- Multi-location forecasts
- No API key required

👥 **Crew Management**
- Create teams
- Invite members
- Track team stats
- Data persists locally

📊 **Impact Tracking**
- Cleanup count
- Trash removed (kg)
- Squad member count
- Beaches protected

---

## 🔍 Accessibility Features

✅ Keyboard navigation (Tab, Enter)
✅ High contrast colors (WCAG AA)
✅ ARIA labels for screen readers
✅ Focus indicators on buttons
✅ Prefers-reduced-motion support
✅ Mobile optimized (touch-friendly)

---

## 💾 Data Persistence

All data saved locally in your browser:
- **Crews** - LocalStorage
- **Stats** - LocalStorage
- **Settings** - LocalStorage

Data **survives page refresh** but clears if cache is cleared.

---

## 🐛 Troubleshooting

### "Map not loading"
- Check internet connection
- Allow geolocation permission
- Try refreshing page

### "Weather shows loading"
- Ensure geolocation is enabled
- Check network tab in DevTools
- Wait a few seconds for API response

### "Crews not saving"
- Check LocalStorage is enabled
- Try incognito/private window
- Clear browser cache and retry

---

## 📞 Need Help?

### Developer Console (F12)
```javascript
// View all errors
console.log(ShoreSquad.state)

// Check crews
ShoreSquad.state.crews

// View stats
ShoreSquad.state.stats
```

### Browser DevTools Tips
- **F12** or **Right-click → Inspect**
- **Console tab** for JavaScript errors
- **Network tab** to check API calls
- **Application tab** to view LocalStorage
- **Device toolbar** for mobile preview

---

## 🚀 Next Steps

1. ✅ **Explore the site** - Try all features
2. ✅ **Check responsive design** - Test on mobile
3. ✅ **View source code** - See how it's built
4. ✅ **Test APIs** - Use console commands
5. ✅ **Deploy** - Push to GitHub/Netlify

---

## 📚 Learn More

- Full documentation: `README.md`
- Project summary: `PROJECT_SUMMARY.md`
- Code comments: See `js/app.js` and `css/styles.css`
- Design system: CSS variables in `styles.css`

---

## 🌊 Rally Your Crew!

**ShoreSquad is live and ready to mobilize young people to clean beaches!**

🏄 Energetic • 🌍 Environmental • 👥 Community-Focused

---

*Created: December 1, 2025*
*Status: Ready to Launch! 🚀*
