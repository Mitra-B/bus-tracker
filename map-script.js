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
        this.routeStopMarkers = []; // store route stop markers for cleanup
        this.isRouteReversed = false; // track if current route is reversed
        // Tracking state
        this.trackedBusId = null; // which bus is being tracked
        this.trackLine = null;    // polyline for tracked bus trail
        this.trackPoints = [];    // recent positions for trail

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
        // Initialize Leaflet map centered on Punjab, India
        this.map = L.map('map').setView([30.7333, 76.7794], 10); // Chandigarh, Punjab coordinates

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
        const reverseBtn = document.getElementById('reverseRouteBtn');
        
        if (routeSelect) {
            routeSelect.addEventListener('change', (e) => {
                const routeId = e.target.value;
                this.isRouteReversed = false; // reset reverse state
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
        if (reverseBtn) {
            reverseBtn.addEventListener('click', () => {
                const routeId = routeSelect.value;
                this.toggleRouteDirection(routeId);
            });
        }
    }

    loadSampleData() {
        // Sample routes data with stops (Punjab area coordinates)
        const sampleRoutes = [
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

        // Sample buses data - PUNBUS buses in Punjab
        const sampleBuses = [
            {
                id: 'BUS001',
                number: 'PN-101',
                route: 'R001',
                lat: 30.7333,
                lng: 76.7794,
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
                lat: 31.6200,
                lng: 74.8765,
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
                lat: 30.3398,
                lng: 76.3869,
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

        // Load buses and initialize along-route paths
        sampleBuses.forEach(bus => {
            const route = this.routes.get(bus.route);
            if (route && Array.isArray(route.stops) && route.stops.length > 1) {
                // Build path from route stops
                bus.path = route.stops.map(s => ({ lat: s.lat, lng: s.lng }));
                bus.segmentIndex = 0; // between stop 0 and 1
                bus.t = 0; // interpolation progress 0..1 along the segment
                // Speed factor per tick (update interval ~5s). Tune for demo.
                bus.speedFactor = 0.35 + Math.random() * 0.25; // 0.35..0.6 per tick
                // Start at the first stop
                bus.lat = bus.path[0].lat;
                bus.lng = bus.path[0].lng;
            }
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
            this.viewRouteOnMap(firstRoute);
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
        if (!bus) return;

        // Toggle tracking if same bus clicked again
        if (this.trackedBusId === busId) {
            // Disable tracking
            this.trackedBusId = null;
            this.trackPoints = [];
            if (this.trackLine) {
                this.map.removeLayer(this.trackLine);
                this.trackLine = null;
            }
            return;
        }

        // Switch tracking to the new bus
        this.trackedBusId = busId;
        this.trackPoints = [[bus.lat, bus.lng]];
        if (this.trackLine) {
            this.map.removeLayer(this.trackLine);
            this.trackLine = null;
        }
        this.trackLine = L.polyline(this.trackPoints, {
            color: 'black',
            weight: 4,
            opacity: 0.9
        }).addTo(this.map);
        this.map.setView([bus.lat, bus.lng], 16);
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
            if (bus.status !== 'online') return;

            if (bus.path && bus.path.length > 1) {
                const seg = bus.segmentIndex ?? 0;
                const a = bus.path[seg];
                const b = bus.path[seg + 1];
                if (a && b) {
                    // advance progress
                    const speed = bus.speedFactor || 0.5; // fallback
                    bus.t = (bus.t ?? 0) + speed; // per tick increment

                    // move to next segment when completed
                    while (bus.t >= 1) {
                        bus.t -= 1;
                        bus.segmentIndex = (bus.segmentIndex + 1) % (bus.path.length - 1);
                    }

                    const t = bus.t;
                    const lat = a.lat + (b.lat - a.lat) * t;
                    const lng = a.lng + (b.lng - a.lng) * t;
                    bus.lat = lat;
                    bus.lng = lng;

                    // derive demo speed km/h roughly from distance per tick
                    const dLat = b.lat - a.lat;
                    const dLng = b.lng - a.lng;
                    const segLen = Math.sqrt(dLat * dLat + dLng * dLng);
                    bus.speed = Math.round(segLen * 111 * 60); // crude demo conversion
                }
            }

            // demo passenger fluctuation
            bus.passengers = Math.max(0, Math.min(bus.capacity, (bus.passengers ?? 0) + Math.floor((Math.random() - 0.5) * 3)));
            bus.lastUpdate = new Date();

            // Update marker position
            const marker = this.markers.get(id);
            if (marker) {
                marker.setLatLng([bus.lat, bus.lng]);
                marker.setPopupContent(this.createBusPopup(bus));
            }

            // Update tracking trail if this bus is being tracked
            if (this.trackedBusId === id) {
                // Append point and keep last 200 positions
                this.trackPoints.push([bus.lat, bus.lng]);
                if (this.trackPoints.length > 200) this.trackPoints.shift();
                if (this.trackLine) {
                    this.trackLine.setLatLngs(this.trackPoints);
                } else {
                    this.trackLine = L.polyline(this.trackPoints, {
                        color: 'black',
                        weight: 4,
                        opacity: 0.9
                    }).addTo(this.map);
                }
                // Keep map centered on the tracked bus
                this.map.setView([bus.lat, bus.lng]);
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

    // ===== Route UI helpers =====
    populateRouteSelect() {
        const select = document.getElementById('routeSelect');
        if (!select) return;
        // Clear
        select.innerHTML = '';
        // Add options from routes map
        Array.from(this.routes.values()).forEach(route => {
            const opt = document.createElement('option');
            opt.value = route.id;
            opt.textContent = route.name;
            select.appendChild(opt);
        });
    }

    renderStops(routeId) {
        const route = this.routes.get(routeId);
        const list = document.getElementById('stopList');
        if (!list) return;
        list.innerHTML = '';
        if (!route || !route.stops) return;

        const stops = this.isRouteReversed ? [...route.stops].reverse() : route.stops;
        let cumulativeDistance = 0;
        let cumulativeTime = 0;

        stops.forEach((s, idx) => {
            // Calculate distance and ETA from previous stop
            let distance = 0;
            let eta = 0;
            
            if (idx > 0) {
                const prevStop = stops[idx - 1];
                distance = this.calculateDistance(prevStop.lat, prevStop.lng, s.lat, s.lng);
                cumulativeDistance += distance;
                // Assume average speed of 40 km/h for ETA calculation
                const segmentTime = (distance / 40) * 60; // minutes
                cumulativeTime += segmentTime;
                eta = Math.round(cumulativeTime);
            }

            const item = document.createElement('div');
            item.className = 'stop-item';
            item.innerHTML = `
                <div class="stop-dot">•</div>
                <div class="stop-info">
                    <div class="stop-name" ${s.strong ? 'style="font-weight:600"' : ''}>${s.name}</div>
                    <div class="stop-details">
                        ${idx === 0 ? 'Starting Point' : `${distance.toFixed(1)} km • ETA: ${eta} min`}
                    </div>
                </div>
            `;
            list.appendChild(item);
        });
    }

    viewRouteOnMap(routeId) {
        const route = this.routes.get(routeId);
        if (!route || !Array.isArray(route.stops) || route.stops.length < 2) return;

        // Remove previous route layer and markers if exists
        if (this.routeLayer) {
            this.map.removeLayer(this.routeLayer);
            this.routeLayer = null;
        }
        this.routeStopMarkers.forEach(marker => this.map.removeLayer(marker));
        this.routeStopMarkers = [];

        const stops = this.isRouteReversed ? [...route.stops].reverse() : route.stops;
        const latlngs = stops.map(s => [s.lat, s.lng]);
        
        // Create animated polyline for navigation route
        this.routeLayer = L.polyline(latlngs, {
            color: 'black',
            weight: 5,
            opacity: 0.9,
            dashArray: '10, 10'
        }).addTo(this.map);

        // Add animation to the route line
        this.animateRoute();

        // Add stop markers with distance and ETA
        let cumulativeDistance = 0;
        let cumulativeTime = 0;
        
        stops.forEach((stop, index) => {
            // Calculate distance and ETA from start
            let distance = 0;
            let eta = 0;
            
            if (index > 0) {
                const prevStop = stops[index - 1];
                distance = this.calculateDistance(prevStop.lat, prevStop.lng, stop.lat, stop.lng);
                cumulativeDistance += distance;
                // Assume average speed of 40 km/h for ETA calculation
                const segmentTime = (distance / 40) * 60; // minutes
                cumulativeTime += segmentTime;
                eta = Math.round(cumulativeTime);
            }
            
            const isTerminal = stop.strong;
            const marker = L.circleMarker([stop.lat, stop.lng], {
                radius: isTerminal ? 8 : 5,
                fillColor: isTerminal ? '#ff0000' : route.color,
                color: 'white',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(this.map);
            
            marker.bindPopup(`
                <div class="stop-popup">
                    <h4>${stop.name}</h4>
                    <p><strong>${isTerminal ? 'Terminal Stop' : 'Bus Stop'}</strong></p>
                    <div class="stop-stats">
                        ${index === 0 ? 
                            '<p><i class="fas fa-play"></i> Starting Point</p>' : 
                            `<p><i class="fas fa-route"></i> ${cumulativeDistance.toFixed(1)} km from start</p>
                             <p><i class="fas fa-clock"></i> ETA: ${eta} minutes</p>`
                        }
                    </div>
                </div>
            `);
            
            this.routeStopMarkers.push(marker);
        });

        // Fit the map to the route
        const bounds = L.latLngBounds(latlngs);
        this.map.fitBounds(bounds, { padding: [30, 30] });
    }

    animateRoute() {
        if (!this.routeLayer) return;
        
        let offset = 0;
        const animate = () => {
            if (!this.routeLayer) return;
            
            offset = (offset + 1) % 20;
            this.routeLayer.setStyle({
                dashOffset: offset + 'px'
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    // Calculate distance between two points in kilometers
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(lat2 - lat1);
        const dLng = this.toRadians(lng2 - lng1);
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    toRadians(degrees) {
        return degrees * (Math.PI/180);
    }

    toggleRouteDirection(routeId) {
        this.isRouteReversed = !this.isRouteReversed;
        this.renderStops(routeId);
        this.viewRouteOnMap(routeId);
        
        // Update button text
        const reverseBtn = document.getElementById('reverseRouteBtn');
        if (reverseBtn) {
            reverseBtn.innerHTML = `
                <i class="fas fa-exchange-alt"></i>
                ${this.isRouteReversed ? 'Normal Direction' : 'Reverse Route'}
            `;
        }
    }
}

// Initialize the map application when the page loads
let busTrackerMap;
document.addEventListener('DOMContentLoaded', () => {
    busTrackerMap = new BusTrackerMap();
});
