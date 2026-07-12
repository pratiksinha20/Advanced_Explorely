import React from 'react';
import { MapPin, Star, ExternalLink } from 'lucide-react';

export default function HotelCard({ hotel }) {
    return (
        <article className="hotel-card">
            <div className="hotel-image-wrapper">
                <img src={hotel.image} alt={hotel.name} className="hotel-image" loading="lazy"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600'; }} />
                <span className="hotel-type-badge">{hotel.type}</span>
                <span className="hotel-price-badge">{hotel.priceRange}</span>
            </div>
            <div className="hotel-content">
                <div className="hotel-header-row">
                    <h3 className="hotel-name">{hotel.name}</h3>
                    <span className="hotel-rating"><Star size={14} fill="#f39c12" color="#f39c12" /> {hotel.rating}</span>
                </div>
                <p className="hotel-location"><MapPin size={14} /> {hotel.city}, {hotel.state}</p>
                <div className="hotel-amenities">
                    {hotel.amenities.slice(0, 5).map((a, i) => (
                        <span key={i} className="amenity-chip">{a}</span>
                    ))}
                    {hotel.amenities.length > 5 && <span className="amenity-chip more">+{hotel.amenities.length - 5}</span>}
                </div>
                <div className="hotel-actions">
                    <a href={hotel.mapLink} target="_blank" rel="noopener noreferrer" className="map-link">
                        <MapPin size={14} /> Maps
                    </a>
                    {hotel.bookingLink && (
                        <a href={hotel.bookingLink} target="_blank" rel="noopener noreferrer" className="booking-link">
                            <ExternalLink size={14} /> Book Now
                        </a>
                    )}
                </div>
            </div>
        </article>
    );
}
