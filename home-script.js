// Home Page Script
class HomePage {
    constructor() {
        // Sample routes (Punjab) matching the map page
        this.routes = [
            { 
                id: 'R001', 
                name: 'Route 1: Chandigarh - Ludhiana', 
                color: '#e74c3c', 
                stops: [
                    { name: 'Chandigarh Bus Stand', lat: 30.7333, lng: 76.7794, strong: true },
                    { name: 'Sector 17', lat: 30.7410, lng: 76.7820 },
                    { name: 'Panchkula', lat: 30.6942, lng: 76.8606 },
                    { name: 'Ambala Cantt', lat: 30.3752, lng: 76.7821 },
                    { name: 'Rajpura', lat: 30.4844, lng: 76.5944 },
                    { name: 'Sirhind', lat: 30.6431, lng: 76.3828 },
                    { name: 'Khanna', lat: 30.7058, lng: 76.2219 },
                    { name: 'Doraha', lat: 30.7975, lng: 76.0219 },
                    { name: 'Ludhiana Bus Stand', lat: 30.9010, lng: 75.8573, strong: true }
                ] 
            },
            { 
                id: 'R002', 
                name: 'Route 2: Amritsar - Jalandhar', 
                color: '#3498db', 
                stops: [
                    { name: 'Golden Temple Complex', lat: 31.6200, lng: 74.8765, strong: true },
                    { name: 'Amritsar Railway Station', lat: 31.6340, lng: 74.8723 },
                    { name: 'Tarn Taran', lat: 31.4515, lng: 74.9289 },
                    { name: 'Goindwal Sahib', lat: 31.3204, lng: 75.1608 },
                    { name: 'Khadur Sahib', lat: 31.2779, lng: 75.2708 },
                    { name: 'Kapurthala', lat: 31.3800, lng: 75.3800 },
                    { name: 'Sultanpur Lodhi', lat: 31.2254, lng: 75.2047 },
                    { name: 'Phillaur', lat: 31.0186, lng: 75.7781 },
                    { name: 'Jalandhar City', lat: 31.3260, lng: 75.5762, strong: true }
                ] 
            },
            { 
                id: 'R003', 
                name: 'Route 3: Patiala - Bathinda', 
                color: '#2ecc71', 
                stops: [
                    { name: 'Patiala Bus Stand', lat: 30.3398, lng: 76.3869, strong: true },
                    { name: 'Rajpura Junction', lat: 30.4844, lng: 76.5944 },
                    { name: 'Samana', lat: 30.1439, lng: 76.1928 },
                    { name: 'Patran', lat: 30.0333, lng: 76.2500 },
                    { name: 'Sunam', lat: 30.1281, lng: 75.7997 },
                    { name: 'Dirba', lat: 30.0708, lng: 75.6042 },
                    { name: 'Sangrur', lat: 30.2458, lng: 75.8421 },
                    { name: 'Lehra Gaga', lat: 30.1500, lng: 75.5667 },
                    { name: 'Bathinda Junction', lat: 30.2110, lng: 74.9455, strong: true }
                ] 
            }
        ];

        this.selectedRouteId = null;
        this.isRouteReversed = false;
        this.init();
    }

    init() {
        this.setupNavigation();
        this.updateStats();
        this.setupRoutesModal();
    }

    setupNavigation() {
        // Handle URL hash for navigation (when coming from map page)
        const hash = window.location.hash.substring(1);
        if (hash === 'punbus') {
            // Redirect to map page with the hash
            window.location.href = `map.html#${hash}`;
        }
        // Clear hash after handling
        history.replaceState(null, null, window.location.pathname);
    }

    updateStats() {
        // Simulate live stats updates
        setInterval(() => {
            const activeBuses = Math.floor(Math.random() * 3) + 2; // 2-4 buses
            const lastUpdate = new Date().toLocaleTimeString();
            const busesEl = document.querySelector('.status-item:nth-child(2) span:last-child');
            const timeEl = document.querySelector('.status-item:nth-child(3) span:last-child');
            if (busesEl) busesEl.textContent = `${activeBuses} Active Buses`;
            if (timeEl) timeEl.textContent = `Last updated: ${lastUpdate}`;
        }, 10000); // Update every 10 seconds
    }

