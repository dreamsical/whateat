import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Filter, Settings, Sparkles, Shuffle, Star, ChevronRight, Plus, Search, ChevronDown } from 'lucide-react';

// Google Places API Configuration
const GOOGLE_PLACES_API_KEY = 'AIzaSyDpDZW6KiqNtoszM3GWA3UNwUEEdMvwg-Y';

// Mock restaurant data
const mockRestaurants = [
  { id: 1, name: "Mama's Trattoria", cuisine: "Italian", rating: 4.5, distance: 0.3, price: "$$", dietary: ["vegetarian"], liked: false },
  { id: 2, name: "Dragon Palace", cuisine: "Chinese", rating: 4.2, distance: 0.5, price: "$", dietary: ["vegetarian", "vegan"], liked: false },
  { id: 3, name: "The Burger Joint", cuisine: "American", rating: 4.7, distance: 0.2, price: "$$", dietary: [], liked: false },
  { id: 4, name: "Sushi Zen", cuisine: "Japanese", rating: 4.8, distance: 0.8, price: "$$$", dietary: ["gluten-free"], liked: false },
  { id: 5, name: "Spice Route", cuisine: "Indian", rating: 4.4, distance: 0.6, price: "$$", dietary: ["vegetarian", "vegan", "gluten-free"], liked: false },
  { id: 6, name: "Green Leaf Cafe", cuisine: "Healthy", rating: 4.3, distance: 0.4, price: "$", dietary: ["vegetarian", "vegan", "gluten-free"], liked: false },
];

// LocalStorage helper functions
const STORAGE_KEYS = {
  LIKES: 'foodspin_likes',
  DIETARY_FILTERS: 'foodspin_dietary_filters',
  INTERACTION_HISTORY: 'foodspin_interactions',
  USER_PREFERENCES: 'foodspin_preferences',
  CUSTOM_RESTAURANTS: 'foodspin_custom_restaurants',
};

const loadFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

