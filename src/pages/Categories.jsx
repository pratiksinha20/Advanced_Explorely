import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import SpotCard from '../components/SpotCard';
import Icon from '../components/Icon';

// Levenshtein distance for fuzzy city search with typo tolerance (e.g. punchkula -> panchkula, mogli -> mohali)
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

export default function Categories() {
    const { allSpots, categories, cities, dataLoaded } = useApp();
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeCategory, setActiveCategory] = useState(searchParams.get('cat') || '');
    const [sortBy, setSortBy] = useState('recommended');

    // Planned cities per category, persisted in localStorage
    const [categoryPlanCities, setCategoryPlanCities] = useState(() => {
        try {
            const saved = localStorage.getItem('explorely-category-plan-cities');
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });

    const [isAddCityOpen, setIsAddCityOpen] = useState(false);
    const [citySearchQuery, setCitySearchQuery] = useState('');
    const addCityRef = useRef(null);

    // Save planned cities to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('explorely-category-plan-cities', JSON.stringify(categoryPlanCities));
        } catch { }
    }, [categoryPlanCities]);

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

    // Active planned cities for the currently selected category
    const currentPlanCities = useMemo(() => {
        if (!activeCategory) return [];
        return categoryPlanCities[activeCategory] || [];
    }, [categoryPlanCities, activeCategory]);

    // Helper: Match spot against planned cities
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

    // Filter spots strictly by category and planned cities
    const spots = useMemo(() => {
        if (!activeCategory) return [];
        let filtered = allSpots.filter(s => {
            const catMatch = s.category === activeCategory ||
                (s.tags && s.tags.includes(activeCategory)) ||
                (activeCategory === 'Adventure / Trekking' && (s.tags || []).some(t => /adventure|trek/i.test(t)));

            if (!catMatch) return false;

            if (currentPlanCities.length > 0) {
                return isItemInPlannedCities(s, currentPlanCities);
            }

            return true;
        });

        if (sortBy === 'rating') filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        else if (sortBy === 'name') filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        else if (sortBy === 'state') filtered = [...filtered].sort((a, b) => (a.state || '').localeCompare(b.state || ''));
        return filtered;
    }, [allSpots, activeCategory, currentPlanCities, sortBy, isItemInPlannedCities]);

    // Matching cities for search popover
    const matchingCities = useMemo(() => {
        if (!cities || !cities.length) return [];
        const q = citySearchQuery.trim().toLowerCase();
        if (!q) {
            const popular = [
                'Manali', 'Rishikesh', 'Leh', 'Shimla', 'Kasol', 'Goa',
                'Jaipur', 'Varanasi', 'Amritsar', 'Udaipur', 'Darjeeling',
                'Munnar', 'Puri', 'Agra', 'Delhi', 'Mumbai', 'Chandigarh'
            ];
            return cities.filter(c => popular.some(p => c.name.toLowerCase() === p.toLowerCase() || c.name.toLowerCase().includes(p.toLowerCase()))).slice(0, 15);
        }
        return searchCitiesFuzzy(q, cities);
    }, [cities, citySearchQuery]);

    const togglePlanCity = (city) => {
        if (!activeCategory) return;
        setCategoryPlanCities(prev => {
            const current = prev[activeCategory] || [];
            const exists = current.some(c => c.name.toLowerCase() === city.name.toLowerCase());
            const updated = exists
                ? current.filter(c => c.name.toLowerCase() !== city.name.toLowerCase())
                : [...current, city];
            return { ...prev, [activeCategory]: updated };
        });
    };

    const removePlanCity = (cityName) => {
        if (!activeCategory) return;
        setCategoryPlanCities(prev => {
            const current = prev[activeCategory] || [];
            const updated = current.filter(c => c.name.toLowerCase() !== cityName.toLowerCase());
            return { ...prev, [activeCategory]: updated };
        });
    };

    const clearPlanCities = () => {
        if (!activeCategory) return;
        setCategoryPlanCities(prev => {
            const updated = { ...prev };
            delete updated[activeCategory];
            return updated;
        });
    };

    // Pagination state
    const [visibleCount, setVisibleCount] = useState(24);

    const visibleSpots = useMemo(() => {
        return spots.slice(0, visibleCount);
    }, [spots, visibleCount]);

    // Reset pagination on filter change
    useEffect(() => {
        setVisibleCount(24);
    }, [activeCategory, sortBy, currentPlanCities]);

    // Infinite scroll handler
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 300) {
                setVisibleCount(prev => {
                    if (prev >= spots.length) return prev;
                    return prev + 24;
                });
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [spots.length]);

    const handleCategoryClick = (catName) => {
        setActiveCategory(catName);
        setSearchParams({ cat: catName });
        setIsAddCityOpen(false);
        setCitySearchQuery('');
    };

    if (!dataLoaded) return <div className="page-loading"><div className="loading-spinner" /><p>Loading...</p></div>;

    return (
        <div className="categories-page">
            <div className="page-header">
                <h1 className="page-title"><Icon name="layout-grid" size={26} className="page-title-icon" /> Explore by Category</h1>
                <p className="page-subtitle">Discover places across India by category, or filter by your planned cities</p>
            </div>

            <div className="category-grid-full">
                {categories.map((cat, i) => {
                    const count = allSpots.filter(s =>
                        s.category === cat.name ||
                        (s.tags && s.tags.includes(cat.name)) ||
                        (cat.name === 'Adventure / Trekking' && (s.tags || []).some(t => /adventure|trek/i.test(t)))
                    ).length;
                    return (
                        <button key={i}
                            className={`category-card-full ${activeCategory === cat.name ? 'active' : ''}`}
                            onClick={() => handleCategoryClick(cat.name)}>
                            <span className="category-icon-lg"><Icon name={cat.icon} size={32} /></span>
                            <span className="category-name-lg">{cat.name}</span>
                            <span className="category-count-lg">{count} places</span>
                        </button>
                    );
                })}
            </div>

            {activeCategory && (
                <div className="category-results fade-in">
                    <div className="results-header category-results-header">
                        <div className="category-title-group">
                            <h2 className="results-title">
                                <Icon name={categories.find(c => c.name === activeCategory)?.icon} size={22} className="results-title-icon" />{' '}
                                {activeCategory} {currentPlanCities.length === 0 ? 'in India' : currentPlanCities.length === 1 ? `in ${currentPlanCities[0].name}` : 'in Selected Cities'}
                            </h2>
                            <span className="results-count">{spots.length} places</span>
                        </div>

                        <div className="category-header-actions">
                            <div className="plan-city-chips">
                                {currentPlanCities.map((city, idx) => (
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
                                {currentPlanCities.length > 0 && (
                                    <button
                                        type="button"
                                        className="clear-plan-chips-btn"
                                        onClick={clearPlanCities}
                                        title="Clear planned cities filter"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>

                            {/* Add a city button & anchored dropdown */}
                            <div className="add-city-anchor" ref={addCityRef} style={{ position: 'relative' }}>
                                <button
                                    type="button"
                                    className={`add-plan-city-btn ${isAddCityOpen ? 'active' : ''}`}
                                    onClick={() => setIsAddCityOpen(prev => !prev)}
                                >
                                    Add a city +
                                </button>

                                {/* Popover Dropdown */}
                                {isAddCityOpen && (
                                    <div className="plan-city-dropdown align-right" style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, left: 'auto', width: '330px', maxWidth: 'calc(100vw - 32px)', zIndex: 1000 }}>
                                        <div className="dropdown-header">
                                            <span className="dropdown-title">
                                                <Icon name="map-pin" size={15} /> Add Cities to {activeCategory}
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
                                                placeholder={`Type city name (e.g. Manali, Rishikesh)...`}
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
                                                    const isAdded = currentPlanCities.some(pc => pc.name.toLowerCase() === city.name.toLowerCase());
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

                            <div className="results-controls">
                                <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                    <option value="recommended">Featured</option>
                                    <option value="rating">Top Rated</option>
                                    <option value="name">Name A–Z</option>
                                    <option value="state">By State</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {spots.length > 0 ? (
                        <>
                            <div className="spots-grid">
                                {visibleSpots.map((spot, i) => (
                                    <SpotCard key={`${spot.name}-${i}`} spot={spot}
                                        style={{ animationDelay: `${Math.min(i, 8) * 0.05}s` }} />
                                ))}
                            </div>
                            {visibleCount < spots.length && (
                                <div className="loading-more">
                                    <div className="loading-spinner-small" />
                                    <p>Loading more places...</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="empty-state">
                            <span className="empty-icon"><Icon name="map-pin" size={40} /></span>
                            <p>
                                {currentPlanCities.length > 0
                                    ? `No ${activeCategory} places found in ${currentPlanCities.map(c => c.name).join(', ')}. Try adding another city or clear the city filter.`
                                    : `No places found for ${activeCategory}.`}
                            </p>
                            {currentPlanCities.length > 0 && (
                                <button className="retry-btn" onClick={clearPlanCities}>
                                    Show all {activeCategory} in India
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {!activeCategory && (
                <div className="empty-state">
                    <span className="empty-icon"><Icon name="compass" size={40} /></span>
                    <p>Select a category above to discover places across India</p>
                </div>
            )}
        </div>
    );
}

