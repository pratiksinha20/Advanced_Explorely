import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import SpotCard from '../components/SpotCard';

export default function Explore() {
    const { allSpots, states, cities: allCities, categories, dataLoaded } = useApp();
    const [searchParams, setSearchParams] = useSearchParams();

    const [selectedState, setSelectedState] = useState(searchParams.get('state') || '');
    const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [stateSearch, setStateSearch] = useState(searchParams.get('state') || '');
    const [sortBy, setSortBy] = useState('name');

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

        if (sortBy === 'rating') filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        else if (sortBy === 'name') filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        return filtered;
    }, [allSpots, selectedState, selectedCity, selectedCategory, sortBy]);

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
                <h1 className="page-title">🧭 Explore India</h1>
                <p className="page-subtitle">Discover tourist places — state by state, city by city</p>
            </div>

            <div className="explore-layout">
                <aside className="explore-sidebar">
                    {/* State Search */}
                    <div className="filter-group">
                        <label className="filter-label">🗺️ Select State</label>
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
                            <label className="filter-label">🏙️ Select City</label>
                            <select className="filter-select" value={selectedCity}
                                onChange={(e) => { setSelectedCity(e.target.value); setSearchParams({ state: selectedState, city: e.target.value }); }}>
                                <option value="">All Cities</option>
                                {cities.map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                    )}

                    {/* Category Filter */}
                    <div className="filter-group">
                        <label className="filter-label">📂 Category</label>
                        <select className="filter-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                            <option value="">All Categories</option>
                            {categories.map((c, i) => <option key={i} value={c.name}>{c.icon} {c.name}</option>)}
                        </select>
                    </div>

                    {/* Sort */}
                    <div className="filter-group">
                        <label className="filter-label">🔄 Sort By</label>
                        <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
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

                    {spots.length > 0 ? (
                        <div className="spots-grid">
                            {spots.map((spot, i) => (
                                <SpotCard key={`${spot.name}-${spot.city}-${i}`} spot={spot}
                                    style={{ animationDelay: `${Math.min(i, 8) * 0.05}s` }} />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <span className="empty-icon">🔍</span>
                            <p>{selectedState ? `No places found in ${selectedCity || selectedState}` : 'Select a state to start exploring!'}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
