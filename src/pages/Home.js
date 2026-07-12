import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import SpotCard from '../components/SpotCard';
import HotelCard from '../components/HotelCard';
import Icon from '../components/Icon';

export default function Home() {
    const { allSpots, allHotels, states, categories, dataLoaded } = useApp();
    const navigate = useNavigate();

    const popularSpots = useMemo(() =>
        [...allSpots].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8), [allSpots]);

    const trendingSpots = useMemo(() => {
        const trending = allSpots.filter(s =>
            s.tags && (s.tags.includes('UNESCO') || s.tags.includes('Popular') || s.tags.includes('Scenic'))
        );
        return trending.slice(0, 6);
    }, [allSpots]);

    const topHotels = useMemo(() =>
        [...allHotels].sort((a, b) => b.rating - a.rating).slice(0, 6), [allHotels]);

    const featuredStates = useMemo(() =>
        states.filter(s => ['Rajasthan', 'Kerala', 'Goa', 'Himachal Pradesh', 'Uttarakhand', 'Tamil Nadu', 'Maharashtra', 'Karnataka'].includes(s.name)),
        [states]);

    if (!dataLoaded) {
        return (
            <div className="page-loading">
                <div className="loading-spinner" />
                <p>Loading Explorely...</p>
            </div>
        );
    }

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-bg-pattern" />
                <div className="hero-content">
                    <h1 className="hero-title">
                        Discover <span className="gradient-text">India's</span> Hidden Gems
                    </h1>
                    <p className="hero-subtitle">
                        Explore 300+ tourist destinations, hotels & attractions across 29 states
                    </p>
                    <div className="hero-search-wrapper">
                        <input type="text" className="hero-search" placeholder="Where do you want to go?"
                            onFocus={() => navigate('/explore')} readOnly />
                        <button className="hero-search-btn" onClick={() => navigate('/explore')}>Explore →</button>
                    </div>
                    <div className="hero-stats">
                        <div className="stat-item"><span className="stat-number">{allSpots.length}+</span><span className="stat-label">Places</span></div>
                        <div className="stat-item"><span className="stat-number">{states.length}</span><span className="stat-label">States</span></div>
                        <div className="stat-item"><span className="stat-number">{allHotels.length}+</span><span className="stat-label">Hotels</span></div>
                        <div className="stat-item"><span className="stat-number">{categories.length}</span><span className="stat-label">Categories</span></div>
                    </div>
                </div>
            </section>

            {/* Explore by State */}
            <section className="home-section">
                <div className="section-header">
                    <h2 className="section-title"><Icon name="map" size={22} className="section-title-icon" /> Explore by State</h2>
                    <Link to="/explore" className="see-all-link">See All →</Link>
                </div>
                <div className="state-grid">
                    {featuredStates.map(s => (
                        <Link to={`/explore?state=${encodeURIComponent(s.name)}`} key={s.code} className="state-card">
                            <span className="state-card-code">{s.code}</span>
                            <span className="state-card-name">{s.name}</span>
                            <span className="state-card-count">{allSpots.filter(sp => sp.state === s.name).length} places</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Explore by Category */}
            <section className="home-section">
                <div className="section-header">
                    <h2 className="section-title"><Icon name="folder-open" size={22} className="section-title-icon" /> Explore by Category</h2>
                    <Link to="/categories" className="see-all-link">See All →</Link>
                </div>
                <div className="category-scroll">
                    {categories.map((cat, i) => (
                        <Link to={`/categories?cat=${encodeURIComponent(cat.name)}`} key={i} className="category-card">
                            <span className="category-icon"><Icon name={cat.icon} size={28} /></span>
                            <span className="category-name">{cat.name}</span>
                            <span className="category-count">{allSpots.filter(s => s.category === cat.name).length}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Popular Destinations */}
            <section className="home-section">
                <div className="section-header">
                    <h2 className="section-title"><Icon name="sparkles" size={22} className="section-title-icon" /> Popular Destinations</h2>
                    <Link to="/explore" className="see-all-link">See All →</Link>
                </div>
                <div className="spots-grid">
                    {popularSpots.map((spot, i) => (
                        <SpotCard key={i} spot={spot} style={{ animationDelay: `${i * 0.05}s` }} />
                    ))}
                </div>
            </section>

            {/* Trending */}
            {trendingSpots.length > 0 && (
                <section className="home-section">
                    <div className="section-header">
                        <h2 className="section-title"><Icon name="trending-up" size={22} className="section-title-icon" /> Trending Tourist Spots</h2>
                    </div>
                    <div className="spots-grid">
                        {trendingSpots.map((spot, i) => (
                            <SpotCard key={i} spot={spot} style={{ animationDelay: `${i * 0.05}s` }} />
                        ))}
                    </div>
                </section>
            )}

            {/* Top Hotels */}
            <section className="home-section">
                <div className="section-header">
                    <h2 className="section-title"><Icon name="hotel" size={22} className="section-title-icon" /> Top Hotels & Resorts</h2>
                    <Link to="/hotels" className="see-all-link">See All →</Link>
                </div>
                <div className="hotels-grid">
                    {topHotels.map((hotel, i) => (
                        <HotelCard key={i} hotel={hotel} />
                    ))}
                </div>
            </section>
        </div>
    );
}