export default function RestaurantApp() {
  const [restaurants, setRestaurants] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [dietaryFilters, setDietaryFilters] = useState([]);
  const [view, setView] = useState('main'); // main, result
  const [interactionHistory, setInteractionHistory] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [listFilter, setListFilter] = useState('all'); // 'all', 'favorites'
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showAllFavorites, setShowAllFavorites] = useState(false);
  const [favoritesSort, setFavoritesSort] = useState('date'); // 'date', 'name', 'distance'
  const [userLocation, setUserLocation] = useState(null); // {lat, lng}
  const [nearbyRestaurants, setNearbyRestaurants] = useState([]);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const [lastNearbyFetch, setLastNearbyFetch] = useState(null);

  // Show save confirmation briefly
  const showSaveConfirmation = () => {
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2000);
  };

  // Initialize data from localStorage on mount
  useEffect(() => {
    // Load saved likes
    const savedLikes = loadFromStorage(STORAGE_KEYS.LIKES, []);
    const customRestaurants = loadFromStorage(STORAGE_KEYS.CUSTOM_RESTAURANTS, []);
    
    // Merge mock restaurants with custom restaurants
    const allRestaurants = [...mockRestaurants, ...customRestaurants];
    
    // Apply likes to all restaurants
    const restaurantsWithLikes = allRestaurants.map(restaurant => ({
      ...restaurant,
      liked: savedLikes.includes(restaurant.id),
    }));
    
    setRestaurants(restaurantsWithLikes);

    // Load dietary filters
    const savedFilters = loadFromStorage(STORAGE_KEYS.DIETARY_FILTERS, []);
    setDietaryFilters(savedFilters);

    // Load interaction history
    const savedHistory = loadFromStorage(STORAGE_KEYS.INTERACTION_HISTORY, []);
    setInteractionHistory(savedHistory);
  }, []);

  // Save likes to localStorage whenever restaurants change
  useEffect(() => {
    if (restaurants.length > 0) {
      const likedIds = restaurants.filter(r => r.liked).map(r => r.id);
      saveToStorage(STORAGE_KEYS.LIKES, likedIds);
      
      // Save custom restaurants (ID > 6, as mock data has IDs 1-6)
      const customRestaurants = restaurants.filter(r => r.id > 6);
      saveToStorage(STORAGE_KEYS.CUSTOM_RESTAURANTS, customRestaurants);
    }
  }, [restaurants]);

  // Save dietary filters to localStorage whenever they change
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.DIETARY_FILTERS, dietaryFilters);
  }, [dietaryFilters]);

  // Save interaction history to localStorage (keep last 100 interactions)
  useEffect(() => {
    if (interactionHistory.length > 0) {
      const recentHistory = interactionHistory.slice(-100);
      saveToStorage(STORAGE_KEYS.INTERACTION_HISTORY, recentHistory);
    }
  }, [interactionHistory]);

  // Get user's location on mount
  useEffect(() => {
    getUserLocation();
  }, []);

  // Fetch nearby restaurants when location is available
  useEffect(() => {
    if (userLocation && !lastNearbyFetch) {
      fetchNearbyRestaurants();
    }
  }, [userLocation]);

  // Get user's location using HTML5 Geolocation API
  const getUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log("Location permission denied or unavailable:", error);
          // App still works without location, just uses mock data
        }
      );
    } else {
      console.log("Geolocation not supported");
    }
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in miles
  };

  // Fetch nearby restaurants from Google Places
  const fetchNearbyRestaurants = async () => {
    if (!userLocation) return;

    // Check cache - don't refetch if we fetched within last hour
    if (lastNearbyFetch && (Date.now() - lastNearbyFetch < 3600000)) {
      console.log("Using cached nearby restaurants");
      return;
    }

    setIsLoadingNearby(true);

    try {
      const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating,places.priceLevel,places.primaryTypeDisplayName,places.location'
        },
        body: JSON.stringify({
          includedTypes: ["restaurant"],
          maxResultCount: 10,
          locationRestriction: {
            circle: {
              center: {
                latitude: userLocation.lat,
                longitude: userLocation.lng
              },
              radius: 3218.69 // 2 miles in meters
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.places && data.places.length > 0) {
        const nearby = data.places.map((place, index) => {
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            place.location.latitude,
            place.location.longitude
          );

          return {
            id: `nearby-${index + 1}`,
            name: place.displayName?.text || "Restaurant",
            cuisine: place.primaryTypeDisplayName?.text || "Restaurant",
            rating: place.rating || 4.0,
            distance: Math.round(distance * 10) / 10, // Round to 1 decimal
            price: mapPriceLevel(place.priceLevel),
            dietary: [],
            liked: false,
            address: place.formattedAddress
          };
        });

        setNearbyRestaurants(nearby);
        setLastNearbyFetch(Date.now());
      }
    } catch (error) {
      console.error('Error fetching nearby restaurants:', error);
      // Fall back to mock data on error
      setNearbyRestaurants([]);
    } finally {
      setIsLoadingNearby(false);
    }
  };

  const logInteraction = (type, data) => {
    const interaction = {
      type, // 'like', 'unlike', 'spin_result', 'view_restaurant'
      data,
      timestamp: new Date().toISOString(),
    };
    setInteractionHistory(prev => [...prev, interaction]);
  };

  const spinForRestaurant = () => {
    setIsSpinning(true);
    setSelectedRestaurant(null);
    
    // Simulate spinning with random selections
    let spinCount = 0;
    const spinInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * restaurants.length);
      setSelectedRestaurant(restaurants[randomIndex]);
      spinCount++;
      
      if (spinCount > 15) {
        clearInterval(spinInterval);
        setIsSpinning(false);
        
        // Log the spin result
        logInteraction('spin_result', {
          restaurantId: restaurants[randomIndex].id,
          restaurantName: restaurants[randomIndex].name,
          cuisine: restaurants[randomIndex].cuisine,
        });
        
        setTimeout(() => setView('result'), 300);
      }
    }, 100);
  };

  const toggleLike = (id) => {
    const restaurant = restaurants.find(r => r.id === id);
    const wasLiked = restaurant.liked;
    
    setRestaurants(restaurants.map(r => 
      r.id === id ? { ...r, liked: !r.liked } : r
    ));

    // Log the like/unlike interaction
    logInteraction(wasLiked ? 'unlike' : 'like', {
      restaurantId: id,
      restaurantName: restaurant.name,
      cuisine: restaurant.cuisine,
    });

    // Show save confirmation
    showSaveConfirmation();
  };

  const toggleDietaryFilter = (filter) => {
    setDietaryFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all saved data? This will reset your favorites, filters, and preferences.')) {
      // Clear localStorage
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Reset state
      setRestaurants(mockRestaurants);
      setDietaryFilters([]);
      setInteractionHistory([]);
      setShowSettings(false);
      
      alert('All data cleared successfully!');
    }
  };

  const openInMaps = (restaurant) => {
    // Create Google Maps search URL
    const query = encodeURIComponent(`${restaurant.name} near me`);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(mapsUrl, '_blank');
    
    // Log the interaction
    logInteraction('view_restaurant', {
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      cuisine: restaurant.cuisine,
    });
  };

  // Real Google Places search using Places API (New)
  const searchRestaurant = async (query) => {
    setIsSearching(true);
    
    try {
      // Use Text Search (New) API
      const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating,places.priceLevel,places.primaryTypeDisplayName,places.location'
        },
        body: JSON.stringify({
          textQuery: query + ' restaurant',
          maxResultCount: 1
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.places && data.places.length > 0) {
        const place = data.places[0];
        
        // Map Google Places data to our format
        const restaurantData = {
          name: place.displayName?.text || query,
          address: place.formattedAddress || "Address not available",
          rating: place.rating || 4.0,
          cuisine: place.primaryTypeDisplayName?.text || "Restaurant",
          distance: 0.5, // Would need geolocation to calculate real distance
          price: mapPriceLevel(place.priceLevel),
          dietary: [], // Google doesn't provide this directly
          photoUrl: null, // Can add later with Place Photos API
        };
        
        setSearchResults(restaurantData);
      } else {
        // No results found - create a basic entry
        setSearchResults({
          name: query,
          address: "Restaurant location not found",
          rating: 0,
          cuisine: "Restaurant",
          distance: 0,
          price: "$$",
          dietary: [],
          photoUrl: null,
        });
      }
    } catch (error) {
      console.error('Google Places API error:', error);
      // Fallback to basic entry on error
      setSearchResults({
        name: query,
        address: "Error fetching restaurant data",
        rating: 0,
        cuisine: "Restaurant",
        distance: 0,
        price: "$$",
        dietary: [],
        photoUrl: null,
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Helper function to map Google's price level to our format
  const mapPriceLevel = (priceLevel) => {
    if (!priceLevel) return "$$";
    switch (priceLevel) {
      case "PRICE_LEVEL_INEXPENSIVE": return "$";
      case "PRICE_LEVEL_MODERATE": return "$$";
      case "PRICE_LEVEL_EXPENSIVE": return "$$$";
      case "PRICE_LEVEL_VERY_EXPENSIVE": return "$$$$";
      default: return "$$";
    }
  };


  const addManualRestaurant = (restaurantData) => {
    // Generate new ID
    const newId = Math.max(...restaurants.map(r => r.id)) + 1;
    
    const newRestaurant = {
      id: newId,
      name: restaurantData.name,
      cuisine: restaurantData.cuisine,
      rating: restaurantData.rating,
      distance: restaurantData.distance,
      price: restaurantData.price,
      dietary: restaurantData.dietary,
      liked: true, // Auto-favorite when manually added
      dateAdded: new Date().toISOString(),
    };
    
    setRestaurants([...restaurants, newRestaurant]);
    
    // Log the interaction
    logInteraction('manual_add', {
      restaurantId: newId,
      restaurantName: newRestaurant.name,
      cuisine: newRestaurant.cuisine,
    });
    
    // Close modal and reset
    setShowAddModal(false);
    setSearchQuery('');
    setSearchResults(null);
    
    // Show confirmation
    showSaveConfirmation();
  };

  // Determine which restaurants to show based on view
  const getRestaurantsForView = () => {
    if (listFilter === 'favorites') {
      // Favorites view: show only liked restaurants (from saved/custom)
      return restaurants.filter(r => r.liked);
    } else {
      // Near You view: show nearby if available, otherwise mock
      if (nearbyRestaurants.length > 0) {
        return nearbyRestaurants;
      } else {
        // Fall back to mock restaurants only (not custom)
        return restaurants.filter(r => r.id <= 6);
      }
    }
  };

  // Cuisine-based heuristic for dietary options when no explicit dietary data exists.
  // These cuisines are widely known to have the relevant options available on their menus.
  const DIETARY_HEURISTICS = {
    'vegetarian': ['indian','thai','chinese','japanese','korean','vietnamese','mediterranean',
                   'italian','greek','mexican','middle eastern','ethiopian','nepali','tibetan',
                   'vegan','vegetarian','healthy','cafe','salad','pizza','falafel'],
    'vegan':      ['indian','thai','vietnamese','ethiopian','mediterranean','middle eastern',
                   'chinese','korean','healthy','vegan','salad','falafel','japanese'],
    'gluten-free':['japanese','korean','vietnamese','thai','mexican','indian','mediterranean',
                   'ethiopian','greek','steakhouse','bbq','seafood','sushi'],
  };

  const restaurantLikelyHasDietaryOption = (r, filter) => {
    // If explicit dietary metadata exists, trust it
    if (r.dietary && r.dietary.length > 0) return r.dietary.includes(filter);
    // Fallback: check cuisine against heuristic list
    const cuisineLower = (r.cuisine || '').toLowerCase();
    const heuristics = DIETARY_HEURISTICS[filter] || [];
    return heuristics.some(h => cuisineLower.includes(h));
  };

  // Apply dietary filters
  let filteredRestaurants = dietaryFilters.length === 0
    ? getRestaurantsForView()
    : getRestaurantsForView().filter(r =>
        dietaryFilters.every(filter => restaurantLikelyHasDietaryOption(r, filter))
      );

  // Get total favorites count (from saved restaurants, not nearby)
  const totalFavoritesCount = restaurants.filter(r => r.liked).length;

  // Then apply list filter (favorites)
  if (listFilter === 'favorites') {
    filteredRestaurants = filteredRestaurants.filter(r => r.liked);
    
    // Sort favorites
    filteredRestaurants.sort((a, b) => {
      if (favoritesSort === 'date') {
        // Most recently added first
        return (b.dateAdded || 0) > (a.dateAdded || 0) ? 1 : -1;
      } else if (favoritesSort === 'name') {
        // Alphabetical
        return a.name.localeCompare(b.name);
      } else if (favoritesSort === 'distance') {
        // Closest first
        return a.distance - b.distance;
      }
      return 0;
    });
  }

  // For favorites view, limit to 3 unless showing all
  const displayRestaurants = listFilter === 'favorites' && !showAllFavorites
    ? filteredRestaurants.slice(0, 3)
    : filteredRestaurants;

  if (view === 'result' && selectedRestaurant) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif',
        color: '#1a1a1a',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '40px',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          animation: 'slideUp 0.5s ease-out',
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '20px',
            animation: 'bounce 0.6s ease-out',
          }}>
            🎉
          </div>
          
          <h2 style={{
            fontSize: '28px',
            fontWeight: '700',
            marginBottom: '12px',
            color: '#1a1a1a',
          }}>
            {selectedRestaurant.name}
          </h2>
          
          <div style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '24px',
            color: '#666',
            fontSize: '14px',
          }}>
            <span>{selectedRestaurant.cuisine}</span>
            <span>•</span>
            <span>{selectedRestaurant.price}</span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star size={14} fill="#FFB800" stroke="#FFB800" />
              {selectedRestaurant.rating}
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            color: '#667eea',
            marginBottom: '32px',
            fontSize: '14px',
          }}>
            <MapPin size={16} />
            <span>{selectedRestaurant.distance} mi away</span>
          </div>

          <button
            onClick={() => {
              toggleLike(selectedRestaurant.id);
              alert('Opening in Maps...');
            }}
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '12px',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            Let's Go! 🚗
          </button>

          <button
            onClick={() => setView('main')}
            style={{
              width: '100%',
              padding: '16px',
              background: 'transparent',
              color: '#667eea',
              border: '2px solid #667eea',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#f7f7ff';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          >
            Choose Again
          </button>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
          
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #FFF5EB 0%, #FFE9D6 100%)',
      fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      color: '#1a1a1a',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>

      {/* Header */}
      <div style={{
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          margin: 0,
          background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          FoodSpin
        </h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              background: showFilters ? '#FF6B6B' : 'white',
              color: showFilters ? 'white' : '#FF6B6B',
              border: 'none',
              borderRadius: '12px',
              padding: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.2s',
            }}
          >
            <Filter size={20} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            style={{
              background: 'white',
              color: '#FF6B6B',
              border: 'none',
              borderRadius: '12px',
              padding: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          animation: 'fadeIn 0.2s ease-out',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            animation: 'slideUp 0.3s ease-out',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                margin: 0,
              }}>
                Settings & Data
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                }}
              >
                ×
              </button>
            </div>

            {/* Data Summary */}
            <div style={{
              background: '#f8f8f8',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '12px',
              }}>
                Your Saved Data
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '14px',
                color: '#666',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Favorite Restaurants:</span>
                  <strong style={{ color: '#FF6B6B' }}>
                    {restaurants.filter(r => r.liked).length}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Active Dietary Filters:</span>
                  <strong style={{ color: '#FF6B6B' }}>
                    {dietaryFilters.length}
                  </strong>
                </div>
              </div>
            </div>

            {/* Learning Info */}
            <div style={{
              background: 'linear-gradient(135deg, #FFF5EB 0%, #FFE9D6 100%)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
            }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <Sparkles size={20} style={{ color: '#FF6B6B', flexShrink: 0 }} />
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '600' }}>
                    Learning Your Preferences
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#666', lineHeight: '1.5' }}>
                    We track your likes, dislikes, and spin choices to recommend better restaurants over time. All data is stored locally on your device.
                  </p>
                </div>
              </div>
            </div>

            {/* Clear Data Button */}
            <button
              onClick={clearAllData}
              style={{
                width: '100%',
                padding: '14px',
                background: 'transparent',
                color: '#FF6B6B',
                border: '2px solid #FF6B6B',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#FFF5F5';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              Clear All Data
            </button>
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div style={{
          margin: '0 20px 20px',
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          animation: 'slideDown 0.3s ease-out',
        }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '600' }}>
            Dietary Options
          </h3>
          <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#999' }}>
            Shows restaurants likely to have these options
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['vegetarian', 'vegan', 'gluten-free'].map(filter => (
              <button
                key={filter}
                onClick={() => toggleDietaryFilter(filter)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: 'none',
                  background: dietaryFilters.includes(filter) 
                    ? 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)' 
                    : '#f5f5f5',
                  color: dietaryFilters.includes(filter) ? 'white' : '#666',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Spinner Hero Section */}
      <div style={{
        padding: '20px',
        textAlign: 'center',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
          borderRadius: '24px',
          padding: '40px 20px',
          marginBottom: '30px',
          boxShadow: '0 10px 40px rgba(255, 107, 107, 0.3)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '200px',
            height: '200px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            animation: 'float 6s ease-in-out infinite',
          }} />
          
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: 'white',
            marginBottom: '12px',
            fontFamily: '"Playfair Display", serif',
          }}>
            Can't Decide?
          </h2>
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '28px',
            fontSize: '16px',
          }}>
            Let fate choose your next meal
          </p>

          <button
            onClick={spinForRestaurant}
            disabled={isSpinning}
            style={{
              background: 'white',
              color: '#FF6B6B',
              border: 'none',
              borderRadius: '16px',
              padding: '18px 36px',
              fontSize: '18px',
              fontWeight: '700',
              cursor: isSpinning ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
              transition: 'transform 0.2s',
              animation: isSpinning ? 'pulse 1s infinite' : 'none',
            }}
            onMouseEnter={(e) => !isSpinning && (e.target.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            <Shuffle size={24} style={{
              animation: isSpinning ? 'spin 1s linear infinite' : 'none',
            }} />
            {isSpinning ? 'Spinning...' : 'Spin to Decide!'}
          </button>

          {isSpinning && selectedRestaurant && (
            <div style={{
              marginTop: '20px',
              color: 'white',
              fontSize: '20px',
              fontWeight: '600',
              animation: 'pulse 0.3s ease-in-out',
            }}>
              {selectedRestaurant.name}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '30px',
        }}>
          <div
            onClick={() => {
              if (listFilter !== 'favorites') {
                setListFilter('favorites');
                setShowAllFavorites(false);
              }
            }}
            style={{
              background: listFilter === 'favorites' ? 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)' : 'white',
              color: listFilter === 'favorites' ? 'white' : '#1a1a1a',
              borderRadius: '16px',
              padding: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              cursor: listFilter !== 'favorites' ? 'pointer' : 'default',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (listFilter !== 'favorites') {
                e.currentTarget.style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: '700', color: listFilter === 'favorites' ? 'white' : '#FF6B6B' }}>
              {restaurants.filter(r => r.liked).length}
            </div>
            <div style={{ fontSize: '14px', color: listFilter === 'favorites' ? 'rgba(255,255,255,0.9)' : '#666' }}>
              Favorites
            </div>
          </div>
          <div
            onClick={() => setListFilter('all')}
            style={{
              background: listFilter === 'all' ? 'linear-gradient(135deg, #FF8E53 0%, #FFB366 100%)' : 'white',
              color: listFilter === 'all' ? 'white' : '#1a1a1a',
              borderRadius: '16px',
              padding: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (listFilter !== 'all') {
                e.currentTarget.style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: '700', color: listFilter === 'all' ? 'white' : '#FF8E53' }}>
              {dietaryFilters.length === 0 
                ? restaurants.length 
                : restaurants.filter(r => dietaryFilters.every(filter => restaurantLikelyHasDietaryOption(r, filter))).length
              }
            </div>
            <div style={{ fontSize: '14px', color: listFilter === 'all' ? 'rgba(255,255,255,0.9)' : '#666' }}>
              Nearby
            </div>
          </div>
        </div>
      </div>

      {/* Restaurants List */}
      <div style={{
        padding: '0 20px 100px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '700',
            margin: 0,
          }}>
            {listFilter === 'favorites' ? 'My Favorites' : 'Near You'}
          </h3>
          {listFilter === 'favorites' && totalFavoritesCount > 3 && (
            <button
              onClick={() => setShowAllFavorites(!showAllFavorites)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FF6B6B',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {showAllFavorites ? 'Show Less' : `View All (${totalFavoritesCount})`}
              <ChevronRight size={16} style={{
                transform: showAllFavorites ? 'rotate(-90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }} />
            </button>
          )}
          {listFilter === 'all' && userLocation && (
            <button
              onClick={() => {
                setLastNearbyFetch(null);
                fetchNearbyRestaurants();
              }}
              disabled={isLoadingNearby}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FF6B6B',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isLoadingNearby ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                opacity: isLoadingNearby ? 0.5 : 1,
              }}
            >
              🔄 {isLoadingNearby ? 'Refreshing...' : 'Refresh'}
            </button>
          )}
        </div>

        {/* Sort Options for Favorites */}
        {listFilter === 'favorites' && filteredRestaurants.length > 0 && (
          <div style={{
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{
              fontSize: '13px',
              color: '#666',
              fontWeight: '500',
            }}>
              Sort by:
            </span>
            <div style={{
              display: 'flex',
              gap: '6px',
              flexWrap: 'wrap',
            }}>
              <button
                onClick={() => setFavoritesSort('date')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '16px',
                  border: 'none',
                  background: favoritesSort === 'date' 
                    ? 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)'
                    : '#f5f5f5',
                  color: favoritesSort === 'date' ? 'white' : '#666',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Recently Added
              </button>
              <button
                onClick={() => setFavoritesSort('name')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '16px',
                  border: 'none',
                  background: favoritesSort === 'name' 
                    ? 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)'
                    : '#f5f5f5',
                  color: favoritesSort === 'name' ? 'white' : '#666',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                A-Z
              </button>
              <button
                onClick={() => setFavoritesSort('distance')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '16px',
                  border: 'none',
                  background: favoritesSort === 'distance' 
                    ? 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)'
                    : '#f5f5f5',
                  color: favoritesSort === 'distance' ? 'white' : '#666',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Nearest
              </button>
            </div>
          </div>
        )}

        {displayRestaurants.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '40px 20px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              {listFilter === 'favorites' ? '💔' : '🔍'}
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#1a1a1a' }}>
              {listFilter === 'favorites' ? 'No favorites yet' : 'No restaurants found'}
            </h4>
            <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
              {listFilter === 'favorites' 
                ? 'Heart some restaurants to see them here!' 
                : 'Try adjusting your dietary filters'}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {displayRestaurants.map((restaurant, index) => (
              <div
                key={restaurant.id}
                onClick={() => openInMaps(restaurant)}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  animation: `slideUp 0.4s ease-out ${index * 0.1}s backwards`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    marginBottom: '4px',
                  }}>
                    {restaurant.name}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '8px',
                  }}>
                    {restaurant.cuisine} • {restaurant.price} • {restaurant.distance} mi
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '14px',
                  }}>
                    <Star size={14} fill="#FFB800" stroke="#FFB800" />
                    <span style={{ fontWeight: '600' }}>{restaurant.rating}</span>
                  </div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(restaurant.id);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  <Heart
                    size={24}
                    fill={restaurant.liked ? '#FF6B6B' : 'none'}
                    stroke={restaurant.liked ? '#FF6B6B' : '#ddd'}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowAddModal(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
          color: 'white',
          border: 'none',
          boxShadow: '0 8px 24px rgba(255, 107, 107, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          zIndex: 999,
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 12px 32px rgba(255, 107, 107, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 8px 24px rgba(255, 107, 107, 0.4)';
        }}
      >
        <Plus size={28} />
      </button>

      {/* Add Restaurant Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          animation: 'fadeIn 0.2s ease-out',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            animation: 'slideUp 0.3s ease-out',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                margin: 0,
              }}>
                Add Restaurant
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSearchQuery('');
                  setSearchResults(null);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                }}
              >
                ×
              </button>
            </div>

            {!searchResults ? (
              <>
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '16px',
                }}>
                  Enter the name of a restaurant you'd like to add to your favorites
                </p>

                <div style={{
                  position: 'relative',
                  marginBottom: '16px',
                }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        searchRestaurant(searchQuery);
                      }
                    }}
                    placeholder="e.g., Tony's Pizza, Blue Bottle Coffee..."
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      fontSize: '16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#FF6B6B'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>

                <button
                  onClick={() => searchRestaurant(searchQuery)}
                  disabled={!searchQuery.trim() || isSearching}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: !searchQuery.trim() || isSearching 
                      ? '#e0e0e0' 
                      : 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: !searchQuery.trim() || isSearching ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                  }}
                >
                  {isSearching ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid white',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }} />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search size={20} />
                      Search Restaurant
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '16px',
                }}>
                  Is this the restaurant you're looking for?
                </p>

                <div style={{
                  background: '#f8f8f8',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '20px',
                }}>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    marginBottom: '8px',
                    color: '#1a1a1a',
                  }}>
                    {searchResults.name}
                  </h3>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '12px',
                  }}>
                    {searchResults.address}
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    fontSize: '14px',
                    flexWrap: 'wrap',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={16} fill="#FFB800" stroke="#FFB800" />
                      <span style={{ fontWeight: '600' }}>{searchResults.rating}</span>
                    </div>
                    <span>•</span>
                    <span>{searchResults.cuisine}</span>
                    <span>•</span>
                    <span>{searchResults.price}</span>
                    <span>•</span>
                    <span>{searchResults.distance} mi away</span>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '12px',
                }}>
                  <button
                    onClick={() => addManualRestaurant(searchResults)}
                    style={{
                      flex: 1,
                      padding: '16px',
                      background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    Yes, Add This! ✓
                  </button>
                  <button
                    onClick={() => {
                      setSearchResults(null);
                      setSearchQuery('');
                    }}
                    style={{
                      flex: 1,
                      padding: '16px',
                      background: 'transparent',
                      color: '#FF6B6B',
                      border: '2px solid #FF6B6B',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#FFF5F5';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                    }}
                  >
                    Search Again
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Save Confirmation Toast */}
      {showSaveToast && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#2D3748',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 2000,
          animation: 'slideUpFade 0.3s ease-out',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span>✓</span>
          <span>Saved to your preferences</span>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
