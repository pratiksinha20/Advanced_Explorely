import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
    const [darkMode, setDarkMode] = useState(() => {
        try { return JSON.parse(localStorage.getItem('explorely-dark')) ?? true; } catch { return true; }
    });
    const [wishlist, setWishlist] = useState(() => {
        try { const s = localStorage.getItem('explorely-wishlist'); return s ? JSON.parse(s) : []; } catch { return []; }
    });
    const [showWishlist, setShowWishlist] = useState(false);

    const [allSpots, setAllSpots] = useState([]);
    const [allHotels, setAllHotels] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [dataLoaded, setDataLoaded] = useState(false);

    // Persist
    useEffect(() => { localStorage.setItem('explorely-wishlist', JSON.stringify(wishlist)); }, [wishlist]);
    useEffect(() => { localStorage.setItem('explorely-dark', JSON.stringify(darkMode)); }, [darkMode]);

    // Load all data once
    useEffect(() => {
        Promise.all([
            fetch(process.env.PUBLIC_URL + '/data/states.json').then(r => r.json()),
            fetch(process.env.PUBLIC_URL + '/data/cities.json').then(r => r.json()),
            fetch(process.env.PUBLIC_URL + '/data/spots.json').then(r => r.json()),
            fetch(process.env.PUBLIC_URL + '/data/hotels.json').then(r => r.json()),
        ]).then(([s, c, sp, h]) => {
            setStates(s);
            setCities(c);
            setAllSpots(sp);
            setAllHotels(h);
            setDataLoaded(true);
        }).catch(err => console.error('Data load error:', err));
    }, []);

    const isInWishlist = useCallback((name, city) =>
        wishlist.some(w => w.name === name && w.city === city), [wishlist]);

    const toggleWishlist = useCallback((spot) => {
        setWishlist(prev => {
            const exists = prev.some(w => w.name === spot.name && w.city === spot.city);
            return exists ? prev.filter(w => !(w.name === spot.name && w.city === spot.city)) : [...prev, { ...spot }];
        });
    }, []);

    const removeFromWishlist = useCallback((spot) => {
        setWishlist(prev => prev.filter(w => !(w.name === spot.name && w.city === spot.city)));
    }, []);

    const toggleDarkMode = useCallback(() => setDarkMode(d => !d), []);

    // Categories with icons
    const categories = useMemo(() => [
        { name: 'Temple / Religious', icon: '🛕' },
        { name: 'Mountains / Hills', icon: '⛰️' },
        { name: 'Beaches', icon: '🏖️' },
        { name: 'Forests', icon: '🌲' },
        { name: 'Wildlife Sanctuaries', icon: '🦁' },
        { name: 'Waterfalls', icon: '💧' },
        { name: 'Lakes', icon: '🏞️' },
        { name: 'Forts', icon: '🏰' },
        { name: 'Palaces', icon: '👑' },
        { name: 'Museums & Galleries', icon: '🏛️' },
        { name: 'Historic Monuments', icon: '🗿' },
        { name: 'Parks & Gardens', icon: '🌳' },
        { name: 'Markets & Bazaars', icon: '🛍️' },
        { name: 'Adventure / Trekking', icon: '🧗' },
        { name: 'Spiritual Sites', icon: '🙏' },
    ], []);

    const value = useMemo(() => ({
        darkMode, toggleDarkMode,
        wishlist, showWishlist, setShowWishlist,
        isInWishlist, toggleWishlist, removeFromWishlist,
        allSpots, allHotels, states, cities, categories, dataLoaded,
    }), [darkMode, toggleDarkMode, wishlist, showWishlist, isInWishlist, toggleWishlist,
        removeFromWishlist, allSpots, allHotels, states, cities, categories, dataLoaded]);

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() { return useContext(AppContext); }
export default AppContext;
