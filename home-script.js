// Home Page Script
class HomePage {
    constructor() {
        this.init();
    }

    init() {
        this.setupNavigation();
        this.updateStats();
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
            document.querySelector('.status-item:nth-child(2) span:last-child').textContent = `${activeBuses} Active Buses`;
            document.querySelector('.status-item:nth-child(3) span:last-child').textContent = `Last updated: ${lastUpdate}`;
        }, 10000); // Update every 10 seconds
    }
}

// Initialize home page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HomePage();
});
