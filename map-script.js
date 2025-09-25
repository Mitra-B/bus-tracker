// Bus Tracker Map Application
class BusTrackerMap {
    constructor() {
        this.map = null;
        this.buses = new Map();
        this.routes = new Map();
        this.markers = new Map();
        this.selectedBus = null;
        this.updateInterval = null;
        this.currentFilter = 'all'; // 'all', 'punbus', 'chalobus'
        this.routeLayer = null; // polyline for selected route

        this.init();
    }

    init() {
        this.initMap();
        this.initEventListeners();
        this.loadSampleData();
        this.startRealTimeUpdates();
        this.hideLoading();
        this.handleUrlHash();
    }

    initMap() {
        // Initialize Leaflet map centered on a default location (you can change this)
        this.map = L.map('map').setView([28.6139, 77.2090], 12); // Delhi coordinates

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Add custom controls
        this.addMapControls();
    }

    addMapControls() {
        // Custom control for centering map
        const centerControl = L.control({position: 'topright'});
        centerControl.onAdd = () => {
            const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
            div.innerHTML = '<a href="#" title="Center Map"><i class="fas fa-crosshairs"></i></a>';
            div.onclick = (e) => {
                e.preventDefault();
                this.centerMap();
            };
            return div;
        };
        centerControl.addTo(this.map);
    }

    initEventListeners() {
        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => this.refreshData());

        // Map controls
        document.getElementById('centerMapBtn').addEventListener('click', () => this.centerMap());
        document.getElementById('toggleTrafficBtn').addEventListener('click', () => this.toggleTraffic());

        // Bus info panel
        document.getElementById('closePanelBtn').addEventListener('click', () => this.closeBusInfoPanel());

        // Bottom navigation
        document.getElementById('punbusNav').addEventListener('click', () => this.setActiveNav('punbus'));

