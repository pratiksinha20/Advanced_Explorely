import React from 'react';
import { useApp } from '../context/AppContext';
import { Heart, MapPin, Star, Search } from 'lucide-react';

export default function SpotCard({ spot, style }) {
    const { isInWishlist, toggleWishlist } = useApp();
    const inWishlist = isInWishlist(spot.name, spot.city);

    return (
        <article className="spot-card" style={style}>
            <div className="spot-image-wrapper">
                <img src={spot.image} alt={spot.name} className="spot-image" loading="lazy"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600'; }} />
                <div className="spot-image-overlay" />
                <button className={`wishlist-heart ${inWishlist ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(spot); }}
                    title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}>
                    <Heart size={18} fill={inWishlist ? '#e74c3c' : 'none'} color={inWishlist ? '#e74c3c' : '#fff'} />
                </button>
                {spot.category && <span className="spot-category-badge">{spot.category}</span>}
                {spot.tier && (
                    <span className={`spot-tier-badge tier-${spot.tier.replace(' ', '-')}`}>
                        {spot.tier === 'most famous' ? '★ Must Visit' : spot.tier === 'famous' ? 'Popular' : 'Hidden Gem'}
                    </span>
                )}
            </div>
            <div className="spot-content">
                <div className="spot-header-row">
                    <h3 className="spot-name">{spot.name}</h3>
                    {spot.rating && <span className="spot-rating"><Star size={14} fill="#f39c12" color="#f39c12" /> {spot.rating}</span>}
                </div>
                <p className="spot-location"><MapPin size={14} /> {spot.city}{spot.state ? `, ${spot.state}` : ''}</p>
                <p className="spot-description">{spot.description}</p>
                {spot.tags && spot.tags.length > 0 && (
                    <div className="spot-tags">
                        {spot.tags.map((tag, i) => <span key={i} className="spot-tag">{tag}</span>)}
                    </div>
                )}
                <div className="spot-actions">
                    <a href={spot.mapLink} target="_blank" rel="noopener noreferrer" className="map-link">
                        <MapPin size={14} /> View on Maps
                    </a>
                    <a href={`https://www.google.com/search?q=${encodeURIComponent(`${spot.name}, ${spot.city}, ${spot.state || ''}`)}`} target="_blank" rel="noopener noreferrer" className="google-search-link">
                        <Search size={14} /> Search on Google
                    </a>
                </div>
            </div>
        </article>
    );
}
