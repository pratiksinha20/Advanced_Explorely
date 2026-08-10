export function getDistance(lat1, lng1, lat2, lng2) {
    if (!lat1 || !lng1 || !lat2 || !lng2) return null;
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function createRandom(seed) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
        h = seed.charCodeAt(i) + ((h << 5) - h);
    }
    return function() {
        const x = Math.sin(h++) * 10000;
        return x - Math.floor(x);
    };
}

const HOTEL_NAMES = {
    prefixes: ["The Grand", "Royal", "Regency", "Vivanta", "Lemon Tree", "Park Plaza", "Fortune Select", "Claridges", "Taj Gateway", "Radisson", "Welcomhotel", "Signature", "Heritage", "Imperial", "Monarch", "Palazzo", "Golden Oasis"],
    suffixes: ["Residency", "Suites", "Inn", "Plaza", "Grand", "Comfort", "International", "Palace", "Executive", "Heights", "Mansion", "Crown"]
};

const RESORT_NAMES = {
    prefixes: ["Club Mahindra", "Sterling", "The Whisper Valley", "Wildflower", "Evolve Back", "Golden Sands", "Coconut Grove", "Mystic Hills", "Riverview", "Mountain Mist", "The Serene Valley", "Whispering Pines", "Green Meadows", "Blue Lagoon", "Hidden Oasis", "Hill Country", "Silent Woods"],
    suffixes: ["Resort & Spa", "Nature Lodge", "Heritage Resort", "Eco Retreat", "Wellness Spa", "Jungle Lodge", "Lakeside Resort", "Hill Retreat", "Beach Resort", "Sanctuary", "Wilderness Camp"]
};

const RESTAURANT_NAMES = {
    prefixes: ["The Golden Spoon", "Spice N Rice", "Royal Feast", "Flavors of India", "Clay Oven", "The Green Leaf", "Pind Balluchi", "Barbeque Nation", "Sagar Ratna", "Saravana Bhavan", "Biryani House", "Coastal Curry", "The Bistro", "Salt & Pepper", "The Curry Pot", "Bukhara", "Copper Chimney", "Zaffran"],
    suffixes: ["Kitchen", "Dhaba", "Bistro", "Fine Dine", "Cafe & Bar", "Multi-Cuisine", "Family Restaurant", "Delight", "Eatery", "Spice Court", "Tavern", "Terrace"]
};

const AMENITIES = ["Pool", "Spa", "WiFi", "Restaurant", "Bar", "Gym", "Valet Parking", "Room Service", "Laundry", "Kids Play Area", "Lounge", "Concierge", "Travel Desk"];

const RESTAURANT_CUISINES = {
    "Goa": ["Goan Seafood", "Portuguese", "Continental", "North Indian"],
    "Punjab": ["Punjabi Dhaba", "Tandoori Specialties", "North Indian", "Mughlai"],
    "West Bengal": ["Bengali Cuisine", "Seafood", "Chinese", "Continental"],
    "Kerala": ["Kerala Traditional", "South Indian", "Seafood", "North Indian"],
    "Tamil Nadu": ["South Indian Vegetarian", "Chettinad", "Seafood", "Chinese"],
    "Rajasthan": ["Rajasthani Thali", "Mughlai", "North Indian", "Marwari Specialties"],
    "Delhi": ["Mughlai", "North Indian", "Street Food Specials", "Continental", "Chinese"],
    "Maharashtra": ["Maharashtrian", "Coastal Seafood", "North Indian", "Chinese", "Continental"],
    "Jammu and Kashmir": ["Kashmiri Wazwan", "North Indian", "Mughlai"],
    "Himachal Pradesh": ["Himachali Dham", "North Indian", "Continental", "Tibetan"],
    "Uttarakhand": ["Garhwali Cuisine", "North Indian", "Chinese"],
    "Karnataka": ["Udupi Style", "South Indian", "Coastal Seafood", "Chinese"],
    "Andhra Pradesh": ["Andhra Spicy Curry", "Hyderabadi Biryani", "North Indian"],
    "Telangana": ["Hyderabadi Biryani", "Deccani Cuisine", "Mughlai"],
    "Gujarat": ["Gujarati Thali", "Kathiyawadi Style", "North Indian", "Chinese"],
    "default": ["North Indian", "South Indian", "Chinese", "Continental", "Mughlai"]
};

const HOTEL_IMAGES = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
    "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800",
    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800"
];

const RESORT_IMAGES = [
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
    "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800"
];

const RESTAURANT_IMAGES = [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
    "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
    "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0638b?w=800"
];

