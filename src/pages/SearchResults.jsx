import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import SpotCard from '../components/SpotCard';
import HotelCard from '../components/HotelCard';
import FoodCard from '../components/FoodCard';
import Icon from '../components/Icon';

export default function SearchResults() {
    const { allSpots, allHotels, allFoods, states, cities, dataLoaded } = useApp();
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const results = useMemo(() => {
        if (!query) return { spots: [], hotels: [], matchedStates: [], matchedCities: [], foods: [] };
        const ql = query.toLowerCase();

        // Flatten foods
        const foodResults = [];
        Object.entries(allFoods).forEach(([stateName, foods]) => {
            if (Array.isArray(foods)) {
                foods.filter(f =>
                    f.name.toLowerCase().includes(ql) ||
                    (f.description || '').toLowerCase().includes(ql) ||
                    stateName.toLowerCase().includes(ql)
                ).forEach(f => foodResults.push({ ...f, state: stateName }));
            }
        });

        return {
            spots: allSpots.filter(s =>
                s.name.toLowerCase().includes(ql) ||
                s.city.toLowerCase().includes(ql) ||
                (s.state || '').toLowerCase().includes(ql) ||
                (s.category || '').toLowerCase().includes(ql) ||
                s.description.toLowerCase().includes(ql)
            ),
            hotels: allHotels.filter(h =>
                h.name.toLowerCase().includes(ql) ||
                h.city.toLowerCase().includes(ql) ||
                h.state.toLowerCase().includes(ql)
            ),
            matchedStates: states.filter(s => s.name.toLowerCase().includes(ql)),
            matchedCities: cities.filter(c => c.name.toLowerCase().includes(ql)),
            foods: foodResults,
        };
    }, [query, allSpots, allHotels, allFoods, states, cities]);

    // Pagination state for spots and hotels
    const [visibleCount, setVisibleCount] = useState(24);
    const [visibleHotelsCount, setVisibleHotelsCount] = useState(24);

    const visibleSpots = useMemo(() => {
        return results.spots.slice(0, visibleCount);
    }, [results.spots, visibleCount]);

    const visibleHotels = useMemo(() => {
        return results.hotels.slice(0, visibleHotelsCount);
    }, [results.hotels, visibleHotelsCount]);

    // Reset pagination on query change
    useEffect(() => {
        setVisibleCount(24);
        setVisibleHotelsCount(24);
    }, [query]);

    // Infinite scroll handler
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 300) {
                setVisibleCount(prev => {
                    if (prev >= results.spots.length) return prev;
                    return prev + 24;
                });
                setVisibleHotelsCount(prev => {
                    if (prev >= results.hotels.length) return prev;
                    return prev + 24;
                });
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [results.spots.length, results.hotels.length]);

    const total = results.spots.length + results.hotels.length + results.matchedStates.length + results.matchedCities.length + results.foods.length;

    if (!dataLoaded) return <div className="page-loading"><div className="loading-spinner" /><p>Loading...</p></div>;

    return (
        <div className="search-page">
            <div className="page-header">
                <h1 className="page-title"><Icon name="search" size={26} className="page-title-icon" /> Search Results</h1>
                <p className="page-subtitle">
                    {total} results for "<strong>{query}</strong>"
                </p>
            </div>

            {total === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon"><Icon name="search" size={40} /></span>
                    <p>No results found for "{query}". Try a different search term.</p>
                </div>
            ) : (
                <div className="search-results-content">
                    {results.matchedStates.length > 0 && (
                        <section className="search-section">
                            <h2 className="search-section-title"><Icon name="map" size={20} className="section-title-icon" /> States</h2>
                            <div className="states-grid-small">
                                {results.matchedStates.map(s => (
                                    <Link key={s.code} to={`/explore?state=${encodeURIComponent(s.name)}`} className="search-state-chip">
                                        <span className="state-code">{s.code}</span> {s.name}
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {results.matchedCities.length > 0 && (
                        <section className="search-section">
                            <h2 className="search-section-title"><Icon name="building" size={20} className="section-title-icon" /> Cities</h2>
                            <div className="cities-grid-small">
                                {results.matchedCities.map(c => (
                                    <Link key={c.name} to={`/explore?state=${encodeURIComponent(c.state)}&city=${encodeURIComponent(c.name)}`} className="search-city-chip">
                                        {c.name}, {c.state}
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {results.foods.length > 0 && (
                        <section className="search-section">
                            <h2 className="search-section-title">
                                <span style={{ marginRight: '6px', verticalAlign: '-2px' }}>🍽️</span>
                                Local Foods ({results.foods.length})
                            </h2>
                            <div className="foods-grid search-foods-grid">
                                {results.foods.slice(0, 12).map((food, i) => (
                                    <FoodCard key={i} food={food} stateName={food.state}
                                        style={{ animationDelay: `${Math.min(i, 8) * 0.05}s` }} />
                                ))}
                            </div>
                            {results.foods.length > 12 && (
                                <div style={{ textAlign: 'center', marginTop: '12px' }}>
                                    <Link to={`/foods?state=${encodeURIComponent(results.foods[0].state)}`} className="see-all-link" style={{ fontSize: '0.95rem' }}>
                                        View all {results.foods.length} foods →
                                    </Link>
                                </div>
                            )}
                        </section>
                    )}

                    {results.spots.length > 0 && (
                        <section className="search-section">
                            <h2 className="search-section-title"><Icon name="map-pin" size={20} className="section-title-icon" /> Tourist Places ({results.spots.length})</h2>
                            <div className="spots-grid">
                                {visibleSpots.map((spot, i) => (
                                    <SpotCard key={i} spot={spot} style={{ animationDelay: `${Math.min(i, 8) * 0.05}s` }} />
                                ))}
                            </div>
                            {visibleCount < results.spots.length && (
                                <div className="loading-more" style={{ marginTop: '20px' }}>
                                    <div className="loading-spinner-small" />
                                    <p>Loading more places...</p>
                                </div>
                            )}
                        </section>
                    )}

                    {results.hotels.length > 0 && (
                        <section className="search-section">
                            <h2 className="search-section-title"><Icon name="hotel" size={20} className="section-title-icon" /> Stays & Dining ({results.hotels.length})</h2>
                            <div className="hotels-grid">
                                {visibleHotels.map((hotel, i) => <HotelCard key={i} hotel={hotel} />)}
                            </div>
                            {visibleHotelsCount < results.hotels.length && (
                                <div className="loading-more" style={{ marginTop: '20px' }}>
                                    <div className="loading-spinner-small" />
                                    <p>Loading more stays...</p>
                                </div>
                            )}
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}