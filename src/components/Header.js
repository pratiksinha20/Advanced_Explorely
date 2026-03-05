import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Header() {
    const { darkMode, toggleDarkMode, wishlist, setShowWishlist, allSpots, allHotels, states, cities } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [mobileNav, setMobileNav] = useState(false);
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

    useEffect(() => { setMobileNav(false); }, [location]);

    const handleSearch = (q) => {
        setSearchQuery(q);
        if (q.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
        const ql = q.toLowerCase();
        const results = [];
        states.filter(s => s.name.toLowerCase().includes(ql)).slice(0, 3)
            .forEach(s => results.push({ type: 'State', name: s.name, icon: '🗺️' }));
        cities.filter(c => c.name.toLowerCase().includes(ql)).slice(0, 3)
            .forEach(c => results.push({ type: 'City', name: c.name, sub: c.state, icon: '🏙️' }));
        allSpots.filter(s => s.name.toLowerCase().includes(ql)).slice(0, 4)
            .forEach(s => results.push({ type: 'Place', name: s.name, sub: s.city, icon: '📍' }));
        allHotels.filter(h => h.name.toLowerCase().includes(ql)).slice(0, 3)
            .forEach(h => results.push({ type: 'Hotel', name: h.name, sub: h.city, icon: '🏨' }));
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
    };

    const handleSuggestionClick = (s) => {
        setShowSuggestions(false);
        setSearchQuery('');
        if (s.type === 'State') navigate(`/explore?state=${encodeURIComponent(s.name)}`);
        else if (s.type === 'City') navigate(`/explore?state=${encodeURIComponent(s.sub)}&city=${encodeURIComponent(s.name)}`);
        else if (s.type === 'Place') navigate(`/search?q=${encodeURIComponent(s.name)}`);
        else if (s.type === 'Hotel') navigate(`/hotels?q=${encodeURIComponent(s.name)}`);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setShowSuggestions(false);
        }
    };

    const navLinks = [
        { path: '/', label: 'Home', icon: '🏠' },
        { path: '/explore', label: 'Explore', icon: '🧭' },
        { path: '/categories', label: 'Categories', icon: '📂' },
        { path: '/hotels', label: 'Hotels', icon: '🏨' },
        { path: '/near-me', label: 'Near Me', icon: '📍' },
    ];

    return (
        <header className="header-bar">
            <div className="header-left">
                <Link to="/" className="header-brand-link">
                    <img src="/explorely-logo.png" alt="Explorely" className="header-logo" />
                    <span className="header-brand-name">Explorely</span>
                </Link>
            </div>

            <nav className={`header-nav ${mobileNav ? 'open' : ''}`}>
                {navLinks.map(l => (
                    <Link key={l.path} to={l.path}
                        className={`nav-link ${location.pathname === l.path ? 'active' : ''}`}
                        onClick={() => setMobileNav(false)}>
                        <span className="nav-icon">{l.icon}</span>
                        <span className="nav-label">{l.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="header-center" ref={searchRef}>
                <form onSubmit={handleSearchSubmit} className="search-form">
                    <span className="search-icon-header">🔍</span>
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
                                <span className="suggestion-icon">{s.icon}</span>
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
                    ❤️
                    {wishlist.length > 0 && <span className="wishlist-badge">{wishlist.length}</span>}
                </button>
                <button className="header-icon-btn theme-btn" onClick={toggleDarkMode} title="Toggle Theme">
                    {darkMode ? '☀️' : '🌙'}
                </button>
                <button className="header-icon-btn mobile-nav-btn" onClick={() => setMobileNav(v => !v)}>
                    {mobileNav ? '✕' : '☰'}
                </button>
            </div>
        </header>
    );
}
