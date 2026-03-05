import React from 'react';
import { useApp } from '../context/AppContext';

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
                    {inWishlist ? '❤️' : '🤍'}
                </button>
                {spot.category && <span className="spot-category-badge">{spot.category}</span>}
            </div>
            <div className="spot-content">
                <div className="spot-header-row">
                    <h3 className="spot-name">{spot.name}</h3>
                    {spot.rating && <span className="spot-rating">⭐ {spot.rating}</span>}
                </div>
                <p className="spot-location">📍 {spot.city}{spot.state ? `, ${spot.state}` : ''}</p>
                <p className="spot-description">{spot.description}</p>
                {spot.tags && spot.tags.length > 0 && (
                    <div className="spot-tags">
                        {spot.tags.map((tag, i) => <span key={i} className="spot-tag">{tag}</span>)}
                    </div>
                )}
                <div className="spot-actions">
                    <a href={spot.mapLink} target="_blank" rel="noopener noreferrer" className="map-link">
                        📍 View on Maps
                    </a>
                </div>
            </div>
        </article>
    );
}
