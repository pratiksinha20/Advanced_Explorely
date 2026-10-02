import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import siteConfig from '../config/siteConfig';
import { 
    Heart, ArrowUp, Compass, MapPin, MessageSquare
} from 'lucide-react';

const InstagramIcon = ({ size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
);

const XIcon = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
);

const LinkedinIcon = ({ size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
        <rect width="4" height="12" x="2" y="9"/>
        <circle cx="4" cy="4" r="2"/>
    </svg>
);

export default function Footer() {
    const { openFeedbackModal } = useApp();

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="footer">
            <div className="footer-container">
                {/* 4-Column Professional Travel Platform Grid */}
                <div className="footer-simple-grid">
                    {/* Brand & Connect Column */}
                    <div className="footer-brand-section">
                        <Link to="/" className="footer-brand-header">
                            <img src="/explorely-logo.png" alt="Explorely Logo" className="footer-logo-img" />
                            <div className="footer-brand-titles">
                                <span className="footer-brand-title">Explorely</span>
                                <span className="footer-brand-subtitle">DISCOVER • EXPLORE • BELONG</span>
                            </div>
                        </Link>
                        <p className="footer-brand-text">
                            Curating India's timeless heritage, scenic retreats, and hidden wonders — helping travelers explore deeper with every journey.
                        </p>
                        
                        <div className="footer-social-links" aria-label="Social Profiles">
                            <a 
                                href={siteConfig.social.x} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="footer-social-icon" 
                                aria-label="X (Twitter)"
                                title={`Pratik Sinha on X (${siteConfig.social.xHandle})`}
                            >
                                <XIcon size={14} />
                            </a>
                            <a 
                                href={siteConfig.social.instagram} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="footer-social-icon" 
                                aria-label="Instagram"
                                title={`Pratik Sinha on Instagram (${siteConfig.social.instagramHandle})`}
                            >
                                <InstagramIcon size={15} />
                            </a>
                            <a 
                                href={siteConfig.social.linkedin} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="footer-social-icon" 
                                aria-label="LinkedIn"
                                title="Pratik Sinha on LinkedIn"
                            >
                                <LinkedinIcon size={15} />
                            </a>
                        </div>
                    </div>

                    {/* Explore Navigation Column */}
                    <div className="footer-column">
                        <h4 className="footer-section-heading">Explore</h4>
                        <ul className="footer-links-list">
                            <li><Link to="/explore">Explore Places</Link></li>
                            <li><Link to="/categories">Categories</Link></li>
                            <li><Link to="/hotels">Hotels & Stays</Link></li>
                            <li><Link to="/near-me">Places Near Me</Link></li>
                            <li><Link to="/spin-go">Spin & Go Lucky Trip</Link></li>
                            <li><Link to="/split">Split Travel Expenses</Link></li>
                        </ul>
                    </div>

                    {/* Company Column */}
                    <div className="footer-column">
                        <h4 className="footer-section-heading">Company</h4>
                        <ul className="footer-links-list">
                            <li><Link to="/contact#about">About Explorely</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                        </ul>

                        {/* Highlighted Interactive Actions */}
                        <div className="footer-highlight-group">
                            <button 
                                type="button" 
                                className="footer-highlight-card-btn spot-highlight"
                                onClick={() => openFeedbackModal({ type: 'spot' })}
                                title="Suggest a missing spot or attraction to add to Explorely"
                            >
                                <span className="footer-highlight-icon-wrap">
                                    <MapPin size={14} />
                                </span>
                                <div className="footer-highlight-text-wrap">
                                    <span className="footer-highlight-label">Suggest a Place</span>
                                    <span className="footer-highlight-sub">Add Missing Spot</span>
                                </div>
                                <span className="footer-highlight-badge">+ Add</span>
                            </button>

                            <button 
                                type="button" 
                                className="footer-highlight-card-btn feedback-highlight"
                                onClick={() => openFeedbackModal({ type: 'feedback' })}
                                title="Send ideas, corrections, or general feedback"
                            >
                                <span className="footer-highlight-icon-wrap">
                                    <MessageSquare size={13} />
                                </span>
                                <div className="footer-highlight-text-wrap">
                                    <span className="footer-highlight-label">Feedback</span>
                                    <span className="footer-highlight-sub">Share Thoughts</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Legal Column */}
                    <div className="footer-column">
                        <h4 className="footer-section-heading">Legal</h4>
                        <ul className="footer-links-list">
                            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                            <li><Link to="/terms">Terms & Conditions</Link></li>
                            <li><Link to="/disclaimer">Disclaimer</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Footer Bottom Bar */}
                <div className="footer-bottom-bar">
                    <div className="footer-bottom-flex">
                        <p className="footer-copyright-text">
                            © 2026 Explorely · Crafted with <Heart size={13} fill="#e74c3c" color="#e74c3c" className="footer-inline-heart" /> in India
                        </p>

                        <div className="footer-bottom-right">
                            <span className="footer-meta-currency">🇮🇳 INR (₹)</span>
                            <button onClick={scrollToTop} className="footer-simple-top-btn" aria-label="Back to top">
                                <Compass size={14} />
                                <span>Top</span>
                                <ArrowUp size={13} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
