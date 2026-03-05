import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import SpotCard from '../components/SpotCard';
import HotelCard from '../components/HotelCard';

function getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function NearMe() {
    const { allSpots, allHotels, dataLoaded } = useApp();
    const [userLat, setUserLat] = useState(null);
    const [userLng, setUserLng] = useState(null);
    const [locationStatus, setLocationStatus] = useState('idle');
    const [maxDistance, setMaxDistance] = useState(100);
    const [tab, setTab] = useState('places');

    const requestLocation = useCallback(() => {
        setLocationStatus('loading');
        if (!navigator.geolocation) {
            setLocationStatus('unsupported');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLat(pos.coords.latitude);
                setUserLng(pos.coords.longitude);
                setLocationStatus('success');
            },
            () => setLocationStatus('denied'),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, []);

    useEffect(() => { requestLocation(); }, [requestLocation]);

    const nearbySpots = useMemo(() => {
        if (!userLat || !userLng) return [];
        return allSpots
            .filter(s => s.lat && s.lng)
            .map(s => ({ ...s, distance: getDistance(userLat, userLng, s.lat, s.lng) }))
            .filter(s => s.distance <= maxDistance)
            .sort((a, b) => a.distance - b.distance);
    }, [allSpots, userLat, userLng, maxDistance]);

    const nearbyHotels = useMemo(() => {
        if (!userLat || !userLng) return [];
        return allHotels
            .filter(h => h.lat && h.lng)
            .map(h => ({ ...h, distance: getDistance(userLat, userLng, h.lat, h.lng) }))
            .filter(h => h.distance <= maxDistance)
            .sort((a, b) => a.distance - b.distance);
    }, [allHotels, userLat, userLng, maxDistance]);

    if (!dataLoaded) return <div className="page-loading"><div className="loading-spinner" /><p>Loading...</p></div>;

    return (
        <div className="nearme-page">
            <div className="page-header">
                <h1 className="page-title">📍 Near Me</h1>
                <p className="page-subtitle">Discover attractions and hotels near your location</p>
            </div>

            {locationStatus === 'idle' || locationStatus === 'loading' ? (
                <div className="location-prompt">
                    <div className="location-icon-lg">📍</div>
                    <h2>Detecting your location...</h2>
                    <div className="loading-spinner" />
                    <p>Please allow location access to see nearby attractions</p>
                </div>
            ) : locationStatus === 'denied' || locationStatus === 'unsupported' ? (
                <div className="location-prompt">
                    <div className="location-icon-lg">🚫</div>
                    <h2>Location access required</h2>
                    <p>Please enable location permissions in your browser to use this feature.</p>
                    <button className="retry-btn" onClick={requestLocation}>Try Again</button>
                </div>
            ) : (
                <>
                    <div className="nearme-controls">
                        <div className="distance-filter">
                            <label>Max distance: <strong>{maxDistance} km</strong></label>
                            <input type="range" min="10" max="500" step="10" value={maxDistance}
                                onChange={(e) => setMaxDistance(Number(e.target.value))} className="distance-slider" />
                        </div>
                        <div className="nearme-tabs">
                            <button className={`tab-btn ${tab === 'places' ? 'active' : ''}`} onClick={() => setTab('places')}>
                                📍 Places ({nearbySpots.length})
                            </button>
                            <button className={`tab-btn ${tab === 'hotels' ? 'active' : ''}`} onClick={() => setTab('hotels')}>
                                🏨 Hotels ({nearbyHotels.length})
                            </button>
                        </div>
                    </div>

                    {tab === 'places' ? (
                        nearbySpots.length > 0 ? (
                            <div className="spots-grid">
                                {nearbySpots.map((spot, i) => (
                                    <div key={i} className="near-card-wrapper">
                                        <div className="distance-badge">{spot.distance < 1 ? `${(spot.distance * 1000).toFixed(0)} m` : `${spot.distance.toFixed(1)} km`} away</div>
                                        <SpotCard spot={spot} style={{ animationDelay: `${Math.min(i, 8) * 0.05}s` }} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <span className="empty-icon">🗺️</span>
                                <p>No places found within {maxDistance} km. Try increasing the distance.</p>
                            </div>
                        )
                    ) : (
                        nearbyHotels.length > 0 ? (
                            <div className="hotels-grid">
                                {nearbyHotels.map((hotel, i) => (
                                    <div key={i} className="near-card-wrapper">
                                        <div className="distance-badge">{hotel.distance < 1 ? `${(hotel.distance * 1000).toFixed(0)} m` : `${hotel.distance.toFixed(1)} km`} away</div>
                                        <HotelCard hotel={hotel} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <span className="empty-icon">🏨</span>
                                <p>No hotels found within {maxDistance} km. Try increasing the distance.</p>
                            </div>
                        )
                    )}
                </>
            )}
        </div>
    );
}