        // Route UI
        const routeSelect = document.getElementById('routeSelect');
        const viewBtn = document.getElementById('viewRouteOnMapBtn');
        const viewLink = document.getElementById('viewOnMapLink');
        if (routeSelect) {
            routeSelect.addEventListener('change', (e) => {
                const routeId = e.target.value;
                this.renderStops(routeId);
            });
        }
        if (viewBtn) {
            viewBtn.addEventListener('click', () => {
                const routeId = routeSelect.value;
                this.viewRouteOnMap(routeId);
            });
        }
        if (viewLink) {
            viewLink.addEventListener('click', (e) => {
                e.preventDefault();
                const routeId = routeSelect.value;
                this.viewRouteOnMap(routeId);
            });
        }
    }

    loadSampleData() {
        // Sample routes data with stops (Delhi area coordinates)
        const sampleRoutes = [
            { 
                id: 'R001', 
                name: 'Route 1: Central Station - Airport', 
                color: '#e74c3c', 
                stops: [
                    { name: 'New Delhi Railway Station', lat: 28.6426, lng: 77.2197, strong: true },
                    { name: 'Connaught Place', lat: 28.6315, lng: 77.2167 },
                    { name: 'India Gate', lat: 28.6129, lng: 77.2295 },
                    { name: 'Ashoka Road', lat: 28.6156, lng: 77.2080 },
                    { name: 'Dhaula Kuan', lat: 28.5921, lng: 77.1655 },
                    { name: 'Mahipalpur', lat: 28.5450, lng: 77.1235 },
                    { name: 'IGI Airport T3', lat: 28.5562, lng: 77.1000, strong: true }
                ] 
            },
            { 
                id: 'R002', 
                name: 'Route 2: Mall - University', 
                color: '#3498db', 
                stops: [
                    { name: 'Select Citywalk Mall', lat: 28.5286, lng: 77.2193, strong: true },
                    { name: 'Malviya Nagar', lat: 28.5362, lng: 77.2100 },
                    { name: 'Hauz Khas', lat: 28.5494, lng: 77.2010 },
                    { name: 'AIIMS', lat: 28.5672, lng: 77.2100 },
                    { name: 'IIT Delhi', lat: 28.5450, lng: 77.1926, strong: true }
                ] 
            },
            { 
                id: 'R003', 
                name: 'Route 3: Hospital - Tech Park', 
                color: '#2ecc71', 
                stops: [
                    { name: 'Safdarjung Hospital', lat: 28.5675, lng: 77.2107, strong: true },
                    { name: 'Green Park', lat: 28.5580, lng: 77.2050 },
                    { name: 'Munirka', lat: 28.5540, lng: 77.1747 },
                    { name: 'Vasant Vihar', lat: 28.5627, lng: 77.1570 },
                    { name: 'DLF Cyber City', lat: 28.4946, lng: 77.0910, strong: true }
                ] 
            }
        ];

        // Sample buses data - only PUNBUS buses
        const sampleBuses = [
            {
                id: 'BUS001',
                number: 'PN-101',
                route: 'R001',
                lat: 28.6139,
                lng: 77.2090,
                speed: 25,
                status: 'online',
                passengers: 15,
                capacity: 40,
                type: 'punbus',
                lastUpdate: new Date()
            },
            {
                id: 'BUS002',
                number: 'PN-201',
                route: 'R002',
                lat: 28.6050,
                lng: 77.2000,
                speed: 20,
                status: 'online',
                passengers: 8,
                capacity: 35,
                type: 'punbus',
                lastUpdate: new Date(Date.now() - 30 * 1000) // 30 seconds ago
            },
            {
                id: 'BUS003',
                number: 'PN-301',
                route: 'R003',
                lat: 28.6250,
                lng: 77.1950,
                speed: 35,
                status: 'online',
                passengers: 30,
                capacity: 45,
                type: 'punbus',
                lastUpdate: new Date(Date.now() - 45 * 1000) // 45 seconds ago
            }
        ];

        // Load routes
        sampleRoutes.forEach(route => {
            this.routes.set(route.id, route);
        });

        // Load buses
        sampleBuses.forEach(bus => {
            this.buses.set(bus.id, bus);
            this.addBusMarker(bus);
        });

        this.updateUI();
        this.updateBottomNavigation();
        // Populate route UI and render default route stops
        this.populateRouteSelect();
        const firstRoute = sampleRoutes[0]?.id;
        if (firstRoute) {
            document.getElementById('routeSelect').value = firstRoute;
            this.renderStops(firstRoute);
        }
    }

    addBusMarker(bus) {
        const route = this.routes.get(bus.route);
        const color = route ? route.color : '#3498db';

        // Create custom icon
        const busIcon = L.divIcon({
            className: 'bus-marker',
            html: `<div style="background: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold;">${bus.number}</div>`,
            iconSize: [26, 26],
            iconAnchor: [13, 13]
        });

        const marker = L.marker([bus.lat, bus.lng], { icon: busIcon })
            .addTo(this.map)
            .bindPopup(this.createBusPopup(bus))
            .on('click', () => this.selectBus(bus.id));

        this.markers.set(bus.id, marker);
    }

    createBusPopup(bus) {
        const route = this.routes.get(bus.route);
        return `
            <div class="bus-popup">
                <h4><i class="fas fa-bus"></i> Bus ${bus.number}</h4>
                <p><strong>Route:</strong> ${route ? route.name : 'Unknown'}</p>
                <p><strong>Status:</strong> <span class="bus-status ${bus.status}">${bus.status.toUpperCase()}</span></p>
                <p><strong>Speed:</strong> ${bus.speed} km/h</p>
                <p><strong>Passengers:</strong> ${bus.passengers}/${bus.capacity}</p>
            </div>
        `;
    }

    selectBus(busId) {
        this.selectedBus = busId;
        const bus = this.buses.get(busId);
        if (bus) {
            this.showBusInfoPanel(bus);
            this.highlightBusMarker(busId);
        }
    }

    showBusInfoPanel(bus) {
        const route = this.routes.get(bus.route);
        const panel = document.getElementById('busInfoPanel');
        const content = document.getElementById('panelContent');

        const occupancyPercentage = Math.round((bus.passengers / bus.capacity) * 100);
        const occupancyColor = occupancyPercentage > 80 ? '#e74c3c' : occupancyPercentage > 50 ? '#f39c12' : '#2ecc71';

        content.innerHTML = `
            <div class="bus-details">
                <div class="bus-header">
                    <h3><i class="fas fa-bus"></i> Bus ${bus.number}</h3>
                    <span class="bus-status ${bus.status}">${bus.status.toUpperCase()}</span>
                </div>

                <div class="bus-info-grid">
                    <div class="info-item">
                        <i class="fas fa-route"></i>
                        <div>
                            <label>Route</label>
                            <span>${route ? route.name : 'Unknown Route'}</span>
                        </div>
                    </div>

                    <div class="info-item">
                        <i class="fas fa-tachometer-alt"></i>
                        <div>
                            <label>Speed</label>
                            <span>${bus.speed} km/h</span>
                        </div>
                    </div>

                    <div class="info-item">
                        <i class="fas fa-users"></i>
                        <div>
                            <label>Occupancy</label>
                            <span style="color: ${occupancyColor}">${bus.passengers}/${bus.capacity} (${occupancyPercentage}%)</span>
                        </div>
                    </div>

                    <div class="info-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <div>
                            <label>Location</label>
                            <span>${bus.lat.toFixed(4)}, ${bus.lng.toFixed(4)}</span>
                        </div>
                    </div>
                </div>

                <div class="occupancy-bar">
                    <div class="occupancy-fill" style="width: ${occupancyPercentage}%; background: ${occupancyColor}"></div>
                </div>

                <div class="bus-actions">
                    <button class="btn btn-primary" onclick="busTrackerMap.trackBus('${bus.id}')">
                        <i class="fas fa-crosshairs"></i> Track Bus
                    </button>
                </div>
            </div>
        `;

        panel.classList.add('show');
    }

    closeBusInfoPanel() {
        document.getElementById('busInfoPanel').classList.remove('show');
        this.selectedBus = null;
        this.unhighlightAllMarkers();
    }

    highlightBusMarker(busId) {
        // Remove highlight from all markers
        this.unhighlightAllMarkers();

        // Highlight selected marker
        const marker = this.markers.get(busId);
        if (marker) {
            const element = marker.getElement();
            if (element) {
                element.classList.add('selected');
            }
        }
    }

    unhighlightAllMarkers() {
        this.markers.forEach(marker => {
            const element = marker.getElement();
            if (element) {
                element.classList.remove('selected');
            }
        });
    }

    trackBus(busId) {
        const bus = this.buses.get(busId);
        if (bus) {
            this.map.setView([bus.lat, bus.lng], 16);
        }
    }

    setActiveNav(navType) {
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to selected nav item
        document.getElementById(navType + 'Nav').classList.add('active');

        // Filter buses based on navigation selection
        this.filterBusesByNav(navType);
        this.currentFilter = navType;
    }

    filterBusesByNav(navType) {
        this.markers.forEach((marker, busId) => {
            const bus = this.buses.get(busId);
            if (navType === 'punbus') {
                if (bus.type === 'punbus') {
                    marker.addTo(this.map);
                } else {
                    this.map.removeLayer(marker);
                }
            }
        });
    }

    updateBottomNavigation() {
        const punbusNav = document.getElementById('punbusNav');

        // Check PUNBUS status (blue if location transmitted within 1 minute)
        const punbusBuses = Array.from(this.buses.values()).filter(bus => bus.type === 'punbus');
        const punbusActive = punbusBuses.some(bus => {
            const timeDiff = (new Date() - bus.lastUpdate) / 1000; // in seconds
            return timeDiff <= 60; // within 1 minute
        });

        // Update PUNBUS color
        punbusNav.classList.remove('punbus-active', 'chalobus-inactive');
        if (punbusActive) {
            punbusNav.classList.add('punbus-active');
        } else {
            punbusNav.classList.add('chalobus-inactive');
        }
    }

    simulateBusMovement() {
        this.buses.forEach((bus, id) => {
            if (bus.status === 'online') {
                // Simulate small random movement
                const latChange = (Math.random() - 0.5) * 0.01;
                const lngChange = (Math.random() - 0.5) * 0.01;

                bus.lat += latChange;
                bus.lng += lngChange;
                bus.speed = Math.max(0, Math.min(60, bus.speed + (Math.random() - 0.5) * 10));
                bus.passengers = Math.max(0, Math.min(bus.capacity, bus.passengers + Math.floor((Math.random() - 0.5) * 5)));

                // Update last update time randomly for some buses
                if (Math.random() < 0.3) {
                    bus.lastUpdate = new Date();
                }

                // Update marker position
                const marker = this.markers.get(id);
                if (marker) {
                    marker.setLatLng([bus.lat, bus.lng]);
                    marker.setPopupContent(this.createBusPopup(bus));
                }
            }
        });
    }

    refreshData() {
        this.showLoading();

        // Simulate data refresh
        setTimeout(() => {
            this.simulateBusMovement();
            this.updateUI();
            this.updateBottomNavigation();
            this.hideLoading();
            this.updateLastUpdateTime();
        }, 1000);
    }

    centerMap() {
        if (this.buses.size > 0) {
            const bounds = L.latLngBounds(Array.from(this.buses.values()).map(bus => [bus.lat, bus.lng]));
            this.map.fitBounds(bounds, { padding: [20, 20] });
        }
    }

    toggleTraffic() {
        // This would integrate with a traffic layer API in a real application
        alert('Traffic layer toggle would be implemented with a real traffic data API');
    }

    updateUI() {
        const activeBusCount = Array.from(this.buses.values()).filter(bus => bus.status === 'online').length;
        document.getElementById('activeBusCount').textContent = `${activeBusCount} Active Buses`;
    }

    updateLastUpdateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        document.getElementById('lastUpdate').textContent = `Last updated: ${timeString}`;
    }

    startRealTimeUpdates() {
        this.updateInterval = setInterval(() => {
            this.simulateBusMovement();
            this.updateUI();
            this.updateBottomNavigation();
            this.updateLastUpdateTime();

            // Update selected bus info if panel is open
            if (this.selectedBus) {
                const bus = this.buses.get(this.selectedBus);
                if (bus) {
                    this.showBusInfoPanel(bus);
                }
            }
        }, 5000); // Update every 5 seconds
    }

    handleUrlHash() {
        const hash = window.location.hash.substring(1);
        if (hash === 'punbus') {
            this.setActiveNav('punbus');
        }
        // Clear hash after handling
        history.replaceState(null, null, window.location.pathname);
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('show');
    }
}

// Initialize the map application when the page loads
let busTrackerMap;
document.addEventListener('DOMContentLoaded', () => {
    busTrackerMap = new BusTrackerMap();
});
