import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import SpotCard from '../components/SpotCard';
import HotelCard from '../components/HotelCard';
import FoodCard from '../components/FoodCard';
import Icon from '../components/Icon';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';

const INITIAL_VISIBLE_COUNT = 24; // 12 rows of 2 spots for instant rendering and smooth scrolling

const stateImages = {
    'Rajasthan': 'https://images.unsplash.com/photo-1477587458883-47145ed31fd8?w=1200',
    'Kerala': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200',
    'Goa': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200',
    'Himachal Pradesh': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200',
    'Uttarakhand': 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200',
    'Tamil Nadu': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200',
    'Maharashtra': 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200',
    'Karnataka': 'https://images.unsplash.com/photo-1580458748802-ade1800f12af?w=1200',
    'Andhra Pradesh': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200',
    'Telangana': 'https://images.unsplash.com/photo-1599030060484-d0e5efbe5de7?w=1200',
    'West Bengal': 'https://images.unsplash.com/photo-1558618047-f4e60e1a57f2?w=1200',
    'Uttar Pradesh': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200',
    'Madhya Pradesh': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200',
    'Gujarat': 'https://images.unsplash.com/photo-1590077428593-a55bb07c4665?w=1200',
    'Punjab': 'https://images.unsplash.com/photo-1588392382834-a891154bca4d?w=1200',
    'Assam': 'https://images.unsplash.com/photo-1617898893024-1bc67e7e7d39?w=1200',
    'Odisha': 'https://images.unsplash.com/photo-1609340754762-5e1b56f82f6e?w=800',
    'Bihar': 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200',
    'Delhi': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200',
    'Jammu and Kashmir': 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=1200',
    'Jammu & Kashmir': 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=1200',
    'Ladakh': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200',
    'Sikkim': 'https://images.unsplash.com/photo-1609340754762-5e1b56f82f6e?w=1200',
    'Andaman and Nicobar Islands': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200',
    'Jharkhand': 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200',
    'Chandigarh': 'https://images.unsplash.com/photo-1588392382834-a891154bca4d?w=1200',
};

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1598394244963-3a0b50bb5406?w=1200';

function getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function levenshtein(a, b) {
    const m = a.length, n = b.length;
    const d = [];
    for (let i = 0; i <= m; i++) d[i] = [i];
    for (let j = 0; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            d[i][j] = a[i - 1] === b[j - 1] ? d[i - 1][j - 1] : 1 + Math.min(d[i - 1][j], d[i][j - 1], d[i - 1][j - 1]);
        }
    }
    return d[m][n];
}

function searchCitiesFuzzy(query, cityList) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const scored = [];
    for (const c of cityList) {
        const name = (c.name || '').toLowerCase();
        const cleanName = name.replace(/\s*\(.*?\)\s*/g, '').trim();
        const state = (c.state || '').toLowerCase();

        if (name === q || cleanName === q) {
            scored.push({ city: c, score: 100 });
        } else if (name.startsWith(q) || cleanName.startsWith(q)) {
            scored.push({ city: c, score: 80 });
        } else if (name.includes(q) || cleanName.includes(q)) {
            scored.push({ city: c, score: 60 });
        } else if (state.startsWith(q)) {
            scored.push({ city: c, score: 50 });
        } else if (state.includes(q)) {
            scored.push({ city: c, score: 40 });
        } else if (q.length >= 4) {
            const prefix = cleanName.slice(0, Math.min(cleanName.length, q.length));
            const dist = levenshtein(q, prefix);
            if (dist <= 2) {
                scored.push({ city: c, score: 35 - dist * 5 });
            }
        }
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 15).map(s => s.city);
}

