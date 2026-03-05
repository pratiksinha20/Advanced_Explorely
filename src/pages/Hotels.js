import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import HotelCard from '../components/HotelCard';

export default function Hotels() {
    const { allHotels, dataLoaded } = useApp();
    const [searchParams] = useSearchParams();

    const [cityFilter, setCityFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [ratingFilter, setRatingFilter] = useState(0);
    const [priceFilter, setPriceFilter] = useState('');
    const [sortBy, setSortBy] = useState('rating');

    const searchQ = searchParams.get('q') || '';

    const hotelCities = useMemo(() => [...new Set(allHotels.map(h => h.city))].sort(), [allHotels]);
    const hotelTypes = useMemo(() => [...new Set(allHotels.map(h => h.type))].sort(), [allHotels]);

    const filtered = useMemo(() => {
        let result = allHotels;
        if (searchQ) result = result.filter(h => h.name.toLowerCase().includes(searchQ.toLowerCase()));
        if (cityFilter) result = result.filter(h => h.city === cityFilter);
        if (typeFilter) result = result.filter(h => h.type === typeFilter);
        if (ratingFilter) result = result.filter(h => h.rating >= ratingFilter);
        if (priceFilter === 'low') result = result.filter(h => h.priceMin <= 5000);
        else if (priceFilter === 'mid') result = result.filter(h => h.priceMin > 5000 && h.priceMin <= 15000);
        else if (priceFilter === 'high') result = result.filter(h => h.priceMin > 15000);

        if (sortBy === 'rating') result = [...result].sort((a, b) => b.rating - a.rating);
        else if (sortBy === 'price-low') result = [...result].sort((a, b) => a.priceMin - b.priceMin);
        else if (sortBy === 'price-high') result = [...result].sort((a, b) => b.priceMin - a.priceMin);
        else if (sortBy === 'name') result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        return result;
    }, [allHotels, cityFilter, typeFilter, ratingFilter, priceFilter, sortBy, searchQ]);

    if (!dataLoaded) return <div className="page-loading"><div className="loading-spinner" /><p>Loading...</p></div>;

    return (
        <div className="hotels-page">
            <div className="page-header">
                <h1 className="page-title">🏨 Hotels & Resorts</h1>
                <p className="page-subtitle">Find the perfect stay across India</p>
            </div>

            <div className="explore-layout">
                <aside className="explore-sidebar">
                    <div className="filter-group">
                        <label className="filter-label">🏙️ City</label>
                        <select className="filter-select" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
                            <option value="">All Cities</option>
                            {hotelCities.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">🏷️ Type</label>
                        <select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                            <option value="">All Types</option>
                            {hotelTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">💰 Price Range</label>
                        <select className="filter-select" value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}>
                            <option value="">Any Price</option>
                            <option value="low">Budget (Under ₹5,000)</option>
                            <option value="mid">Mid-Range (₹5,000 - ₹15,000)</option>
                            <option value="high">Luxury (₹15,000+)</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">⭐ Min Rating</label>
                        <select className="filter-select" value={ratingFilter} onChange={(e) => setRatingFilter(Number(e.target.value))}>
                            <option value={0}>Any Rating</option>
                            <option value={4}>4+ Stars</option>
                            <option value={4.5}>4.5+ Stars</option>
                            <option value={4.7}>4.7+ Stars</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">🔄 Sort By</label>
                        <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="rating">Top Rated</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="name">Name A–Z</option>
                        </select>
                    </div>

                    <button className="clear-filters-btn" onClick={() => {
                        setCityFilter(''); setTypeFilter(''); setRatingFilter(0); setPriceFilter('');
                    }}>Clear All Filters</button>
                </aside>

                <div className="explore-results">
                    <div className="results-header">
                        <span className="results-count">{filtered.length} hotels found</span>
                    </div>
                    {filtered.length > 0 ? (
                        <div className="hotels-grid">
                            {filtered.map((hotel, i) => <HotelCard key={i} hotel={hotel} />)}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <span className="empty-icon">🏨</span>
                            <p>No hotels match your filters. Try adjusting them.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
