/* ============================================================
   WhatEat — Utility Functions
   Pure JS helpers — no JSX, no React dependency.
   ============================================================ */

// ── LocalStorage helpers ──────────────────────────────────────

function loadFromStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error loading ' + key + ' from localStorage:', error);
        return defaultValue;
    }
}

function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error saving ' + key + ' to localStorage:', error);
    }
}

// ── Geo helpers ───────────────────────────────────────────────

/** Haversine formula — returns distance in miles. */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/** Geocode an address using Nominatim (free, no key needed). */
async function geocodeAddress(address) {
    try {
        const resp = await fetch(
            'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(address),
            { headers: { 'Accept-Language': 'en' } }
        );
        const data = await resp.json();
        if (data && data.length > 0) {
            return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        }
    } catch (e) { /* silent */ }
    return null;
}

// ── Google Places helpers ─────────────────────────────────────

/** Map Google priceLevel enum to $–$$$$ symbol. */
function mapPriceLevel(priceLevel) {
    switch (priceLevel) {
        case 'PRICE_LEVEL_INEXPENSIVE':   return '$';
        case 'PRICE_LEVEL_MODERATE':      return '$$';
        case 'PRICE_LEVEL_EXPENSIVE':     return '$$$';
        case 'PRICE_LEVEL_VERY_EXPENSIVE':return '$$$$';
        default:                          return '$$';
    }
}

// ── Cuisine matching ──────────────────────────────────────────

function matchesCuisine(restaurantCuisine, selectedCuisine) {
    if (!restaurantCuisine || !selectedCuisine) return false;
    const rc = restaurantCuisine.toLowerCase();
    const sc = selectedCuisine.toLowerCase();
    if (rc.includes(sc) || sc.includes(rc)) return true;
    const parent = CUISINE_PARENT_MAP[rc];
    if (parent && parent === sc) return true;
    for (const [sub, par] of Object.entries(CUISINE_PARENT_MAP)) {
        if (par === sc && rc.includes(sub)) return true;
    }
    const googleTypes = GOOGLE_TYPE_MAP[sc] || [];
    for (const t of googleTypes) {
        if (rc.includes(t.replace(/_/g, ' ')) || rc.replace(/ /g, '_').includes(t)) return true;
    }
    const rcNorm = rc.replace(/_/g, ' ').replace('restaurant', '').trim();
    if (rcNorm.includes(sc) || sc.includes(rcNorm)) return true;
    return false;
}

/** Heuristic dietary check when no explicit dietary metadata exists. */
function restaurantLikelyHasDietaryOption(r, filter) {
    if (r.dietary && r.dietary.length > 0) return r.dietary.includes(filter);
    const cuisineLower = (r.cuisine || '').toLowerCase();
    const heuristics = DIETARY_HEURISTICS[filter] || [];
    return heuristics.some(h => cuisineLower.includes(h));
}

// ── Google Maps deep-link ──────────────────────────────────────

function buildMapsUrl(restaurant) {
    let searchStr;
    if (restaurant.address && restaurant.address !== 'Address not available') {
        searchStr = restaurant.name + ' ' + restaurant.address;
    } else {
        searchStr = restaurant.name + ' restaurant';
    }
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(searchStr);
}