export default function Explore() {
    const { allSpots, allHotels, allFoods, states, cities: allCities, categories, dataLoaded, openFeedbackModal } = useApp();
    const [searchParams, setSearchParams] = useSearchParams();

    const initialCity = searchParams.get('city') || '';
    const initialState = searchParams.get('state') || '';
    const [selectedState, setSelectedState] = useState(initialState);
    const [selectedCity, setSelectedCity] = useState(initialCity);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [stateSearch, setStateSearch] = useState(initialState);
    const [sortBy, setSortBy] = useState('recommended');
    const [selectedTier, setSelectedTier] = useState('');

    // Direct Search state with responsive typing + debounced filtering
    // Show only city when city is present, else state if state is present
    const [directSearchInput, setDirectSearchInput] = useState(initialCity || initialState || '');
    const [debouncedDirectSearch, setDebouncedDirectSearch] = useState('');
    const [directSuggestions, setDirectSuggestions] = useState([]);
    const [showDirectDropdown, setShowDirectDropdown] = useState(false);
    const directSearchRef = useRef(null);
    const isTypingRef = useRef(false);

    // Modal state for Food and Hotels
    const [activeModal, setActiveModal] = useState(null); // 'foods' | 'hotels' | null
    const [modalSearch, setModalSearch] = useState('');

    // Banner visibility toggle state
    const [hideBanner, setHideBanner] = useState(false);

    // Planned cities state (persisted in localStorage)
    const [explorePlanCities, setExplorePlanCities] = useState(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            if (!params.get('state') && !params.get('city')) return [];
            const saved = localStorage.getItem('explorely-explore-plan-cities');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [isAddCityOpen, setIsAddCityOpen] = useState(false);
    const [citySearchQuery, setCitySearchQuery] = useState('');
    const [placeFilterQuery, setPlaceFilterQuery] = useState('');
    const addCityRef = useRef(null);
    const prevLocationRef = useRef({ state: null, city: null });

    // Save planned cities to localStorage
    useEffect(() => {
        try {
            if (explorePlanCities.length === 0) {
                localStorage.removeItem('explorely-explore-plan-cities');
            } else {
                localStorage.setItem('explorely-explore-plan-cities', JSON.stringify(explorePlanCities));
            }
        } catch { }
    }, [explorePlanCities]);

    // Close add city dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (addCityRef.current && !addCityRef.current.contains(e.target)) {
                setIsAddCityOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Pagination state
    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

    // 200ms debounce: only active when user is manually typing, never overrides programmatic dropdown/suggestion selections
    useEffect(() => {
        if (!isTypingRef.current) return;
        const timer = setTimeout(() => {
            setDebouncedDirectSearch(directSearchInput);
        }, 200);
        return () => clearTimeout(timer);
    }, [directSearchInput]);

    useEffect(() => {
        setHideBanner(false);
        setPlaceFilterQuery('');
    }, [selectedState, selectedCity]);

    // Keep directSearchInput and dropdowns in sync with URL searchParams
    useEffect(() => {
        const s = searchParams.get('state') || '';
        const c = searchParams.get('city') || '';
        isTypingRef.current = false;
        setSelectedState(s);
        setStateSearch(s);
        setSelectedCity(c);
        if (c) {
            // When city is chosen, show only city in search
            setDirectSearchInput(c);
        } else if (s) {
            // When only state is chosen, show only state in search
            setDirectSearchInput(s);
        } else {
            setDirectSearchInput('');
        }
        setDebouncedDirectSearch('');

        // Automatically reset all added plan cities and in-city place filter when destination changes or is cleared
        const prev = prevLocationRef.current;
        if (prev.state !== null && (prev.state !== s || prev.city !== c)) {
            setExplorePlanCities([]);
            setPlaceFilterQuery('');
            try { localStorage.removeItem('explorely-explore-plan-cities'); } catch { }
        } else if (!s && !c) {
            setExplorePlanCities([]);
            setPlaceFilterQuery('');
            try { localStorage.removeItem('explorely-explore-plan-cities'); } catch { }
        }
        prevLocationRef.current = { state: s, city: c };
    }, [searchParams]);

    // Close direct dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (directSearchRef.current && !directSearchRef.current.contains(e.target)) {
                setShowDirectDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Direct Search input handler with fast early-exit suggestions
    const handleDirectSearchInput = (q) => {
        isTypingRef.current = true;
        setDirectSearchInput(q);
        if (!q || q.trim().length === 0) {
            setDebouncedDirectSearch('');
            setDirectSuggestions([]);
            setShowDirectDropdown(false);
            setSelectedState('');
            setStateSearch('');
            setSelectedCity('');
            setSearchParams({});
            setExplorePlanCities([]);
            setPlaceFilterQuery('');
            try { localStorage.removeItem('explorely-explore-plan-cities'); } catch { }
            return;
        }
        if (q.trim().length < 2) {
            setDirectSuggestions([]);
            setShowDirectDropdown(false);
            return;
        }
        const ql = q.trim().toLowerCase();
        const results = [];

        // 1. States (max 3)
        for (let i = 0; i < states.length; i++) {
            if (states[i].name.toLowerCase().includes(ql)) {
                results.push({ type: 'State', name: states[i].name });
                if (results.length >= 3) break;
            }
        }

        // 2. Cities (max 4)
        let cityCount = 0;
        for (let i = 0; i < allCities.length; i++) {
            if (allCities[i].name.toLowerCase().includes(ql)) {
                results.push({ type: 'City', name: allCities[i].name, state: allCities[i].state });
                cityCount++;
                if (cityCount >= 4) break;
            }
        }

        // 3. Spots (max 5 with early exit - takes <0.1ms)
        let spotCount = 0;
        for (let i = 0; i < allSpots.length; i++) {
            if (allSpots[i].name.toLowerCase().includes(ql)) {
                results.push({ type: 'Spot', name: allSpots[i].name, city: allSpots[i].city, state: allSpots[i].state });
                spotCount++;
                if (spotCount >= 5) break;
            }
        }

        setDirectSuggestions(results);
        setShowDirectDropdown(true);
    };

    // Auto-complete search bar and update dropdowns simultaneously upon selecting a suggestion
    const handleSelectDirectSuggestion = (s) => {
        isTypingRef.current = false;
        setShowDirectDropdown(false);
        setExplorePlanCities([]);
        setPlaceFilterQuery('');
        try { localStorage.removeItem('explorely-explore-plan-cities'); } catch { }
        if (s.type === 'State') {
            setSelectedState(s.name);
            setStateSearch(s.name);
            setSelectedCity('');
            // Only show state in search
            setDirectSearchInput(s.name);
            setDebouncedDirectSearch('');
            setSearchParams({ state: s.name });
        } else if (s.type === 'City') {
            setSelectedState(s.state);
            setStateSearch(s.state);
            setSelectedCity(s.name);
            // Only show city in search (never "City, State")
            setDirectSearchInput(s.name);
            setDebouncedDirectSearch('');
            setSearchParams({ state: s.state, city: s.name });
        } else if (s.type === 'Spot') {
            setSelectedState(s.state || '');
            setStateSearch(s.state || '');
            setSelectedCity(s.city || '');
            setDirectSearchInput(s.name);
            setDebouncedDirectSearch(s.name);
            setSearchParams({ state: s.state || '', city: s.city || '' });
        }
    };

    const isStateMatch = (spot, st) => {
        if (!st) return true;
        if (spot.state === st) return true;
        if (st === 'Chandigarh' && spot.city === 'Chandigarh') return true;
        return false;
    };

    // Matching helper for planned cities
    const isItemInPlannedCities = useCallback((item, plannedList) => {
        if (!plannedList || !plannedList.length) return false;
        const itemCity = (item.city || '').toLowerCase().trim();
        return plannedList.some(pc => {
            const pcName = (pc.name || '').toLowerCase().trim();
            const pcClean = pcName.replace(/\s*\(.*?\)\s*/g, '').trim();
            const itemCityClean = itemCity.replace(/\s*\(.*?\)\s*/g, '').trim();

            if (itemCity === pcName || itemCityClean === pcClean) return true;
            if (pcClean && itemCity.includes(pcClean)) return true;
            if (itemCityClean && pcName.includes(itemCityClean)) return true;

            const pcWords = pcClean.split(/\s+/).filter(w => w.length > 2);
            for (const w of pcWords) {
                if (itemCity.includes(w)) return true;
            }
            return false;
        });
    }, []);

    const toggleExplorePlanCity = (city) => {
        setExplorePlanCities(prev => {
            const exists = prev.some(c => c.name.toLowerCase() === city.name.toLowerCase());
            if (exists) {
                return prev.filter(c => c.name.toLowerCase() !== city.name.toLowerCase());
            } else {
                return [...prev, { name: city.name, state: city.state }];
            }
        });
    };

    const removeExplorePlanCity = (cityName) => {
        setExplorePlanCities(prev => prev.filter(c => c.name.toLowerCase() !== cityName.toLowerCase()));
    };

    const clearExplorePlanCities = () => {
        setExplorePlanCities([]);
    };

    // Filter cities pool to the currently selected state (or all cities if no state is chosen)
    const stateCitiesPool = useMemo(() => {
        if (!allCities || !allCities.length) return [];
        if (!selectedState) return allCities;
        if (selectedState === 'Chandigarh') {
            return allCities.filter(c => c.state === 'Chandigarh' || c.name === 'Chandigarh');
        }
        return allCities.filter(c => c.state && c.state.toLowerCase() === selectedState.toLowerCase());
    }, [allCities, selectedState]);

    // Matching cities for the popover search, restricted strictly to current state
    const matchingCities = useMemo(() => {
        if (!stateCitiesPool || !stateCitiesPool.length) return [];

        // Exclude currently active selectedCity and already planned cities so user only sees cities they can still add
        const unaddedCities = stateCitiesPool.filter(c => {
            if (selectedCity && c.name.toLowerCase() === selectedCity.toLowerCase()) return false;
            if (explorePlanCities.some(pc => pc.name.toLowerCase() === c.name.toLowerCase())) return false;
            return true;
        });

        if (!citySearchQuery || !citySearchQuery.trim()) {
            return unaddedCities.slice(0, 30);
        }
        return searchCitiesFuzzy(citySearchQuery, unaddedCities);
    }, [stateCitiesPool, citySearchQuery, selectedCity, explorePlanCities]);

    // Compute suggested nearby cities to visit along with selectedCity (strictly within the same state)
    const suggestedNearbyCities = useMemo(() => {
        if (!selectedCity || !allSpots || !allSpots.length) return [];
        const citySpots = allSpots.filter(s => s.city && s.city.toLowerCase() === selectedCity.toLowerCase() && s.lat && s.lng);
        if (!citySpots.length) return [];
        const refLat = citySpots[0].lat;
        const refLng = citySpots[0].lng;

        const nearbyMap = new Map();
        for (const s of allSpots) {
            if (!s.city || !s.lat || !s.lng) continue;
            // STRICT STATE CHECK: Only suggest cities in the same state!
            if (selectedState) {
                if (selectedState === 'Chandigarh') {
                    if (s.state !== 'Chandigarh' && s.state !== 'Punjab' && s.state !== 'Haryana') continue;
                } else if (s.state && s.state.toLowerCase() !== selectedState.toLowerCase()) {
                    continue;
                }
            }
            const sCityLower = s.city.toLowerCase();
            if (sCityLower === selectedCity.toLowerCase()) continue;
            if (explorePlanCities.some(pc => pc.name.toLowerCase() === sCityLower)) continue;
            if (nearbyMap.has(sCityLower)) continue;

            const dist = getDistance(refLat, refLng, s.lat, s.lng);
            if (dist <= 85) { // Within 85 km
                nearbyMap.set(sCityLower, { name: s.city, state: s.state, distance: Math.round(dist) });
            }
        }

        const nearbyList = Array.from(nearbyMap.values());
        nearbyList.sort((a, b) => a.distance - b.distance);
        return nearbyList.slice(0, 6);
    }, [selectedCity, selectedState, allSpots, explorePlanCities]);

    const isSpotInSelection = useCallback((s) => {
        if (selectedCity) {
            if (s.city && s.city.toLowerCase() === selectedCity.toLowerCase()) return true;
            if (isItemInPlannedCities(s, explorePlanCities)) return true;
            return false;
        }
        if (selectedState) {
            if (isStateMatch(s, selectedState)) return true;
            if (isItemInPlannedCities(s, explorePlanCities)) return true;
            return false;
        }
        if (explorePlanCities.length > 0) {
            return isItemInPlannedCities(s, explorePlanCities);
        }
        return true;
    }, [selectedCity, selectedState, explorePlanCities, isItemInPlannedCities]);

    const cities = useMemo(() => {
        if (!selectedState) return [];
        if (selectedState === 'Chandigarh') {
            return [{ name: 'Chandigarh', state: 'Chandigarh' }];
        }
        return allCities.filter(c => c.state === selectedState);
    }, [allCities, selectedState]);

    const spots = useMemo(() => {
        let filtered = allSpots;

        if (debouncedDirectSearch && debouncedDirectSearch.trim() !== '') {
            const rawQuery = debouncedDirectSearch.trim().toLowerCase();

            // Check if the query is simply the selected city or state
            const isCityQuery = selectedCity && rawQuery === selectedCity.toLowerCase();
            const isStateQuery = selectedState && !selectedCity && rawQuery === selectedState.toLowerCase();

            if (isCityQuery) {
                filtered = filtered.filter(isSpotInSelection);
                if (selectedCategory) filtered = filtered.filter(s => s.category === selectedCategory);
                if (selectedTier) filtered = filtered.filter(s => s.tier === selectedTier);
            } else if (isStateQuery) {
                filtered = filtered.filter(isSpotInSelection);
                if (selectedCategory) filtered = filtered.filter(s => s.category === selectedCategory);
                if (selectedTier) filtered = filtered.filter(s => s.tier === selectedTier);
            } else {
                // Smart search: parse comma-separated tokens (e.g. "Chandigarh, Punjab" or "Hawa Mahal, Jaipur")
                const tokens = rawQuery.includes(',')
                    ? rawQuery.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
                    : [rawQuery];

                const matchSpot = (s) => {
                    const spotName = (s.name || '').toLowerCase();
                    const spotCity = (s.city || '').toLowerCase();
                    const spotState = (s.state || '').toLowerCase();
                    const spotCat = (s.category || '').toLowerCase();
                    const spotDesc = (s.description || '').toLowerCase();

                    // Every token must match at least one attribute of the spot
                    return tokens.every(tok =>
                        spotName.includes(tok) ||
                        spotCity.includes(tok) ||
                        spotState.includes(tok) ||
                        spotCat.includes(tok) ||
                        spotDesc.includes(tok)
                    );
                };

                // Check local pool (within currently selected state/city/planCities)
                let localPool = filtered.filter(isSpotInSelection);
                if (selectedCategory) localPool = localPool.filter(s => s.category === selectedCategory);
                if (selectedTier) localPool = localPool.filter(s => s.tier === selectedTier);

                const localMatches = localPool.filter(matchSpot);

                if (localMatches.length > 0) {
                    filtered = localMatches;
                } else {
                    // Search nationwide across all places
                    filtered = allSpots.filter(matchSpot);
                    if (selectedCategory) filtered = filtered.filter(s => s.category === selectedCategory);
                    if (selectedTier) filtered = filtered.filter(s => s.tier === selectedTier);
                }
            }
        } else {
            // Normal browsing when search bar has no active text filter
            filtered = filtered.filter(isSpotInSelection);
            if (selectedCategory) filtered = filtered.filter(s => s.category === selectedCategory);
            if (selectedTier) filtered = filtered.filter(s => s.tier === selectedTier);
        }

        // Dedicated local places filter for the selected city and planned cities
        if (placeFilterQuery && placeFilterQuery.trim() !== '') {
            const rawTokens = placeFilterQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
            filtered = filtered.filter(s => {
                const spotName = (s.name || '').toLowerCase();
                const spotCity = (s.city || '').toLowerCase();
                const spotCat = (s.category || '').toLowerCase();
                const spotDesc = (s.description || '').toLowerCase();
                const spotState = (s.state || '').toLowerCase();
                const spotKeywords = Array.isArray(s.keywords) ? s.keywords.join(' ').toLowerCase() : '';
                const text = `${spotName} ${spotCity} ${spotCat} ${spotDesc} ${spotState} ${spotKeywords}`;
                return rawTokens.every(tok => text.includes(tok));
            });
        }

        let sorted = [...filtered];
        if (sortBy === 'rating') {
            sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (sortBy === 'name') {
            sorted.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            const tierOrder = { 'most famous': 1, 'famous': 2, 'hidden': 3 };
            sorted.sort((a, b) => {
                const ta = tierOrder[a.tier] || 2;
                const tb = tierOrder[b.tier] || 2;
                if (ta !== tb) return ta - tb;
                return (b.rating || 0) - (a.rating || 0);
            });
        }
        return sorted;
    }, [allSpots, debouncedDirectSearch, sortBy, isSpotInSelection, selectedCategory, selectedCity, selectedState, selectedTier, placeFilterQuery]);

    // Foods for selected state
    const stateFoods = useMemo(() => {
        const stateKey = selectedState === 'Chandigarh' ? 'Punjab' : selectedState;
        if (!stateKey || !allFoods[stateKey]) return [];
        let items = allFoods[stateKey] || [];
        if (modalSearch) {
            const ql = modalSearch.toLowerCase();
            items = items.filter(f => f.name.toLowerCase().includes(ql) || (f.description || '').toLowerCase().includes(ql));
        }
        return items;
    }, [allFoods, selectedState, modalSearch]);

    // Hotels for selected city/state and planned cities
    const locationHotels = useMemo(() => {
        if (!selectedState && explorePlanCities.length === 0) return [];
        let hotels = allHotels.filter(h => {
            if (selectedCity) {
                return (h.city && h.city.toLowerCase() === selectedCity.toLowerCase()) || isItemInPlannedCities(h, explorePlanCities);
            }
            if (selectedState) {
                return h.state === selectedState || (selectedState === 'Chandigarh' && h.city === 'Chandigarh') || isItemInPlannedCities(h, explorePlanCities);
            }
            return isItemInPlannedCities(h, explorePlanCities);
        });
        if (modalSearch) {
            const ql = modalSearch.toLowerCase();
            hotels = hotels.filter(h => h.name.toLowerCase().includes(ql) || (h.type || '').toLowerCase().includes(ql));
        }
        return hotels.sort((a, b) => b.rating - a.rating);
    }, [allHotels, selectedState, selectedCity, explorePlanCities, isItemInPlannedCities, modalSearch]);

    // Check if any state, city, spot search, category or tier filter is active
    const hasActiveFilter = Boolean(
        selectedState ||
        selectedCity ||
        (debouncedDirectSearch && debouncedDirectSearch.trim() !== '') ||
        (placeFilterQuery && placeFilterQuery.trim() !== '') ||
        selectedCategory ||
        selectedTier ||
        explorePlanCities.length > 0
    );

    // ALWAYS cap visible spots to visibleCount so the browser renders instantly without freezing
    const visibleSpots = useMemo(() => {
        return spots.slice(0, visibleCount);
    }, [spots, visibleCount]);

    // Reset pagination when any filter/query changes
    useEffect(() => {
        setVisibleCount(INITIAL_VISIBLE_COUNT);
    }, [selectedState, selectedCity, selectedCategory, selectedTier, debouncedDirectSearch, sortBy, explorePlanCities, placeFilterQuery]);

    // Smooth infinite scroll handler for continuous browsing
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 400) {
                setVisibleCount(prev => {
                    if (prev >= spots.length) return prev;
                    return Math.min(spots.length, prev + 24);
                });
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [spots.length]);

    const filteredStates = useMemo(() =>
        states.filter(s => s.name.toLowerCase().includes(stateSearch.toLowerCase())), [states, stateSearch]);

    const showDropdown = stateSearch.length > 0 && stateSearch !== selectedState && filteredStates.length > 0;

    const handleStateSelect = (name) => {
        isTypingRef.current = false;
        setSelectedState(name);
        setStateSearch(name);
        setSelectedCity('');
        // When only state is chosen, show only state in search
        setDirectSearchInput(name);
        setDebouncedDirectSearch('');
        setSearchParams({ state: name });
        setExplorePlanCities([]);
        setPlaceFilterQuery('');
        try { localStorage.removeItem('explorely-explore-plan-cities'); } catch { }
    };

    const bannerImage = selectedState ? (stateImages[selectedState] || DEFAULT_BANNER) : null;

    if (!dataLoaded) return <div className="page-loading"><div className="loading-spinner" /><p>Loading...</p></div>;

    return (
        <div className="explore-page">
            <div className="page-header">
                <div className="page-header-flex">
                    <div className="page-header-titles">
                        <h1 className="page-title"><Icon name="compass" size={26} className="page-title-icon" /> Explore India</h1>
                        <p className="page-subtitle">Discover tourist places — state by state, city by city</p>
                    </div>
                    <button
                        type="button"
                        className="explore-header-suggest-btn"
                        onClick={() => openFeedbackModal({
                            type: 'spot',
                            spotAddress: [selectedCity, selectedState].filter(Boolean).join(', ')
                        })}
                        title="Suggest a new place or spot to add"
                    >
                        <MapPin size={16} />
                        <span>+ Suggest a Spot</span>
                    </button>
                </div>
            </div>

            <div className="explore-layout">
                <aside className="explore-sidebar">
                    {/* Direct Search Option */}
                    <div className="filter-group" ref={directSearchRef}>
                        <label className="filter-label">
                            <Icon name="search" size={16} className="filter-label-icon" /> Search State, City or Spot
                        </label>
                        <div className="search-wrapper" style={{ position: 'relative' }}>
                            <input
                                type="text"
                                className="filter-input"
                                placeholder="Type any place, city, or state..."
                                value={directSearchInput}
                                onChange={(e) => handleDirectSearchInput(e.target.value)}
                                style={{ paddingRight: directSearchInput ? '32px' : '14px' }}
                            />
                            {directSearchInput && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        isTypingRef.current = false;
                                        setDirectSearchInput('');
                                        setDebouncedDirectSearch('');
                                        setSelectedState('');
                                        setStateSearch('');
                                        setSelectedCity('');
                                        setDirectSuggestions([]);
                                        setShowDirectDropdown(false);
                                        setSearchParams({});
                                        setExplorePlanCities([]);
                                        setPlaceFilterQuery('');
                                        try { localStorage.removeItem('explorely-explore-plan-cities'); } catch { }
                                    }}
                                    title="Clear search"
                                    aria-label="Clear search"
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#888',
                                        fontSize: '14px',
                                        lineHeight: 1,
                                        padding: '4px'
                                    }}
                                >
                                    ✕
                                </button>
                            )}
                            {showDirectDropdown && (
                                <ul className="dropdown-list">
                                    {directSuggestions.length > 0 ? (
                                        <>
                                            {directSuggestions.map((s, i) => (
                                                <li key={i} className="dropdown-item" onClick={() => handleSelectDirectSuggestion(s)}>
                                                    <span className="state-code" style={{ fontSize: '0.7rem' }}>{s.type}</span>
                                                    {s.name} {s.city ? `(${s.city})` : ''}
                                                </li>
                                            ))}
                                            <li
                                                className="dropdown-item dropdown-suggest-item"
                                                onClick={() => {
                                                    setShowDirectDropdown(false);
                                                    openFeedbackModal({
                                                        type: 'spot',
                                                        spotName: directSearchInput,
                                                        spotAddress: [selectedCity, selectedState].filter(Boolean).join(', ')
                                                    });
                                                }}
                                            >
                                                <MapPin size={13} style={{ color: '#ff6b4a' }} />
                                                <span>Missing a spot? <strong>Submit "{directSearchInput}"</strong></span>
                                            </li>
                                        </>
                                    ) : (
                                        <li
                                            className="dropdown-item dropdown-suggest-item empty"
                                            onClick={() => {
                                                setShowDirectDropdown(false);
                                                openFeedbackModal({
                                                    type: 'spot',
                                                    spotName: directSearchInput,
                                                    spotAddress: [selectedCity, selectedState].filter(Boolean).join(', ')
                                                });
                                            }}
                                        >
                                            <div className="dropdown-suggest-empty-box">
                                                <span>No places found for "{directSearchInput}"</span>
                                                <strong className="suggest-click-text">+ Click to submit & add this spot →</strong>
                                            </div>
                                        </li>
                                    )}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="sidebar-divider">
                        <span>— OR Choose Below —</span>
                    </div>

                    {/* State Select */}
                    <div className="filter-group">
                        <label className="filter-label"><Icon name="map" size={16} className="filter-label-icon" /> Select State</label>
                        <div className="search-wrapper">
                            <input type="text" className="filter-input" placeholder="Search states..."
                                value={stateSearch} onChange={(e) => {
                                    const val = e.target.value;
                                    setStateSearch(val);
                                    if (!val) {
                                        isTypingRef.current = false;
                                        setSelectedState('');
                                        setSelectedCity('');
                                        setDirectSearchInput('');
                                        setDebouncedDirectSearch('');
                                        setSearchParams({});
                                        setExplorePlanCities([]);
                                        setPlaceFilterQuery('');
                                        try { localStorage.removeItem('explorely-explore-plan-cities'); } catch { }
                                    }
                                }} />
                            {showDropdown && (
                                <ul className="dropdown-list">
                                    {filteredStates.map(s => (
                                        <li key={s.code} className="dropdown-item" onClick={() => handleStateSelect(s.name)}>
                                            <span className="state-code">{s.code}</span> {s.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* City Select */}
                    {selectedState && cities.length > 0 && (
                        <div className="filter-group fade-in">
                            <label className="filter-label"><Icon name="building" size={16} className="filter-label-icon" /> Select City</label>
                            <select
                                className="filter-select"
                                value={selectedCity}
                                onChange={(e) => {
                                    isTypingRef.current = false;
                                    const cName = e.target.value;
                                    setSelectedCity(cName);
                                    setExplorePlanCities([]);
                                    setPlaceFilterQuery('');
                                    try { localStorage.removeItem('explorely-explore-plan-cities'); } catch { }
                                    if (cName) {
                                        // Show only city in search automatically
                                        setDirectSearchInput(cName);
                                        setDebouncedDirectSearch('');
                                        setSearchParams({ state: selectedState, city: cName });
                                    } else {
                                        // When All Cities chosen, show state
                                        setDirectSearchInput(selectedState);
                                        setDebouncedDirectSearch('');
                                        setSearchParams({ state: selectedState });
                                    }
                                }}
                            >
                                <option value="">All Cities</option>
                                {cities.map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                    )}

                    {/* Category Filter */}
                    <div className="filter-group">
                        <label className="filter-label"><Icon name="folder-open" size={16} className="filter-label-icon" /> Category</label>
                        <select className="filter-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                            <option value="">All Categories</option>
                            {categories.map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>

                    {/* Sort */}
                    <div className="filter-group">
                        <label className="filter-label"><Icon name="arrow-up-down" size={16} className="filter-label-icon" /> Sort By</label>
                        <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="recommended">Featured</option>
                            <option value="name">Name A–Z</option>
                            <option value="rating">Top Rated</option>
                        </select>
                    </div>
                </aside>

                <div className="explore-results">
                    {/* Location Header with Famous Food & Stays Action Buttons */}
                    {selectedState && !hideBanner && (!debouncedDirectSearch || (spots.length > 0 && selectedCity)) && (
                        <div className="explore-city-banner fade-in">
                            <img src={bannerImage} alt={selectedState} className="explore-banner-img" />
                            <div className="explore-banner-overlay">
                                <div className="location-header-info">
                                    <h2 className="explore-banner-title">
                                        {selectedCity ? selectedCity : selectedState}
                                        {explorePlanCities.length > 0 && (
                                            <span style={{ fontSize: '0.62em', fontWeight: 400, opacity: 0.9, marginLeft: '8px' }}>
                                                + {explorePlanCities.length === 1 ? explorePlanCities[0].name : `${explorePlanCities.length} more cities`}
                                            </span>
                                        )}
                                    </h2>
                                    <p className="explore-banner-subtitle">
                                        {selectedCity ? `${selectedCity}, ${selectedState}` : selectedState}
                                        {explorePlanCities.length > 0 && ` & planned cities`}
                                        &nbsp;·&nbsp; {spots.length} tourist places
                                    </p>
                                </div>

                                <div className="explore-highlight-buttons">
                                    <button
                                        className="highlight-btn food-highlight-btn"
                                        onClick={() => { setActiveModal('foods'); setModalSearch(''); }}
                                        title={`Famous Foods of ${selectedState}`}
                                    >
                                        <span className="btn-icon">🍽️</span> Famous Foods
                                    </button>
                                    <button
                                        className="highlight-btn hotel-highlight-btn"
                                        onClick={() => { setActiveModal('hotels'); setModalSearch(''); }}
                                        title={`Famous Stays & Hotels in ${selectedCity || selectedState}`}
                                    >
                                        <Icon name="hotel" size={15} /> Famous Stays
                                    </button>
                                    <button
                                        className="banner-close-btn"
                                        onClick={() => setHideBanner(true)}
                                        title="Hide this banner"
                                        aria-label="Hide banner"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="results-header" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'stretch' }}>
                        {/* Primary Control Row: Left = count & location; Right = In-place search & Fixed "Add a city +" button */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span className="results-count">{spots.length} places found</span>
                                {placeFilterQuery && (
                                    <span className="results-filter" style={{ color: 'var(--accent, #ff7e5f)', fontWeight: 600 }}>
                                        matching "{placeFilterQuery}"
                                    </span>
                                )}
                                {!debouncedDirectSearch && selectedState && (
                                    <span className="results-filter">
                                        in {selectedState}
                                        {selectedCity ? ` › ${selectedCity}` : ''}
                                        {explorePlanCities.length > 0 ? ` (+${explorePlanCities.length} planned)` : ''}
                                    </span>
                                )}
                                {debouncedDirectSearch && !placeFilterQuery && (
                                    <span className="results-filter">for "{debouncedDirectSearch}"</span>
                                )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto', flexWrap: 'wrap' }}>
                                {selectedState && hideBanner && (
                                    <button
                                        className="show-banner-toggle"
                                        onClick={() => setHideBanner(false)}
                                        title="Show banner & highlights"
                                    >
                                        <span>✨</span> Show Banner
                                    </button>
                                )}

                                {/* Dedicated Search Bar: Find places strictly within selected city and planned cities */}
                                <div className="city-places-search-wrapper" title={`Search places in ${selectedCity || selectedState || 'selection'}`}>
                                    <Icon name="search" size={14} className="city-places-search-icon" />
                                    <input
                                        type="text"
                                        className="city-places-search-input"
                                        placeholder={selectedCity ? `Search in ${selectedCity}...` : (selectedState ? `Search in ${selectedState}...` : 'Search places...')}
                                        value={placeFilterQuery}
                                        onChange={(e) => setPlaceFilterQuery(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Escape') {
                                                setPlaceFilterQuery('');
                                                e.target.blur();
                                            }
                                        }}
                                    />
                                    {placeFilterQuery && (
                                        <button
                                            type="button"
                                            className="city-places-search-clear"
                                            onClick={() => setPlaceFilterQuery('')}
                                            title="Clear search"
                                            aria-label="Clear place search"
                                        >
                                            &times;
                                        </button>
                                    )}
                                </div>

                                {/* Dedicated Anchor Wrapper: Dropdown is anchored ONLY to this button, preventing any shifting! */}
                                <div className="add-city-anchor" ref={addCityRef} style={{ position: 'relative' }}>
                                    <button
                                        type="button"
                                        className={`add-plan-city-btn ${isAddCityOpen ? 'active' : ''}`}
                                        onClick={() => setIsAddCityOpen(prev => !prev)}
                                    >
                                        Add a city +
                                    </button>

                                    {/* Popover Dropdown is anchored directly below Add a city button */}
                                    {isAddCityOpen && (
                                        <div
                                            className="plan-city-dropdown"
                                            style={{
                                                position: 'absolute',
                                                top: 'calc(100% + 8px)',
                                                right: 0,
                                                left: 'auto',
                                                width: '330px',
                                                maxWidth: 'calc(100vw - 32px)',
                                                zIndex: 1000
                                            }}
                                        >
                                            <div className="dropdown-header">
                                                <span className="dropdown-title">
                                                    <Icon name="map-pin" size={15} /> Add Cities in {selectedState || 'India'}
                                                </span>
                                                <button
                                                    type="button"
                                                    className="dropdown-close"
                                                    onClick={() => setIsAddCityOpen(false)}
                                                >
                                                    &times;
                                                </button>
                                            </div>

                                            <div className="dropdown-search-box">
                                                <Icon name="search" size={15} className="dropdown-search-icon" />
                                                <input
                                                    type="text"
                                                    className="dropdown-input"
                                                    placeholder={selectedState ? `Type city in ${selectedState}...` : 'Type city name...'}
                                                    value={citySearchQuery}
                                                    onChange={(e) => setCitySearchQuery(e.target.value)}
                                                    autoFocus
                                                />
                                                {citySearchQuery && (
                                                    <button
                                                        type="button"
                                                        className="dropdown-clear-btn"
                                                        onClick={() => setCitySearchQuery('')}
                                                    >
                                                        &times;
                                                    </button>
                                                )}
                                            </div>

                                            {/* Suggested Nearby Cities in dropdown (strictly within current state) */}
                                            {suggestedNearbyCities.length > 0 && !citySearchQuery && (
                                                <div style={{ marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid var(--card-border)' }}>
                                                    <div style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                                                        Nearby to {selectedCity}:
                                                    </div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                        {suggestedNearbyCities.map((nc, idx) => (
                                                            <button
                                                                key={idx}
                                                                type="button"
                                                                className="suggested-city-btn"
                                                                onClick={() => toggleExplorePlanCity(nc)}
                                                                title={`Add ${nc.name} (${nc.distance} km from ${selectedCity})`}
                                                            >
                                                                + {nc.name} <span style={{ opacity: 0.75, fontSize: '0.72rem' }}>({nc.distance} km)</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="dropdown-list">
                                                {matchingCities.length > 0 ? (
                                                    matchingCities.map((city, i) => {
                                                        const isAdded = explorePlanCities.some(pc => pc.name.toLowerCase() === city.name.toLowerCase());
                                                        return (
                                                            <div
                                                                key={i}
                                                                className={`dropdown-item ${isAdded ? 'selected' : ''}`}
                                                                onClick={() => toggleExplorePlanCity(city)}
                                                            >
                                                                <div className="dropdown-item-info">
                                                                    <span className="city-title">{city.name}</span>
                                                                    <span className="city-subtitle">{city.state}</span>
                                                                </div>
                                                                <span className="dropdown-item-badge">
                                                                    {isAdded ? (
                                                                        <span className="badge-added">
                                                                            <Icon name="check" size={12} /> Added
                                                                        </span>
                                                                    ) : (
                                                                        <span className="badge-add">+ Add</span>
                                                                    )}
                                                                </span>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="dropdown-empty">
                                                        No cities found in {selectedState || 'India'}{citySearchQuery ? ` matching "${citySearchQuery}"` : ''}.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Planned Cities Chips Row (Row 2): Keeps Add a city button fixed & never shifting */}
                        {explorePlanCities.length > 0 && (
                            <div className="plan-city-chips-row fade-in" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', width: '100%', paddingTop: '4px' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                    Planned cities:
                                </span>
                                {explorePlanCities.map((city, idx) => (
                                    <span key={idx} className="plan-city-chip" title={`${city.name}, ${city.state}`}>
                                        <span className="chip-name">{city.name}</span>
                                        <button
                                            type="button"
                                            className="chip-remove-btn"
                                            onClick={() => removeExplorePlanCity(city.name)}
                                            aria-label={`Remove ${city.name}`}
                                        >
                                            &times;
                                        </button>
                                    </span>
                                ))}
                                <button
                                    type="button"
                                    className="clear-plan-chips-btn"
                                    onClick={clearExplorePlanCities}
                                    title="Clear planned cities filter"
                                >
                                    Clear all
                                </button>
                            </div>
                        )}
                    </div>

                    {visibleSpots.length > 0 ? (
                        <>
                            <div className="spots-grid">
                                {visibleSpots.map((spot, i) => (
                                    <SpotCard key={`${spot.name}-${spot.city}-${i}`} spot={spot}
                                        style={{ animationDelay: `${Math.min(i, 8) * 0.05}s` }} />
                                ))}
                            </div>
                            {/* View More / Load More Section for all filtered/browsing results */}
                            {visibleCount < spots.length && (
                                <div className="explore-view-more-container">
                                    <div className="explore-view-more-info">
                                        <span className="explore-view-more-count">
                                            Showing <strong>{visibleSpots.length}</strong> of <strong>{spots.length.toLocaleString()}</strong> places ({Math.ceil(visibleSpots.length / 2)} rows)
                                        </span>
                                        <div className="explore-view-more-bar">
                                            <div
                                                className="explore-view-more-bar-fill"
                                                style={{ width: `${Math.min(100, Math.max(6, (visibleSpots.length / spots.length) * 100))}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="explore-view-more-actions">
                                        <button
                                            type="button"
                                            className="explore-view-all-btn"
                                            onClick={() => setVisibleCount(prev => Math.min(spots.length, prev + 48))}
                                            title="Load next 48 places"
                                        >
                                            <span>+ Load 48 More</span>
                                            <ChevronDown size={17} />
                                        </button>
                                        <button
                                            type="button"
                                            className="explore-load-more-btn"
                                            onClick={() => setVisibleCount(prev => Math.min(spots.length, prev + 24))}
                                            title="Load next 24 places"
                                        >
                                            <span>+ Load Next 24 Places</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Banner shown when all matching places are loaded */}
                            {visibleCount >= spots.length && spots.length > INITIAL_VISIBLE_COUNT && (
                                <div className="explore-all-loaded-banner">
                                    <span className="explore-all-loaded-text">
                                        All <strong>{spots.length.toLocaleString()}</strong> places loaded
                                    </span>
                                    <button
                                        type="button"
                                        className="explore-collapse-btn"
                                        onClick={() => {
                                            setVisibleCount(INITIAL_VISIBLE_COUNT);
                                            window.scrollTo({ top: 320, behavior: 'smooth' });
                                        }}
                                        title="Collapse back to top"
                                    >
                                        <ChevronUp size={15} />
                                        <span>Show Less</span>
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="empty-state explore-empty-card">
                            <div className="empty-state-glow-icon">
                                <MapPin size={34} />
                            </div>
                            <h3 className="empty-state-heading">
                                {placeFilterQuery
                                    ? `No places found matching "${placeFilterQuery}" in ${selectedCity || selectedState || 'selection'}`
                                    : directSearchInput
                                        ? `Couldn't find "${directSearchInput}"`
                                        : (selectedCity || selectedState)
                                            ? `No spots found in ${[selectedCity, selectedState].filter(Boolean).join(', ')}`
                                            : 'No tourist places found'}
                            </h3>
                            <p className="empty-state-subtext">
                                {placeFilterQuery ? (
                                    'Try searching with another keyword or clear the search to view all places.'
                                ) : directSearchInput || selectedState ? (
                                    <>
                                        Know this place or want to see it featured on Explorely?
                                        Submit the spot details and picture, and our team will add it!
                                    </>
                                ) : (
                                    'Select a state or search above to discover places, or suggest a new spot below!'
                                )}
                            </p>
                            {placeFilterQuery && (
                                <button
                                    type="button"
                                    className="add-plan-city-btn"
                                    onClick={() => setPlaceFilterQuery('')}
                                    style={{ marginTop: '14px' }}
                                >
                                    Clear Places Search
                                </button>
                            )}
                            <button
                                type="button"
                                className="empty-state-submit-btn"
                                onClick={() => openFeedbackModal({
                                    type: 'spot',
                                    spotName: directSearchInput || '',
                                    spotAddress: [selectedCity, selectedState].filter(Boolean).join(', '),
                                    spotCategory: selectedCategory || ''
                                })}
                            >
                                <MapPin size={16} />
                                <span>+ Submit & Add {directSearchInput ? `"${directSearchInput}"` : 'a Spot'}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* =========================================
                MODAL OVERLAY FOR FOODS AND HOTELS
               ========================================= */}
            {activeModal && (
                <div className="explore-modal-backdrop fade-in" onClick={() => setActiveModal(null)}>
                    <div className="explore-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="explore-modal-header">
                            <div className="modal-title-wrapper">
                                <h2>
                                    {activeModal === 'foods' ? `🍽️ Famous Foods of ${selectedState}` : `🏨 Top Stays in ${selectedCity || selectedState}`}
                                </h2>
                                <p className="modal-subtitle">
                                    {activeModal === 'foods' ? `Traditional dishes and delicacies of ${selectedState}` : `Recommended hotels & dining near ${selectedCity || selectedState}`}
                                </p>
                            </div>
                            <button className="modal-close-btn" onClick={() => setActiveModal(null)}>
                                <Icon name="x" size={22} />
                            </button>
                        </div>

                        {/* Search bar inside Modal */}
                        <div className="modal-search-wrapper">
                            <span className="modal-search-icon"><Icon name="search" size={16} /></span>
                            <input
                                type="text"
                                className="modal-search-input"
                                placeholder={`Search ${activeModal === 'foods' ? 'dishes' : 'hotels'}...`}
                                value={modalSearch}
                                onChange={(e) => setModalSearch(e.target.value)}
                            />
                            {modalSearch && (
                                <button className="modal-search-clear" onClick={() => setModalSearch('')}>
                                    <Icon name="x" size={14} />
                                </button>
                            )}
                        </div>

                        <div className="explore-modal-body">
                            {activeModal === 'foods' && (
                                stateFoods.length > 0 ? (
                                    <div className="foods-grid search-foods-grid">
                                        {stateFoods.map((food, i) => (
                                            <FoodCard key={i} food={food} stateName={null} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <span className="empty-icon">🍽️</span>
                                        <p>No dishes found matching "{modalSearch}"</p>
                                    </div>
                                )
                            )}

                            {activeModal === 'hotels' && (
                                locationHotels.length > 0 ? (
                                    <div className="hotels-grid">
                                        {locationHotels.map((hotel, i) => (
                                            <HotelCard key={i} hotel={hotel} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <span className="empty-icon"><Icon name="hotel" size={32} /></span>
                                        <p>No hotels found matching "{modalSearch}" in {selectedCity || selectedState}</p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
