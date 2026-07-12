import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import SpotCard from '../components/SpotCard';
import HotelCard from '../components/HotelCard';
import Icon from '../components/Icon';

export default function SearchResults() {
    const { allSpots, allHotels, states, cities, dataLoaded } = useApp();
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const results = useMemo(() => {
        if (!query) return { spots: [], hotels: [], matchedStates: [], matchedCities: [] };
        const ql = query.toLowerCase();
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
        };
    }, [query, allSpots, allHotels, states, cities]);

    // Pagination state for spots
    const [visibleCount, setVisibleCount] = useState(24);

    const visibleSpots = useMemo(() => {
        return results.spots.slice(0, visibleCount);
    }, [results.spots, visibleCount]);

    // Reset pagination on query change
    useEffect(() => {
        setVisibleCount(24);
    }, [query]);

    // Infinite scroll handler
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 300) {
                setVisibleCount(prev => {
                    if (prev >= results.spots.length) return prev;
                    return prev + 24;
                });
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [results.spots.length]);

    const total = results.spots.length + results.hotels.length + results.matchedStates.length + results.matchedCities.length;

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
                            <h2 className="search-section-title"><Icon name="hotel" size={20} className="section-title-icon" /> Hotels ({results.hotels.length})</h2>
                            <div className="hotels-grid">
                                {results.hotels.map((hotel, i) => <HotelCard key={i} hotel={hotel} />)}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}
