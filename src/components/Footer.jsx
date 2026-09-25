import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    Heart, Sparkles, Mail, Send, ArrowUp, Compass, Globe, MapPin, Hotel 
} from 'lucide-react';

const InstagramIcon = ({ size = 17 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
);

const TwitterIcon = ({ size = 17 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
    </svg>
);

const YoutubeIcon = ({ size = 17 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
        <path d="m10 15 5-3-5-3z"/>
    </svg>
);

export default function Footer() {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email.trim()) {
            setSubscribed(true);
            setTimeout(() => {
                setEmail('');
                setSubscribed(false);
            }, 4000);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="footer">
            <div className="footer-container">
                {/* Top Newsletter / CTA Banner */}
                <div className="footer-newsletter-wrap">
                    <div className="footer-newsletter-card">
                        <div className="footer-newsletter-info">
                            <span className="footer-newsletter-badge">
                                <Sparkles size={14} className="sparkle-icon" />
                                <span>INCREDIBLE INDIA AWAITS</span>
                            </span>
                            <h3 className="footer-newsletter-title">Plan Your Dream Journey Across India</h3>
                            <p className="footer-newsletter-desc">
                                Get hand-picked heritage destinations, hidden scenic gems, and seasonal travel inspiration delivered straight to your inbox.
                            </p>
                        </div>
                        <form className="footer-newsletter-form" onSubmit={handleSubscribe}>
                            <div className="footer-input-box">
                                <Mail size={18} className="footer-input-icon" />
                                <input
                                    type="email"
                                    placeholder="Enter your email address..."
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="footer-email-input"
                                />
                            </div>
                            <button type="submit" className="footer-subscribe-btn">
                                <span>{subscribed ? 'Subscribed! 🎉' : 'Subscribe'}</span>
                                {!subscribed && <Send size={15} />}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Main Footer Content */}
                <div className="footer-main-content">
                    {/* Brand Column */}
                    <div className="footer-brand-col">
                        <Link to="/" className="footer-brand-header">
                            <img src="/explorely-logo.png" alt="Explorely Logo" className="footer-logo-img" />
                            <div className="footer-brand-titles">
                                <span className="footer-brand-title">Explorely</span>
                                <span className="footer-brand-subtitle">DISCOVER • EXPLORE • BELONG</span>
                            </div>
                        </Link>
                        <p className="footer-brand-text">
                            Discover the magic, culture, and untold wonders of India. One destination, one story, one unforgettable journey at a time.
                        </p>
                        
                        <div className="footer-pill-badges">
                            <span className="footer-pill"><Compass size={13} className="pill-icon" /> 28+ States</span>
                            <span className="footer-pill"><MapPin size={13} className="pill-icon" /> 21,500+ Places</span>
                            <span className="footer-pill"><Hotel size={13} className="pill-icon" /> 19,000+ Stays</span>
                        </div>

                        <div className="footer-social-links">
                            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="footer-social-icon" aria-label="Instagram">
                                <InstagramIcon size={17} />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="footer-social-icon" aria-label="Twitter">
                                <TwitterIcon size={17} />
                            </a>
                            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="footer-social-icon" aria-label="YouTube">
                                <YoutubeIcon size={17} />
                            </a>
                            <a href="https://explorely.com" target="_blank" rel="noreferrer" className="footer-social-icon" aria-label="Website">
                                <Globe size={17} />
                            </a>
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div className="footer-nav-grid">
                        <div className="footer-links-group">
                            <h4 className="footer-group-title">Explore</h4>
                            <ul className="footer-links-list">
                                <li><Link to="/explore">States & Cities</Link></li>
                                <li><Link to="/categories">Browse Categories</Link></li>
                                <li><Link to="/hotels">Hotels & Resorts</Link></li>
                                <li><Link to="/explore?category=Heritage">Heritage & Palaces</Link></li>
                                <li><Link to="/explore?category=Nature">Hill Stations & Treks</Link></li>
                            </ul>
                        </div>

                        <div className="footer-links-group">
                            <h4 className="footer-group-title">Discover</h4>
                            <ul className="footer-links-list">
                                <li><Link to="/near-me">Places Near Me</Link></li>
                                <li><Link to="/spin-go">Spin & Go Lucky Trip</Link></li>
                                <li><Link to="/split">Split Travel Expenses</Link></li>
                                <li><Link to="/explore?category=Spiritual">Sacred Temples & Ghats</Link></li>
                                <li><Link to="/explore?category=Beach">Beaches & Coastal</Link></li>
                            </ul>
                        </div>

                        <div className="footer-links-group top-destinations-group">
                            <h4 className="footer-group-title">Top Destinations</h4>
                            <ul className="footer-links-list top-dest-list">
                                <li><Link to="/explore?state=Uttar%20Pradesh&city=Agra">Taj Mahal, Agra</Link></li>
                                <li><Link to="/explore?state=Himachal%20Pradesh&city=Manali">Manali & Solang</Link></li>
                                <li><Link to="/explore?state=Goa">Goa Sunsets & Palms</Link></li>
                                <li><Link to="/explore?state=Rajasthan&city=Jaipur">Jaipur Amer Fort</Link></li>
                                <li><Link to="/explore?state=Uttar%20Pradesh&city=Varanasi">Varanasi Ghats</Link></li>
                                <li><Link to="/explore?state=Karnataka&city=Hampi">Hampi Ruins</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Back to top row */}
                <div className="footer-top-btn-wrap">
                    <button onClick={scrollToTop} className="footer-back-to-top-btn" aria-label="Back to top">
                        <Compass size={16} className="compass-icon" />
                        <span>Back to top</span>
                        <ArrowUp size={15} />
                    </button>
                </div>

                {/* Footer Bottom Bar */}
                <div className="footer-bottom-bar">
                    <div className="footer-bottom-flex">
                        <p className="footer-copyright-text">
                            © 2026 Explorely · Crafted with <Heart size={14} fill="#e74c3c" color="#e74c3c" className="footer-inline-heart" /> in India for passionate travelers worldwide
                        </p>
                        <div className="footer-bottom-meta">
                            <Link to="/explore">Explore India</Link>
                            <span className="footer-meta-sep">•</span>
                            <Link to="/hotels">Hotels</Link>
                            <span className="footer-meta-sep">•</span>
                            <Link to="/split">Expense Splitter</Link>
                            <span className="footer-meta-sep">•</span>
                            <span className="footer-meta-flag">🇮🇳 INR (₹)</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
