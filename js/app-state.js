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
    const [blacklist, setBlacklist] = useState([]); // array of place names to permanently hide
    const [searchLocation, setSearchLocation] = useState(null); // {lat, lng, label} override
    const [isGeocodingLocation, setIsGeocodingLocation] = useState(false);
    const [locationSearchInput, setLocationSearchInput] = useState('');
    const [locationSearchError, setLocationSearchError] = useState(null);

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
    const realUserLocationRef = useRef(null);   // always holds real GPS coords even when searchLocation is set
    const [addModalViewMode, setAddModalViewMode] = useState('list'); // 'list' or 'map'
    const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
    const [duplicateName, setDuplicateName] = useState('');

    const showSaveConfirmation = () => {
        setShowSaveToast(true);
        setTimeout(() => setShowSaveToast(false), 2000);
    };

    // Block horizontal swipe/pan on iOS Safari at the touch event level.
    // CSS overflow-x:hidden alone is not enough — iOS Safari still allows
    // the document to pan horizontally during touch gestures.
    // Also blocks pinch-to-zoom since Android Chrome ignores user-scalable=no.
    useEffect(() => {
        let startX = 0;
        let startY = 0;

        const onTouchStart = (e) => {
            // Block pinch-to-zoom (2+ fingers)
            if (e.touches.length > 1) {
                e.preventDefault();
                return;
            }
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        };

        const onTouchMove = (e) => {
            // Block pinch-to-zoom (2+ fingers)
            if (e.touches.length > 1) {
                e.preventDefault();
                return;
            }
            const dx = Math.abs(e.touches[0].clientX - startX);
            const dy = Math.abs(e.touches[0].clientY - startY);
            // If horizontal movement dominates, block the event
            if (dx > dy) {
                e.preventDefault();
            }
        };

        // gesturestart/gesturechange are Safari-specific pinch events
        const onGesture = (e) => { e.preventDefault(); };

        document.addEventListener('touchstart', onTouchStart, { passive: false });
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('gesturestart', onGesture, { passive: false });
        document.addEventListener('gesturechange', onGesture, { passive: false });

        return () => {
            document.removeEventListener('touchstart', onTouchStart);
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('gesturestart', onGesture);
            document.removeEventListener('gesturechange', onGesture);
        };
    }, []);

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

    // Re-fetch when searchLocation override changes (set or cleared)
    useEffect(() => {
        if (searchLocation) {
            fetchNearbyRestaurants();
        }
    }, [searchLocation]);

    // Recalculate distances for all saved favorites whenever location updates.
    // Favorites store the distance from when they were added — this keeps them current.
    useEffect(() => {
        if (!userLocation) return;
        setRestaurants(prev => prev.map(r => {
            if (!r.lat || !r.lng) return r;
            const d = calculateDistance(userLocation.lat, userLocation.lng, r.lat, r.lng);
            return { ...r, distance: Math.round(d * 10) / 10 };
        }));
    }, [userLocation]);

    // Load blacklist from localStorage on mount
    useEffect(() => {
        const saved = loadFromStorage(STORAGE_KEYS.BLACKLIST, []);
        setBlacklist(saved);
    }, []);

    // Persist blacklist to localStorage whenever it changes
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.BLACKLIST, blacklist);
    }, [blacklist]);

    // Blacklist a nearby restaurant by name — hides it from list, spin, and discover
    const blacklistRestaurant = (name) => {
        setBlacklist(prev => prev.includes(name) ? prev : [...prev, name]);
    };

    // Geocode a user-typed address/zip/city and set it as the search location override
    const geocodeAndSearchLocation = async (query) => {
        if (!query.trim()) return;
        setIsGeocodingLocation(true);
        setLocationSearchError(null);
        try {
            const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&q='
                + encodeURIComponent(query.trim());
            const resp = await fetch(url, { headers: { 'Accept-Language': 'en' } });
            const data = await resp.json();
            if (!data || data.length === 0) {
                setLocationSearchError('No location found. Try a different address or zip code.');
                setIsGeocodingLocation(false);
                return;
            }
            const { lat, lon, display_name } = data[0];
            // Use the first two parts of the display name as a short label (e.g. "Sunnyvale, California")
            const label = display_name.split(',').slice(0, 2).join(',').trim();
            const newLocation = { lat: parseFloat(lat), lng: parseFloat(lon), label };
            setSearchLocation(newLocation);
            setLocationSearchInput('');
            // Clear cache and re-fetch nearby for the new location
            setLastNearbyFetch(null);
            setNearbyRestaurants([]);
        } catch (e) {
            setLocationSearchError('Could not connect. Check your internet connection.');
        }
        setIsGeocodingLocation(false);
    };

    // Clear the location override and return to real GPS
    const clearSearchLocation = () => {
        setSearchLocation(null);
        setLocationSearchInput('');
        setLocationSearchError(null);
        setLastNearbyFetch(null);
        setNearbyRestaurants([]);
        // Pass real GPS directly — can't rely on searchLocation state being null yet
        const realGps = realUserLocationRef.current || userLocation;
        if (realGps) fetchNearbyRestaurants(realGps);
    };

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
                const coords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                realUserLocationRef.current = coords;
                setUserLocation(coords);
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
    const fetchNearbyRestaurants = async (locationOverride) => {
        // Explicit override (e.g. from clearSearchLocation) > searchLocation > real GPS
        const locationToUse = locationOverride || searchLocation || userLocation;
        if (!locationToUse) return;

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
                                latitude: locationToUse.lat,
                                longitude: locationToUse.lng
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
                        locationToUse.lat,
                        locationToUse.lng,
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

        // Candidates = nearby not already favorited, not blacklisted, and not the one we just showed
        const favNames = new Set(favorites.map(r => r.name.toLowerCase()));
        let candidates = nearbyRestaurants.filter(r => 
            !favNames.has(r.name.toLowerCase()) && !blacklist.includes(r.name)
        );
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
            : nearbyRestaurants.filter(r => !blacklist.includes(r.name)));

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

    // Remove blacklisted restaurants from the nearby view
    if (listFilter === 'all') {
        filteredRestaurants = filteredRestaurants.filter(r => !blacklist.includes(r.name));
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

        // Center on search location if overriding, otherwise real GPS, otherwise first restaurant
        const locationForCenter = searchLocation || userLocation;
        const center = locationForCenter
            ? [locationForCenter.lat, locationForCenter.lng]
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

        // Real GPS blue dot — always shows actual device location (even when browsing elsewhere)
        const realGps = realUserLocationRef.current;
        if (realGps) {
            const userIcon = L.divIcon({
                html: '<div style="width:16px;height:16px;background:#4A90E2;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>',
                className: '',
                iconSize: [16, 16],
                iconAnchor: [8, 8],
            });
            L.marker([realGps.lat, realGps.lng], { icon: userIcon })
                .addTo(map)
                .bindPopup('<b style="font-family:sans-serif">📍 You are here</b>');
        }

        // Search-location crosshair pin — shown when browsing a custom location
        if (searchLocation) {
            const searchIcon = L.divIcon({
                html: '<div style="width:22px;height:22px;background:#FF6B6B;border:3px solid white;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 2px 8px rgba(0,0,0,0.4)">📍</div>',
                className: '',
                iconSize: [22, 22],
                iconAnchor: [11, 11],
            });
            L.marker([searchLocation.lat, searchLocation.lng], { icon: searchIcon })
                .addTo(map)
                .bindPopup(`<b style="font-family:sans-serif">🔍 Searching near: ${searchLocation.label}</b>`);
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

