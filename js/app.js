/* ============================================
   SHORE SQUAD - INTERACTIVE APP
   ============================================
   
   Features:
   - Geolocation services
   - Interactive map with beach cleanup markers
   - Weather API integration
   - Real-time crew management
   - Service worker for offline support
   - Progressive enhancement
*/

// ============================================
// STATE MANAGEMENT
// ============================================

const appState = {
    userLocation: null,
    userCrew: null,
    crews: JSON.parse(localStorage.getItem('crews')) || [],
    cleanups: [
        {
            id: 1,
            title: 'Sunset Beach Cleanup',
            lat: 34.0,
            lng: -118.5,
            date: '2025-12-15',
            time: '09:00 AM',
            description: 'Join us for our monthly beach cleanup at Sunset Beach. Bring your own bags!'
        },
        {
            id: 2,
            title: 'Marina Bay Eco Rally',
            lat: 37.8,
            lng: -122.4,
            date: '2025-12-16',
            time: '10:00 AM',
            description: 'Large community cleanup event. BBQ after cleanup!'
        },
        {
            id: 3,
            title: 'Pacific Shores Initiative',
            lat: 32.9,
            lng: -117.3,
            date: '2025-12-17',
            time: '08:00 AM',
            description: 'Help us restore marine habitat and remove microplastics.'
        }
    ],
    stats: {
        cleanups: 0,
        trashKg: 0,
        squadMembers: 0,
        beaches: 0
    }
};

let map;
let userMarker;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🌊 ShoreSquad App Initializing...');
    
    // Initialize all features
    initializeNavigation();
    initializeMap();
    initializeWeather();
    initializeCrewFeatures();
    initializeEventListeners();
    updateStats();
    loadStats();
    
    // Register service worker for offline support
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(err => {
            console.log('Service Worker registration failed:', err);
        });
    }
    
    console.log('✅ ShoreSquad ready to rally crews!');
});

// ============================================
// NAVIGATION
// ============================================

function initializeNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when link clicked
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// ============================================
// MAP INITIALIZATION & GEOLOCATION
// ============================================

function initializeMap() {
    // Initialize Leaflet map centered on US coasts
    map = L.map('map').setView([37.7749, -122.4194], 5);
    
    // Add tile layer with light theme
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        minZoom: 3
    }).addTo(map);
    
    // Add cleanup location markers
    addCleanupMarkers();
    
    // Geolocation button
    const geoBtn = document.getElementById('geoBtn');
    if (geoBtn) {
        geoBtn.addEventListener('click', getUserLocation);
    }
}

function addCleanupMarkers() {
    const cleanupIcon = L.icon({
        iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30"><circle cx="15" cy="15" r="13" fill="%230066CC"/><text x="15" y="20" text-anchor="middle" font-size="16" fill="white">🏖</text></svg>',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
    
    appState.cleanups.forEach(cleanup => {
        const marker = L.marker([cleanup.lat, cleanup.lng], { icon: cleanupIcon })
            .bindPopup(createCleanupPopup(cleanup))
            .addTo(map);
        
        marker.on('click', () => displayEventDetails(cleanup));
    });
}

function createCleanupPopup(cleanup) {
    return `
        <div style="font-family: Poppins, sans-serif; min-width: 200px;">
            <h3 style="color: #0066CC; margin-bottom: 8px;">${cleanup.title}</h3>
            <p style="margin: 8px 0; font-size: 14px;">${cleanup.description}</p>
            <p style="color: #666; font-size: 13px;">📅 ${cleanup.date} at ${cleanup.time}</p>
        </div>
    `;
}

function getUserLocation() {
    const geoBtn = document.getElementById('geoBtn');
    const spinner = document.getElementById('loadingSpinner');
    
    if (!navigator.geolocation) {
        alert('Geolocation not supported in your browser');
        return;
    }
    
    spinner.style.display = 'block';
    geoBtn.disabled = true;
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            appState.userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            // Add user location marker
            if (userMarker) {
                map.removeLayer(userMarker);
            }
            
            const userIcon = L.icon({
                iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30"><circle cx="15" cy="15" r="10" fill="%23FF6B6B"/><circle cx="15" cy="15" r="6" fill="white"/></svg>',
                iconSize: [28, 28],
                iconAnchor: [14, 14]
            });
            
            userMarker = L.marker([appState.userLocation.lat, appState.userLocation.lng], { icon: userIcon })
                .bindPopup('📍 Your Location')
                .addTo(map);
            
            map.setView([appState.userLocation.lat, appState.userLocation.lng], 10);
            
            findNearestCleanup();
            updateWeather(appState.userLocation.lat, appState.userLocation.lng);
            
            spinner.style.display = 'none';
            geoBtn.disabled = false;
        },
        (error) => {
            console.error('Geolocation error:', error);
            alert('Unable to get your location. Please enable location services.');
            spinner.style.display = 'none';
            geoBtn.disabled = false;
        }
    );
}

