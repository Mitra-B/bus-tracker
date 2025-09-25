# Bus Tracker - Live Bus Tracking System

A modern, responsive web application for tracking buses in real-time, similar to Mindicator. This application provides live bus locations, route information, and passenger occupancy data with a beautiful, intuitive interface.

## Features

### 🚌 Real-time Bus Tracking
- Live bus locations on an interactive map
- Real-time position updates every 5 seconds
- Bus status monitoring (online/offline)
- Speed and passenger occupancy tracking

### 🗺️ Interactive Map
- Powered by Leaflet and OpenStreetMap
- Custom bus markers with route colors
- Click on buses for detailed information
- Map centering and zoom controls
- Responsive design for mobile and desktop

### 🔍 Search & Navigation
- Search buses by number or route name
- Route-based bus filtering
- Quick bus selection from sidebar
- Automatic map centering on selected buses

### 📊 Dashboard Features
- Active bus count display
- Route management with color coding
- Bus occupancy visualization
- Last update timestamp
- System status indicators

### 🎨 Modern UI/UX
- Beautiful gradient backgrounds
- Glass-morphism design elements
- Smooth animations and transitions
- Responsive layout for all devices
- Dark theme status bar

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server setup required - runs entirely in the browser

### Installation
1. Download or clone this repository
2. Open `index.html` in your web browser
3. The application will load with sample bus data

### Usage

#### Viewing Buses
- Bus locations appear as colored markers on the map
- Each bus marker shows the bus number
- Marker colors correspond to different routes

#### Selecting a Bus
- Click on any bus marker on the map
- Or click on a bus in the sidebar list
- The bus information panel will slide in from the right

#### Searching for Buses
- Use the search box in the sidebar
- Search by bus number (e.g., "101") or route name
- The map will automatically center on found buses

#### Route Management
- View all active routes in the sidebar
- Click on a route to see all buses on that route
- Route colors help identify buses visually

#### Real-time Updates
- Bus positions update automatically every 5 seconds
- Speed and passenger data changes dynamically
- Use the refresh button for manual updates

## Technical Details

### Technologies Used
- **HTML5** - Modern semantic markup
- **CSS3** - Advanced styling with flexbox and grid
- **JavaScript (ES6+)** - Modern JavaScript features
- **Leaflet.js** - Interactive mapping library
- **OpenStreetMap** - Map tile provider
- **Font Awesome** - Icon library

### Architecture
- **Modular Design** - Object-oriented JavaScript architecture
- **Event-driven** - Responsive to user interactions
- **Data Management** - Efficient Map-based data structures
- **Real-time Simulation** - Simulated live bus movements

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Customization

### Adding Real Data
To connect with real bus tracking APIs:

1. **Replace Sample Data**: Modify the `loadSampleData()` method in `script.js`
2. **API Integration**: Add API calls in the `refreshData()` method
3. **WebSocket Support**: Implement WebSocket connections for real-time updates

### Styling Customization
- Modify `styles.css` for color schemes and layouts
- Update CSS variables for consistent theming
- Customize marker styles in the JavaScript

### Adding Features
- **Route Planning**: Add route visualization
- **Notifications**: Implement bus arrival alerts
- **Historical Data**: Add trip history tracking
- **User Accounts**: Implement user preferences

## Sample Data

The application includes sample data for demonstration:
- **5 Bus Routes** with different colors and stops
- **7 Sample Buses** with varying status and occupancy
- **Simulated Movement** with realistic speed and passenger changes

## Performance

### Optimization Features
- Efficient marker management
- Throttled updates to prevent performance issues
- Responsive image loading
- CSS animations with hardware acceleration

### Scalability
- Designed to handle hundreds of buses
- Efficient data structures for quick lookups
- Minimal DOM manipulation for smooth performance

## Mobile Support

### Responsive Features
- Touch-friendly interface
- Optimized for small screens
- Swipe gestures support
- Mobile-first design approach

## Future Enhancements

### Planned Features
- **GPS Integration** - Use device location
- **Push Notifications** - Bus arrival alerts
- **Offline Support** - Service worker implementation
- **Multi-language** - Internationalization support
- **Analytics** - Usage tracking and insights

### API Integration Ideas
- **GTFS Data** - Standard transit feed format
- **Traffic Data** - Real-time traffic conditions
- **Weather Integration** - Weather-based delays
- **Social Features** - User reviews and ratings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For questions, issues, or feature requests, please create an issue in the repository.

---

**Enjoy tracking buses with this modern, beautiful interface!** 🚌✨
