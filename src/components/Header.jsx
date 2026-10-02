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
        if (!q || q.length < 2) return [];
        const ql = q.toLowerCase();
        const results = [];

        // 1. States (max 3)
        for (let i = 0; i < states.length; i++) {
            if (states[i].name.toLowerCase().includes(ql)) {
                results.push({ type: 'State', name: states[i].name, iconName: 'map' });
                if (results.length >= 3) break;
            }
        }

        // 2. Cities (max 3)
        let cityCount = 0;
        for (let i = 0; i < cities.length; i++) {
            if (cities[i].name.toLowerCase().includes(ql)) {
                results.push({ type: 'City', name: cities[i].name, sub: cities[i].state, iconName: 'building' });
                cityCount++;
                if (cityCount >= 3) break;
            }
        }

        // 3. Spots (max 4 with early exit)
        let spotCount = 0;
        for (let i = 0; i < allSpots.length; i++) {
            if (allSpots[i].name.toLowerCase().includes(ql)) {
                results.push({ type: 'Place', name: allSpots[i].name, sub: allSpots[i].city, iconName: 'map-pin' });
                spotCount++;
                if (spotCount >= 4) break;
            }
        }

        // 4. Hotels & Stays (max 3)
        let hotelCount = 0;
        for (let i = 0; i < allHotels.length; i++) {
            if (allHotels[i].name.toLowerCase().includes(ql)) {
                results.push({
                    type: allHotels[i].type,
                    name: allHotels[i].name,
                    sub: allHotels[i].city,
                    iconName: allHotels[i].type === 'Restaurant' ? 'utensils' : 'hotel'
                });
                hotelCount++;
                if (hotelCount >= 3) break;
            }
        }

        // 5. Foods (max 2)
        let foodCount = 0;
        for (const [stateName, foods] of Object.entries(allFoods)) {
            if (Array.isArray(foods)) {
                for (let i = 0; i < foods.length; i++) {
                    if (foods[i].name.toLowerCase().includes(ql)) {
                        results.push({ type: 'Food', name: foods[i].name, sub: stateName, iconName: 'utensils' });
                        foodCount++;
                        if (foodCount >= 2) break;
                    }
                }
            }
            if (foodCount >= 2) break;
        }

        return results.slice(0, 8);
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

    // Navigation items for desktop & mobile
    const navLinks = [
        { path: '/', label: 'Home', iconName: 'home' },
        { path: '/explore', label: 'Explore', iconName: 'compass' },
        { path: '/categories', label: 'Categories', iconName: 'layout-grid' },
        { path: '/hotels', label: 'Hotels', iconName: 'building' },
        { path: '/near-me', label: 'Near Me', iconName: 'map-pin' },
        { path: '/spin-go', label: 'Spin & Go', iconName: 'refresh-cw' },
        { path: '/split', label: 'Split Expenses', iconName: 'split' },
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
                    <button
                        className={`header-icon-btn wishlist-btn ${wishlist.length > 0 ? 'has-items' : ''}`}
                        onClick={() => setShowWishlist(v => !v)}
                        title="Wishlist"
                        aria-label="Wishlist"
                    >
                        <Icon name="heart" size={18} className={wishlist.length > 0 ? 'heart-filled' : ''} />
                        {wishlist.length > 0 && <span className="wishlist-badge">{wishlist.length}</span>}
                    </button>
                    <button
                        className="header-icon-btn theme-btn"
                        onClick={toggleDarkMode}
                        title="Toggle Theme"
                        aria-label="Toggle Theme"
                    >
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

            {/* Clean & Premium Mobile Navigation Drawer (No unnecessary images) */}
            <aside
                className={`mobile-nav-drawer ${mobileNav ? 'open' : ''}`}
                aria-label="Mobile Navigation"
                aria-hidden={!mobileNav}
            >
                <div className="mobile-nav-scroll-container">
                    {/* Clean Minimalist Drawer Header */}
                    <div className="mobile-drawer-header">
                        <Link to="/" className="mobile-drawer-brand" onClick={() => setMobileNav(false)}>
                            <img src="/explorely-logo.png" alt="Explorely" className="mobile-drawer-logo" />
                            <div className="mobile-drawer-brand-text">
                                <span className="mobile-drawer-brand-name">Explorely</span>
                                <span className="mobile-drawer-brand-sub">India Travel Guide</span>
                            </div>
                        </Link>
                        <button
                            className="mobile-drawer-close-btn"
                            onClick={() => setMobileNav(false)}
                            aria-label="Close navigation"
                        >
                            <Icon name="x" size={18} />
                        </button>
                    </div>

                    {/* Clean Drawer Search Bar */}
                    <div className="mobile-nav-search-section">
                        <form onSubmit={handleDrawerSearchSubmit} className="mobile-nav-search-form">
                            <span className="mobile-nav-search-icon"><Icon name="search" size={16} /></span>
                            <input
                                type="text"
                                className="mobile-nav-search-input"
                                placeholder="Search destinations, cities, spots..."
                                value={drawerSearchQuery}
                                onChange={(e) => handleDrawerSearch(e.target.value)}
                            />
                            {drawerSearchQuery && (
                                <button
                                    type="button"
                                    className="mobile-nav-search-clear"
                                    onClick={() => { setDrawerSearchQuery(''); setDrawerSuggestions([]); }}
                                >
                                    <Icon name="x" size={14} />
                                </button>
                            )}
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

                    {/* Clean Navigation Links List */}
                    <nav className="mobile-nav-links-list">
                        <div className="mobile-nav-group-label">Menu</div>
                        {navLinks.map(item => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`mobile-nav-row ${isActive ? 'active' : ''}`}
                                    onClick={() => setMobileNav(false)}
                                >
                                    <span className="mobile-nav-row-icon">
                                        <Icon name={item.iconName} size={18} />
                                    </span>
                                    <span className="mobile-nav-row-title">{item.label}</span>
                                    <span className="mobile-nav-row-arrow">
                                        <Icon name="chevron-right" size={16} />
                                    </span>
                                </Link>
                            );
                        })}

                        {/* Quick Saved Spots Link */}
                        <button
                            className="mobile-nav-row mobile-nav-wishlist-row"
                            onClick={() => {
                                setMobileNav(false);
                                setShowWishlist(true);
                            }}
                        >
                            <span className="mobile-nav-row-icon wishlist-icon">
                                <Icon name="heart" size={18} />
                            </span>
                            <span className="mobile-nav-row-title">Saved Wishlist</span>
                            {wishlist.length > 0 ? (
                                <span className="mobile-nav-badge">{wishlist.length}</span>
                            ) : (
                                <span className="mobile-nav-row-arrow">
                                    <Icon name="chevron-right" size={16} />
                                </span>
                            )}
                        </button>
                    </nav>

                    {/* Clean Drawer Footer Controls */}
                    <div className="mobile-drawer-footer">
                        <button
                            className="mobile-drawer-theme-toggle"
                            onClick={toggleDarkMode}
                        >
                            <span className="theme-toggle-icon">
                                <Icon name={darkMode ? 'sun' : 'moon'} size={16} />
                            </span>
                            <span className="theme-toggle-text">
                                {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            </span>
                        </button>
                        <div className="mobile-drawer-meta">
                            <span>Explorely • 21,000+ Spots across India</span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}