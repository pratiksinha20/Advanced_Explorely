import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import SpotCard from '../components/SpotCard';
import Icon from '../components/Icon';

export default function Explore() {
    const { allSpots, states, cities: allCities, categories, dataLoaded } = useApp();
    const [searchParams, setSearchParams] = useSearchParams();

    const [selectedState, setSelectedState] = useState(searchParams.get('state') || '');
    const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [stateSearch, setStateSearch] = useState(searchParams.get('state') || '');
    const [sortBy, setSortBy] = useState('recommended');
    const [selectedTier, setSelectedTier] = useState('');
    
    // Pagination state
    const [visibleCount, setVisibleCount] = useState(24);

    useEffect(() => {
        const s = searchParams.get('state');
        const c = searchParams.get('city');
        if (s) { setSelectedState(s); setStateSearch(s); }
        if (c) setSelectedCity(c);
    }, [searchParams]);

    const cities = useMemo(() =>
        selectedState ? allCities.filter(c => c.state === selectedState) : [], [allCities, selectedState]);

    const spots = useMemo(() => {
        let filtered = allSpots;
        if (selectedState) filtered = filtered.filter(s => s.state === selectedState);
        if (selectedCity) filtered = filtered.filter(s => s.city === selectedCity);
        if (selectedCategory) filtered = filtered.filter(s => s.category === selectedCategory);
        if (selectedTier) filtered = filtered.filter(s => s.tier === selectedTier);

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
    }, [allSpots, selectedState, selectedCity, selectedCategory, selectedTier, sortBy]);

    // Slice spots for rendering
    const visibleSpots = useMemo(() => {
        return spots.slice(0, visibleCount);
    }, [spots, visibleCount]);

    // Reset pagination on filter change
    useEffect(() => {
        setVisibleCount(24);
    }, [selectedState, selectedCity, selectedCategory, selectedTier, sortBy]);

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

    const filteredStates = useMemo(() =>
        states.filter(s => s.name.toLowerCase().includes(stateSearch.toLowerCase())), [states, stateSearch]);

    const showDropdown = stateSearch.length > 0 && stateSearch !== selectedState && filteredStates.length > 0;

    const handleStateSelect = (name) => {
        setSelectedState(name);
        setStateSearch(name);
        setSelectedCity('');
        setSearchParams({ state: name });
    };

    if (!dataLoaded) return <div className="page-loading"><div className="loading-spinner" /><p>Loading...</p></div>;

    return (
        <div className="explore-page">
            <div className="page-header">
                <h1 className="page-title"><Icon name="compass" size={26} className="page-title-icon" /> Explore India</h1>
                <p className="page-subtitle">Discover tourist places — state by state, city by city</p>
            </div>

            <div className="explore-layout">
                <aside className="explore-sidebar">
                    {/* State Search */}
                    <div className="filter-group">
                        <label className="filter-label"><Icon name="map" size={16} className="filter-label-icon" /> Select State</label>
                        <div className="search-wrapper">
                            <input type="text" className="filter-input" placeholder="Search states..."
                                value={stateSearch} onChange={(e) => {
                                    setStateSearch(e.target.value);
                                    if (!e.target.value) { setSelectedState(''); setSelectedCity(''); setSearchParams({}); }
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
                            <select className="filter-select" value={selectedCity}
                                onChange={(e) => { setSelectedCity(e.target.value); setSearchParams({ state: selectedState, city: e.target.value }); }}>
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
                    <div className="results-header">
                        <span className="results-count">{spots.length} places found</span>
                        {selectedState && <span className="results-filter">in {selectedState}{selectedCity ? ` › ${selectedCity}` : ''}</span>}
                    </div>

                    <div className="tier-filter-tabs">
                        <button className={`tier-tab ${selectedTier === '' ? 'active' : ''}`}
                            onClick={() => setSelectedTier('')}>
                            All Places
                        </button>
                        <button className={`tier-tab ${selectedTier === 'most famous' ? 'active' : ''}`}
                            onClick={() => setSelectedTier('most famous')}>
                            ★ Must Visit
                        </button>
                        <button className={`tier-tab ${selectedTier === 'famous' ? 'active' : ''}`}
                            onClick={() => setSelectedTier('famous')}>
                            Popular
                        </button>
                        <button className={`tier-tab ${selectedTier === 'hidden' ? 'active' : ''}`}
                            onClick={() => setSelectedTier('hidden')}>
                            Hidden Gems
                        </button>
                    </div>

                    {visibleSpots.length > 0 ? (
                        <>
                            <div className="spots-grid">
                                {visibleSpots.map((spot, i) => (
                                    <SpotCard key={`${spot.name}-${spot.city}-${i}`} spot={spot}
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
                            <span className="empty-icon"><Icon name="search" size={40} /></span>
                            <p>{selectedState ? `No places found in ${selectedCity || selectedState}` : 'Select a state to start exploring!'}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
