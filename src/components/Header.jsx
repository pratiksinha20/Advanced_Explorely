import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Icon from './Icon';

export default function Header() {
    const { darkMode, toggleDarkMode, wishlist, setShowWishlist, allSpots, allHotels, allFoods, states, cities } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [mobileNav, setMobileNav] = useState(false);
    
    // In-drawer mobile search state
    const [drawerSearchQuery, setDrawerSearchQuery] = useState('');
    const [drawerSuggestions, setDrawerSuggestions] = useState([]);
    
    const searchRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handler = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Close mobile nav on route change
    useEffect(() => { 
        setMobileNav(false); 
        setDrawerSearchQuery('');
        setDrawerSuggestions([]);
    }, [location]);

    // Lock body scroll and handle Escape key when mobile nav is open
    useEffect(() => {
        if (mobileNav) {
            document.body.style.overflow = 'hidden';
            const handleKeyDown = (e) => {
                if (e.key === 'Escape') setMobileNav(false);
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => {
                document.body.style.overflow = '';
                window.removeEventListener('keydown', handleKeyDown);
            };
        } else {
            document.body.style.overflow = '';
        }
    }, [mobileNav]);

    const buildSuggestions = (q) => {
        if (q.length < 2) return [];
        const ql = q.toLowerCase();
        const results = [];
        states.filter(s => s.name.toLowerCase().includes(ql)).slice(0, 3)
            .forEach(s => results.push({ type: 'State', name: s.name, iconName: 'map' }));
        cities.filter(c => c.name.toLowerCase().includes(ql)).slice(0, 3)
            .forEach(c => results.push({ type: 'City', name: c.name, sub: c.state, iconName: 'building' }));
        allSpots.filter(s => s.name.toLowerCase().includes(ql)).slice(0, 4)
            .forEach(s => results.push({ type: 'Place', name: s.name, sub: s.city, iconName: 'map-pin' }));
        allHotels.filter(h => h.name.toLowerCase().includes(ql)).slice(0, 3)
            .forEach(h => results.push({ 
                type: h.type, 
                name: h.name, 
                sub: h.city, 
                iconName: h.type === 'Restaurant' ? 'utensils' : 'hotel' 
            }));
        Object.entries(allFoods).forEach(([stateName, foods]) => {
            if (Array.isArray(foods)) {
                foods.filter(f => f.name.toLowerCase().includes(ql)).slice(0, 2)
                    .forEach(f => results.push({ type: 'Food', name: f.name, sub: stateName, iconName: 'utensils' }));
            }
        });
        return results.slice(0, 10);
    };

    const handleSearch = (q) => {
        setSearchQuery(q);
        const res = buildSuggestions(q);
        setSuggestions(res);
        setShowSuggestions(res.length > 0);
    };

    const handleDrawerSearch = (q) => {
        setDrawerSearchQuery(q);
        const res = buildSuggestions(q);
        setDrawerSuggestions(res);
    };

    const handleSuggestionClick = (s) => {
        setShowSuggestions(false);
        setSearchQuery('');
        if (s.type === 'State') navigate(`/explore?state=${encodeURIComponent(s.name)}`);
        else if (s.type === 'City') navigate(`/explore?state=${encodeURIComponent(s.sub)}&city=${encodeURIComponent(s.name)}`);
        else if (s.type === 'Place') navigate(`/search?q=${encodeURIComponent(s.name)}`);
        else if (s.type === 'Hotel' || s.type === 'Resort' || s.type === 'Restaurant') navigate(`/hotels?q=${encodeURIComponent(s.name)}`);
        else if (s.type === 'Food') navigate(`/explore?state=${encodeURIComponent(s.sub)}`);
    };

    const handleDrawerSuggestionClick = (s) => {
        setDrawerSuggestions([]);
        setDrawerSearchQuery('');
        setMobileNav(false);
        handleSuggestionClick(s);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setShowSuggestions(false);
        }
    };

    const handleDrawerSearchSubmit = (e) => {
        e.preventDefault();
        if (drawerSearchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(drawerSearchQuery.trim())}`);
            setDrawerSuggestions([]);
            setDrawerSearchQuery('');
            setMobileNav(false);
        }
    };

    // Desktop nav links
    const navLinks = [
        { path: '/', label: 'Home', iconName: 'home' },
        { path: '/explore', label: 'Explore', iconName: 'compass' },
        { path: '/categories', label: 'Categories', iconName: 'folder-open' },
        { path: '/hotels', label: 'Hotels', iconName: 'hotel' },
        { path: '/near-me', label: 'Near Me', iconName: 'map-pin' },
        { path: '/spin-go', label: 'Spin & Go', iconName: 'refresh-cw' },
        { path: '/split', label: 'Split', iconName: 'split' },
    ];

    // Mobile nav rows with rich subtitles and color-coded icon badges (matching Image 2)
    const mobileNavItems = [
        { path: '/', label: 'Home', sub: 'Back to start', iconName: 'home', badgeClass: 'badge-home' },
        { path: '/explore', label: 'Explore', sub: 'Discover new places', iconName: 'compass', badgeClass: 'badge-explore' },
        { path: '/categories', label: 'Categories', sub: 'Find by interest', iconName: 'layout-grid', badgeClass: 'badge-categories' },
        { path: '/hotels', label: 'Hotels', sub: 'Stay in comfort', iconName: 'building', badgeClass: 'badge-hotels' },
        { path: '/near-me', label: 'Near Me', sub: 'Places around you', iconName: 'map-pin', badgeClass: 'badge-nearme' },
        { path: '/spin-go', label: 'Spin & Go', sub: 'Random destination', iconName: 'refresh-cw', badgeClass: 'badge-spingo' },
        { path: '/split', label: 'Split', sub: 'Split expenses', iconName: 'split', badgeClass: 'badge-split' },
    ];

    // Popular destinations preview thumbnails (matching Image 2)
    const popularDestinations = [
        { name: 'Agra', image: '/nav/dest-agra.jpg', path: '/explore?state=Uttar%20Pradesh&city=Agra' },
        { name: 'Manali', image: '/nav/dest-manali.jpg', path: '/explore?state=Himachal%20Pradesh&city=Manali' },
        { name: 'Goa', image: '/nav/dest-goa.jpg', path: '/explore?state=Goa' },
        { name: 'Hampi', image: '/nav/dest-hampi.jpg', path: '/explore?state=Karnataka&city=Hampi' },
    ];

    return (
        <>
            <header className="header-bar">
                <div className="header-left">
                    <Link to="/" className="header-brand-link">
                        <img src="/explorely-logo.png" alt="Explorely" className="header-logo" />
                        <span className="header-brand-name">Explorely</span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="header-nav desktop-nav">
                    {navLinks.map(l => (
                        <Link key={l.path} to={l.path}
                            className={`nav-link ${l.path === '/spin-go' ? 'nav-link-spin' : ''} ${location.pathname === l.path ? 'active' : ''}`}>
                            <span className="nav-icon"><Icon name={l.iconName} size={16} /></span>
                            <span className="nav-label">{l.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="header-center" ref={searchRef}>
                    <form onSubmit={handleSearchSubmit} className="search-form">
                        <span className="search-icon-header"><Icon name="search" size={16} /></span>
                        <input
                            type="text"
                            className="global-search"
                            placeholder="Search places, cities, hotels..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                        />
                    </form>
                    {showSuggestions && (
                        <div className="search-suggestions">
                            {suggestions.map((s, i) => (
                                <div key={i} className="suggestion-item" onClick={() => handleSuggestionClick(s)}>
                                    <span className="suggestion-icon"><Icon name={s.iconName} size={16} /></span>
                                    <div className="suggestion-text">
                                        <span className="suggestion-name">{s.name}</span>
                                        {s.sub && <span className="suggestion-sub">{s.sub}</span>}
                                    </div>
                                    <span className="suggestion-type">{s.type}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="header-right">
                    <button className={`header-icon-btn wishlist-btn ${wishlist.length > 0 ? 'has-items' : ''}`}
                        onClick={() => setShowWishlist(v => !v)} title="Wishlist">
                        <Icon name="heart" size={18} className={wishlist.length > 0 ? 'heart-filled' : ''} />
                        {wishlist.length > 0 && <span className="wishlist-badge">{wishlist.length}</span>}
                    </button>
                    <button className="header-icon-btn theme-btn" onClick={toggleDarkMode} title="Toggle Theme">
                        <Icon name={darkMode ? 'sun' : 'moon'} size={18} />
                    </button>
                    <button 
                        className={`header-icon-btn mobile-nav-btn ${mobileNav ? 'active' : ''}`} 
                        onClick={() => setMobileNav(v => !v)}
                        aria-label="Toggle navigation menu"
                    >
                        <Icon name={mobileNav ? 'x' : 'menu'} size={20} />
                    </button>
                </div>
            </header>

            {/* Mobile Navigation Backdrop Overlay */}
            <div 
                className={`mobile-nav-backdrop ${mobileNav ? 'open' : ''}`}
                onClick={() => setMobileNav(false)}
                aria-hidden={!mobileNav}
            />

            {/* Premium Mobile Navigation Drawer Sheet (Image 2 Redesign) */}
            <aside 
                className={`mobile-nav-drawer ${mobileNav ? 'open' : ''}`}
                aria-label="Mobile Navigation"
                aria-hidden={!mobileNav}
            >
                <div className="mobile-nav-scroll-container">
                    {/* Header Hero Banner with Amber Fort */}
                    <div className="mobile-nav-header-banner">
                        <img 
                            src="/nav/amber-fort.jpg" 
                            alt="Amer Fort Jaipur" 
                            className="mobile-nav-banner-img" 
                        />
                        <div className="mobile-nav-banner-overlay" />
                        
                        <div className="mobile-nav-banner-top">
                            <div className="mobile-nav-brand">
                                <img src="/explorely-logo.png" alt="Explorely" className="mobile-nav-brand-logo" />
                                <div className="mobile-nav-brand-text">
                                    <span className="mobile-nav-brand-name">Explorely</span>
                                    <span className="mobile-nav-brand-tagline">DISCOVER • EXPLORE • BELONG</span>
                                </div>
                            </div>
                            <button 
                                className="mobile-nav-close-btn" 
                                onClick={() => setMobileNav(false)}
                                aria-label="Close navigation"
                            >
                                <Icon name="x" size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Drawer Inset Search Bar */}
                    <div className="mobile-nav-search-section">
                        <form onSubmit={handleDrawerSearchSubmit} className="mobile-nav-search-form">
                            <span className="mobile-nav-search-icon"><Icon name="search" size={16} /></span>
                            <input
                                type="text"
                                className="mobile-nav-search-input"
                                placeholder="Search places, cities, hotels..."
                                value={drawerSearchQuery}
                                onChange={(e) => handleDrawerSearch(e.target.value)}
                            />
                        </form>
                        {drawerSuggestions.length > 0 && (
                            <div className="mobile-nav-suggestions">
                                {drawerSuggestions.map((s, i) => (
                                    <div key={i} className="mobile-suggestion-item" onClick={() => handleDrawerSuggestionClick(s)}>
                                        <span className="mobile-suggestion-icon"><Icon name={s.iconName} size={15} /></span>
                                        <div className="mobile-suggestion-info">
                                            <span className="mobile-suggestion-name">{s.name}</span>
                                            {s.sub && <span className="mobile-suggestion-sub">{s.sub}</span>}
                                        </div>
                                        <span className="mobile-suggestion-type">{s.type}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Rich Navigation Links List */}
                    <nav className="mobile-nav-links-list">
                        {mobileNavItems.map(item => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`mobile-nav-row ${isActive ? 'active' : ''}`}
                                    onClick={() => setMobileNav(false)}
                                >
                                    <div className={`mobile-nav-row-badge ${item.badgeClass}`}>
                                        <Icon name={item.iconName} size={20} />
                                    </div>
                                    <div className="mobile-nav-row-content">
                                        <span className="mobile-nav-row-title">{item.label}</span>
                                        <span className="mobile-nav-row-sub">{item.sub}</span>
                                    </div>
                                    <span className="mobile-nav-row-arrow">
                                        <Icon name="chevron-right" size={18} />
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Popular Destinations Preview Section */}
                    <div className="mobile-nav-section-destinations">
                        <div className="mobile-nav-section-head">
                            <span className="mobile-nav-section-title">POPULAR DESTINATIONS</span>
                            <Link to="/explore" className="mobile-nav-see-all" onClick={() => setMobileNav(false)}>
                                See All →
                            </Link>
                        </div>
                        <div className="mobile-nav-destinations-grid">
                            {popularDestinations.map((dest) => (
                                <Link
                                    key={dest.name}
                                    to={dest.path}
                                    className="mobile-nav-dest-card"
                                    onClick={() => setMobileNav(false)}
                                >
                                    <img src={dest.image} alt={dest.name} className="mobile-nav-dest-img" loading="lazy" />
                                    <div className="mobile-nav-dest-overlay" />
                                    <span className="mobile-nav-dest-name">{dest.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Promo Banner */}
                    <div className="mobile-nav-promo-section">
                        <Link to="/explore" className="mobile-nav-promo-card" onClick={() => setMobileNav(false)}>
                            <img 
                                src="/nav/promo-banner.jpg" 
                                alt="Explore Incredible India" 
                                className="mobile-nav-promo-img" 
                                loading="lazy" 
                            />
                        </Link>
                    </div>
                </div>
            </aside>
        </>
    );
}