export function generateNearbyAmenities(spotOrCity, curatedHotels = [], type = "Hotel", allSpots = []) {
    if (!spotOrCity) return [];

    const isSpot = typeof spotOrCity === "object" && spotOrCity.name;
    const city = isSpot ? (spotOrCity.city || "") : (spotOrCity.city || "");
    const state = isSpot ? (spotOrCity.state || "") : (spotOrCity.state || "");
    const name = isSpot ? spotOrCity.name : (city || state || "Location");

    let baseLat = isSpot ? spotOrCity.lat : 20.5937; // Center of India fallback
    let baseLng = isSpot ? spotOrCity.lng : 78.9629;

    // Scan allSpots to locate base coordinates for the region if available
    if (!isSpot && allSpots.length > 0) {
        if (city) {
            const citySpot = allSpots.find(s => s.city && s.city.toLowerCase() === city.toLowerCase() && s.lat && s.lng);
            if (citySpot) {
                baseLat = citySpot.lat;
                baseLng = citySpot.lng;
            }
        } else if (state) {
            const stateSpot = allSpots.find(s => s.state && s.state.toLowerCase() === state.toLowerCase() && s.lat && s.lng);
            if (stateSpot) {
                baseLat = stateSpot.lat;
                baseLng = stateSpot.lng;
            }
        }
    }

    const seed = `${state}-${city}-${name}-${type}`;
    const rand = createRandom(seed);

    // 1. Gather curated matches from database first
    const curatedMatches = curatedHotels.filter(h => {
        const matchesRegion = (h.state && state && h.state.toLowerCase() === state.toLowerCase()) && 
                             (h.city && city && h.city.toLowerCase() === city.toLowerCase());
        const matchesType = h.type && type && h.type.toLowerCase() === type.toLowerCase();
        return matchesRegion && matchesType;
    });

    const results = curatedMatches.map(h => {
        let dist = null;
        if (isSpot && h.lat && h.lng) {
            dist = getDistance(baseLat, baseLng, h.lat, h.lng);
        } else if (isSpot && baseLat && baseLng) {
            // Curated but no coordinate, generate a close distance
            dist = 1.5 + rand() * 4.0;
        }
        return {
            ...h,
            distance: dist,
            isCurated: true
        };
    });

    // 2. Generate fallback / extra matches to ensure rich results (always show 4 items total)
    const needed = 4 - results.length;
    if (needed > 0) {
        const pool = type === "Hotel" ? HOTEL_NAMES : type === "Resort" ? RESORT_NAMES : RESTAURANT_NAMES;
        const images = type === "Hotel" ? HOTEL_IMAGES : type === "Resort" ? RESORT_IMAGES : RESTAURANT_IMAGES;

        for (let i = 0; i < needed; i++) {
            const prefix = pool.prefixes[Math.floor(rand() * pool.prefixes.length)];
            const suffix = pool.suffixes[Math.floor(rand() * pool.suffixes.length)];
            const placeName = `${prefix} ${suffix}`;
            
            // Avoid generating a name that is already in results
            if (results.some(r => r.name === placeName)) continue;

            const rating = (4.1 + rand() * 0.8).toFixed(1);
            
            // Random offset for coordinates near the spot (approx within 1-5km)
            const latOffset = (rand() - 0.5) * 0.04;
            const lngOffset = (rand() - 0.5) * 0.04;
            const itemLat = baseLat + latOffset;
            const itemLng = baseLng + lngOffset;
            const distance = isSpot ? getDistance(baseLat, baseLng, itemLat, itemLng) : (0.5 + rand() * 5.0);

            let priceRange = "";
            let priceMin = 0;
            let amenitiesList = [];

            if (type === "Hotel") {
                const pMin = 3000 + Math.floor(rand() * 8000);
                priceMin = pMin;
                priceRange = `₹${pMin.toLocaleString('en-IN')} - ₹${(pMin + 5000 + Math.floor(rand()*10000)).toLocaleString('en-IN')}`;
                
                // Shuffle and pick 4-6 amenities
                const shuffled = [...AMENITIES].sort(() => rand() - 0.5);
                amenitiesList = shuffled.slice(0, 4 + Math.floor(rand() * 3));
            } else if (type === "Resort") {
                const pMin = 8000 + Math.floor(rand() * 15000);
                priceMin = pMin;
                priceRange = `₹${pMin.toLocaleString('en-IN')} - ₹${(pMin + 10000 + Math.floor(rand()*20000)).toLocaleString('en-IN')}`;
                
                const shuffled = [...AMENITIES].sort(() => rand() - 0.5);
                amenitiesList = ["Spa", "Pool", ...shuffled.slice(0, 3 + Math.floor(rand() * 3))];
            } else { // Restaurant
                const cost = 400 + Math.floor(rand() * 1200);
                priceMin = cost;
                priceRange = `₹${cost} for two`;
                
                const stateCuisines = RESTAURANT_CUISINES[state] || RESTAURANT_CUISINES.default;
                const shuffled = [...stateCuisines].sort(() => rand() - 0.5);
                amenitiesList = shuffled.slice(0, 2 + Math.floor(rand() * 2));
            }

            const img = images[Math.floor(rand() * images.length)];
            const mapLink = `https://www.google.com/maps?q=${encodeURIComponent(`${placeName}, ${city}, ${state}`)}`;
            const bookingLink = type === "Restaurant" ? "https://www.zomato.com" : "https://www.booking.com";

            results.push({
                name: placeName,
                city,
                state,
                type,
                priceRange,
                priceMin,
                rating: parseFloat(rating),
                amenities: amenitiesList,
                image: img,
                mapLink,
                bookingLink,
                lat: itemLat,
                lng: itemLng,
                distance: distance,
                isCurated: false
            });
        }
    }

    // Sort: if it's a spot, sort by distance. Otherwise, sort by rating.
    return results.sort((a, b) => {
        if (isSpot && a.distance !== null && b.distance !== null) {
            return a.distance - b.distance;
        }
        return b.rating - a.rating;
    });
}
