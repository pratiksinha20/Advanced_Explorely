import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import SpotCard from '../components/SpotCard';

export default function Categories() {
    const { allSpots, categories, dataLoaded } = useApp();
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeCategory, setActiveCategory] = useState(searchParams.get('cat') || '');
    const [sortBy, setSortBy] = useState('rating');

    const spots = useMemo(() => {
        if (!activeCategory) return [];
        let filtered = allSpots.filter(s => s.category === activeCategory);
        if (sortBy === 'rating') filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        else if (sortBy === 'name') filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        else if (sortBy === 'state') filtered = [...filtered].sort((a, b) => (a.state || '').localeCompare(b.state || ''));
        return filtered;
    }, [allSpots, activeCategory, sortBy]);

    const handleCategoryClick = (catName) => {
        setActiveCategory(catName);
        setSearchParams({ cat: catName });
    };

    if (!dataLoaded) return <div className="page-loading"><div className="loading-spinner" /><p>Loading...</p></div>;

    return (
        <div className="categories-page">
            <div className="page-header">
                <h1 className="page-title">📂 Explore by Category</h1>
                <p className="page-subtitle">Discover places across India by category</p>
            </div>

            <div className="category-grid-full">
                {categories.map((cat, i) => {
                    const count = allSpots.filter(s => s.category === cat.name).length;
                    return (
                        <button key={i}
                            className={`category-card-full ${activeCategory === cat.name ? 'active' : ''}`}
                            onClick={() => handleCategoryClick(cat.name)}>
                            <span className="category-icon-lg">{cat.icon}</span>
                            <span className="category-name-lg">{cat.name}</span>
                            <span className="category-count-lg">{count} places</span>
                        </button>
                    );
                })}
            </div>

            {activeCategory && (
                <div className="category-results fade-in">
                    <div className="results-header">
                        <h2 className="results-title">
                            {categories.find(c => c.name === activeCategory)?.icon} {activeCategory} in India
                        </h2>
                        <div className="results-controls">
                            <span className="results-count">{spots.length} places</span>
                            <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="rating">Top Rated</option>
                                <option value="name">Name A–Z</option>
                                <option value="state">By State</option>
                            </select>
                        </div>
                    </div>
                    <div className="spots-grid">
                        {spots.map((spot, i) => (
                            <SpotCard key={`${spot.name}-${i}`} spot={spot}
                                style={{ animationDelay: `${Math.min(i, 8) * 0.05}s` }} />
                        ))}
                    </div>
                </div>
            )}

            {!activeCategory && (
                <div className="empty-state">
                    <span className="empty-icon">👆</span>
                    <p>Select a category above to discover places across India</p>
                </div>
            )}
        </div>
    );
}