function findNearestCleanup() {
    if (!appState.userLocation) return;
    
    let nearest = appState.cleanups[0];
    let minDistance = calculateDistance(
        appState.userLocation.lat,
        appState.userLocation.lng,
        nearest.lat,
        nearest.lng
    );
    
    appState.cleanups.forEach(cleanup => {
        const distance = calculateDistance(
            appState.userLocation.lat,
            appState.userLocation.lng,
            cleanup.lat,
            cleanup.lng
        );
        if (distance < minDistance) {
            minDistance = distance;
            nearest = cleanup;
        }
    });
    
    console.log(`📍 Nearest cleanup: ${nearest.title} (${minDistance.toFixed(1)} km away)`);
}

// Haversine formula for distance calculation
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function displayEventDetails(cleanup) {
    const eventDetails = document.getElementById('eventDetails');
    document.getElementById('eventTitle').textContent = cleanup.title;
    document.getElementById('eventDesc').textContent = cleanup.description;
    document.getElementById('eventDate').textContent = `📅 ${cleanup.date}`;
    document.getElementById('eventTime').textContent = `🕐 ${cleanup.time}`;
    eventDetails.style.display = 'block';
    
    // Setup join button
    const joinBtn = document.getElementById('joinBtn');
    joinBtn.onclick = () => joinCleanup(cleanup);
}

function joinCleanup(cleanup) {
    if (!appState.userCrew) {
        openCrewModal(`Join "${cleanup.title}"?`);
    } else {
        alert(`✅ You've joined "${cleanup.title}" with your crew!`);
        appState.stats.cleanups += 1;
        updateStats();
    }
}

// ============================================
// WEATHER INTEGRATION
// ============================================

function initializeWeather() {
    // Fetch Singapore weather from NEA (National Environment Agency) API
    fetchNEAWeatherForecast();
}

function fetchNEAWeatherForecast() {
    // NEA 4-Day Forecast API via data.gov.sg (no API key required)
    const url = 'https://api.data.gov.sg/v1/environment/4-day-weather-forecast';
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayNEAForecast(data);
        })
        .catch(err => {
            console.error('NEA Weather API error:', err);
            displayForecastError();
        });
}

