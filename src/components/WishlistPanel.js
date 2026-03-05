import React from 'react';
import { useApp } from '../context/AppContext';

export default function WishlistPanel() {
    const { wishlist, showWishlist, setShowWishlist, removeFromWishlist } = useApp();
    if (!showWishlist) return null;

    return (
        <div className="wishlist-overlay" onClick={() => setShowWishlist(false)}>
            <div className="wishlist-panel" onClick={(e) => e.stopPropagation()}>
                <div className="wishlist-header">
                    <h2>❤️ My Wishlist</h2>
                    <button className="wishlist-close" onClick={() => setShowWishlist(false)}>✕</button>
                </div>
                {wishlist.length === 0 ? (
                    <div className="wishlist-empty">
                        <span className="empty-icon">📋</span>
                        <p>Your wishlist is empty.</p>
                        <p className="hint-text">Tap the heart on any place to save it!</p>
                    </div>
                ) : (
                    <div className="wishlist-items">
                        {wishlist.map((item, idx) => (
                            <div className="wishlist-item" key={idx}>
                                <img src={item.image} alt={item.name} className="wishlist-item-img"
                                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200'; }} />
                                <div className="wishlist-item-info">
                                    <h4>{item.name}</h4>
                                    <p>{item.city}{item.state ? `, ${item.state}` : ''}</p>
                                    <a href={item.mapLink} target="_blank" rel="noopener noreferrer" className="wishlist-map-link">📍 Maps</a>
                                </div>
                                <button className="wishlist-remove" onClick={() => removeFromWishlist(item)} title="Remove">🗑️</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
