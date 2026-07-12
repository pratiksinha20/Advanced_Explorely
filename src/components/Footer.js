import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-brand">
                    <h3>Explorely</h3>
                    <p>Discover the beauty of India — one destination at a time.</p>
                </div>
                <div className="footer-links">
                    <div className="footer-col">
                        <h4>Explore</h4>
                        <Link to="/explore">States & Cities</Link>
                        <Link to="/categories">Categories</Link>
                        <Link to="/hotels">Hotels & Resorts</Link>
                    </div>
                    <div className="footer-col">
                        <h4>Discover</h4>
                        <Link to="/near-me">Near Me</Link>
                        <Link to="/categories">Temples</Link>
                        <Link to="/categories">Beaches</Link>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>© 2026 Explorely · Made with <Heart size={14} fill="#e74c3c" color="#e74c3c" style={{ verticalAlign: 'middle', display: 'inline' }} /> for travelers</p>
            </div>
        </footer>
    );
}