function displayNEAForecast(data) {
    const weatherContainer = document.getElementById('weatherContainer');
    weatherContainer.innerHTML = '';
    
    if (!data.items || data.items.length === 0 || !data.items[0].forecasts) {
        displayForecastError();
        return;
    }
    
    const item = data.items[0];
    const updateDate = new Date(item.update_timestamp).toLocaleDateString('en-SG', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    const updateTime = new Date(item.update_timestamp).toLocaleTimeString('en-SG', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Header with forecast date
    const headerHTML = `
        <div class="forecast-header" style="grid-column: 1/-1; margin-bottom: 20px;">
            <h3 style="color: #0066CC; margin: 0 0 8px 0; font-size: 1.2rem;">📅 Singapore 4-Day Weather Forecast</h3>
            <p style="color: #666; margin: 0; font-size: 0.9rem;">Updated: ${updateDate} at ${updateTime}</p>
        </div>
    `;
    weatherContainer.innerHTML = headerHTML;
    
    // 4-day forecast breakdown
    if (item.forecasts && item.forecasts.length > 0) {
        item.forecasts.forEach((forecast, index) => {
            const forecastDate = new Date(forecast.date);
            const dayName = forecastDate.toLocaleDateString('en-SG', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            });
            
            // Determine weather emoji based on forecast text
            const weatherEmoji = getWeatherEmojiFromText(forecast.forecast);
            
            const dayCard = document.createElement('div');
            dayCard.className = 'weather-card day-forecast-card';
            dayCard.style.cssText = index === 0 ? 'grid-column: 1/-1; border: 2px solid #00BCD4;' : '';
            
            const humidityHTML = forecast.relative_humidity ? 
                `<p style="margin: 4px 0; color: #555;">💧 ${forecast.relative_humidity.low}% - ${forecast.relative_humidity.high}%</p>` : '';
            
            const windHTML = forecast.wind ? 
                `<p style="margin: 4px 0; color: #555;">💨 ${forecast.wind.speed[0]}-${forecast.wind.speed[1]} km/h ${forecast.wind.direction}</p>` : '';
            
            const tempHTML = forecast.temperature ? 
                `<p style="margin: 4px 0; color: #555;">🌡️ ${forecast.temperature.low}-${forecast.temperature.high}°C</p>` : '';
            
            dayCard.innerHTML = `
                <div style="border-bottom: 2px solid #E0E0E0; padding-bottom: 10px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <p style="margin: 0; font-weight: 700; color: #0066CC; font-size: 1rem;">${dayName}</p>
                        <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #999;">Day ${index + 1}</p>
                    </div>
                    <div style="font-size: 2rem;">${weatherEmoji}</div>
                </div>
                <p style="margin: 8px 0; color: #333; font-weight: 600;">${forecast.forecast}</p>
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #E8E8E8; font-size: 0.9rem;">
                    ${tempHTML}
                    ${humidityHTML}
                    ${windHTML}
                </div>
            `;
            weatherContainer.appendChild(dayCard);
        });
    }
}

function getWeatherEmojiFromText(text) {
    const lower = text.toLowerCase();
    if (lower.includes('thundery') || lower.includes('thunder')) return '⛈️';
    if (lower.includes('shower') || lower.includes('rain')) return '🌧️';
    if (lower.includes('cloud')) return '☁️';
    if (lower.includes('partly')) return '🌤️';
    if (lower.includes('clear') || lower.includes('sunny')) return '☀️';
    if (lower.includes('fog') || lower.includes('mist')) return '🌫️';
    if (lower.includes('snow')) return '❄️';
    return '🌈';
}

function displayForecastError() {
    const weatherContainer = document.getElementById('weatherContainer');
    weatherContainer.innerHTML = `
        <div class="weather-card" style="grid-column: 1/-1; text-align: center;">
            <p style="color: #666; margin: 0;">⚠️ Unable to load NEA weather forecast</p>
            <p style="color: #999; margin: 8px 0 0 0; font-size: 0.9rem;">Please check your internet connection</p>
        </div>
    `;
}

function updateWeather(lat, lng, locationName = 'Current Location') {
    // Legacy function - kept for compatibility
    // NEA API now handles Singapore weather updates
}

// Weather emoji and description functions moved to NEA API format
// (NEA provides forecast text directly, no WMO codes)

// ============================================
// CREW MANAGEMENT
// ============================================

function initializeCrewFeatures() {
    const createCrewBtn = document.getElementById('createCrewBtn');
    const crewNameInput = document.getElementById('crewNameInput');
    
    if (createCrewBtn) {
        createCrewBtn.addEventListener('click', () => {
            const crewName = crewNameInput.value.trim();
            if (crewName) {
                createCrew(crewName);
                crewNameInput.value = '';
            } else {
                alert('Please enter a crew name');
            }
        });
    }
    
    displayCrews();
}

function createCrew(name) {
    const crew = {
        id: Date.now(),
        name: name,
        members: [{ name: 'You', avatar: '👤' }],
        cleanups: 0,
        trashCollected: 0,
        joinDate: new Date().toLocaleDateString()
    };
    
    appState.crews.push(crew);
    appState.userCrew = crew;
    localStorage.setItem('crews', JSON.stringify(appState.crews));
    
    displayCrews();
    updateStats();
    
    console.log(`✅ Crew "${name}" created!`);
}

function displayCrews() {
    const crewList = document.getElementById('crewList');
    
    if (appState.crews.length === 0) {
        crewList.innerHTML = '<p class="empty-state">No crews yet. Create one to get started!</p>';
        return;
    }
    
    crewList.innerHTML = appState.crews.map(crew => `
        <div class="crew-card">
            <h3>🏖️ ${crew.name}</h3>
            <p class="crew-members">👥 ${crew.members.length} member${crew.members.length !== 1 ? 's' : ''}</p>
            <p style="font-size: 0.85rem; color: #666; margin: 8px 0;">
                📊 ${crew.cleanups} cleanups • ${crew.trashCollected}kg trash
            </p>
            <span class="crew-badge">Active ${crew.joinDate}</span>
            <div style="margin-top: 12px; display: flex; gap: 8px;">
                <button class="btn btn-small btn-primary" onclick="inviteMember(${crew.id})">Invite</button>
                <button class="btn btn-small btn-secondary" onclick="viewCrewDetails(${crew.id})">Details</button>
            </div>
        </div>
    `).join('');
}

function inviteMember(crewId) {
    const crew = appState.crews.find(c => c.id === crewId);
    const memberName = prompt(`Add member to "${crew.name}":`);
    
    if (memberName) {
        crew.members.push({ name: memberName, avatar: '👤' });
        localStorage.setItem('crews', JSON.stringify(appState.crews));
        displayCrews();
        updateStats();
        console.log(`✅ ${memberName} invited to crew!`);
    }
}

function viewCrewDetails(crewId) {
    const crew = appState.crews.find(c => c.id === crewId);
    alert(`
🏖️ ${crew.name}
━━━━━━━━━━━━━━━━━━
👥 Members: ${crew.members.map(m => m.name).join(', ')}
📊 Cleanups: ${crew.cleanups}
♻️ Trash Removed: ${crew.trashCollected}kg
📅 Active Since: ${crew.joinDate}
    `);
}

function openCrewModal(message) {
    const modal = document.getElementById('crewModal');
    const modalMessage = document.getElementById('modalMessage');
    modalMessage.textContent = message;
    modal.style.display = 'flex';
    
    const closeBtn = document.getElementById('closeModal');
    closeBtn.onclick = () => modal.style.display = 'none';
    
    window.onclick = (event) => {
        if (event.target === modal) modal.style.display = 'none';
    };
}

// ============================================
// STATS & TRACKING
// ============================================

function updateStats() {
    appState.stats.squadMembers = appState.crews.reduce((sum, crew) => sum + crew.members.length, 0);
    appState.stats.beaches = appState.cleanups.length;
    
    document.getElementById('statCleanups').textContent = appState.stats.cleanups;
    document.getElementById('statTrash').textContent = appState.stats.trashKg;
    document.getElementById('statSquad').textContent = appState.stats.squadMembers;
    document.getElementById('statBeaches').textContent = appState.stats.beaches;
    
    localStorage.setItem('stats', JSON.stringify(appState.stats));
}

function loadStats() {
    const savedStats = localStorage.getItem('stats');
    if (savedStats) {
        appState.stats = JSON.parse(savedStats);
        updateStats();
    }
}

// ============================================
// BUTTON EVENT LISTENERS
// ============================================

function initializeEventListeners() {
    const startBtn = document.getElementById('startBtn');
    const learnBtn = document.getElementById('learnBtn');
    
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            document.getElementById('map-section').scrollIntoView({ behavior: 'smooth' });
            getUserLocation();
        });
    }
    
    if (learnBtn) {
        learnBtn.addEventListener('click', () => {
            document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
        });
    }
}

// ============================================
// PERFORMANCE OPTIMIZATION
// ============================================

// Lazy load images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.src = entry.target.dataset.src;
                observer.unobserve(entry.target);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
}

// Debounce function for resize events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle responsive map on resize
window.addEventListener('resize', debounce(() => {
    if (map) map.invalidateSize();
}, 250));

// ============================================
// LOGGING & DEBUGGING
// ============================================

window.addEventListener('error', (event) => {
    console.error('🚨 Error:', event.error);
});

// Expose app state for debugging
window.ShoreSquad = {
    state: appState,
    createTestCrew: () => createCrew('Test Squad'),
    simulateCleanup: () => {
        appState.stats.cleanups += 1;
        appState.stats.trashKg += Math.floor(Math.random() * 50 + 10);
        updateStats();
        console.log('✅ Cleanup simulated!');
    }
};

console.log('💡 Tip: Use ShoreSquad.simulateCleanup() to test stats tracking!');
