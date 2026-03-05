import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import SpotCard from '../components/SpotCard';
import HotelCard from '../components/HotelCard';

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

    const total = results.spots.length + results.hotels.length + results.matchedStates.length + results.matchedCities.length;

    if (!dataLoaded) return <div className="page-loading"><div className="loading-spinner" /><p>Loading...</p></div>;

    return (
        <div className="search-page">
            <div className="page-header">
                <h1 className="page-title">🔍 Search Results</h1>
                <p className="page-subtitle">
                    {total} results for "<strong>{query}</strong>"
                </p>
            </div>

            {total === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">🔍</span>
                    <p>No results found for "{query}". Try a different search term.</p>
                </div>
            ) : (
                <div className="search-results-content">
                    {results.spots.length > 0 && (
                        <section className="search-section">
                            <h2 className="search-section-title">📍 Tourist Places ({results.spots.length})</h2>
                            <div className="spots-grid">
                                {results.spots.map((spot, i) => (
                                    <SpotCard key={i} spot={spot} style={{ animationDelay: `${Math.min(i, 8) * 0.05}s` }} />
                                ))}
                            </div>
                        </section>
                    )}

                    {results.hotels.length > 0 && (
                        <section className="search-section">
                            <h2 className="search-section-title">🏨 Hotels ({results.hotels.length})</h2>
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
