// Bus Tracker Application
class BusTracker {
    constructor() {
        this.map = null;
        this.buses = new Map();
        this.routes = new Map();
        this.markers = new Map();
        this.selectedBus = null;
        this.updateInterval = null;
        
        this.init();
    }

    init() {
        this.initMap();
        this.initEventListeners();
        this.loadSampleData();
        this.startRealTimeUpdates();
        this.hideLoading();
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
        // Search functionality
        document.getElementById('searchBtn').addEventListener('click', () => this.searchBus());
        document.getElementById('busSearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchBus();
        });

        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => this.refreshData());

        // Map controls
        document.getElementById('centerMapBtn').addEventListener('click', () => this.centerMap());
        document.getElementById('toggleTrafficBtn').addEventListener('click', () => this.toggleTraffic());

        // Bus info panel
        document.getElementById('closePanelBtn').addEventListener('click', () => this.closeBusInfoPanel());

        // Bottom navigation
        document.getElementById('homeNav').addEventListener('click', () => this.setActiveNav('home'));
        document.getElementById('punbusNav').addEventListener('click', () => this.setActiveNav('punbus'));
        document.getElementById('chalobusNav').addEventListener('click', () => this.setActiveNav('chalobus'));
    }

    loadSampleData() {
        // Sample routes data - reduced to 3 routes
        const sampleRoutes = [
            { id: 'R001', name: 'Route 1: Central Station - Airport', color: '#e74c3c', stops: 15 },
            { id: 'R002', name: 'Route 2: Mall - University', color: '#3498db', stops: 12 },
            { id: 'R003', name: 'Route 3: Hospital - Tech Park', color: '#2ecc71', stops: 18 }
        ];

        // Sample buses data - reduced to 3 buses with specific types
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
                number: 'CB-201', 
                route: 'R002', 
                lat: 28.6050, 
                lng: 77.2000, 
                speed: 20, 
                status: 'online', 
                passengers: 8, 
                capacity: 35,
                type: 'chalobus',
                lastUpdate: new Date(Date.now() - 2 * 60 * 1000) // 2 minutes ago
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
                lastUpdate: new Date(Date.now() - 30 * 1000) // 30 seconds ago
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
                    <button class="btn btn-primary" onclick="busTracker.trackBus('${bus.id}')">
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

    searchBus() {
        const query = document.getElementById('busSearch').value.trim().toLowerCase();
        if (!query) return;

        let foundBus = null;
        
        // Search by bus number
        for (const [id, bus] of this.buses) {
            if (bus.number.toLowerCase().includes(query)) {
                foundBus = bus;
                break;
            }
        }

        // Search by route name if not found by bus number
        if (!foundBus) {
            for (const [id, bus] of this.buses) {
                const route = this.routes.get(bus.route);
                if (route && route.name.toLowerCase().includes(query)) {
                    foundBus = bus;
                    break;
                }
            }
        }

        if (foundBus) {
            this.selectBus(foundBus.id);
            this.map.setView([foundBus.lat, foundBus.lng], 16);
        } else {
            alert('Bus not found. Please try a different search term.');
        }
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

    setActiveNav(navType) {
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to selected nav item
        document.getElementById(navType + 'Nav').classList.add('active');

        // Filter buses based on navigation selection
        this.filterBusesByNav(navType);
    }

    filterBusesByNav(navType) {
        this.markers.forEach((marker, busId) => {
            const bus = this.buses.get(busId);
            if (navType === 'home') {
                marker.addTo(this.map);
            } else if (navType === 'punbus') {
                if (bus.type === 'punbus') {
                    marker.addTo(this.map);
                } else {
                    this.map.removeLayer(marker);
                }
            } else if (navType === 'chalobus') {
                if (bus.type === 'chalobus') {
                    marker.addTo(this.map);
                } else {
                    this.map.removeLayer(marker);
                }
            }
        });
    }

    updateBottomNavigation() {
        const punbusNav = document.getElementById('punbusNav');
        const chalobusNav = document.getElementById('chalobusNav');

        // Check PUNBUS status (blue if location transmitted within 1 minute)
        const punbusBuses = Array.from(this.buses.values()).filter(bus => bus.type === 'punbus');
        const punbusActive = punbusBuses.some(bus => {
            const timeDiff = (new Date() - bus.lastUpdate) / 1000; // in seconds
            return timeDiff <= 60; // within 1 minute
        });

        // Check Chalo Bus status (grey if location not transmitted within 1 minute)
        const chalobusBuses = Array.from(this.buses.values()).filter(bus => bus.type === 'chalobus');
        const chalobusActive = chalobusBuses.some(bus => {
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

        // Update Chalo Bus color
        chalobusNav.classList.remove('punbus-active', 'chalobus-inactive');
        if (chalobusActive) {
            chalobusNav.classList.add('punbus-active');
        } else {
            chalobusNav.classList.add('chalobus-inactive');
        }
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

    updateUI() {
        this.updateRoutesList();
        this.updateBusList();
        this.updateStatusBar();
    }

    updateRoutesList() {
        const routesList = document.getElementById('routesList');
        routesList.innerHTML = '';
        
        this.routes.forEach((route, id) => {
            const activeBuses = Array.from(this.buses.values()).filter(bus => 
                bus.route === id && bus.status === 'online'
            ).length;
            
            const routeElement = document.createElement('div');
            routeElement.className = 'route-item';
            routeElement.innerHTML = `
                <div style="border-left: 4px solid ${route.color}; padding-left: 10px;">
                    <strong>${route.name}</strong>
                    <div style="font-size: 0.9rem; color: #666; margin-top: 5px;">
                        <i class="fas fa-bus"></i> ${activeBuses} active buses
                        <span style="margin-left: 10px;"><i class="fas fa-map-marker-alt"></i> ${route.stops} stops</span>
                    </div>
                </div>
            `;
            
            routeElement.addEventListener('click', () => {
                this.showRouteBuses(id);
            });
            
            routesList.appendChild(routeElement);
        });
    }

    updateBusList() {
        const busList = document.getElementById('busList');
        busList.innerHTML = '';
        
        this.buses.forEach((bus, id) => {
            const route = this.routes.get(bus.route);
            const busElement = document.createElement('div');
            busElement.className = 'bus-item';
            busElement.innerHTML = `
                <div>
                    <strong>Bus ${bus.number}</strong>
                    <div style="font-size: 0.8rem; color: #666;">
                        ${route ? route.name.split(':')[1] || route.name : 'Unknown Route'}
                    </div>
                </div>
                <span class="bus-status ${bus.status}">${bus.status}</span>
            `;
            
            busElement.addEventListener('click', () => {
                this.selectBus(id);
                this.map.setView([bus.lat, bus.lng], 16);
            });
            
            busList.appendChild(busElement);
        });
    }

    updateStatusBar() {
        const activeBusCount = Array.from(this.buses.values()).filter(bus => bus.status === 'online').length;
        document.getElementById('activeBusCount').textContent = `${activeBusCount} Active Buses`;
    }

    updateLastUpdateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        document.getElementById('lastUpdate').textContent = `Last updated: ${timeString}`;
    }

    showRouteBuses(routeId) {
        const routeBuses = Array.from(this.buses.values()).filter(bus => bus.route === routeId);
        if (routeBuses.length > 0) {
            const bounds = L.latLngBounds(routeBuses.map(bus => [bus.lat, bus.lng]));
            this.map.fitBounds(bounds, { padding: [20, 20] });
        }
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

    showLoading() {
        document.getElementById('loadingOverlay').classList.add('show');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('show');
    }
}

// Initialize the application when the page loads
let busTracker;
document.addEventListener('DOMContentLoaded', () => {
    busTracker = new BusTracker();
});

// Add some additional CSS for the bus info panel
const additionalCSS = `
.bus-details {
    font-size: 0.9rem;
}

.bus-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #eee;
}

.bus-info-grid {
    display: grid;
    gap: 1rem;
    margin-bottom: 1rem;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.info-item i {
    color: #3498db;
    width: 20px;
    text-align: center;
}

.info-item div {
    flex: 1;
}

.info-item label {
    display: block;
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 0.25rem;
}

.info-item span {
    font-weight: 500;
}

.occupancy-bar {
    width: 100%;
    height: 8px;
    background: #eee;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 1rem;
}

.occupancy-fill {
    height: 100%;
    transition: width 0.3s ease;
}

.bus-actions {
    text-align: center;
}

.bus-popup {
    min-width: 200px;
}

.bus-popup h4 {
    margin-bottom: 0.5rem;
    color: #2c3e50;
}

.bus-popup p {
    margin: 0.25rem 0;
    font-size: 0.9rem;
}
`;

// Inject additional CSS
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);
