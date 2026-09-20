import React from 'react';
import { MapPin, Star, Search } from 'lucide-react';

export default function HotelCard({ hotel }) {
    const isRestaurant = hotel.type === 'Restaurant';

    return (
        <article className="hotel-card">
            <div className="hotel-image-wrapper">
                <img src={hotel.image} alt={hotel.name} className="hotel-image" loading="lazy"
                    onError={(e) => { e.target.src = isRestaurant ? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600' : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600'; }} />
                <span className={`hotel-type-badge type-${hotel.type.toLowerCase()}`}>{hotel.type}</span>
                <span className="hotel-price-badge">{hotel.priceRange}</span>
                {hotel.distance !== undefined && hotel.distance !== null && (
                    <span className="hotel-distance-badge">
                        <MapPin size={11} /> {hotel.distance < 1 ? `${(hotel.distance * 1000).toFixed(0)} m` : `${hotel.distance.toFixed(1)} km`} away
                    </span>
                )}
            </div>
            <div className="hotel-content">
                <div className="hotel-header-row">
                    <h3 className="hotel-name">{hotel.name}</h3>
                    <span className="hotel-rating"><Star size={14} fill="#f39c12" color="#f39c12" /> {hotel.rating}</span>
                </div>
                <p className="spot-location" style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0 12px 0', fontSize: '0.85rem', opacity: 0.7 }}><MapPin size={14} /> {hotel.city && hotel.state ? `${hotel.city}, ${hotel.state}` : (hotel.city || hotel.state || '')}</p>
                <div className="hotel-amenities">
                    {hotel.amenities.slice(0, 5).map((a, i) => (
                        <span key={i} className={`amenity-chip ${isRestaurant ? 'cuisine-chip' : ''}`}>{a}</span>
                    ))}
                    {hotel.amenities.length > 5 && <span className="amenity-chip more">+{hotel.amenities.length - 5}</span>}
                </div>
                <div className="hotel-actions">
                    <a href={hotel.mapLink} target="_blank" rel="noopener noreferrer" className="map-link">
                        <MapPin size={14} /> View on Maps
                    </a>
                    <a href={`https://www.google.com/search?q=${encodeURIComponent(`${hotel.name}, ${hotel.city}, ${hotel.state}`)}`} target="_blank" rel="noopener noreferrer" className="google-search-link">
                        <Search size={14} /> Search on Google
                    </a>
                </div>
            </div>
        </article>
    );
}