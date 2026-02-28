const { useState, useEffect, useRef } = React;

function RestaurantApp() {
    const [restaurants, setRestaurants] = useState([]);
    const [isSpinning, setIsSpinning] = useState(false);
    const [isSpinningAgain, setIsSpinningAgain] = useState(false);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [dietaryFilters, setDietaryFilters] = useState([]);
    const [view, setView] = useState('main');
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
    const [nearbyApiError, setNearbyApiError] = useState(null); // null | 'key' | 'network'
    const [searchApiError, setSearchApiError] = useState(null); // null | 'key' | 'network'
    const [searchRadius, setSearchRadius] = useState(8046.72); // 5 miles default
    const [multipleSearchResults, setMultipleSearchResults] = useState([]);
    const [selectedSearchResult, setSelectedSearchResult] = useState(null);
    const [spinMode, setSpinMode] = useState('favorites'); // 'favorites' or 'nearby'
    const [showGuidedWizard, setShowGuidedWizard] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);
    const [wizardAnswers, setWizardAnswers] = useState({
        cuisines: [],      // array of selected cuisines
        priceRanges: [],   // array of selected price ranges
        distance: null,
        searchOutside: false,
    });
    const [customCuisineText, setCustomCuisineText] = useState('');
    const [showAllNearby, setShowAllNearby] = useState(false);
    const [listViewMode, setListViewMode] = useState('list'); // 'list' or 'map'
    const [manualEntryMode, setManualEntryMode] = useState(false);
    const [manualForm, setManualForm] = useState({ name: '', address: '', cuisine: '', price: '$$', rating: '4.0' });
    const [nearbySort, setNearbySort] = useState('distance'); // 'distance', 'name', 'rating', 'price'
    // Separate filter states per view so Favorites and Nearby don't share filters
    const EMPTY_FILTERS = { cuisines: [], prices: [], distance: null, rating: null };
    const [favFilters, setFavFilters] = useState(EMPTY_FILTERS);
    const [nearbyFilters, setNearbyFilters] = useState(EMPTY_FILTERS);
    const [showListFilters, setShowListFilters] = useState(false);

    // Convenience: active filters = whichever view is open
    const activeFilters = listFilter === 'favorites' ? favFilters : nearbyFilters;
    const setActiveFilters = listFilter === 'favorites' ? setFavFilters : setNearbyFilters;

    // Shorthands that mirror the old API so the rest of the code changes minimally
    const activeCuisineFilters = activeFilters.cuisines;
    const activePriceFilters   = activeFilters.prices;
    const activeDistanceFilter = activeFilters.distance;
    const activeRatingFilter   = activeFilters.rating;
    const setActiveCuisineFilters = (fn) => setActiveFilters(f => ({ ...f, cuisines: typeof fn === 'function' ? fn(f.cuisines) : fn }));
    const setActivePriceFilters   = (fn) => setActiveFilters(f => ({ ...f, prices:   typeof fn === 'function' ? fn(f.prices)   : fn }));
    const setActiveDistanceFilter = (val) => setActiveFilters(f => ({ ...f, distance: val }));
    const setActiveRatingFilter   = (val) => setActiveFilters(f => ({ ...f, rating:   val }));
    const [priceSortDir, setPriceSortDir] = useState('asc'); // 'asc' = $ first, 'desc' = $$$$ first
    const [nameSortDir, setNameSortDir] = useState('asc');   // 'asc' = A→Z, 'desc' = Z→A
    const [resultSource, setResultSource] = useState('spin'); // 'spin' | 'wizard'
    const lastSpinPoolRef = useRef([]);
    const lastWizardPoolRef = useRef([]);
    const [locationError, setLocationError] = useState(null); // null | 'file_protocol' | 'denied' | 'unavailable'
    const [isDiscovering, setIsDiscovering] = useState(false);
    const [discoverRec, setDiscoverRec] = useState(null);     // { restaurant, explanation }
    const [showDiscoverModal, setShowDiscoverModal] = useState(false);
    const mapRef = useRef(null);
    const leafletMapRef = useRef(null);
    const addMapRef = useRef(null);
    const addLeafletMapRef = useRef(null);
    const addModalListRef = useRef(null);       // scrollable results list container
    const selectedResultRef = useRef(null);     // currently-selected result item
    const selectionFromMapRef = useRef(false);  // true when selection was triggered by a map pin tap
    const [addModalViewMode, setAddModalViewMode] = useState('list'); // 'list' or 'map'
    const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
    const [duplicateName, setDuplicateName] = useState('');

    const showSaveConfirmation = () => {
        setShowSaveToast(true);
        setTimeout(() => setShowSaveToast(false), 2000);
    };

    // Initialize data from localStorage on mount
    useEffect(() => {
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

        const savedFilters = loadFromStorage(STORAGE_KEYS.DIETARY_FILTERS, []);
        setDietaryFilters(savedFilters);

        const savedHistory = loadFromStorage(STORAGE_KEYS.INTERACTION_HISTORY, []);
        setInteractionHistory(savedHistory);
    }, []);

    // Save likes to localStorage
    useEffect(() => {
        if (restaurants.length > 0) {
            const likedIds = restaurants.filter(r => r.liked).map(r => r.id);
            saveToStorage(STORAGE_KEYS.LIKES, likedIds);
            
            // Save custom restaurants (ID > 6, as mock data has IDs 1-6)
            const customRestaurants = restaurants.filter(r => r.id > 6);
            saveToStorage(STORAGE_KEYS.CUSTOM_RESTAURANTS, customRestaurants);
        }
    }, [restaurants]);

    // Save dietary filters
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.DIETARY_FILTERS, dietaryFilters);
    }, [dietaryFilters]);

    // Save interaction history
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
        if (!("geolocation" in navigator)) {
            setLocationError('unavailable');
            return;
        }
        setLocationError(null);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocationError(null);
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            (error) => {
                console.log("Location error:", error.code, error.message);
                if (error.code === 1) {
                    setLocationError('denied');
                } else if (window.location.protocol === 'file:') {
                    // file:// works on desktop browsers but fails on mobile —
                    // hint user to host via HTTPS for mobile access
                    setLocationError('file_protocol_mobile');
                } else {
                    setLocationError('unavailable');
                }
            },
            { timeout: 10000, maximumAge: 300000 }
        );
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
        setNearbyApiError(null);

        try {
            const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
                    'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating,places.priceLevel,places.primaryTypeDisplayName,places.primaryType,places.location'
                },
                body: JSON.stringify({
                    includedTypes: ["restaurant"],
                    maxResultCount: 20,
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
                const errText = await response.text();
                console.error('Places API error:', response.status, errText);
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();

            if (data.places && data.places.length > 0) {
                // Allowlist of Google Places primaryType values that are food/drink establishments
                const FOOD_TYPES = new Set([
                    'restaurant', 'cafe', 'bakery', 'bar', 'food',
                    'american_restaurant', 'barbecue_restaurant', 'brazilian_restaurant',
                    'breakfast_restaurant', 'brunch_restaurant', 'chinese_restaurant',
                    'coffee_shop', 'fast_food_restaurant', 'french_restaurant',
                    'greek_restaurant', 'hamburger_restaurant', 'ice_cream_shop',
                    'indian_restaurant', 'indonesian_restaurant', 'italian_restaurant',
                    'japanese_restaurant', 'korean_restaurant', 'lebanese_restaurant',
                    'meal_delivery', 'meal_takeaway', 'mediterranean_restaurant',
                    'mexican_restaurant', 'middle_eastern_restaurant', 'pizza_restaurant',
                    'ramen_restaurant', 'sandwich_shop', 'seafood_restaurant',
                    'spanish_restaurant', 'steak_house', 'sushi_restaurant',
                    'thai_restaurant', 'turkish_restaurant', 'vegan_restaurant',
                    'vegetarian_restaurant', 'vietnamese_restaurant', 'wine_bar',
                    'pub', 'food_court', 'diner', 'buffet_restaurant',
                ]);
                // Filter: if primaryType is set and NOT in our food list, exclude it
                const filtered = data.places.filter(place => {
                    const type = (place.primaryType || '').toLowerCase();
                    // If no primaryType, allow (some restaurants may lack it)
                    if (!type) return true;
                    return FOOD_TYPES.has(type);
                });

                const nearby = filtered.map((place, index) => {
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
                        distance: Math.round(distance * 10) / 10,
                        price: mapPriceLevel(place.priceLevel),
                        dietary: [],
                        liked: false,
                        address: place.formattedAddress,
                        lat: place.location?.latitude,
                        lng: place.location?.longitude,
                    };
                });

                setNearbyRestaurants(nearby);
                setLastNearbyFetch(Date.now());
            }
        } catch (error) {
            console.error('Error fetching nearby restaurants:', error);
            setNearbyRestaurants([]);
            // Distinguish API key/auth errors from network errors
            if (error.message && error.message.includes('403')) {
                setNearbyApiError('key');
            } else if (error.message && (error.message.includes('400') || error.message.includes('401'))) {
                setNearbyApiError('key');
            } else {
                setNearbyApiError('network');
            }
        } finally {
            setIsLoadingNearby(false);
        }
    };

    const logInteraction = (type, data) => {
        const interaction = {
            type,
            data,
            timestamp: new Date().toISOString(),
        };
        setInteractionHistory(prev => [...prev, interaction]);
    };

    // Try Another for Smart Match — picks different result from same filtered pool
    const tryAnotherWizard = () => {
        const pool = lastWizardPoolRef.current;
        if (!pool || pool.length <= 1) {
            alert("No other matches available! Try adjusting your Smart Match filters.");
            return;
        }
        const excluded = selectedRestaurant?.id;
        const others = pool.filter(r => r.id !== excluded);
        if (!others.length) {
            alert("No other matches available! Try adjusting your Smart Match filters.");
            return;
        }
        setSelectedRestaurant(others[Math.floor(Math.random() * others.length)]);
    };

    // AI-powered Discover: uses Claude to recommend a nearby restaurant based on favorites
    const runDiscover = async (excludeName) => {
        const favorites = restaurants.filter(r => r.liked);
        if (!favorites.length) {
            alert("Save some favorites first so Discover can learn your taste!");
            return;
        }
        if (!nearbyRestaurants.length) {
            alert("Enable location and wait for Nearby to load, then Discover will have options to pick from.");
            return;
        }

        setIsDiscovering(true);
        setDiscoverRec(null);
        setShowDiscoverModal(true);

        // Candidates = nearby not already favorited (and not the one we just showed)
        const favNames = new Set(favorites.map(r => r.name.toLowerCase()));
        let candidates = nearbyRestaurants.filter(r => !favNames.has(r.name.toLowerCase()));
        if (excludeName) candidates = candidates.filter(r => r.name !== excludeName);

        if (!candidates.length) {
            setIsDiscovering(false);
            setDiscoverRec({ restaurant: null, explanation: "You've already favorited every nearby restaurant! Try expanding your area." });
            return;
        }

        const favSummary = favorites.map(r =>
            `${r.name} (${r.cuisine}, ${r.price}, ${r.rating}★)`
        ).join('; ');

        const candList = candidates.slice(0, 20).map((r, i) =>
            `${i + 1}. ${r.name} — ${r.cuisine}, ${r.price}, ${r.rating}★, ${r.distance}mi`
        ).join('\n');

        try {
            const resp = await fetch(ANTHROPIC_PROXY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-6',
                    max_tokens: 300,
                    system: 'You are a restaurant recommendation expert. Analyze someone\'s saved favorites to understand their actual taste — not just cuisine labels but implied preferences around price tier, quality level, and dining style. Respond ONLY with valid compact JSON, no markdown fences.',
                    messages: [{
                        role: 'user',
                        content: `My favorites: ${favSummary}\n\nNearby options I haven't tried:\n${candList}\n\nPick the single best match. Consider price tier alignment, quality bar (ratings), and whether the vibe fits — don't just match cuisine category. Return JSON: {"index": <1-based>, "name": "<name>", "why": "<2-3 sentences explaining why this fits my specific taste, referencing my actual favorites>"}`
                    }]
                })
            });

            if (!resp.ok) throw new Error('API ' + resp.status);
            const data = await resp.json();
            const raw = (data.content?.[0]?.text || '').replace(/```[a-z]*|```/g, '').trim();
            const parsed = JSON.parse(raw);
            const rec = candidates[parsed.index - 1];
            if (!rec) throw new Error('bad index');
            setDiscoverRec({ restaurant: rec, explanation: parsed.why });
        } catch (e) {
            console.error('Discover error:', e);
            // Smart fallback: match price tier + highest rating
            const favPrices = favorites.map(r => r.price);
            const topPrice = [...favPrices].sort((a, b) =>
                favPrices.filter(v => v === b).length - favPrices.filter(v => v === a).length
            )[0];
            const fallback = candidates.filter(r => r.price === topPrice).sort((a, b) => b.rating - a.rating)[0]
                || candidates.sort((a, b) => b.rating - a.rating)[0];
            setDiscoverRec({
                restaurant: fallback,
                explanation: `Based on your favorite price range (${topPrice}) and ratings, this looks like it suits your taste well.`
            });
        } finally {
            setIsDiscovering(false);
        }
    };

    const spinForRestaurant = (poolOverride, inPlace) => {
        // inPlace=true: spin within the result view (Spin Again), no view transitions
        if (inPlace) {
            const spinPool = lastSpinPoolRef.current;
            if (!spinPool || spinPool.length === 0) return;
            setIsSpinningAgain(true);

            let spinCount = 0;
            let lastPicked = null;
            const spinInterval = setInterval(() => {
                const randomIndex = Math.floor(Math.random() * spinPool.length);
                lastPicked = spinPool[randomIndex];
                setSelectedRestaurant(lastPicked);
                spinCount++;
                if (spinCount > 15) {
                    clearInterval(spinInterval);
                    setIsSpinningAgain(false);
                    logInteraction('spin_result', {
                        restaurantId: lastPicked.id,
                        restaurantName: lastPicked.name,
                        cuisine: lastPicked.cuisine,
                        spinMode: spinMode,
                    });
                }
            }, 100);
            return;
        }

        setIsSpinning(true);
        setSelectedRestaurant(null);

        const spinPool = poolOverride || (spinMode === 'favorites' 
            ? restaurants.filter(r => r.liked)
            : nearbyRestaurants);

        if (spinPool.length === 0) {
            alert(spinMode === 'favorites' 
                ? "You don't have any favorites yet! Add some restaurants first." 
                : "No nearby restaurants found. Please allow location access or add some favorites.");
            setIsSpinning(false);
            return;
        }

        // Save pool for "Spin Again"
        lastSpinPoolRef.current = spinPool;

        let spinCount = 0;
        let lastPicked = null;
        const spinInterval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * spinPool.length);
            lastPicked = spinPool[randomIndex];
            setSelectedRestaurant(lastPicked);
            spinCount++;

            if (spinCount > 15) {
                clearInterval(spinInterval);
                setIsSpinning(false);

                logInteraction('spin_result', {
                    restaurantId: lastPicked.id,
                    restaurantName: lastPicked.name,
                    cuisine: lastPicked.cuisine,
                    spinMode: spinMode,
                });

                setResultSource('spin');
                setTimeout(() => setView('result'), 300);
            }
        }, 100);
    };

    const toggleLike = (id) => {
        // Check if this is a nearby restaurant not yet in favorites state
        const isInRestaurants = restaurants.find(r => r.id === id);
        
        if (!isInRestaurants) {
            // It's a nearby restaurant — add it to restaurants state as liked
            const nearbyRest = nearbyRestaurants.find(r => r.id === id);
            if (!nearbyRest) return;
            const newId = Math.max(...restaurants.map(r => typeof r.id === 'number' ? r.id : 0)) + 1;
            const newRestaurant = {
                ...nearbyRest,
                id: newId,
                liked: true,
                dateAdded: new Date().toISOString(),
            };
            setRestaurants(prev => [...prev, newRestaurant]);
            // Update nearbyRestaurants to reflect liked state
            setNearbyRestaurants(prev => prev.map(r => r.id === id ? { ...r, liked: true, _savedId: newId } : r));
            logInteraction('like', { restaurantId: newId, restaurantName: nearbyRest.name, cuisine: nearbyRest.cuisine });
            showSaveConfirmation();
            return;
        }

        const restaurant = isInRestaurants;
        const wasLiked = restaurant.liked;

        setRestaurants(restaurants.map(r =>
            r.id === id ? { ...r, liked: !r.liked } : r
        ));

        // Sync liked state back to nearby list if applicable
        setNearbyRestaurants(prev => prev.map(r => 
            r._savedId === id ? { ...r, liked: !wasLiked } : r
        ));

        logInteraction(wasLiked ? 'unlike' : 'like', {
            restaurantId: id,
            restaurantName: restaurant.name,
            cuisine: restaurant.cuisine,
        });

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
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });

            setRestaurants(mockRestaurants);
            setDietaryFilters([]);
            setInteractionHistory([]);
            setShowSettings(false);

            alert('All data cleared successfully!');
        }
    };

    const openInMaps = (restaurant) => {
        // Build the best possible search query — name + address is most accurate
        let searchStr;
        if (restaurant.address && restaurant.address !== 'Address not available') {
            searchStr = `${restaurant.name} ${restaurant.address}`;
        } else {
            searchStr = `${restaurant.name} restaurant`;
        }
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchStr)}`;
        window.open(mapsUrl, '_blank');
        
        logInteraction('view_restaurant', {
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            cuisine: restaurant.cuisine,
        });
    };

    // Real Google Places search using Places API (New)
    const searchRestaurant = async (query, expandedRadius = false) => {
        setIsSearching(true);
        setMultipleSearchResults([]);
        setSelectedSearchResult(null);
        setSearchApiError(null);
        
        try {
            // Build request body with optional location bias
            const requestBody = {
                textQuery: query + ' restaurant',
                maxResultCount: 5 // Get top 5 results
            };

            // Add location bias if available
            const radiusToUse = expandedRadius ? 40233.6 : searchRadius; // 25 miles if expanded, 5 miles default
            
            if (userLocation) {
                requestBody.locationBias = {
                    circle: {
                        center: {
                            latitude: userLocation.lat,
                            longitude: userLocation.lng
                        },
                        radius: radiusToUse
                    }
                };
            }

            // Use Text Search (New) API
            const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
                    'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating,places.priceLevel,places.primaryTypeDisplayName,places.location'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.places && data.places.length > 0) {
                // Map all results
                const results = data.places.map(place => {
                    // Calculate real distance if we have user location
                    let distance = 0.5; // Default
                    if (userLocation && place.location) {
                        distance = calculateDistance(
                            userLocation.lat,
                            userLocation.lng,
                            place.location.latitude,
                            place.location.longitude
                        );
                        distance = Math.round(distance * 10) / 10; // Round to 1 decimal
                    }
                    
                    return {
                        name: place.displayName?.text || query,
                        address: place.formattedAddress || "Address not available",
                        rating: place.rating || 4.0,
                        cuisine: place.primaryTypeDisplayName?.text || "Restaurant",
                        distance: distance,
                        price: mapPriceLevel(place.priceLevel),
                        dietary: [],
                        photoUrl: null,
                        lat: place.location?.latitude,
                        lng: place.location?.longitude,
                    };
                });
                
                setMultipleSearchResults(results);
                setSearchRadius(radiusToUse); // Remember which radius we used
            } else {
                // No results found
                setMultipleSearchResults([]);
            }
        } catch (error) {
            console.error('Google Places API error:', error);
            setMultipleSearchResults([]);
            if (error.message && (error.message.includes('403') || error.message.includes('400') || error.message.includes('401'))) {
                setSearchApiError('key');
            } else {
                setSearchApiError('network');
            }
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


    const resetAddModal = () => {
        setShowAddModal(false);
        setSearchQuery('');
        setSearchResults(null);
        setManualEntryMode(false);
        setManualForm({ name: '', address: '', cuisine: '', price: '$$', rating: '4.0' });
        setMultipleSearchResults([]);
        setSelectedSearchResult(null);
        setSearchRadius(8046.72);
        setAddModalViewMode('list');
        if (addLeafletMapRef.current) {
            addLeafletMapRef.current.remove();
            addLeafletMapRef.current = null;
        }
    };

    const addManualRestaurant = (restaurantData) => {
        // Duplicate check — same name AND same address (allows multiple locations of same chain)
        const nameNorm = restaurantData.name.toLowerCase().trim();
        const addrNorm = (restaurantData.address || '').toLowerCase().trim();
        const isDuplicate = restaurants.some(r => {
            if (!r.liked) return false;
            const sameName = r.name.toLowerCase().trim() === nameNorm;
            if (!sameName) return false;
            // If both have addresses, compare them; otherwise fall back to name-only check
            const existingAddr = (r.address || '').toLowerCase().trim();
            if (addrNorm && existingAddr) return addrNorm === existingAddr;
            return true; // same name, no address to differentiate
        });
        if (isDuplicate) {
            setDuplicateName(restaurantData.name);
            setShowDuplicateWarning(true);
            return;
        }

        // Generate new ID - handle mixed string/number IDs safely
        const numericIds = restaurants.map(r => typeof r.id === 'number' ? r.id : 0);
        const newId = (numericIds.length > 0 ? Math.max(...numericIds) : 6) + 1;
        
        const newRestaurant = {
            id: newId,
            name: restaurantData.name,
            cuisine: restaurantData.cuisine || 'Restaurant',
            rating: parseFloat(restaurantData.rating) || 4.0,
            distance: restaurantData.distance || 0,
            price: restaurantData.price || '$$',
            dietary: restaurantData.dietary || [],
            address: restaurantData.address || null,
            lat: restaurantData.lat || null,
            lng: restaurantData.lng || null,
            liked: true,
            dateAdded: new Date().toISOString(),
        };
        
        setRestaurants([...restaurants, newRestaurant]);
        
        logInteraction('manual_add', {
            restaurantId: newId,
            restaurantName: newRestaurant.name,
            cuisine: newRestaurant.cuisine,
        });
        
        // Full reset + close
        resetAddModal();
        showSaveConfirmation();
    };

    // Maps sub-cuisines to their parent cuisine for broader matching
    const CUISINE_PARENT_MAP = {
        'cantonese': 'chinese', 'szechuan': 'chinese', 'mandarin': 'chinese',
        'dim sum': 'chinese', 'peking': 'chinese', 'hunan': 'chinese',
        'taiwanese': 'chinese', 'shanghainese': 'chinese', 'hong kong': 'chinese',
        'sushi': 'japanese', 'ramen': 'japanese', 'tempura': 'japanese',
        'izakaya': 'japanese', 'udon': 'japanese', 'soba': 'japanese',
        'neapolitan': 'italian', 'sicilian': 'italian', 'roman': 'italian',
        'pizza': 'italian', 'pasta': 'italian',
        'tex-mex': 'mexican', 'baja': 'mexican', 'taco': 'mexican',
        'korean bbq': 'korean', 'korean fried chicken': 'korean',
        'south indian': 'indian', 'north indian': 'indian',
        'punjabi': 'indian', 'tandoori': 'indian', 'curry': 'indian',
        'thai bbq': 'thai',
        'american bbq': 'american', 'southern': 'american', 'cajun': 'american',
        'pho': 'vietnamese', 'banh mi': 'vietnamese', 'viet': 'vietnamese',
        'mediterranean': 'greek', 'gyro': 'greek',
        'shawarma': 'middle eastern', 'falafel': 'middle eastern', 'halal': 'middle eastern',
        'burrito': 'mexican', 'quesadilla': 'mexican',
        'noodle': 'asian', 'dumpling': 'chinese', 'hot pot': 'chinese',
    };

    // Google Places uses its own cuisine type strings — map user-friendly names to them
    const GOOGLE_TYPE_MAP = {
        'vietnamese': ['vietnamese_restaurant', 'vietnamese', 'pho', 'banh mi', 'viet'],
        'chinese': ['chinese_restaurant', 'chinese', 'dim_sum_restaurant', 'cantonese'],
        'japanese': ['japanese_restaurant', 'japanese', 'sushi_restaurant', 'ramen_restaurant'],
        'korean': ['korean_restaurant', 'korean'],
        'thai': ['thai_restaurant', 'thai'],
        'indian': ['indian_restaurant', 'indian'],
        'italian': ['italian_restaurant', 'italian', 'pizza_restaurant'],
        'mexican': ['mexican_restaurant', 'mexican'],
        'american': ['american_restaurant', 'american', 'hamburger_restaurant'],
        'mediterranean': ['mediterranean_restaurant', 'mediterranean', 'greek_restaurant'],
        'middle eastern': ['middle_eastern_restaurant', 'middle_eastern', 'lebanese_restaurant'],
    };

    const matchesCuisine = (restaurantCuisine, selectedCuisine) => {
        if (!restaurantCuisine || !selectedCuisine) return false;
        const rc = restaurantCuisine.toLowerCase();
        const sc = selectedCuisine.toLowerCase();
        // Direct includes match
        if (rc.includes(sc) || sc.includes(rc)) return true;
        // Check parent map
        const parent = CUISINE_PARENT_MAP[rc];
        if (parent && parent === sc) return true;
        // Check partial sub-cuisine key match
        for (const [sub, par] of Object.entries(CUISINE_PARENT_MAP)) {
            if (par === sc && rc.includes(sub)) return true;
        }
        // Check Google Places type map — handle underscored type names like "vietnamese_restaurant"
        const googleTypes = GOOGLE_TYPE_MAP[sc] || [];
        for (const t of googleTypes) {
            if (rc.includes(t.replace(/_/g, ' ')) || rc.replace(/ /g, '_').includes(t)) return true;
        }
        // Check if rc contains any googleType alias for sc
        const rcNorm = rc.replace(/_/g, ' ').replace('restaurant', '').trim();
        if (rcNorm.includes(sc) || sc.includes(rcNorm)) return true;
        return false;
    };

    const applyGuidedSelection = () => {
        // Get pool based on searchOutside preference
        let pool = wizardAnswers.searchOutside 
            ? nearbyRestaurants  // Only real nearby — no mock
            : restaurants.filter(r => r.liked);

        // Apply filters
        let filtered = pool;

        // Filter by cuisines (multi-select — 'Any' or empty means no cuisine filter)
        const selectedCuisines = wizardAnswers.cuisines.filter(c => c !== 'Any');
        if (selectedCuisines.length > 0) {
            filtered = filtered.filter(r =>
                selectedCuisines.some(sc => matchesCuisine(r.cuisine, sc))
            );
        }

        // Filter by price ranges (multi-select — 'Any' or empty means no price filter)
        const selectedPrices = wizardAnswers.priceRanges.filter(p => p !== 'Any');
        if (selectedPrices.length > 0) {
            filtered = filtered.filter(r => selectedPrices.includes(r.price));
        }

        // Filter by distance
        if (wizardAnswers.distance && wizardAnswers.distance !== 999) {
            filtered = filtered.filter(r => r.distance <= wizardAnswers.distance);
        }

        // Close wizard
        setShowGuidedWizard(false);
        setWizardStep(1);

        // Show results
        if (filtered.length === 0) {
            alert("No restaurants match your criteria. Try adjusting your preferences!");
            setWizardAnswers({ cuisines: [], priceRanges: [], distance: null, searchOutside: false });
        } else {
            const randomIndex = Math.floor(Math.random() * filtered.length);
            setSelectedRestaurant(filtered[randomIndex]);
            
            logInteraction('guided_selection', {
                restaurantId: filtered[randomIndex].id,
                restaurantName: filtered[randomIndex].name,
                cuisines: wizardAnswers.cuisines,
                priceRanges: wizardAnswers.priceRanges,
                distance: wizardAnswers.distance,
                searchOutside: wizardAnswers.searchOutside,
                resultsCount: filtered.length,
            });
            
            lastWizardPoolRef.current = filtered;
            setResultSource('wizard');
            setView('result');
            setWizardAnswers({ cuisines: [], priceRanges: [], distance: null, searchOutside: false });
        }
    };

    // Determine which restaurants to show based on view
    const getRestaurantsForView = () => {
        if (listFilter === 'favorites') {
            return restaurants.filter(r => r.liked);
        } else {
            // Near You: only show real nearby results, never mock data
            return nearbyRestaurants;
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

    // Helper: total number of active filters FOR THE CURRENT VIEW ONLY
    const totalActiveFilters = activeCuisineFilters.length + activePriceFilters.length
        + (activeDistanceFilter !== null ? 1 : 0) + (activeRatingFilter !== null ? 1 : 0);

    const clearAllListFilters = () => setActiveFilters(EMPTY_FILTERS);

    // Pre-compute filtered counts for the stat cards — each uses its OWN filter set
    const applyFiltersToPool = (pool, filters) => {
        let r = pool;
        if (dietaryFilters.length > 0) r = r.filter(x => dietaryFilters.every(f => restaurantLikelyHasDietaryOption(x, f)));
        if (filters.cuisines.length > 0) r = r.filter(x => filters.cuisines.some(sc => matchesCuisine(x.cuisine, sc)));
        if (filters.prices.length > 0)   r = r.filter(x => filters.prices.includes(x.price));
        if (filters.distance !== null)    r = r.filter(x => x.distance <= filters.distance);
        if (filters.rating !== null)      r = r.filter(x => x.rating >= filters.rating);
        return r;
    };
    const favHasFilter  = dietaryFilters.length > 0 || favFilters.cuisines.length > 0 || favFilters.prices.length > 0 || favFilters.distance !== null || favFilters.rating !== null;
    const nearbyHasFilter = dietaryFilters.length > 0 || nearbyFilters.cuisines.length > 0 || nearbyFilters.prices.length > 0 || nearbyFilters.distance !== null || nearbyFilters.rating !== null;
    const filteredFavoritesCount = favHasFilter
        ? applyFiltersToPool(restaurants.filter(r => r.liked), favFilters).length
        : restaurants.filter(r => r.liked).length;
    const filteredNearbyCount = nearbyHasFilter
        ? applyFiltersToPool(nearbyRestaurants, nearbyFilters).length
        : nearbyRestaurants.length;
    const hasAnyFilter = listFilter === 'favorites' ? favHasFilter : nearbyHasFilter;

    // Apply dietary filters
    let filteredRestaurants = dietaryFilters.length === 0
        ? getRestaurantsForView()
        : getRestaurantsForView().filter(r =>
            dietaryFilters.every(filter => restaurantLikelyHasDietaryOption(r, filter))
        );


    // Apply cuisine filter (multi-select)
    if (activeCuisineFilters.length > 0) {
        filteredRestaurants = filteredRestaurants.filter(r =>
            activeCuisineFilters.some(sc => matchesCuisine(r.cuisine, sc))
        );
    }

    // Apply price filter (multi-select)
    if (activePriceFilters.length > 0) {
        filteredRestaurants = filteredRestaurants.filter(r =>
            activePriceFilters.includes(r.price)
        );
    }

    // Apply distance filter
    if (activeDistanceFilter !== null) {
        filteredRestaurants = filteredRestaurants.filter(r =>
            r.distance <= activeDistanceFilter
        );
    }

    // Apply rating filter
    if (activeRatingFilter !== null) {
        filteredRestaurants = filteredRestaurants.filter(r =>
            r.rating >= activeRatingFilter
        );
    }

    // Get total favorites count (from saved restaurants, not nearby)
    const totalFavoritesCount = restaurants.filter(r => r.liked).length;

    // Price sort helper: $ < $$ < $$$ < $$$$
    const priceOrder = { '$': 1, '$$': 2, '$$$': 3, '$$$$': 4 };

    // Sort
    if (listFilter === 'favorites') {
        filteredRestaurants = filteredRestaurants.filter(r => r.liked);
        filteredRestaurants.sort((a, b) => {
            if (favoritesSort === 'date') return (b.dateAdded || 0) > (a.dateAdded || 0) ? 1 : -1;
            if (favoritesSort === 'name') return nameSortDir === 'asc'
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
            if (favoritesSort === 'distance') return a.distance - b.distance;
            if (favoritesSort === 'price') return priceSortDir === 'asc'
                ? (priceOrder[a.price] || 2) - (priceOrder[b.price] || 2)
                : (priceOrder[b.price] || 2) - (priceOrder[a.price] || 2);
            return 0;
        });
    } else {
        // Nearby sort
        filteredRestaurants.sort((a, b) => {
            if (nearbySort === 'name') return nameSortDir === 'asc'
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
            if (nearbySort === 'rating') return b.rating - a.rating;
            if (nearbySort === 'price') return priceSortDir === 'asc'
                ? (priceOrder[a.price] || 2) - (priceOrder[b.price] || 2)
                : (priceOrder[b.price] || 2) - (priceOrder[a.price] || 2);
            return a.distance - b.distance; // default: nearest
        });
    }

    // For favorites view, limit to 3 unless showing all
    // For nearby view, limit to 5 unless showing all
    const NEARBY_DEFAULT_LIMIT = 5;
    const FAVORITES_DEFAULT_LIMIT = 5;
    let displayRestaurants = filteredRestaurants;
    if (listFilter === 'favorites' && !showAllFavorites) {
        displayRestaurants = filteredRestaurants.slice(0, FAVORITES_DEFAULT_LIMIT);
    } else if (listFilter === 'all' && !showAllNearby) {
        displayRestaurants = filteredRestaurants.slice(0, NEARBY_DEFAULT_LIMIT);
    }

    // Compute unique cuisines available in the current pool for filter chips
    const allPoolRestaurants = getRestaurantsForView();
    const availableCuisines = [...new Set(
        allPoolRestaurants.map(r => r.cuisine).filter(Boolean)
    )].sort();
    const availablePrices = ['$', '$$', '$$$', '$$$$'];

    // Geocode an address using Nominatim (free, no API key)
    const geocodeAddress = async (address) => {
        try {
            const resp = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`,
                { headers: { 'Accept-Language': 'en' } }
            );
            const data = await resp.json();
            if (data && data.length > 0) {
                return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
            }
        } catch (e) { /* silent */ }
        return null;
    };

    // When in map+favorites mode, geocode any favorites missing lat/lng
    useEffect(() => {
        if (listViewMode !== 'map' || listFilter !== 'favorites') return;
        const needsGeocode = restaurants.filter(
            r => r.liked && (!r.lat || !r.lng) && r.address && r.address !== 'Address not available'
        );
        if (needsGeocode.length === 0) return;
        needsGeocode.forEach(async (r) => {
            const coords = await geocodeAddress(r.address);
            if (coords) {
                setRestaurants(prev => prev.map(rest =>
                    rest.id === r.id ? { ...rest, lat: coords.lat, lng: coords.lng } : rest
                ));
            }
        });
    }, [listViewMode, listFilter]);

    // Determine the list of restaurants to show on the map
    // Uses filteredRestaurants so all active filters (cuisine, price, distance, dietary) are applied
    const mapRestaurants = filteredRestaurants.filter(r => r.lat && r.lng);

    // Favorites that can't be mapped (no coordinates)
    const unmappableFavorites = listFilter === 'favorites'
        ? filteredRestaurants.filter(r => r.liked && (!r.lat || !r.lng))
        : [];

    // Initialize / update Leaflet map whenever map view is active
    useEffect(() => {
        if (listViewMode !== 'map' || !mapRef.current) return;

        // Center point: user location or first restaurant
        const center = userLocation
            ? [userLocation.lat, userLocation.lng]
            : mapRestaurants.length > 0
                ? [mapRestaurants[0].lat, mapRestaurants[0].lng]
                : [37.7749, -122.4194];

        // Destroy previous map instance if it exists
        if (leafletMapRef.current) {
            leafletMapRef.current.remove();
            leafletMapRef.current = null;
        }

        const map = L.map(mapRef.current, { zoomControl: true }).setView(center, 14);
        leafletMapRef.current = map;

        // CartoDB Positron — clean, minimal tiles, free, no API key
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '© <a href="https://carto.com/">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19,
        }).addTo(map);

        // User location marker (blue)
        if (userLocation) {
            const userIcon = L.divIcon({
                html: '<div style="width:16px;height:16px;background:#4A90E2;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>',
                className: '',
                iconSize: [16, 16],
                iconAnchor: [8, 8],
            });
            L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
                .addTo(map)
                .bindPopup('<b style="font-family:sans-serif">📍 You are here</b>');
        }

        // Restaurant markers with clickable Google Maps links
        mapRestaurants.forEach(r => {
            const color = r.liked ? '#FF6B6B' : '#FF8E53';
            const emoji = r.liked ? '❤️' : '🍽️';
            const icon = L.divIcon({
                html: `<div style="width:36px;height:36px;background:${color};border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.35);cursor:pointer">${emoji}</div>`,
                className: '',
                iconSize: [36, 36],
                iconAnchor: [18, 18],
            });
            // Use name+address for accurate place lookup, not raw coordinates
            const searchStr = (r.address && r.address !== 'Address not available')
                ? `${r.name} ${r.address}`
                : `${r.name} restaurant`;
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchStr)}`;
            const addressLine = r.address && r.address !== 'Address not available'
                ? `<div style="font-size:11px;color:#888;margin-bottom:6px">📍 ${r.address}</div>`
                : '';
            const popup = `
                <div style="font-family:sans-serif;min-width:170px;padding:2px">
                    <div style="font-weight:700;font-size:14px;margin-bottom:3px">${r.name}</div>
                    <div style="font-size:12px;color:#666;margin-bottom:3px">${r.cuisine} • ${r.price} • ⭐${r.rating}</div>
                    ${addressLine}
                    <div style="font-size:12px;color:#888;margin-bottom:8px">${r.distance ? r.distance + ' mi away' : ''}</div>
                    <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer"
                       style="display:block;text-align:center;padding:7px 10px;background:linear-gradient(135deg,#FF6B6B,#FF8E53);color:white;border-radius:8px;font-size:12px;font-weight:700;text-decoration:none">
                        🗺️ Open in Google Maps
                    </a>
                </div>
            `;
            L.marker([r.lat, r.lng], { icon }).addTo(map).bindPopup(popup, { maxWidth: 220 });
        });

        // Fit bounds to show all markers
        if (mapRestaurants.length > 0) {
            const allPoints = [...mapRestaurants.map(r => [r.lat, r.lng])];
            if (userLocation) allPoints.push([userLocation.lat, userLocation.lng]);
            try { map.fitBounds(allPoints, { padding: [40, 40], maxZoom: 15 }); } catch(e) {}
        }

        return () => {
            if (leafletMapRef.current) {
                leafletMapRef.current.remove();
                leafletMapRef.current = null;
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listViewMode, mapRestaurants.map(r => r.id).join(','), listFilter]);

    // Add-modal map: render search results as pins
    useEffect(() => {
        if (addModalViewMode !== 'map' || !addMapRef.current || multipleSearchResults.length === 0) return;

        if (addLeafletMapRef.current) {
            addLeafletMapRef.current.remove();
            addLeafletMapRef.current = null;
        }

        const resultsWithCoords = multipleSearchResults.filter(r => r.lat && r.lng);
        if (resultsWithCoords.length === 0) return;

        const center = userLocation
            ? [userLocation.lat, userLocation.lng]
            : [resultsWithCoords[0].lat, resultsWithCoords[0].lng];

        const map = L.map(addMapRef.current, { zoomControl: true }).setView(center, 14);
        addLeafletMapRef.current = map;

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '© <a href="https://carto.com/">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19,
        }).addTo(map);

        if (userLocation) {
            const userIcon = L.divIcon({
                html: '<div style="width:14px;height:14px;background:#4A90E2;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>',
                className: '', iconSize: [14, 14], iconAnchor: [7, 7],
            });
            L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
                .addTo(map).bindPopup('<b style="font-family:sans-serif">📍 You</b>');
        }

        resultsWithCoords.forEach((r, idx) => {
            const isSelected = selectedSearchResult === multipleSearchResults[multipleSearchResults.indexOf(r)] ||
                selectedSearchResult === r;
            const bg = isSelected ? '#FF6B6B' : '#aaa';
            const border = isSelected ? '3px solid white' : '2px solid white';
            const size = isSelected ? 38 : 32;
            const icon = L.divIcon({
                html: `<div style="width:${size}px;height:${size}px;background:${bg};border:${border};border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:13px;box-shadow:0 2px 8px rgba(0,0,0,${isSelected ? '0.4' : '0.3'});cursor:pointer;transition:all 0.15s">${idx + 1}</div>`,
                className: '', iconSize: [size, size], iconAnchor: [size/2, size/2],
            });
            const marker = L.marker([r.lat, r.lng], { icon }).addTo(map);
            // Clicking the pin selects this restaurant (turns it orange) and scrolls list to it
            marker.on('click', () => {
                selectionFromMapRef.current = true;
                setSelectedSearchResult(r);
            });
        });

        const allPoints = resultsWithCoords.map(r => [r.lat, r.lng]);
        if (userLocation) allPoints.push([userLocation.lat, userLocation.lng]);
        try { map.fitBounds(allPoints, { padding: [30, 30], maxZoom: 15 }); } catch(e) {}

        return () => {
            if (addLeafletMapRef.current) {
                addLeafletMapRef.current.remove();
                addLeafletMapRef.current = null;
            }
        };
    }, [addModalViewMode, multipleSearchResults.length, selectedSearchResult]);

    // Only scroll the list when the user tapped a map pin (not when they clicked a list item)
    useEffect(() => {
        if (!selectedSearchResult || !selectionFromMapRef.current) return;
        selectionFromMapRef.current = false;
        requestAnimationFrame(() => {
            const container = addModalListRef.current;
            const item = selectedResultRef.current;
            if (!container || !item) return;
            // Calculate item's top relative to the scroll container (not the page)
            const containerRect = container.getBoundingClientRect();
            const itemRect = item.getBoundingClientRect();
            const relativeTop = itemRect.top - containerRect.top + container.scrollTop;
            container.scrollTo({ top: relativeTop - 8, behavior: 'smooth' });
        });
    }, [selectedSearchResult]);

    if (view === 'result' && selectedRestaurant) {
        const isSpin = resultSource === 'spin';
        const isWizard = resultSource === 'wizard';
        return (
            <div style={{
                position: 'fixed',
                inset: 0,
                overflow: 'hidden',
                fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif',
            }}>
                <button
                    onClick={() => setView('main')}
                    style={{
                        position: 'absolute', top: '20px', left: '20px', zIndex: 10,
                        background: 'rgba(255,255,255,0.2)', border: 'none',
                        borderRadius: '10px', padding: '8px 16px',
                        color: 'white', fontSize: '14px', fontWeight: '600',
                        cursor: 'pointer', backdropFilter: 'blur(10px)',
                    }}
                >← Back</button>
                <div style={{
                    width: '100%',
                    height: '100%',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    WebkitOverflowScrolling: 'touch',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '64px 20px 20px',
                    boxSizing: 'border-box',
                }}>
                <div style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '24px 20px 20px',
                    maxWidth: '380px',
                    width: '100%',
                    textAlign: 'center',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    animation: 'slideUp 0.5s ease-out',
                }}>
                    <div style={{ fontSize: '32px', marginBottom: '6px' }}>
                        🎲
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: '700', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                        Spin Result
                    </div>

                    <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px', color: '#1a1a1a' }}>
                        {selectedRestaurant.name}
                    </h2>

                    <div style={{
                        display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center',
                        marginBottom: '8px', color: '#666', fontSize: '13px', flexWrap: 'wrap',
                    }}>
                        <span>{selectedRestaurant.cuisine}</span>
                        <span>•</span><span>{selectedRestaurant.price}</span>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Star size={12} fill="#FFB800" stroke="#FFB800" />{selectedRestaurant.rating}
                        </span>
                    </div>

                    {selectedRestaurant.distance > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', color: '#667eea', fontSize: '12px', marginBottom: '8px' }}>
                            <MapPin size={13} />{selectedRestaurant.distance} mi away
                        </div>
                    )}

                    {selectedRestaurant.address && (
                        <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '16px' }}>
                            📍 {selectedRestaurant.address}
                        </div>
                    )}

                    <button
                        onClick={() => openInMaps(selectedRestaurant)}
                        style={{
                            width: '100%', padding: '13px', marginBottom: '8px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white', border: 'none', borderRadius: '12px',
                            fontSize: '15px', fontWeight: '600', cursor: 'pointer',
                        }}
                    >Let's Go! 🚗</button>

                    <button
                        onClick={() => spinForRestaurant(null, true)}
                        disabled={isSpinningAgain}
                        style={{
                            width: '100%', padding: '13px', marginBottom: '8px',
                            background: isSpinningAgain
                                ? 'linear-gradient(135deg, #FF8E53 0%, #FF6B6B 100%)'
                                : 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                            color: 'white', border: 'none', borderRadius: '12px',
                            fontSize: '15px', fontWeight: '600', cursor: isSpinningAgain ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            transition: 'opacity 0.2s', opacity: isSpinningAgain ? 0.85 : 1,
                        }}
                    >
                        <span style={{ display: 'inline-block', animation: isSpinningAgain ? 'spin 0.6s linear infinite' : 'none' }}>🎲</span>
                        {isSpinningAgain ? 'Spinning…' : 'Spin Again'}
                    </button>

                    <button
                        onClick={() => setView('main')}
                        style={{
                            width: '100%', padding: '10px',
                            background: 'transparent', color: '#999',
                            border: '1px solid #e0e0e0', borderRadius: '12px',
                            fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                        }}
                    >Back to Main</button>
                </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            background: 'linear-gradient(to bottom, #FFF5EB 0%, #FFE9D6 100%)',
            fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif',
            color: '#1a1a1a',
            WebkitOverflowScrolling: 'touch',
        }}>
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
                    WhatEat
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
            <div style={{ padding: '20px 20px 0' }}>
                <div style={{
                    background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                    borderRadius: '24px',
                    padding: '24px 20px 20px',
                    marginBottom: '12px',
                    boxShadow: '0 10px 40px rgba(255, 107, 107, 0.3)',
                    position: 'relative',
                    overflow: 'hidden',
                    textAlign: 'center',
                }}>
                    <div style={{
                        position: 'absolute', top: '-50%', right: '-10%',
                        width: '200px', height: '200px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '50%',
                        animation: 'float 6s ease-in-out infinite',
                    }} />
                    <h2 style={{
                        fontSize: '26px', fontWeight: '700', color: 'white',
                        marginBottom: '4px', fontFamily: '"Playfair Display", serif',
                    }}>
                        Random Pick 🎲
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '16px', fontSize: '14px' }}>
                        Completely random — let fate decide
                    </p>
                    <div style={{
                        display: 'flex', gap: '8px', marginBottom: '16px',
                        background: 'rgba(255,255,255,0.15)', padding: '5px',
                        borderRadius: '12px', backdropFilter: 'blur(10px)',
                    }}>
                        <button
                            onClick={() => setSpinMode('favorites')}
                            style={{
                                flex: 1, padding: '9px 16px',
                                background: spinMode === 'favorites' ? 'white' : 'transparent',
                                color: spinMode === 'favorites' ? '#FF6B6B' : 'white',
                                border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
                                cursor: 'pointer', transition: 'all 0.3s',
                                boxShadow: spinMode === 'favorites' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                            }}
                        >❤️ My Favorites</button>
                        <button
                            onClick={() => setSpinMode('nearby')}
                            style={{
                                flex: 1, padding: '9px 16px',
                                background: spinMode === 'nearby' ? 'white' : 'transparent',
                                color: spinMode === 'nearby' ? '#FF6B6B' : 'white',
                                border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
                                cursor: 'pointer', transition: 'all 0.3s',
                                boxShadow: spinMode === 'nearby' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                            }}
                        >🗺️ Try Nearby</button>
                    </div>
                    <button
                        onClick={() => spinForRestaurant()}
                        disabled={isSpinning}
                        style={{
                            background: 'rgba(255,255,255,0.22)',
                            color: 'white',
                            border: '2px solid rgba(255,255,255,0.6)',
                            borderRadius: '14px', padding: '13px 28px',
                            fontSize: '17px', fontWeight: '700',
                            cursor: isSpinning ? 'not-allowed' : 'pointer',
                            display: 'inline-flex', alignItems: 'center', gap: '10px',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                            transition: 'all 0.2s',
                            animation: isSpinning ? 'pulse 1s infinite' : 'none',
                            opacity: isSpinning ? 0.75 : 1,
                        }}
                        onMouseEnter={(e) => !isSpinning && (e.currentTarget.style.background = 'rgba(255,255,255,0.32)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.22)')}
                    >
                        <Shuffle size={22} style={{ animation: isSpinning ? 'spin 1s linear infinite' : 'none' }} />
                        {isSpinning ? 'Spinning...' : 'Spin to Decide!'}
                    </button>

                    {isSpinning && selectedRestaurant && (
                        <div style={{ marginTop: '14px', color: 'white', fontSize: '18px', fontWeight: '600', animation: 'pulse 0.3s ease-in-out' }}>
                            {selectedRestaurant.name}
                        </div>
                    )}
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.25)', margin: '18px 0 16px' }} />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', textAlign: 'left' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                                <span style={{ fontSize: '16px' }}>✨</span>
                                <span style={{ fontSize: '15px', fontWeight: '700', color: 'white', fontFamily: '"Playfair Display", serif' }}>AI Discover</span>
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '12px', margin: 0, lineHeight: '1.4' }}>
                                Picks something new based on your taste
                            </p>
                        </div>
                        <button
                            onClick={() => runDiscover()}
                            disabled={isDiscovering}
                            style={{
                                background: 'rgba(255,255,255,0.22)', color: 'white',
                                border: '1.5px solid rgba(255,255,255,0.55)',
                                borderRadius: '12px', padding: '10px 16px',
                                fontSize: '13px', fontWeight: '700',
                                cursor: isDiscovering ? 'not-allowed' : 'pointer',
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                backdropFilter: 'blur(4px)',
                                transition: 'all 0.2s', flexShrink: 0,
                                opacity: isDiscovering ? 0.7 : 1,
                            }}
                            onMouseEnter={(e) => { if (!isDiscovering) { e.currentTarget.style.background = 'rgba(255,255,255,0.32)'; e.currentTarget.style.transform = 'scale(1.04)'; }}}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)'; e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                            <Sparkles size={15} />
                            {isDiscovering ? 'Analyzing…' : 'Discover'}
                        </button>
                    </div>
                </div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    marginBottom: '20px',
                }}>
                    <div 
                        onClick={() => {
                            if (listFilter !== 'favorites') {
                                setListFilter('favorites');
                                setShowAllFavorites(false);
                                setShowListFilters(false);
                            }
                        }}
                        style={{
                            background: listFilter === 'favorites' ? 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)' : 'white',
                            color: listFilter === 'favorites' ? 'white' : '#1a1a1a',
                            borderRadius: '14px',
                            padding: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            cursor: listFilter !== 'favorites' ? 'pointer' : 'default',
                            transition: 'all 0.2s',
                            textAlign: 'center',
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
                        <div style={{ fontSize: '20px', fontWeight: '700', color: listFilter === 'favorites' ? 'white' : '#FF6B6B' }}>
                            {filteredFavoritesCount}
                        </div>
                        <div style={{ fontSize: '12px', color: listFilter === 'favorites' ? 'rgba(255,255,255,0.9)' : '#666' }}>
                            Favorites{favHasFilter ? ' *' : ''}
                        </div>
                    </div>
                    <div 
                        onClick={() => { setListFilter('all'); setShowListFilters(false); }}
                        style={{
                            background: listFilter === 'all' ? 'linear-gradient(135deg, #FF8E53 0%, #FFB366 100%)' : 'white',
                            color: listFilter === 'all' ? 'white' : '#1a1a1a',
                            borderRadius: '14px',
                            padding: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            textAlign: 'center',
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
                        <div style={{ fontSize: '20px', fontWeight: '700', color: listFilter === 'all' ? 'white' : '#FF8E53' }}>
                            {filteredNearbyCount}
                        </div>
                        <div style={{ fontSize: '12px', color: listFilter === 'all' ? 'rgba(255,255,255,0.9)' : '#666' }}>
                            Nearby{nearbyHasFilter ? ' *' : ''}
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ padding: '0 20px 100px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>
                        {listFilter === 'favorites' ? 'My Favorites' : 'Near You'}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {listFilter === 'favorites' && totalFavoritesCount > 3 && (
                            <button
                                onClick={() => setShowAllFavorites(!showAllFavorites)}
                                style={{
                                    background: 'transparent', border: 'none', color: '#FF6B6B',
                                    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '4px', padding: 0,
                                }}
                            >
                                {showAllFavorites ? 'Show Less' : `View All (${totalFavoritesCount})`}
                                <ChevronRight size={16} style={{ transform: showAllFavorites ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                            </button>
                        )}
                        {listFilter === 'all' && filteredRestaurants.length > NEARBY_DEFAULT_LIMIT && (
                            <button
                                onClick={() => setShowAllNearby(!showAllNearby)}
                                style={{
                                    background: 'transparent', border: 'none', color: '#FF6B6B',
                                    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '4px', padding: 0,
                                }}
                            >
                                {showAllNearby ? 'Show Less' : `View All (${filteredRestaurants.length})`}
                                <ChevronRight size={16} style={{ transform: showAllNearby ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                            </button>
                        )}
                        {listFilter === 'all' && userLocation && listViewMode === 'list' && (
                            <button
                                onClick={() => { setLastNearbyFetch(null); fetchNearbyRestaurants(); }}
                                disabled={isLoadingNearby}
                                style={{
                                    background: 'transparent', border: 'none', color: '#FF6B6B',
                                    fontSize: '14px', fontWeight: '600', padding: 0,
                                    cursor: isLoadingNearby ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                    opacity: isLoadingNearby ? 0.5 : 1,
                                }}
                            >
                                🔄 {isLoadingNearby ? '...' : 'Refresh'}
                            </button>
                        )}
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', background: '#f5f5f5', borderRadius: '10px', padding: '3px', gap: '2px' }}>
                        <button
                            onClick={() => setListViewMode('list')}
                            style={{
                                padding: '5px 10px', borderRadius: '8px', border: 'none',
                                background: listViewMode === 'list' ? 'white' : 'transparent',
                                color: listViewMode === 'list' ? '#FF6B6B' : '#999',
                                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                boxShadow: listViewMode === 'list' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s',
                            }}
                        >☰ List</button>
                        <button
                            onClick={() => setListViewMode('map')}
                            style={{
                                padding: '5px 10px', borderRadius: '8px', border: 'none',
                                background: listViewMode === 'map' ? 'white' : 'transparent',
                                color: listViewMode === 'map' ? '#FF6B6B' : '#999',
                                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                boxShadow: listViewMode === 'map' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s',
                            }}
                        >🗺️ Map</button>
                    </div>
                </div>
                {listViewMode === 'list' && (
                    <div style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                {listFilter === 'favorites' && (
                                    <button onClick={() => setFavoritesSort('date')} style={{
                                        padding: '5px 11px', borderRadius: '16px', border: 'none',
                                        background: favoritesSort === 'date' ? 'linear-gradient(135deg,#FF6B6B,#FF8E53)' : '#f5f5f5',
                                        color: favoritesSort === 'date' ? 'white' : '#666',
                                        fontSize: '12px', fontWeight: '500', cursor: 'pointer',
                                    }}>Recently Added</button>
                                )}
                                {listFilter === 'all' && (
                                    <button onClick={() => setNearbySort('distance')} style={{
                                        padding: '5px 11px', borderRadius: '16px', border: 'none',
                                        background: nearbySort === 'distance' ? 'linear-gradient(135deg,#FF6B6B,#FF8E53)' : '#f5f5f5',
                                        color: nearbySort === 'distance' ? 'white' : '#666',
                                        fontSize: '12px', fontWeight: '500', cursor: 'pointer',
                                    }}>Nearest</button>
                                )}
                                <button
                                    onClick={() => {
                                        const currentSort = listFilter === 'favorites' ? favoritesSort : nearbySort;
                                        if (currentSort === 'name') {
                                            setNameSortDir(d => d === 'asc' ? 'desc' : 'asc');
                                        } else {
                                            setNameSortDir('asc');
                                            listFilter === 'favorites' ? setFavoritesSort('name') : setNearbySort('name');
                                        }
                                    }}
                                    style={{
                                        padding: '5px 11px', borderRadius: '16px', border: 'none',
                                        background: (listFilter === 'favorites' ? favoritesSort : nearbySort) === 'name' ? 'linear-gradient(135deg,#FF6B6B,#FF8E53)' : '#f5f5f5',
                                        color: (listFilter === 'favorites' ? favoritesSort : nearbySort) === 'name' ? 'white' : '#666',
                                        fontSize: '12px', fontWeight: '500', cursor: 'pointer',
                                    }}>
                                    {(listFilter === 'favorites' ? favoritesSort : nearbySort) === 'name'
                                        ? (nameSortDir === 'asc' ? 'A-Z ↑' : 'Z-A ↓')
                                        : 'A-Z'}
                                </button>
                                <button
                                    onClick={() => listFilter === 'favorites' ? setFavoritesSort('distance') : setNearbySort('rating')}
                                    style={{
                                        padding: '5px 11px', borderRadius: '16px', border: 'none',
                                        background: (listFilter === 'favorites'
                                            ? favoritesSort === 'distance'
                                            : nearbySort === 'rating') ? 'linear-gradient(135deg,#FF6B6B,#FF8E53)' : '#f5f5f5',
                                        color: (listFilter === 'favorites'
                                            ? favoritesSort === 'distance'
                                            : nearbySort === 'rating') ? 'white' : '#666',
                                        fontSize: '12px', fontWeight: '500', cursor: 'pointer',
                                    }}>{listFilter === 'favorites' ? 'Nearest' : 'Top Rated'}</button>
                                <button
                                    onClick={() => {
                                        const currentSort = listFilter === 'favorites' ? favoritesSort : nearbySort;
                                        if (currentSort === 'price') {
                                            setPriceSortDir(d => d === 'asc' ? 'desc' : 'asc');
                                        } else {
                                            setPriceSortDir('asc');
                                            listFilter === 'favorites' ? setFavoritesSort('price') : setNearbySort('price');
                                        }
                                    }}
                                    style={{
                                        padding: '5px 11px', borderRadius: '16px', border: 'none',
                                        background: (listFilter === 'favorites' ? favoritesSort : nearbySort) === 'price' ? 'linear-gradient(135deg,#FF6B6B,#FF8E53)' : '#f5f5f5',
                                        color: (listFilter === 'favorites' ? favoritesSort : nearbySort) === 'price' ? 'white' : '#666',
                                        fontSize: '12px', fontWeight: '500', cursor: 'pointer',
                                    }}>
                                    Price {(listFilter === 'favorites' ? favoritesSort : nearbySort) === 'price' ? (priceSortDir === 'asc' ? '↑' : '↓') : ''}
                                </button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => setShowListFilters(!showListFilters)}
                                style={{
                                    padding: '5px 11px', borderRadius: '16px', border: 'none',
                                    background: totalActiveFilters > 0
                                        ? 'linear-gradient(135deg,#FF6B6B,#FF8E53)' : '#f0f0f0',
                                    color: totalActiveFilters > 0 ? 'white' : '#666',
                                    fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                }}
                            >
                                🎛️ Filter {totalActiveFilters > 0 ? `(${totalActiveFilters})` : ''}
                            </button>
                        </div>
                        {showListFilters && (
                            <div style={{
                                background: 'white', borderRadius: '14px', padding: '14px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: '8px',
                            }}>
                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#444', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Cuisine
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {availableCuisines.map(c => (
                                            <button key={c} onClick={() => {
                                                setActiveCuisineFilters(prev =>
                                                    prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
                                                );
                                            }} style={{
                                                padding: '4px 10px', borderRadius: '12px', border: 'none',
                                                background: activeCuisineFilters.includes(c) ? 'linear-gradient(135deg,#FF6B6B,#FF8E53)' : '#f5f5f5',
                                                color: activeCuisineFilters.includes(c) ? 'white' : '#555',
                                                fontSize: '12px', fontWeight: '500', cursor: 'pointer',
                                            }}>{c}</button>
                                        ))}
                                        {availableCuisines.length === 0 && (
                                            <span style={{ fontSize: '12px', color: '#aaa' }}>No cuisine data available</span>
                                        )}
                                    </div>
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#444', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Price Range
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        {availablePrices.map(p => (
                                            <button key={p} onClick={() => {
                                                setActivePriceFilters(prev =>
                                                    prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
                                                );
                                            }} style={{
                                                padding: '6px 14px', borderRadius: '12px', border: 'none',
                                                background: activePriceFilters.includes(p) ? 'linear-gradient(135deg,#FF6B6B,#FF8E53)' : '#f5f5f5',
                                                color: activePriceFilters.includes(p) ? 'white' : '#555',
                                                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                            }}>{p}</button>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ marginBottom: '4px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#444', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Max Distance
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        {[0.5, 1, 2, 5].map(d => (
                                            <button key={d} onClick={() => setActiveDistanceFilter(activeDistanceFilter === d ? null : d)} style={{
                                                padding: '6px 14px', borderRadius: '12px', border: 'none',
                                                background: activeDistanceFilter === d ? 'linear-gradient(135deg,#FF6B6B,#FF8E53)' : '#f5f5f5',
                                                color: activeDistanceFilter === d ? 'white' : '#555',
                                                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                            }}>{d < 1 ? `½ mi` : `${d} mi`}</button>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ marginBottom: '4px', marginTop: '12px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#444', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Min Rating
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        {[3.5, 4.0, 4.5].map(r => (
                                            <button key={r} onClick={() => setActiveRatingFilter(activeRatingFilter === r ? null : r)} style={{
                                                padding: '6px 14px', borderRadius: '12px', border: 'none',
                                                background: activeRatingFilter === r ? 'linear-gradient(135deg,#FF6B6B,#FF8E53)' : '#f5f5f5',
                                                color: activeRatingFilter === r ? 'white' : '#555',
                                                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                            }}>⭐ {r}+</button>
                                        ))}
                                    </div>
                                </div>
                                {totalActiveFilters > 0 && (
                                    <button onClick={clearAllListFilters}
                                        style={{
                                            marginTop: '12px', padding: '5px 12px', borderRadius: '10px',
                                            border: 'none', background: '#fff0f0', color: '#FF6B6B',
                                            fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                                        }}
                                    >✕ Clear all filters</button>
                                )}
                            </div>
                        )}
                    </div>
                )}
                {listViewMode === 'map' && (
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                            {activeCuisineFilters.map(c => (
                                <span key={c} onClick={() => setActiveCuisineFilters(prev => prev.filter(x => x !== c))}
                                    style={{ padding: '4px 10px', borderRadius: '12px', background: '#FFE9D6', color: '#FF6B6B', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                                    {c} ✕
                                </span>
                            ))}
                            {activePriceFilters.map(p => (
                                <span key={p} onClick={() => setActivePriceFilters(prev => prev.filter(x => x !== p))}
                                    style={{ padding: '4px 10px', borderRadius: '12px', background: '#FFE9D6', color: '#FF6B6B', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                                    {p} ✕
                                </span>
                            ))}
                            {activeDistanceFilter !== null && (
                                <span onClick={() => setActiveDistanceFilter(null)}
                                    style={{ padding: '4px 10px', borderRadius: '12px', background: '#FFE9D6', color: '#FF6B6B', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                                    ≤{activeDistanceFilter < 1 ? '½' : activeDistanceFilter} mi ✕
                                </span>
                            )}
                            {activeRatingFilter !== null && (
                                <span onClick={() => setActiveRatingFilter(null)}
                                    style={{ padding: '4px 10px', borderRadius: '12px', background: '#FFE9D6', color: '#FF6B6B', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                                    ⭐ {activeRatingFilter}+ ✕
                                </span>
                            )}
                            <button
                                onClick={() => setShowListFilters(!showListFilters)}
                                style={{
                                    padding: '6px 13px', borderRadius: '16px', border: 'none',
                                    background: totalActiveFilters > 0
                                        ? 'linear-gradient(135deg,#FF6B6B,#FF8E53)' : '#f0f0f0',
                                    color: totalActiveFilters > 0 ? 'white' : '#666',
                                    fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                }}
                            >
                                🎛️ Filter {totalActiveFilters > 0 ? `(${totalActiveFilters})` : ''}
                            </button>
                        </div>
                        {showListFilters && (
                            <div style={{
                                background: 'white', borderRadius: '14px', padding: '14px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: '10px',
                            }}>
                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#444', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cuisine</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {availableCuisines.map(c => (
                                            <button key={c} onClick={() => setActiveCuisineFilters(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])} style={{
                                                padding: '4px 10px', borderRadius: '12px', border: 'none',
                                                background: activeCuisineFilters.includes(c) ? 'linear-gradient(135deg,#FF6B6B,#FF8E53)' : '#f5f5f5',
                                                color: activeCuisineFilters.includes(c) ? 'white' : '#555',
                                                fontSize: '12px', fontWeight: '500', cursor: 'pointer',
                                            }}>{c}</button>
                                        ))}
                                        {availableCuisines.length === 0 && <span style={{ fontSize: '12px', color: '#aaa' }}>No cuisine data available</span>}
                                    </div>
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#444', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price Range</div>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        {availablePrices.map(p => (
                                            <button key={p} onClick={() => setActivePriceFilters(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])} style={{
                                                padding: '6px 14px', borderRadius: '12px', border: 'none',
                                                background: activePriceFilters.includes(p) ? 'linear-gradient(135deg,#FF6B6B,#FF8E53)' : '#f5f5f5',
                                                color: activePriceFilters.includes(p) ? 'white' : '#555',
                                                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                            }}>{p}</button>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ marginBottom: '4px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#444', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Max Distance</div>
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        {[0.5, 1, 2, 5].map(d => (
                                            <button key={d} onClick={() => setActiveDistanceFilter(activeDistanceFilter === d ? null : d)} style={{
                                                padding: '6px 14px', borderRadius: '12px', border: 'none',
                                                background: activeDistanceFilter === d ? 'linear-gradient(135deg,#FF6B6B,#FF8E53)' : '#f5f5f5',
                                                color: activeDistanceFilter === d ? 'white' : '#555',
                                                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                            }}>{d < 1 ? `½ mi` : `${d} mi`}</button>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ marginBottom: '4px', marginTop: '12px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#444', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Min Rating</div>
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        {[3.5, 4.0, 4.5].map(r => (
                                            <button key={r} onClick={() => setActiveRatingFilter(activeRatingFilter === r ? null : r)} style={{
                                                padding: '6px 14px', borderRadius: '12px', border: 'none',
                                                background: activeRatingFilter === r ? 'linear-gradient(135deg,#FF6B6B,#FF8E53)' : '#f5f5f5',
                                                color: activeRatingFilter === r ? 'white' : '#555',
                                                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                            }}>⭐ {r}+</button>
                                        ))}
                                    </div>
                                </div>
                                {totalActiveFilters > 0 && (
                                    <button onClick={clearAllListFilters}
                                        style={{ marginTop: '12px', padding: '5px 12px', borderRadius: '10px', border: 'none', background: '#fff0f0', color: '#FF6B6B', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                                        ✕ Clear all filters
                                    </button>
                                )}
                            </div>
                        )}
                        {!userLocation && mapRestaurants.length === 0 ? (
                            <div style={{
                                background: 'white',
                                borderRadius: '16px',
                                padding: '30px 20px',
                                textAlign: 'center',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            }}>
                                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📍</div>
                                <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                                    Allow location access to see restaurants on the map.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div
                                    ref={mapRef}
                                    style={{
                                        width: '100%',
                                        height: '380px',
                                        borderRadius: '16px',
                                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                                        overflow: 'hidden',
                                    }}
                                />
                                <div style={{
                                    display: 'flex',
                                    gap: '12px',
                                    marginTop: '10px',
                                    fontSize: '12px',
                                    color: '#666',
                                    justifyContent: 'center',
                                    flexWrap: 'wrap',
                                }}>
                                    {userLocation && <span>🔵 You</span>}
                                    {listFilter === 'favorites' ? <span>❤️ Favorite</span> : <span>🍽️ Nearby</span>}
                                    <span style={{ color: '#aaa' }}>Tap a pin → Open in Maps</span>
                                </div>
                                {mapRestaurants.length === 0 && listFilter === 'favorites' && (
                                    <p style={{ textAlign: 'center', fontSize: '13px', color: '#999', marginTop: '8px' }}>
                                        Your favorites are being located… if nothing appears, they may lack address data. Add restaurants via Search to get map pins.
                                    </p>
                                )}
                                {unmappableFavorites.length > 0 && listFilter === 'favorites' && (
                                    <div style={{
                                        marginTop: '10px',
                                        background: '#fff8f0',
                                        borderRadius: '12px',
                                        padding: '10px 14px',
                                        fontSize: '12px',
                                        color: '#888',
                                        border: '1px solid #ffe4cc',
                                    }}>
                                        <strong style={{ color: '#FF8E53' }}>Not mapped ({unmappableFavorites.length}):</strong>{' '}
                                        {unmappableFavorites.map(r => r.name).join(', ')} — no address data available.
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
                {listViewMode === 'list' && listFilter === 'all' && !userLocation && !isLoadingNearby ? (
                    <div style={{
                        background: 'white', borderRadius: '16px', padding: '36px 24px',
                        textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>📍</div>
                        <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#1a1a1a' }}>
                            {locationError === 'denied' ? 'Location Access Blocked' : 'Location Access Needed'}
                        </h4>
                        <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px', lineHeight: '1.6' }}>
                            {locationError === 'denied'
                                ? 'Your browser blocked location access. Open your browser\'s site settings, allow location for this page, then tap Try Again.'
                                : locationError === 'file_protocol_mobile'
                                ? 'Location works when opening this file on a desktop browser. On mobile, you\'ll need to host it via HTTPS (e.g. drag it to netlify.com/drop for a free instant link).'
                                : 'To show restaurants near you, WhatEat needs your location. Your location is only used to find nearby restaurants and is never stored or shared.'}
                        </p>
                        <button
                            onClick={getUserLocation}
                            style={{
                                padding: '14px 28px',
                                background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                                color: 'white', border: 'none', borderRadius: '12px',
                                fontSize: '15px', fontWeight: '600', cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(255,107,107,0.3)',
                            }}
                        >
                            📍 {locationError === 'denied' ? 'Try Again' : 'Share My Location'}
                        </button>
                        {!locationError && (
                            <p style={{ fontSize: '12px', color: '#aaa', marginTop: '12px' }}>
                                If your browser blocks the prompt, check the address bar for a location icon and allow access there.
                            </p>
                        )}
                    </div>
                ) : listViewMode === 'list' && listFilter === 'all' && isLoadingNearby ? (
                    <div style={{
                        background: 'white', borderRadius: '16px', padding: '40px 20px',
                        textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}>
                        <div style={{
                            width: '36px', height: '36px', border: '3px solid #FF6B6B',
                            borderTopColor: 'transparent', borderRadius: '50%',
                            animation: 'spin 1s linear infinite', margin: '0 auto 16px',
                        }} />
                        <p style={{ fontSize: '15px', color: '#666', margin: 0 }}>Finding restaurants near you…</p>
                    </div>
                ) : listViewMode === 'list' && listFilter === 'all' && nearbyApiError ? (
                    <div style={{
                        background: 'white', borderRadius: '16px', padding: '32px 24px',
                        textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}>
                        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔑</div>
                        <h4 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px', color: '#1a1a1a' }}>
                            {nearbyApiError === 'key' ? 'API Key Not Authorized' : 'Connection Error'}
                        </h4>
                        <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px', lineHeight: '1.6' }}>
                            {nearbyApiError === 'key'
                                ? 'Your Google Places API key needs to allow this domain. In Google Cloud Console → Credentials → your key → HTTP referrers, add: dreamsical.github.io/*'
                                : 'Could not reach Google Places. Check your connection and try again.'}
                        </p>
                        <button
                            onClick={() => { setLastNearbyFetch(null); fetchNearbyRestaurants(); }}
                            style={{
                                padding: '10px 20px', borderRadius: '10px', border: 'none',
                                background: 'linear-gradient(135deg,#FF6B6B,#FF8E53)',
                                color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                            }}
                        >Try Again</button>
                    </div>
                ) : listViewMode === 'list' && displayRestaurants.length === 0 ? (
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
                        <p style={{ fontSize: '14px', color: '#666', marginBottom: totalActiveFilters > 0 ? '16px' : '0' }}>
                            {listFilter === 'favorites'
                                ? 'Heart some restaurants to see them here!'
                                : totalActiveFilters > 0
                                ? 'No restaurants match your current filters.'
                                : userLocation ? 'Try adjusting your filters or tap Refresh above.' : 'Enable location to see restaurants near you.'}
                        </p>
                        {totalActiveFilters > 0 && (
                            <button
                                onClick={clearAllListFilters}
                                style={{
                                    padding: '10px 20px', borderRadius: '12px', border: 'none',
                                    background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                                    color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(255,107,107,0.25)',
                                }}
                            >✕ Clear all filters</button>
                        )}
                    </div>
                ) : listViewMode === 'list' ? (
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
                                        fontSize: '13px',
                                        color: restaurant.address ? '#888' : '#bbb',
                                        marginBottom: '6px',
                                        fontStyle: restaurant.address ? 'normal' : 'italic',
                                    }}>
                                        📍 {restaurant.address || 'Address not available'}
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
                ) : null}
            </div>
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
            {showAddModal && (
                <div style={{
                    position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 1000,
                }}>
                <div
                    onClick={(e) => { if (e.target === e.currentTarget) resetAddModal(); }}
                    style={{
                    width: '100%', height: '100%',
                    overflowY: 'auto', overflowX: 'hidden',
                    WebkitOverflowScrolling: 'touch',
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    boxSizing: 'border-box',
                    animation: 'fadeIn 0.2s ease-out',
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        padding: '0',
                        maxWidth: '500px',
                        width: '100%',
                        maxHeight: '92vh',
                        display: 'flex',
                        flexDirection: 'column',
                        animation: 'slideUp 0.3s ease-out',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            padding: '20px 20px 0',
                            flexShrink: 0,
                        }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '16px',
                        }}>
                            <h2 style={{
                                fontSize: '22px',
                                fontWeight: '700',
                                margin: 0,
                            }}>
                                Add Restaurant
                            </h2>
                            <button
                                onClick={resetAddModal}
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
                        </div>
                        <div style={{ overflowY: 'auto', padding: '0 20px 20px', flex: 1 }}>
                        {multipleSearchResults.length === 0 && (
                            <div style={{
                                display: 'flex',
                                background: '#f5f5f5',
                                borderRadius: '12px',
                                padding: '4px',
                                marginBottom: '16px',
                                gap: '4px',
                            }}>
                                <button
                                    onClick={() => setManualEntryMode(false)}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: !manualEntryMode ? 'white' : 'transparent',
                                        color: !manualEntryMode ? '#FF6B6B' : '#999',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        boxShadow: !manualEntryMode ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    🔍 Search Google
                                </button>
                                <button
                                    onClick={() => setManualEntryMode(true)}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: manualEntryMode ? 'white' : 'transparent',
                                        color: manualEntryMode ? '#FF6B6B' : '#999',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        boxShadow: manualEntryMode ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    ✏️ Enter Manually
                                </button>
                            </div>
                        )}
                        {manualEntryMode && multipleSearchResults.length === 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <p style={{ fontSize: '13px', color: '#888', margin: '0 0 4px' }}>
                                    For restaurants far away or not found by search. Google Maps will use the address you enter.
                                </p>
                                {[
                                    { key: 'name', label: 'Restaurant Name *', placeholder: 'e.g., Wok of Flames', type: 'text' },
                                    { key: 'address', label: 'Address (used for navigation)', placeholder: 'e.g., 1234 Main St, Los Angeles, CA', type: 'text' },
                                    { key: 'cuisine', label: 'Cuisine Type', placeholder: 'e.g., Chinese, Italian, Korean…', type: 'text' },
                                ].map(field => (
                                    <div key={field.key}>
                                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '6px' }}>
                                            {field.label}
                                        </label>
                                        <input
                                            type={field.type}
                                            value={manualForm[field.key]}
                                            onChange={(e) => setManualForm({ ...manualForm, [field.key]: e.target.value })}
                                            placeholder={field.placeholder}
                                            style={{
                                                width: '100%',
                                                padding: '12px 14px',
                                                fontSize: '14px',
                                                border: '2px solid #e0e0e0',
                                                borderRadius: '10px',
                                                outline: 'none',
                                                boxSizing: 'border-box',
                                                transition: 'border-color 0.2s',
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = '#FF6B6B'}
                                            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                        />
                                    </div>
                                ))}
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '6px' }}>Price Range</label>
                                        <select
                                            value={manualForm.price}
                                            onChange={(e) => setManualForm({ ...manualForm, price: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '12px 14px',
                                                fontSize: '14px',
                                                border: '2px solid #e0e0e0',
                                                borderRadius: '10px',
                                                outline: 'none',
                                                background: 'white',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {['$', '$$', '$$$', '$$$$'].map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '6px' }}>Rating (1-5)</label>
                                        <input
                                            type="number"
                                            min="1" max="5" step="0.1"
                                            value={manualForm.rating}
                                            onChange={(e) => setManualForm({ ...manualForm, rating: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '12px 14px',
                                                fontSize: '14px',
                                                border: '2px solid #e0e0e0',
                                                borderRadius: '10px',
                                                outline: 'none',
                                                boxSizing: 'border-box',
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = '#FF6B6B'}
                                            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        if (!manualForm.name.trim()) return;
                                        addManualRestaurant({
                                            ...manualForm,
                                            distance: 0,
                                            dietary: [],
                                        });
                                        setManualEntryMode(false);
                                        setManualForm({ name: '', address: '', cuisine: '', price: '$$', rating: '4.0' });
                                    }}
                                    disabled={!manualForm.name.trim()}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        background: manualForm.name.trim()
                                            ? 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)'
                                            : '#e0e0e0',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        cursor: manualForm.name.trim() ? 'pointer' : 'not-allowed',
                                        marginTop: '4px',
                                    }}
                                >
                                    ✓ Add to Favorites
                                </button>
                            </div>
                        )}

                        {!manualEntryMode && multipleSearchResults.length === 0 ? (
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
                                {searchApiError && (
                                    <div style={{
                                        marginTop: '12px', padding: '12px 14px',
                                        background: '#fff3f3', borderRadius: '10px',
                                        border: '1px solid #ffd0d0',
                                    }}>
                                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#c0392b', marginBottom: '4px' }}>
                                            {searchApiError === 'key' ? '🔑 API Key Not Authorized' : '⚠️ Connection Error'}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.5' }}>
                                            {searchApiError === 'key'
                                                ? 'Add dreamsical.github.io/* to your Google API key\'s allowed HTTP referrers in Google Cloud Console.'
                                                : 'Could not reach Google. Check your connection and try again.'}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : !manualEntryMode ? (
                            <>
                                {multipleSearchResults.length > 0 ? (
                                    <>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '12px',
                                        }}>
                                            <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                                                Found {multipleSearchResults.length} result{multipleSearchResults.length > 1 ? 's' : ''}. Select one:
                                            </p>
                                            <div style={{
                                                display: 'flex',
                                                background: '#f5f5f5',
                                                borderRadius: '10px',
                                                padding: '3px',
                                                gap: '2px',
                                            }}>
                                                <button
                                                    onClick={() => setAddModalViewMode('list')}
                                                    style={{
                                                        padding: '5px 10px',
                                                        borderRadius: '7px',
                                                        border: 'none',
                                                        background: addModalViewMode === 'list' ? 'white' : 'transparent',
                                                        color: addModalViewMode === 'list' ? '#FF6B6B' : '#999',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        boxShadow: addModalViewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                                        transition: 'all 0.2s',
                                                    }}
                                                >☰ List</button>
                                                <button
                                                    onClick={() => setAddModalViewMode('map')}
                                                    style={{
                                                        padding: '5px 10px',
                                                        borderRadius: '7px',
                                                        border: 'none',
                                                        background: addModalViewMode === 'map' ? 'white' : 'transparent',
                                                        color: addModalViewMode === 'map' ? '#FF6B6B' : '#999',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        boxShadow: addModalViewMode === 'map' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                                        transition: 'all 0.2s',
                                                    }}
                                                >🗺️ Map</button>
                                            </div>
                                        </div>
                                        {addModalViewMode === 'map' && (
                                            <div style={{ marginBottom: '12px' }}>
                                                <div
                                                    ref={addMapRef}
                                                    style={{
                                                        width: '100%',
                                                        height: '260px',
                                                        borderRadius: '12px',
                                                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                                        overflow: 'hidden',
                                                        marginBottom: '8px',
                                                    }}
                                                />
                                                <p style={{ fontSize: '11px', color: '#aaa', textAlign: 'center', margin: 0 }}>
                                                    Tap a pin to select · scroll list below to see details
                                                </p>
                                            </div>
                                        )}
                                        <div
                                            ref={addModalListRef}
                                            style={{
                                            maxHeight: addModalViewMode === 'map' ? '160px' : '240px',
                                            overflowY: 'auto',
                                            marginBottom: '12px',
                                        }}>
                                            {multipleSearchResults.map((result, index) => (
                                                <div
                                                    key={index}
                                                    ref={selectedSearchResult === result ? selectedResultRef : null}
                                                    onClick={() => setSelectedSearchResult(result)}
                                                    style={{
                                                        background: selectedSearchResult === result ? '#FFF5F5' : '#f8f8f8',
                                                        border: selectedSearchResult === result ? '2px solid #FF6B6B' : '2px solid transparent',
                                                        borderRadius: '12px',
                                                        padding: '14px 16px',
                                                        marginBottom: '10px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        display: 'flex',
                                                        gap: '12px',
                                                        alignItems: 'flex-start',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (selectedSearchResult !== result) {
                                                            e.currentTarget.style.background = '#f0f0f0';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (selectedSearchResult !== result) {
                                                            e.currentTarget.style.background = '#f8f8f8';
                                                        }
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                                                        background: selectedSearchResult === result ? '#FF6B6B' : '#ccc',
                                                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '12px', fontWeight: '700', marginTop: '2px',
                                                    }}>
                                                        {index + 1}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <h4 style={{
                                                            fontSize: '15px',
                                                            fontWeight: '700',
                                                            marginBottom: '4px',
                                                            margin: '0 0 4px',
                                                            color: '#1a1a1a',
                                                        }}>
                                                            {result.name}
                                                        </h4>
                                                        <div style={{
                                                            fontSize: '13px',
                                                            color: '#666',
                                                            marginBottom: '6px',
                                                        }}>
                                                            📍 {result.address}
                                                        </div>
                                                        <div style={{
                                                            display: 'flex',
                                                            gap: '8px',
                                                            alignItems: 'center',
                                                            fontSize: '12px',
                                                            flexWrap: 'wrap',
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                                <Star size={12} fill="#FFB800" stroke="#FFB800" />
                                                                <span style={{ fontWeight: '600' }}>{result.rating}</span>
                                                            </div>
                                                            <span style={{ color: '#ccc' }}>•</span>
                                                            <span>{result.price}</span>
                                                            <span style={{ color: '#ccc' }}>•</span>
                                                            <span>{result.distance} mi</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            gap: '10px',
                                            marginBottom: searchRadius < 40233.6 ? '10px' : '0',
                                        }}>
                                            <button
                                                onClick={() => {
                                                    if (selectedSearchResult) {
                                                        addManualRestaurant(selectedSearchResult);
                                                    }
                                                }}
                                                disabled={!selectedSearchResult}
                                                style={{
                                                    flex: 1,
                                                    padding: '13px',
                                                    background: selectedSearchResult 
                                                        ? 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)'
                                                        : '#e0e0e0',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    fontSize: '16px',
                                                    fontWeight: '600',
                                                    cursor: selectedSearchResult ? 'pointer' : 'not-allowed',
                                                    transition: 'transform 0.2s',
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (selectedSearchResult) e.target.style.transform = 'scale(1.02)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.transform = 'scale(1)';
                                                }}
                                            >
                                                Add Selected ✓
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setMultipleSearchResults([]);
                                                    setSelectedSearchResult(null);
                                                    setSearchQuery('');
                                                    setSearchRadius(8046.72);
                                                    setAddModalViewMode('list');
                                                    if (addLeafletMapRef.current) {
                                                        addLeafletMapRef.current.remove();
                                                        addLeafletMapRef.current = null;
                                                    }
                                                }}
                                                style={{
                                                    flex: 1,
                                                    padding: '13px',
                                                    background: 'transparent',
                                                    color: '#FF6B6B',
                                                    border: '2px solid #FF6B6B',
                                                    borderRadius: '12px',
                                                    fontSize: '14px',
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
                                        {searchRadius < 40233.6 && (
                                            <button
                                                onClick={() => searchRestaurant(searchQuery, true)}
                                                disabled={isSearching}
                                                style={{
                                                    width: '100%', padding: '10px', marginTop: '8px',
                                                    background: 'transparent', color: '#FF6B6B',
                                                    border: '1px dashed #FF6B6B', borderRadius: '10px',
                                                    fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                                }}
                                            >🔍 Expand search radius (up to 25 miles)</button>
                                        )}
                                    </>
                ) : (
                                    <>
                                        <p style={{
                                            fontSize: '14px',
                                            color: '#666',
                                            marginBottom: '16px',
                                            textAlign: 'center',
                                        }}>
                                            No results found for "{searchQuery}"
                                        </p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {searchRadius < 40233.6 && (
                                                <button
                                                    onClick={() => searchRestaurant(searchQuery, true)}
                                                    disabled={isSearching}
                                                    style={{
                                                        width: '100%', padding: '14px',
                                                        background: 'linear-gradient(135deg,#FF6B6B,#FF8E53)',
                                                        color: 'white', border: 'none', borderRadius: '12px',
                                                        fontSize: '15px', fontWeight: '600', cursor: 'pointer',
                                                    }}
                                                >🔍 Try wider search (up to 25 miles)</button>
                                            )}
                                            <button
                                                onClick={() => { setMultipleSearchResults([]); setSearchQuery(''); setSearchRadius(8046.72); }}
                                                style={{
                                                    width: '100%', padding: '14px',
                                                    background: 'transparent', color: '#FF6B6B',
                                                    border: '2px solid #FF6B6B', borderRadius: '12px',
                                                    fontSize: '15px', fontWeight: '600', cursor: 'pointer',
                                                }}
                                            >Search Again</button>
                                        </div>
                                    </>
                                )}
                            </>
                        ) : null}
                        </div>
                    </div>
                </div>
                </div>
            )}
            {showDiscoverModal && (
                <div style={{
                    position: 'fixed', inset: 0, overflow: 'hidden',
                    zIndex: 2100,
                }}>
                    <div
                        onClick={(e) => { if (e.target === e.currentTarget && !isDiscovering) setShowDiscoverModal(false); }}
                        style={{
                            width: '100%', height: '100%',
                            overflowY: 'auto', overflowX: 'hidden',
                            WebkitOverflowScrolling: 'touch',
                            background: 'rgba(0,0,0,0.6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '20px', boxSizing: 'border-box',
                            animation: 'fadeIn 0.2s ease-out',
                        }}
                    >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'white', borderRadius: '20px', padding: '28px',
                            maxWidth: '420px', width: '100%', textAlign: 'center',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)', animation: 'slideUp 0.3s ease-out',
                            position: 'relative',
                        }}
                    >
                        {!isDiscovering && (
                            <button
                                onClick={() => setShowDiscoverModal(false)}
                                style={{ position: 'absolute', top: '14px', right: '18px', background: 'transparent', border: 'none', fontSize: '22px', color: '#bbb', cursor: 'pointer' }}
                            >×</button>
                        )}

                        {isDiscovering && (
                            <>
                                <div style={{ fontSize: '40px', marginBottom: '14px' }}>✨</div>
                                <div style={{ fontSize: '17px', fontWeight: '600', marginBottom: '6px' }}>Analyzing your taste…</div>
                                <div style={{ fontSize: '13px', color: '#888', marginBottom: '22px' }}>Comparing your favorites with nearby options</div>
                                <div style={{
                                    width: '32px', height: '32px', border: '3px solid #7C3AED',
                                    borderTopColor: 'transparent', borderRadius: '50%',
                                    animation: 'spin 1s linear infinite', margin: '0 auto',
                                }} />
                            </>
                        )}

                        {!isDiscovering && discoverRec && discoverRec.restaurant && (
                            <>
                                <div style={{ fontSize: '38px', marginBottom: '10px' }}>✨</div>
                                <div style={{ fontSize: '11px', fontWeight: '700', color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                                    Recommended for You
                                </div>
                                <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px', color: '#1a1a1a' }}>
                                    {discoverRec.restaurant.name}
                                </h3>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', fontSize: '13px', color: '#666', marginBottom: '14px', flexWrap: 'wrap' }}>
                                    <span>{discoverRec.restaurant.cuisine}</span>
                                    <span>•</span><span>{discoverRec.restaurant.price}</span>
                                    <span>•</span><span>⭐ {discoverRec.restaurant.rating}</span>
                                    {discoverRec.restaurant.distance > 0 && (<><span>•</span><span>{discoverRec.restaurant.distance} mi</span></>)}
                                </div>
                                <div style={{
                                    background: 'linear-gradient(135deg, #f5f0ff, #ede8ff)',
                                    borderRadius: '12px', padding: '14px 16px', marginBottom: '16px',
                                    fontSize: '14px', color: '#4B0082', lineHeight: '1.6', textAlign: 'left',
                                    borderLeft: '3px solid #7C3AED',
                                }}>
                                    💡 {discoverRec.explanation}
                                </div>
                                {discoverRec.restaurant.address && (
                                    <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '16px' }}>
                                        📍 {discoverRec.restaurant.address}
                                    </div>
                                )}
                                <button
                                    onClick={() => openInMaps(discoverRec.restaurant)}
                                    style={{
                                        width: '100%', padding: '14px', marginBottom: '10px',
                                        background: 'linear-gradient(135deg, #7C3AED, #9F67F5)',
                                        color: 'white', border: 'none', borderRadius: '12px',
                                        fontSize: '15px', fontWeight: '600', cursor: 'pointer',
                                    }}
                                >Let's Go! 🚗</button>
                                <button
                                    onClick={() => runDiscover(discoverRec.restaurant.name)}
                                    style={{
                                        width: '100%', padding: '12px', marginBottom: '8px',
                                        background: 'transparent', color: '#7C3AED',
                                        border: '2px solid #7C3AED', borderRadius: '12px',
                                        fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                                    }}
                                >✨ Try Another Suggestion</button>
                                <button
                                    onClick={() => setShowDiscoverModal(false)}
                                    style={{
                                        width: '100%', padding: '10px',
                                        background: 'transparent', color: '#aaa',
                                        border: '1px solid #e0e0e0', borderRadius: '10px',
                                        fontSize: '13px', cursor: 'pointer',
                                    }}
                                >Close</button>
                            </>
                        )}

                        {!isDiscovering && discoverRec && !discoverRec.restaurant && (
                            <>
                                <div style={{ fontSize: '40px', marginBottom: '12px' }}>😕</div>
                                <div style={{ fontSize: '15px', color: '#666', marginBottom: '16px' }}>{discoverRec.explanation}</div>
                                <button onClick={() => setShowDiscoverModal(false)} style={{ padding: '12px 24px', background: '#7C3AED', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Close</button>
                            </>
                        )}
                    </div>
                    </div>
                </div>
            )}
            {showDuplicateWarning && (
                <div
                    onClick={() => setShowDuplicateWarning(false)}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.5)', zIndex: 2000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '20px', animation: 'fadeIn 0.2s ease-out',
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'white', borderRadius: '20px', padding: '32px 28px',
                            maxWidth: '360px', width: '100%', textAlign: 'center',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                            animation: 'slideUp 0.3s ease-out',
                        }}
                    >
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>❤️</div>
                        <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px', color: '#1a1a1a' }}>
                            Already in Favorites!
                        </h3>
                        <p style={{ fontSize: '15px', color: '#666', marginBottom: '24px', lineHeight: '1.5' }}>
                            <strong style={{ color: '#FF6B6B' }}>{duplicateName}</strong> at this address is already on your My Favorites list. To add a different location of the same restaurant, search again with the specific address.
                        </p>
                        <button
                            onClick={() => setShowDuplicateWarning(false)}
                            style={{
                                width: '100%', padding: '14px',
                                background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                                color: 'white', border: 'none', borderRadius: '12px',
                                fontSize: '16px', fontWeight: '600', cursor: 'pointer',
                            }}
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
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

                @keyframes bounce {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.2); }
                }
            `}</style>
        </div>
    );
}

// Render app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<RestaurantApp />);