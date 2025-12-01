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
    // Default to major coastal cities for demo
    const defaultLocations = [
        { name: 'San Francisco Bay', lat: 37.7749, lng: -122.4194 },
        { name: 'Los Angeles Coast', lat: 34.0522, lng: -118.2437 },
        { name: 'San Diego Beach', lat: 32.7157, lng: -117.1611 }
    ];
    
    defaultLocations.forEach(loc => updateWeather(loc.lat, loc.lng, loc.name));
}

function updateWeather(lat, lng, locationName = 'Current Location') {
    // Using Open-Meteo free API (no key required)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const current = data.current;
            const weatherIcon = getWeatherEmoji(current.weather_code);
            
            const weatherContainer = document.getElementById('weatherContainer');
            const weatherCard = document.createElement('div');
            weatherCard.className = 'weather-card';
            weatherCard.innerHTML = `
                <div class="weather-icon">${weatherIcon}</div>
                <div class="weather-temp">${Math.round(current.temperature_2m)}°C</div>
                <div class="weather-condition">${getWeatherDescription(current.weather_code)}</div>
                <p style="font-size: 0.85rem; color: #999; margin-top: 8px;">💨 ${current.wind_speed_10m} km/h</p>
                <p style="font-size: 0.8rem; color: #0066CC; margin-top: 8px;"><strong>${locationName}</strong></p>
            `;
            weatherContainer.appendChild(weatherCard);
        })
        .catch(err => {
            console.error('Weather API error:', err);
            const weatherContainer = document.getElementById('weatherContainer');
            weatherContainer.innerHTML = '<p class="weather-card">Unable to load weather. Check your connection.</p>';
        });
}

function getWeatherEmoji(code) {
    if (code === 0) return '☀️';
    if (code === 1 || code === 2) return '🌤️';
    if (code === 3) return '☁️';
    if (code === 45 || code === 48) return '🌫️';
    if (code === 51 || code === 53 || code === 55) return '🌧️';
    if (code === 61 || code === 63 || code === 65) return '🌧️';
    if (code === 71 || code === 73 || code === 75) return '❄️';
    if (code === 80 || code === 81 || code === 82) return '⛈️';
    return '🌈';
}

function getWeatherDescription(code) {
    const descriptions = {
        0: 'Clear',
        1: 'Partly Cloudy',
        2: 'Mostly Cloudy',
        3: 'Cloudy',
        45: 'Foggy',
        48: 'Foggy',
        51: 'Light Drizzle',
        53: 'Drizzle',
        55: 'Heavy Drizzle',
        61: 'Rain',
        63: 'Heavy Rain',
        65: 'Very Heavy Rain',
        71: 'Snow',
        73: 'Heavy Snow',
        75: 'Heavy Snow',
        80: 'Showers',
        81: 'Heavy Showers',
        82: 'Extreme Showers'
    };
    return descriptions[code] || 'Unknown';
}

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
