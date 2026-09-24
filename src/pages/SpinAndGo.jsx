import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import SpinWheel from '../components/SpinWheel';
import Icon from '../components/Icon';

const STORAGE_KEY = 'explorely-spin-options';

const DEFAULT_OPTIONS = [
    { id: 'opt-1', text: 'Shimla', category: 'Place' },
    { id: 'opt-2', text: 'Rishikesh', category: 'Place' },
    { id: 'opt-3', text: 'Goa', category: 'Place' },
    { id: 'opt-4', text: 'Leh Ladakh', category: 'Place' },
    { id: 'opt-5', text: 'Kerala', category: 'Place' },
    { id: 'opt-6', text: 'Netarhat', category: 'Place' },
];

const CATEGORY_TAGS = ['Place', 'Food', 'Activity', 'Hotel', 'Custom'];

export default function SpinAndGo() {
    const { allSpots, cities, states, dataLoaded } = useApp();
    const navigate = useNavigate();

    // Persistent options list
    const [options, setOptions] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {
            console.error('Error loading spin options:', e);
        }
        return DEFAULT_OPTIONS;
    });

    // Form inputs
    const [inputText, setInputText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Custom');

    // Spin state
    const [isSpinning, setIsSpinning] = useState(false);
    const [spinTrigger, setSpinTrigger] = useState(0);
    const [winner, setWinner] = useState(null);
    const [spinHistory, setSpinHistory] = useState([]);

    // Drag-and-drop state
    const [draggedIndex, setDraggedIndex] = useState(null);

    const inputRef = useRef(null);
    const resultRef = useRef(null);
    const wheelRef = useRef(null);

    // Save options to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
        } catch (e) {
            console.error('Error saving spin options:', e);
        }
    }, [options]);

    // Handle adding an option
    const handleAddOption = (e) => {
        if (e) e.preventDefault();
        const trimmed = inputText.trim();
        if (!trimmed) return;

        // Auto-detect category if user left as Custom
        let cat = selectedCategory;
        if (cat === 'Custom') {
            const lower = trimmed.toLowerCase();
            if (cities.some(c => c.name.toLowerCase() === lower) || states.some(s => s.name.toLowerCase() === lower)) {
                cat = 'Place';
            }
        }

        const newOption = {
            id: `opt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            text: trimmed,
            category: cat
        };

        setOptions(prev => [...prev, newOption]);
        setInputText('');
        if (inputRef.current) inputRef.current.focus();
    };

    // Remove single option
    const handleRemoveOption = (id) => {
        if (isSpinning) return;
        setOptions(prev => prev.filter(o => o.id !== id));
        if (winner && winner.id === id) {
            setWinner(null);
        }
    };

    // Clear all
    const handleClearAll = () => {
        if (isSpinning) return;
        setOptions([]);
        setWinner(null);
    };

    // Reset to defaults
    const handleResetDefaults = () => {
        if (isSpinning) return;
        setOptions(DEFAULT_OPTIONS);
        setWinner(null);
    };

    // Trigger spin reliably through wheel ref
    const handleTriggerSpin = () => {
        if (isSpinning || options.length < 2) return;
        setWinner(null);
        setSpinTrigger(prev => prev + 1);
        wheelRef.current?.spin();
    };

    // Spin ended callback
    const handleSpinEnd = (winningOption) => {
        setIsSpinning(false);
        setWinner(winningOption);
        setSpinHistory(prev => [winningOption.text, ...prev.slice(0, 4)]);

        // Smooth scroll to result area if on mobile/smaller screens
        if (resultRef.current && window.innerWidth < 900) {
            setTimeout(() => {
                resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    };

    // Drag and Drop reordering
    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, targetIndex) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === targetIndex) return;

        setOptions(prev => {
            const updated = [...prev];
            const [movedItem] = updated.splice(draggedIndex, 1);
            updated.splice(targetIndex, 0, movedItem);
            return updated;
        });
        setDraggedIndex(null);
    };

    // Match winning option to Explorely spots.json / cities / states
    const matchedSpot = useMemo(() => {
        if (!winner || !winner.text || !dataLoaded) return null;
        const q = winner.text.trim().toLowerCase();

        // 1. Exact match on spot name
        const exactSpot = allSpots.find(s => s.name.toLowerCase() === q);
        if (exactSpot) return exactSpot;

        // 2. Exact match on city -> find best rated spot in that city
        const isKnownCity = cities.some(c => c.name.toLowerCase() === q);
        if (isKnownCity) {
            const citySpots = allSpots.filter(s => s.city && s.city.toLowerCase() === q);
            if (citySpots.length > 0) {
                return citySpots.reduce((best, s) => ((s.rating || 0) > (best.rating || 0) ? s : best), citySpots[0]);
            }
        }

        // 3. Exact match on state -> find best rated spot in that state
        const isKnownState = states.some(s => s.name.toLowerCase() === q);
        if (isKnownState) {
            const stateSpots = allSpots.filter(s => s.state && s.state.toLowerCase() === q);
            if (stateSpots.length > 0) {
                return stateSpots.reduce((best, s) => ((s.rating || 0) > (best.rating || 0) ? s : best), stateSpots[0]);
            }
        }

        return null;
    }, [winner, allSpots, cities, states, dataLoaded]);

    const isTouristDestination = Boolean(matchedSpot);

    // Compute destination Explore URL to open state/city/spot directly in /explore (Image 3)
    const destinationExploreUrl = useMemo(() => {
        if (!winner || !winner.text) return null;
        const q = winner.text.trim().toLowerCase();

        // 1. Is it a state? (e.g. Kerala, Goa, Rajasthan) -> /explore?state=Kerala
        const matchedState = states.find(s => s.name.toLowerCase() === q);
        if (matchedState) {
            return `/explore?state=${encodeURIComponent(matchedState.name)}`;
        }

        // 2. Is it a city? (e.g. Shimla, Rishikesh, Manali) -> /explore?state=...&city=...
        const matchedCity = cities.find(c => c.name.toLowerCase() === q);
        if (matchedCity) {
            return `/explore?state=${encodeURIComponent(matchedCity.state)}&city=${encodeURIComponent(matchedCity.name)}`;
        }

        // 3. Is it a spot? -> /explore?state=...&city=...
        if (matchedSpot) {
            if (matchedSpot.state && matchedSpot.city) {
                return `/explore?state=${encodeURIComponent(matchedSpot.state)}&city=${encodeURIComponent(matchedSpot.city)}`;
            } else if (matchedSpot.state) {
                return `/explore?state=${encodeURIComponent(matchedSpot.state)}`;
            }
        }

        return null;
    }, [winner, states, cities, matchedSpot]);

    return (
        <div className="spin-go-page">
            {/* Background scenic decor */}
            <div className="spin-bg-graphic spin-bg-plane">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M2 12l20-9-9 20-2-8-9-3z" />
                </svg>
            </div>

            {/* Section Header */}
            <section className="spin-header">

                <h1 className="spin-title">
                    Spin & <span className="gradient-text">Go</span>
                </h1>
                <p className="spin-subtitle">
                    Can’t decide? Add your options and let the wheel choose for you.
                </p>
                <div className="spin-header-line" />
            </section>

            {/* Main Interactive Unified Layout */}
            <div className="spin-unified-layout">
                {/* =========================================
                    LEFT: OPTIONS PANEL
                   ========================================= */}
                <aside className="spin-options-card">
                    <div className="options-card-header">
                        <div className="options-title-row">
                            <span className="options-icon-pin">
                                <Icon name="map-pin" size={18} />
                            </span>
                            <div>
                                <h2 className="options-title">Your Options</h2>
                                <p className="options-subtitle">Add anything you’re deciding between.</p>
                            </div>
                        </div>
                    </div>

                    {/* Input Field + Add Button */}
                    <form onSubmit={handleAddOption} className="options-input-form">
                        <div className="input-group-custom">
                            <span className="input-icon">
                                <Icon name="map-pin" size={16} />
                            </span>
                            <input
                                ref={inputRef}
                                type="text"
                                className="options-text-input"
                                placeholder="Enter a place, food, activity, hotel..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                disabled={isSpinning}
                                maxLength={32}
                            />
                            <button
                                type="submit"
                                className="options-add-btn"
                                disabled={isSpinning || !inputText.trim()}
                            >
                                <Icon name="plus" size={16} />
                                <span>Add</span>
                            </button>
                        </div>

                        {/* Optional Quick Category Pills */}
                        <div className="options-category-picker">
                            <span className="category-picker-label">Type:</span>
                            {CATEGORY_TAGS.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </form>

                    {/* Options List */}
                    <div className="options-list-container">
                        {options.length === 0 ? (
                            <div className="options-empty-state">
                                <span className="empty-state-icon">
                                    <Icon name="dices" size={32} />
                                </span>
                                <p>No options yet.</p>
                                <span>Type any destination, food, or activity above to add it!</span>
                            </div>
                        ) : (
                            <div className="options-list-items">
                                {options.map((opt, idx) => (
                                    <div
                                        key={opt.id}
                                        className={`option-row ${draggedIndex === idx ? 'dragging' : ''}`}
                                        draggable={!isSpinning}
                                        onDragStart={(e) => handleDragStart(e, idx)}
                                        onDragOver={(e) => handleDragOver(e, idx)}
                                        onDrop={(e) => handleDrop(e, idx)}
                                    >
                                        <span className="drag-handle" title="Drag to reorder">
                                            <Icon name="grip-vertical" size={16} />
                                        </span>
                                        <span className="option-name">{opt.text}</span>
                                        {opt.category && opt.category !== 'Custom' && (
                                            <span className="option-tag-badge">{opt.category}</span>
                                        )}
                                        <button
                                            type="button"
                                            className="option-remove-btn"
                                            onClick={() => handleRemoveOption(opt.id)}
                                            disabled={isSpinning}
                                            title="Remove option"
                                        >
                                            <Icon name="x" size={15} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Options Card Footer */}
                    <div className="options-card-footer">
                        <button
                            type="button"
                            className="options-clear-btn"
                            onClick={handleClearAll}
                            disabled={isSpinning || options.length === 0}
                        >
                            <Icon name="trash-2" size={15} />
                            <span>Clear All</span>
                        </button>
                        <button
                            type="button"
                            className="options-reset-btn"
                            onClick={handleResetDefaults}
                            disabled={isSpinning}
                            title="Restore default travel spots"
                        >
                            <Icon name="rotate-ccw" size={15} />
                            <span>Defaults</span>
                        </button>
                    </div>
                </aside>

                {/* =========================================
                    CENTER: SPINNING WHEEL & RESULT SECTION
                   ========================================= */}
                <main className="spin-center-column">
                    <div className="spin-wheel-card">
                        {/* Wheel Component */}
                        <SpinWheel
                            ref={wheelRef}
                            options={options}
                            isSpinning={isSpinning}
                            onSpinStart={() => {
                                setIsSpinning(true);
                                setWinner(null);
                            }}
                            onSpinEnd={handleSpinEnd}
                            disabled={options.length < 2}
                            spinTrigger={spinTrigger}
                        />

                        {/* Status Message when not enough options */}
                        {options.length === 0 && (
                            <p className="wheel-status-hint">
                                Add a few options and let fate decide.
                            </p>
                        )}
                        {options.length === 1 && (
                            <p className="wheel-status-hint warning">
                                Add at least one more option to spin.
                            </p>
                        )}

                        {/* Spin Controls */}
                        <div className="spin-controls-row">
                            <button
                                type="button"
                                className={`spin-action-btn primary ${isSpinning ? 'spinning' : ''}`}
                                onClick={handleTriggerSpin}
                                disabled={isSpinning || options.length < 2}
                            >
                                <Icon name="refresh-cw" size={18} className={isSpinning ? 'spin-rotate-anim' : ''} />
                                <span>{isSpinning ? 'Spinning...' : 'Spin'}</span>
                            </button>

                            <button
                                type="button"
                                className="spin-action-btn secondary"
                                onClick={handleResetDefaults}
                                disabled={isSpinning}
                            >
                                <Icon name="rotate-ccw" size={16} />
                                <span>Restart</span>
                            </button>
                        </div>

                        {/* =========================================
                            RESULT DISPLAY BELOW SPIN & RESTART BUTTONS
                            (Per user instruction: "when spin rotate and
                            stop that section show with a best message below
                            down to spin and restart button because there has
                            more space")
                           ========================================= */}
                        <div ref={resultRef} className="spin-result-container">
                            {isSpinning && (
                                <div className="spin-in-progress-badge">
                                    <span className="dot-pulse" />
                                    <span>Destiny is rotating the wheel...</span>
                                </div>
                            )}

                            {winner && !isSpinning && (
                                <div className="spin-winner-card animate-result-appear">
                                    <div className="winner-celebration-head">
                                        <span className="winner-party-emoji">🎉</span>
                                        <span className="winner-head-label">
                                            {isTouristDestination ? 'Your destination is...' : 'Your choice is...'}
                                        </span>
                                    </div>

                                    <h3 className="winner-title">{winner.text}</h3>

                                    <p className="winner-subtitle">
                                        {isTouristDestination
                                            ? `Looks like ${winner.text} is calling! Pack your bags and get ready.`
                                            : `The wheel has spoken! Go ahead with ${winner.text}.`}
                                    </p>

                                    {/* If matches Explorely spot, show rich card */}
                                    {matchedSpot && (
                                        <div
                                            className="matched-spot-preview"
                                            onClick={() => destinationExploreUrl && navigate(destinationExploreUrl)}
                                            style={destinationExploreUrl ? { cursor: 'pointer' } : {}}
                                            title={destinationExploreUrl ? `Explore ${winner.text}` : ''}
                                        >
                                            <div className="matched-spot-img-wrap">
                                                <img
                                                    src={matchedSpot.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600'}
                                                    alt={matchedSpot.name}
                                                    className="matched-spot-img"
                                                    onError={(e) => {
                                                        e.target.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600';
                                                    }}
                                                />
                                                {matchedSpot.category && (
                                                    <span className="matched-spot-badge">{matchedSpot.category}</span>
                                                )}
                                                {matchedSpot.rating && (
                                                    <span className="matched-spot-rating">
                                                        <Icon name="star" size={13} color="#f39c12" /> {matchedSpot.rating}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="matched-spot-info">
                                                <h4 className="matched-spot-name">{matchedSpot.name}</h4>
                                                <p className="matched-spot-location">
                                                    <Icon name="map-pin" size={13} /> {matchedSpot.city}
                                                    {matchedSpot.state ? `, ${matchedSpot.state}` : ''}
                                                </p>
                                                {matchedSpot.description && (
                                                    <p className="matched-spot-desc">{matchedSpot.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="winner-actions-row">
                                        {matchedSpot && (
                                            <button
                                                type="button"
                                                className="winner-explore-btn"
                                                onClick={() => {
                                                    if (destinationExploreUrl) {
                                                        navigate(destinationExploreUrl);
                                                    }
                                                }}
                                            >
                                                <span>Explore {winner.text}</span>
                                                <Icon name="arrow-right" size={16} />
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            className="winner-spin-again-btn"
                                            onClick={handleTriggerSpin}
                                        >
                                            <Icon name="refresh-cw" size={15} />
                                            <span>Spin Again</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {!winner && !isSpinning && options.length >= 2 && (
                                <div className="spin-ready-hint">
                                    <span className="ready-hint-icon">
                                        <Icon name="target" size={17} strokeWidth={2.2} />
                                    </span>
                                    <p>Ready to spin? Press <strong>SPIN</strong> or click the wheel center to decide!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* =========================================
                    RIGHT: TRAVEL VIBES & HELPFUL CARD
                   ========================================= */}
                <aside className="spin-helpful-card">
                    {/* Quote Card */}
                    <div className="travel-quote-box">
                        <span className="quote-mark">“</span>
                        <p className="quote-intro">Sometimes</p>
                        <p className="quote-main">the best journeys are the unplanned ones.</p>
                        <div className="quote-bar" />
                    </div>

                    {/* Travel Signpost Illustration Card */}
                    <div className="travel-signpost-widget">
                        <div className="signpost-wood-pole" />
                        <div className="signpost-board board-top">
                            <span>SAME PLACES</span>
                        </div>
                        <div className="signpost-board board-mid">
                            <span>NEW STORIES</span>
                        </div>
                        <div className="signpost-board board-bot">
                            <span>SPIN & EXPLORE</span>
                        </div>
                    </div>

                    {/* Recent Spin History */}
                    {spinHistory.length > 0 && (
                        <div className="spin-history-box">
                            <h4 className="history-title">
                                <Icon name="award" size={15} />
                                <span>Recent Picks</span>
                            </h4>
                            <div className="history-tags">
                                {spinHistory.map((item, i) => (
                                    <span key={i} className="history-tag">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Decision Tips */}
                    <div className="spin-tips-box">
                        <h4 className="tips-title">💡 Quick Tips</h4>
                        <ul className="tips-list">
                            <li>Add between 4 to 8 choices for the best spinning experience.</li>
                            <li>Mix cities, hotels, activities, or dishes into your wheel.</li>
                            <li>Play best-of-3 with your travel group if you want extra suspense!</li>
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
}