    setupRoutesModal() {
        const openBtn = document.getElementById('browseRoutesBtn');
        const modal = document.getElementById('routesModal');
        const closeBtn = document.getElementById('closeRoutesModal');
        const reverseBtn = document.getElementById('homeReverseRouteBtn');
        if (!openBtn || !modal || !closeBtn) return;

        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('show');
            modal.setAttribute('aria-hidden', 'false');
            this.renderRoutesListHome();
            // default select first route
            const first = this.routes[0]?.id;
            if (first) this.selectHomeRoute(first);
        });

        closeBtn.addEventListener('click', () => this.closeRoutesModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeRoutesModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeRoutesModal();
        });

        if (reverseBtn) {
            reverseBtn.addEventListener('click', () => this.toggleHomeRouteDirection());
        }
    }

    closeRoutesModal() {
        const modal = document.getElementById('routesModal');
        if (!modal) return;
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
    }

    renderRoutesListHome() {
        const list = document.getElementById('routesListHome');
        if (!list) return;
        list.innerHTML = '';

        this.routes.forEach(route => {
            const el = document.createElement('div');
            el.className = 'route-item';
            el.innerHTML = `
                <div style="border-left: 4px solid ${route.color}; padding-left: 10px;">
                    <strong>${route.name}</strong>
                    <div style="font-size: 0.9rem; color: #666; margin-top: 5px;">
                        <i class="fas fa-map-marker-alt"></i> ${route.stops.length} stops
                    </div>
                </div>
            `;
            el.addEventListener('click', () => this.selectHomeRoute(route.id));
            list.appendChild(el);
        });
    }

    selectHomeRoute(routeId) {
        this.selectedRouteId = routeId;
        // Update active class
        const list = document.getElementById('routesListHome');
        if (list) {
            Array.from(list.children).forEach((child, idx) => {
                child.classList.toggle('active', this.routes[idx]?.id === routeId);
            });
        }
        this.renderHomeStops(routeId);
    }

    renderHomeStops(routeId) {
        const route = this.routes.find(r => r.id === routeId);
        const list = document.getElementById('homeStopList');
        if (!route || !list) return;
        list.innerHTML = '';

        const stops = this.isRouteReversed ? [...route.stops].reverse() : route.stops;
        let cumulativeDistance = 0;
        let cumulativeTime = 0;
        stops.forEach((s, idx) => {
            if (idx > 0) {
                const prev = stops[idx - 1];
                const seg = this.calculateDistance(prev.lat, prev.lng, s.lat, s.lng);
                cumulativeDistance += seg;
                cumulativeTime += (seg / 40) * 60; // minutes at 40km/h
            }
            const item = document.createElement('div');
            item.className = 'stop-item';
            item.innerHTML = `
                <div class="stop-dot">•</div>
                <div class="stop-line" style="background:${route.color}"></div>
                <div class="stop-info">
                    <div class="stop-name" ${s.strong ? 'style="font-weight:600"' : ''}>${s.name}</div>
                    <div class="stop-details">
                        ${idx === 0 ? 'Starting Point' : `${cumulativeDistance.toFixed(1)} km from start • ETA: ${Math.round(cumulativeTime)} min`}
                    </div>
                </div>
            `;
            list.appendChild(item);
        });
    }

    toggleHomeRouteDirection() {
        this.isRouteReversed = !this.isRouteReversed;
        if (this.selectedRouteId) {
            this.renderHomeStops(this.selectedRouteId);
        }
        const btn = document.getElementById('homeReverseRouteBtn');
        if (btn) {
            btn.innerHTML = this.isRouteReversed 
                ? '<i class="fas fa-exchange-alt"></i> Normal Direction'
                : '<i class="fas fa-exchange-alt"></i> Reverse Route';
        }
    }

    // Haversine distance (km)
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371;
        const dLat = this.toRad(lat2 - lat1);
        const dLng = this.toRad(lng2 - lng1);
        const a = Math.sin(dLat/2) ** 2 + Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLng/2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    toRad(d) { return d * Math.PI / 180; }
}

// Initialize home page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HomePage();
});
