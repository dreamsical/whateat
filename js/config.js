/* ============================================================
   WhatEat — Configuration & Constants
   
   ⚠️  SECURITY WARNING:
   API keys placed here are visible to anyone who views the page source.
   Do NOT commit real API keys to a public GitHub repository.
   
   For the Google Places API key:
     → Restrict it in Google Cloud Console → Credentials → your key
       → "HTTP referrers" → add: yourusername.github.io/*
       This limits the key to only your domain, so even if someone copies
       it they cannot use it on their own site.
   
   For the Anthropic API key (AI Discover feature):
     → The key should NEVER live in client-side code.
     → See SECURITY.md (included in this project) for how to set up
       a free serverless proxy on Netlify or Vercel.
   ============================================================ */

// ── Google Places API ─────────────────────────────────────────
// Replace with your restricted key. See note above.
const GOOGLE_PLACES_API_KEY = 'AIzaSyBe9YWuTJgvHDkbrH_8fRqICEYhi5HBmKI';

// ── Anthropic API ─────────────────────────────────────────────
// DO NOT paste your real Anthropic key here.
// Instead, point ANTHROPIC_PROXY_URL at your serverless proxy endpoint.
// Example (Netlify): 'https://your-site.netlify.app/.netlify/functions/claude'
const ANTHROPIC_PROXY_URL = '/.netlify/functions/claude'; // change to your proxy URL

// ── Mock / Seed Restaurant Data ───────────────────────────────
const mockRestaurants = [
    { id: 1, name: "Mama's Trattoria",  cuisine: "Italian",  rating: 4.5, distance: 0.3, price: "$$",  dietary: ["vegetarian"],                         liked: false },
    { id: 2, name: "Dragon Palace",     cuisine: "Chinese",  rating: 4.2, distance: 0.5, price: "$",   dietary: ["vegetarian", "vegan"],                liked: false },
    { id: 3, name: "The Burger Joint",  cuisine: "American", rating: 4.7, distance: 0.2, price: "$$",  dietary: [],                                     liked: false },
    { id: 4, name: "Sushi Zen",         cuisine: "Japanese", rating: 4.8, distance: 0.8, price: "$$$", dietary: ["gluten-free"],                         liked: false },
    { id: 5, name: "Spice Route",       cuisine: "Indian",   rating: 4.4, distance: 0.6, price: "$$",  dietary: ["vegetarian", "vegan", "gluten-free"],  liked: false },
    { id: 6, name: "Green Leaf Cafe",   cuisine: "Healthy",  rating: 4.3, distance: 0.4, price: "$",   dietary: ["vegetarian", "vegan", "gluten-free"],  liked: false },
];

// ── LocalStorage Keys ─────────────────────────────────────────
const STORAGE_KEYS = {
    LIKES:               'foodspin_likes',
    DIETARY_FILTERS:     'foodspin_dietary_filters',
    INTERACTION_HISTORY: 'foodspin_interactions',
    USER_PREFERENCES:    'foodspin_preferences',
    CUSTOM_RESTAURANTS:  'foodspin_custom_restaurants',
};

// ── Cuisine → parent cuisine mapping ─────────────────────────
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

// ── Google Places type → cuisine mapping ──────────────────────
const GOOGLE_TYPE_MAP = {
    'vietnamese':    ['vietnamese_restaurant', 'vietnamese', 'pho', 'banh mi', 'viet'],
    'chinese':       ['chinese_restaurant', 'chinese', 'dim_sum_restaurant', 'cantonese'],
    'japanese':      ['japanese_restaurant', 'japanese', 'sushi_restaurant', 'ramen_restaurant'],
    'korean':        ['korean_restaurant', 'korean'],
    'thai':          ['thai_restaurant', 'thai'],
    'indian':        ['indian_restaurant', 'indian'],
    'italian':       ['italian_restaurant', 'italian', 'pizza_restaurant'],
    'mexican':       ['mexican_restaurant', 'mexican'],
    'american':      ['american_restaurant', 'american', 'hamburger_restaurant'],
    'mediterranean': ['mediterranean_restaurant', 'mediterranean', 'greek_restaurant'],
    'middle eastern':['middle_eastern_restaurant', 'middle_eastern', 'lebanese_restaurant'],
};

// ── Dietary heuristics by cuisine ────────────────────────────
const DIETARY_HEURISTICS = {
    'vegetarian': ['indian','thai','chinese','japanese','korean','vietnamese','mediterranean',
                   'italian','greek','mexican','middle eastern','ethiopian','nepali','tibetan',
                   'vegan','vegetarian','healthy','cafe','salad','pizza','falafel'],
    'vegan':      ['indian','thai','vietnamese','ethiopian','mediterranean','middle eastern',
                   'chinese','korean','healthy','vegan','salad','falafel','japanese'],
    'gluten-free':['japanese','korean','vietnamese','thai','mexican','indian','mediterranean',
                   'ethiopian','greek','steakhouse','bbq','seafood','sushi'],
};

// ── Nearby food-type allowlist (Google Places primaryType) ────
const FOOD_TYPES = new Set([
    'restaurant','cafe','bakery','bar','food',
    'american_restaurant','barbecue_restaurant','brazilian_restaurant',
    'breakfast_restaurant','brunch_restaurant','chinese_restaurant',
    'coffee_shop','fast_food_restaurant','french_restaurant',
    'greek_restaurant','hamburger_restaurant','ice_cream_shop',
    'indian_restaurant','indonesian_restaurant','italian_restaurant',
    'japanese_restaurant','korean_restaurant','lebanese_restaurant',
    'meal_delivery','meal_takeaway','mediterranean_restaurant',
    'mexican_restaurant','middle_eastern_restaurant','pizza_restaurant',
    'ramen_restaurant','sandwich_shop','seafood_restaurant',
    'spanish_restaurant','steak_house','sushi_restaurant',
    'thai_restaurant','turkish_restaurant','vegan_restaurant',
    'vegetarian_restaurant','vietnamese_restaurant','wine_bar',
    'pub','food_court','diner','buffet_restaurant',
]);
