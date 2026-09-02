import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import SpotCard from '../components/SpotCard';
import HotelCard from '../components/HotelCard';
import FoodCard from '../components/FoodCard';
import Icon from '../components/Icon';

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
    'Sikkim': 'https://images.unsplash.com/photo-1609340754762-5e1b56f82f6e?w=1200',
    'Andaman and Nicobar Islands': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200',
    'Jharkhand': 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200',
    'Chandigarh': 'https://images.unsplash.com/photo-1588392382834-a891154bca4d?w=1200',
};

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1598394244963-3a0b50bb5406?w=1200';

export default function Explore() {
    const { allSpots, allHotels, allFoods, states, cities: allCities, categories, dataLoaded } = useApp();
    const [searchParams, setSearchParams] = useSearchParams();

    const [selectedState, setSelectedState] = useState(searchParams.get('state') || '');
    const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [stateSearch, setStateSearch] = useState(searchParams.get('state') || '');
    const [sortBy, setSortBy] = useState('recommended');
    const [selectedTier, setSelectedTier] = useState('');
    
    // Direct "OR" Search state
    const [directSearch, setDirectSearch] = useState('');
    const [directSuggestions, setDirectSuggestions] = useState([]);
    const [showDirectDropdown, setShowDirectDropdown] = useState(false);
    const directSearchRef = useRef(null);

    // Modal state for Food and Hotels
    const [activeModal, setActiveModal] = useState(null); // 'foods' | 'hotels' | null
    const [modalSearch, setModalSearch] = useState('');

    // Pagination state
    const [visibleCount, setVisibleCount] = useState(24);

    useEffect(() => {
        const s = searchParams.get('state');
        const c = searchParams.get('city');
        if (s) { setSelectedState(s); setStateSearch(s); }
        if (c) setSelectedCity(c);
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

    // Direct Search handler
    const handleDirectSearchInput = (q) => {
        setDirectSearch(q);
        if (q.length < 2) {
            setDirectSuggestions([]);
            setShowDirectDropdown(false);
            return;
        }
        const ql = q.toLowerCase();
        const results = [];
        states.filter(s => s.name.toLowerCase().includes(ql)).slice(0, 3)
            .forEach(s => results.push({ type: 'State', name: s.name }));
        allCities.filter(c => c.name.toLowerCase().includes(ql)).slice(0, 4)
            .forEach(c => results.push({ type: 'City', name: c.name, state: c.state }));
        allSpots.filter(s => s.name.toLowerCase().includes(ql)).slice(0, 5)
            .forEach(s => results.push({ type: 'Spot', name: s.name, city: s.city, state: s.state }));

        setDirectSuggestions(results);
        setShowDirectDropdown(results.length > 0);
    };

    const handleSelectDirectSuggestion = (s) => {
        setShowDirectDropdown(false);
        if (s.type === 'State') {
            setSelectedState(s.name);
            setStateSearch(s.name);
            setSelectedCity('');
            setSearchParams({ state: s.name });
        } else if (s.type === 'City') {
            setSelectedState(s.state);
            setStateSearch(s.state);
            setSelectedCity(s.name);
            setSearchParams({ state: s.state, city: s.name });
        } else if (s.type === 'Spot') {
            setSelectedState(s.state || '');
            setStateSearch(s.state || '');
            setSelectedCity(s.city || '');
            setDirectSearch(s.name);
            setSearchParams({ state: s.state || '', city: s.city || '' });
        }
    };

    const cities = useMemo(() =>
        selectedState ? allCities.filter(c => c.state === selectedState) : [], [allCities, selectedState]);

    const spots = useMemo(() => {
        let filtered = allSpots;
        if (selectedState) filtered = filtered.filter(s => s.state === selectedState);
        if (selectedCity) filtered = filtered.filter(s => s.city === selectedCity);
        if (selectedCategory) filtered = filtered.filter(s => s.category === selectedCategory);
        if (selectedTier) filtered = filtered.filter(s => s.tier === selectedTier);
        if (directSearch && directSearch.trim() !== '') {
            const ql = directSearch.toLowerCase();
            filtered = filtered.filter(s =>
                s.name.toLowerCase().includes(ql) ||
                s.city.toLowerCase().includes(ql) ||
                (s.state || '').toLowerCase().includes(ql) ||
                (s.category || '').toLowerCase().includes(ql) ||
                s.description.toLowerCase().includes(ql)
            );
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
    }, [allSpots, selectedState, selectedCity, selectedCategory, selectedTier, directSearch, sortBy]);

    // Foods for selected state
    const stateFoods = useMemo(() => {
        if (!selectedState || !allFoods[selectedState]) return [];
        let items = allFoods[selectedState] || [];
        if (modalSearch) {
            const ql = modalSearch.toLowerCase();
            items = items.filter(f => f.name.toLowerCase().includes(ql) || (f.description || '').toLowerCase().includes(ql));
        }
        return items;
    }, [allFoods, selectedState, modalSearch]);

    // Hotels for selected city/state
    const locationHotels = useMemo(() => {
        if (!selectedState) return [];
        let hotels = allHotels.filter(h => h.state === selectedState);
        if (selectedCity) hotels = hotels.filter(h => h.city === selectedCity);
        if (modalSearch) {
            const ql = modalSearch.toLowerCase();
            hotels = hotels.filter(h => h.name.toLowerCase().includes(ql) || (h.type || '').toLowerCase().includes(ql));
        }
        return hotels.sort((a, b) => b.rating - a.rating);
    }, [allHotels, selectedState, selectedCity, modalSearch]);

    const visibleSpots = useMemo(() => {
        return spots.slice(0, visibleCount);
    }, [spots, visibleCount]);

    useEffect(() => {
        setVisibleCount(24);
    }, [selectedState, selectedCity, selectedCategory, selectedTier, directSearch, sortBy]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 300) {
                setVisibleCount(prev => (prev >= spots.length ? prev : prev + 24));
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

    const bannerImage = selectedState ? (stateImages[selectedState] || DEFAULT_BANNER) : null;

    if (!dataLoaded) return <div className="page-loading"><div className="loading-spinner" /><p>Loading...</p></div>;

    return (
        <div className="explore-page">
            <div className="page-header">
                <h1 className="page-title"><Icon name="compass" size={26} className="page-title-icon" /> Explore India</h1>
                <p className="page-subtitle">Discover tourist places — state by state, city by city</p>
            </div>

            <div className="explore-layout">
                <aside className="explore-sidebar">
                    {/* Direct Search Option */}
                    <div className="filter-group" ref={directSearchRef}>
                        <label className="filter-label">
                            <Icon name="search" size={16} className="filter-label-icon" /> Search State, City or Spot
                        </label>
                        <div className="search-wrapper">
                            <input
                                type="text"
                                className="filter-input"
                                placeholder="Type any place, city, or state..."
                                value={directSearch}
                                onChange={(e) => handleDirectSearchInput(e.target.value)}
                            />
                            {showDirectDropdown && (
                                <ul className="dropdown-list">
                                    {directSuggestions.map((s, i) => (
                                        <li key={i} className="dropdown-item" onClick={() => handleSelectDirectSuggestion(s)}>
                                            <span className="state-code" style={{ fontSize: '0.7rem' }}>{s.type}</span>
                                            {s.name} {s.city ? `(${s.city})` : ''}
                                        </li>
                                    ))}
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
                    {/* Location Header with Famous Food & Stays Action Buttons */}
                    {selectedState && (
                        <div className="explore-city-banner fade-in">
                            <img src={bannerImage} alt={selectedState} className="explore-banner-img" />
                            <div className="explore-banner-overlay">
                                <div className="location-header-info">
                                    <h2 className="explore-banner-title">
                                        {selectedCity ? selectedCity : selectedState}
                                    </h2>
                                    <p className="explore-banner-subtitle">
                                        {selectedCity ? `${selectedCity}, ${selectedState}` : selectedState} &nbsp;·&nbsp; {spots.length} tourist places
                                    </p>
                                </div>

                                <div className="explore-highlight-buttons">
                                    <button
                                        className="highlight-btn food-highlight-btn"
                                        onClick={() => { setActiveModal('foods'); setModalSearch(''); }}
                                    >
                                        <span className="btn-icon">🍽️</span> Famous Foods of {selectedState}
                                    </button>
                                    <button
                                        className="highlight-btn hotel-highlight-btn"
                                        onClick={() => { setActiveModal('hotels'); setModalSearch(''); }}
                                    >
                                        <Icon name="hotel" size={18} /> Famous Stays & Hotels in {selectedCity || selectedState}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

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
                            <p>{selectedState ? `No places found in ${selectedCity || selectedState}` : 'Select a state or search above to start exploring!'}</p>
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
