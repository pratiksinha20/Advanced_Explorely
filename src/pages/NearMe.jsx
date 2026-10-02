import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import SpotCard from '../components/SpotCard';
import HotelCard from '../components/HotelCard';
import Icon from '../components/Icon';

function getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Levenshtein distance for fuzzy city search with typo tolerance (e.g. punchkula -> panchkula)
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

export default function NearMe() {
    const { allSpots, allHotels, cities, dataLoaded } = useApp();
    const [userLat, setUserLat] = useState(null);
    const [userLng, setUserLng] = useState(null);
    const [locationStatus, setLocationStatus] = useState('idle');
    const [maxDistance, setMaxDistance] = useState(30); // Default to 30km as requested
    const [tab, setTab] = useState('places');

    // Planned cities state (persisted in localStorage)
    const [planCities, setPlanCities] = useState(() => {
        try {
            const saved = localStorage.getItem('explorely-plan-cities');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [isAddCityOpen, setIsAddCityOpen] = useState(false);
    const [citySearchQuery, setCitySearchQuery] = useState('');
    const addCityRef = useRef(null);

    // Save planned cities to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('explorely-plan-cities', JSON.stringify(planCities));
        } catch { }
    }, [planCities]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (addCityRef.current && !addCityRef.current.contains(e.target)) {
                setIsAddCityOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const requestLocation = useCallback(() => {
        setLocationStatus('loading');
        if (!navigator.geolocation) {
            setLocationStatus('unsupported');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLat(pos.coords.latitude);
                setUserLng(pos.coords.longitude);
                setLocationStatus('success');
            },
            () => setLocationStatus('denied'),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, []);

    useEffect(() => { requestLocation(); }, [requestLocation]);

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

    // Filter spots: strictly to planned cities if active, otherwise all spots within GPS radius
    const nearbySpots = useMemo(() => {
        if (!allSpots || !allSpots.length) return [];

        const spotsWithDistance = allSpots.map(s => {
            const distance = (userLat && userLng && s.lat && s.lng)
                ? getDistance(userLat, userLng, s.lat, s.lng)
                : null;
            return { ...s, distance };
        });

        let results = [];

        if (planCities.length > 0) {
            // STRICT FILTER: When user adds planned cities, ONLY show places from those cities!
            // No other nearby cities (like Rupnagar, Kharar, etc.) will appear.
            const citySpots = spotsWithDistance.filter(s => isItemInPlannedCities(s, planCities));

            if (userLat && userLng) {
                // If any spots of the planned cities are within maxDistance, filter by maxDistance.
                // Otherwise (if user added a city slightly farther), still display them so they don't see an empty page.
                const withinRadius = citySpots.filter(s => s.distance !== null && s.distance <= maxDistance);
                results = withinRadius.length > 0 ? withinRadius : citySpots;
            } else {
                results = citySpots;
            }
        } else if (userLat && userLng) {
            // When NO planned cities are added, show all places within GPS radius
            results = spotsWithDistance.filter(s => s.distance !== null && s.distance <= maxDistance);
        }

        results.sort((a, b) => {
            if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
            if (a.distance !== null) return -1;
            if (b.distance !== null) return 1;
            return 0;
        });

        return results;
    }, [allSpots, userLat, userLng, maxDistance, planCities, isItemInPlannedCities]);

    // Filter hotels: strictly to planned cities if active, otherwise all hotels within GPS radius
    const nearbyHotels = useMemo(() => {
        if (!allHotels || !allHotels.length) return [];

        const hotelsWithDistance = allHotels.map(h => {
            const distance = (userLat && userLng && h.lat && h.lng)
                ? getDistance(userLat, userLng, h.lat, h.lng)
                : null;
            return { ...h, distance };
        });

        let results = [];

        if (planCities.length > 0) {
            // STRICT FILTER: When user adds planned cities, ONLY show hotels from those cities!
            const cityHotels = hotelsWithDistance.filter(h => isItemInPlannedCities(h, planCities));

            if (userLat && userLng) {
                const withinRadius = cityHotels.filter(h => h.distance !== null && h.distance <= maxDistance);
                results = withinRadius.length > 0 ? withinRadius : cityHotels;
            } else {
                results = cityHotels;
            }
        } else if (userLat && userLng) {
            results = hotelsWithDistance.filter(h => h.distance !== null && h.distance <= maxDistance);
        }

        results.sort((a, b) => {
            if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
            if (a.distance !== null) return -1;
            if (b.distance !== null) return 1;
            return 0;
        });

        return results;
    }, [allHotels, userLat, userLng, maxDistance, planCities, isItemInPlannedCities]);

    // Matching cities for the popover
    const matchingCities = useMemo(() => {
        if (!cities || !cities.length) return [];
        const q = citySearchQuery.trim().toLowerCase();
        if (!q) {
            const popular = ['Chandigarh', 'Mohali (SAS Nagar)', 'Panchkula', 'Jaipur', 'Agra', 'Delhi', 'Shimla', 'Manali', 'Mumbai', 'Varanasi', 'Amritsar', 'Udaipur', 'Goa'];
            return cities.filter(c => popular.some(p => c.name.toLowerCase().includes(p.toLowerCase()))).slice(0, 15);
        }
        return searchCitiesFuzzy(q, cities);
    }, [cities, citySearchQuery]);

    const togglePlanCity = (city) => {
        setPlanCities(prev => {
            const exists = prev.some(c => c.name.toLowerCase() === city.name.toLowerCase());
            if (exists) {
                return prev.filter(c => c.name.toLowerCase() !== city.name.toLowerCase());
            } else {
                return [...prev, city];
            }
        });
    };

    const removePlanCity = (cityName) => {
        setPlanCities(prev => prev.filter(c => c.name.toLowerCase() !== cityName.toLowerCase()));
    };

    // Pagination state
    const [visibleCount, setVisibleCount] = useState(24);

    const visibleSpots = useMemo(() => {
        return nearbySpots.slice(0, visibleCount);
    }, [nearbySpots, visibleCount]);

    const visibleHotels = useMemo(() => {
        return nearbyHotels.slice(0, visibleCount);
    }, [nearbyHotels, visibleCount]);

    // Reset pagination on filter or tab change
    useEffect(() => {
        setVisibleCount(24);
    }, [maxDistance, tab, planCities]);

    // Infinite scroll handler
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 300) {
                const totalLength = tab === 'places' ? nearbySpots.length : nearbyHotels.length;
                setVisibleCount(prev => {
                    if (prev >= totalLength) return prev;
                    return prev + 24;
                });
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [nearbySpots.length, nearbyHotels.length, tab]);

    if (!dataLoaded) return <div className="page-loading"><div className="loading-spinner" /><p>Loading...</p></div>;

    const hasLocation = userLat !== null && userLng !== null;
    const showResults = hasLocation || planCities.length > 0;

    return (
        <div className="nearme-page">
            <div className="page-header">
                <h1 className="page-title"><Icon name="map-pin" size={26} className="page-title-icon" /> Near Me</h1>
                <p className="page-subtitle">Discover attractions and hotels near your location and planned cities</p>
            </div>

            {!hasLocation && locationStatus === 'loading' && planCities.length === 0 ? (
                <div className="location-prompt">
                    <div className="location-icon-lg"><Icon name="map-pinned" size={48} /></div>
                    <h2>Detecting your location...</h2>
                    <div className="loading-spinner" />
                    <p>Please allow location access to see nearby attractions</p>
                    <div className="prompt-actions-divider">
                        <span>OR</span>
                    </div>
                    <button className="add-plan-city-hero-btn" onClick={() => setIsAddCityOpen(true)}>
                        <Icon name="plus" size={16} /> Add a city +
                    </button>
                </div>
            ) : !hasLocation && (locationStatus === 'denied' || locationStatus === 'unsupported') && planCities.length === 0 ? (
                <div className="location-prompt">
                    <div className="location-icon-lg"><Icon name="ban" size={48} /></div>
                    <h2>Location access required</h2>
                    <p>Enable location permissions in your browser, or add cities you are planning to visit.</p>
                    <div className="prompt-btn-group">
                        <button className="retry-btn" onClick={requestLocation}>Try Again</button>
                        <button className="add-plan-city-hero-btn" onClick={() => setIsAddCityOpen(true)}>
                            <Icon name="plus" size={16} /> Add a city +
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {!hasLocation && planCities.length > 0 && (
                        <div className="nearme-banner-info">
                            <Icon name="info" size={16} />
                            <span>Location is disabled. Showing places & hotels for your planned cities: <strong>{planCities.map(c => c.name).join(', ')}</strong></span>
                        </div>
                    )}

                    <div className="nearme-controls">
                        <div className="nearme-controls-left">
                            {hasLocation && (
                                <div className="distance-filter">
                                    <label>Max distance: <strong>{maxDistance} km</strong></label>
                                    <input
                                        type="range"
                                        min="5"
                                        max="300"
                                        step="5"
                                        value={maxDistance}
                                        onChange={(e) => setMaxDistance(Number(e.target.value))}
                                        className="distance-slider"
                                    />
                                </div>
                            )}

                            {/* Add a city + and chips */}
                            <div className="plan-cities-container" ref={addCityRef}>
                                <button
                                    type="button"
                                    className={`add-plan-city-btn ${isAddCityOpen ? 'active' : ''}`}
                                    onClick={() => setIsAddCityOpen(prev => !prev)}
                                >
                                    Add a city +
                                </button>

                                {/* Removable City Chips */}
                                <div className="plan-city-chips">
                                    {planCities.map((city, idx) => (
                                        <span key={idx} className="plan-city-chip" title={`${city.name}, ${city.state}`}>
                                            <span className="chip-name">{city.name}</span>
                                            <button
                                                type="button"
                                                className="chip-remove-btn"
                                                onClick={() => removePlanCity(city.name)}
                                                aria-label={`Remove ${city.name}`}
                                            >
                                                &times;
                                            </button>
                                        </span>
                                    ))}
                                    {planCities.length > 0 && (
                                        <button
                                            type="button"
                                            className="clear-plan-chips-btn"
                                            onClick={() => setPlanCities([])}
                                            title="Clear planned cities filter"
                                        >
                                            Clear all
                                        </button>
                                    )}
                                </div>

                                {/* Interactive City Search Dropdown Popover */}
                                {isAddCityOpen && (
                                    <div className="plan-city-dropdown">
                                        <div className="dropdown-header">
                                            <span className="dropdown-title">
                                                <Icon name="map-pin" size={15} /> Add Cities to Near Me
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
                                                placeholder="Type city name (e.g. Mohali, Chandigarh)..."
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

                                        <div className="dropdown-list">
                                            {matchingCities.length > 0 ? (
                                                matchingCities.map((city, i) => {
                                                    const isAdded = planCities.some(pc => pc.name.toLowerCase() === city.name.toLowerCase());
                                                    return (
                                                        <div
                                                            key={i}
                                                            className={`dropdown-item ${isAdded ? 'selected' : ''}`}
                                                            onClick={() => togglePlanCity(city)}
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
                                                    No cities found matching "{citySearchQuery}".
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="nearme-tabs">
                            <button
                                className={`tab-btn ${tab === 'places' ? 'active' : ''}`}
                                onClick={() => setTab('places')}
                            >
                                <Icon name="map-pin" size={16} /> Places ({nearbySpots.length})
                            </button>
                            <button
                                className={`tab-btn ${tab === 'hotels' ? 'active' : ''}`}
                                onClick={() => setTab('hotels')}
                            >
                                <Icon name="hotel" size={16} /> Hotels ({nearbyHotels.length})
                            </button>
                        </div>
                    </div>

                    {tab === 'places' ? (
                        nearbySpots.length > 0 ? (
                            <>
                                <div className="spots-grid">
                                    {visibleSpots.map((spot, i) => (
                                        <div key={i} className="near-card-wrapper">
                                            <div className="distance-badge">
                                                {spot.distance !== null && !isNaN(spot.distance) ? (
                                                    spot.distance < 1
                                                        ? `${(spot.distance * 1000).toFixed(0)} m away`
                                                        : `${spot.distance.toFixed(1)} km away`
                                                ) : (
                                                    <><Icon name="map-pin" size={12} /> {spot.city}</>
                                                )}
                                            </div>
                                            <SpotCard spot={spot} style={{ animationDelay: `${Math.min(i, 8) * 0.05}s` }} />
                                        </div>
                                    ))}
                                </div>
                                {visibleCount < nearbySpots.length && (
                                    <div className="loading-more">
                                        <div className="loading-spinner-small" />
                                        <p>Loading more places...</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="empty-state">
                                <span className="empty-icon"><Icon name="map" size={40} /></span>
                                <p>
                                    No places found within {maxDistance} km.
                                    {planCities.length === 0 ? ' Click "Add a city +" to include cities you want to explore!' : ' Try adding more planned cities or increasing the distance.'}
                                </p>
                            </div>
                        )
                    ) : (
                        nearbyHotels.length > 0 ? (
                            <>
                                <div className="hotels-grid">
                                    {visibleHotels.map((hotel, i) => (
                                        <div key={i} className="near-card-wrapper">
                                            <div className="distance-badge">
                                                {hotel.distance !== null && !isNaN(hotel.distance) ? (
                                                    hotel.distance < 1
                                                        ? `${(hotel.distance * 1000).toFixed(0)} m away`
                                                        : `${hotel.distance.toFixed(1)} km away`
                                                ) : (
                                                    <><Icon name="map-pin" size={12} /> {hotel.city}</>
                                                )}
                                            </div>
                                            <HotelCard hotel={hotel} />
                                        </div>
                                    ))}
                                </div>
                                {visibleCount < nearbyHotels.length && (
                                    <div className="loading-more">
                                        <div className="loading-spinner-small" />
                                        <p>Loading more hotels...</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="empty-state">
                                <span className="empty-icon"><Icon name="hotel" size={40} /></span>
                                <p>
                                    No hotels found within {maxDistance} km.
                                    {planCities.length === 0 ? ' Click "Add a city +" to include cities you want to explore!' : ' Try adding more planned cities or increasing the distance.'}
                                </p>
                            </div>
                        )
                    )}
                </>
            )}
        </div>
    );
}

