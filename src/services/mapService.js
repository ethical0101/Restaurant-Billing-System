// Map service for location and delivery management
export class MapService {
  constructor() {
    this.geocoder = null;
    this.placesService = null;
    this.demoMode = true; // Enable demo mode for development
  }

  // Demo locations for testing
  demoLocations = [
    {
      name: "Delhi NCR - Connaught Place",
      address: "Connaught Place, New Delhi, Delhi 110001, India",
      lat: 28.6304,
      lng: 77.2177
    },
    {
      name: "Mumbai - Bandra West",
      address: "Bandra West, Mumbai, Maharashtra 400050, India",
      lat: 19.0596,
      lng: 72.8295
    },
    {
      name: "Bangalore - Koramangala",
      address: "Koramangala, Bengaluru, Karnataka 560034, India",
      lat: 12.9352,
      lng: 77.6245
    },
    {
      name: "Hyderabad - HITEC City",
      address: "HITEC City, Hyderabad, Telangana 500081, India",
      lat: 17.4435,
      lng: 78.3772
    }
  ];

  // Initialize Google Maps (fallback to demo mode)
  async initializeMap() {
    try {
      if (this.demoMode) {
        console.log('Running in demo mode - Google Maps API not configured');
        return true;
      }
      return true;
    } catch (error) {
      console.error('Error initializing Google Maps, falling back to demo mode:', error);
      this.demoMode = true;
      return true;
    }
  }

  // Get current location (demo mode provides random demo location)
  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (this.demoMode) {
        const randomLocation = this.demoLocations[Math.floor(Math.random() * this.demoLocations.length)];
        setTimeout(() => {
          resolve({
            lat: randomLocation.lat,
            lng: randomLocation.lng
          });
        }, 1000);
        return;
      }

      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  // Geocode address to coordinates (demo mode provides best match)
  async geocodeAddress(address) {
    if (this.demoMode) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const lowerAddress = address.toLowerCase();
          let bestMatch = this.demoLocations[0];

          for (const location of this.demoLocations) {
            if (location.address.toLowerCase().includes(lowerAddress) ||
                lowerAddress.includes(location.name.toLowerCase())) {
              bestMatch = location;
              break;
            }
          }

          resolve({
            lat: bestMatch.lat,
            lng: bestMatch.lng,
            formattedAddress: bestMatch.address
          });
        }, 800);
      });
    }
    return Promise.resolve({ lat: 28.6139, lng: 77.2090, formattedAddress: address });
  }

  // Reverse geocode coordinates to address
  async reverseGeocode(lat, lng) {
    if (this.demoMode) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          let closestLocation = this.demoLocations[0];
          let minDistance = this.calculateDistance(lat, lng, closestLocation.lat, closestLocation.lng);

          for (const location of this.demoLocations) {
            const distance = this.calculateDistance(lat, lng, location.lat, location.lng);
            if (distance < minDistance) {
              minDistance = distance;
              closestLocation = location;
            }
          }

          resolve({
            address: closestLocation.address,
            components: []
          });
        }, 600);
      });
    }
    return Promise.resolve({ address: 'Demo Address', components: [] });
  }

  // Check if address is within delivery area
  isWithinDeliveryArea(coordinates, restaurantCoordinates = { lat: 28.6139, lng: 77.2090 }) {
    const distance = this.calculateDistance(
      coordinates.lat,
      coordinates.lng,
      restaurantCoordinates.lat,
      restaurantCoordinates.lng
    );
    return distance <= 10000; // 10km radius
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
}

export const mapService = new MapService();
