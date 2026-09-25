import React, { useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import SpotCard from '../components/SpotCard';
import HotelCard from '../components/HotelCard';
import FoodCard from '../components/FoodCard';
import Icon from '../components/Icon';
import India3DBackground from '../components/India3DBackground';

export default function Home() {
    const { allSpots, allHotels, states, categories, dataLoaded } = useApp();
    const navigate = useNavigate();

    // Only 3 Popular Destinations: Ram Mandir UP, Golden Temple, and Kashi Vishwanath Temple Varanasi
    const popularSpots = useMemo(() => {
        const findSpot = (predicate, fallback) => {
            const match = allSpots.find(predicate);
            if (!match) return fallback;
            return {
                ...match,
                ...fallback,
                image: fallback.image || match.image,
                rating: fallback.rating || match.rating,
                tier: 'most famous'
            };
        };

        const ramMandir = findSpot(
            s => (s.name && (s.name.includes('Ram Janmabhoomi') || s.name.includes('Ram Mandir'))) && (s.city === 'Ayodhya' || s.state === 'Uttar Pradesh'),
            {
                name: "Ram Mandir",
                city: "Ayodhya",
                state: "Uttar Pradesh",
                category: "Temple / Religious",
                rating: 5,
                tier: "most famous",
                description: "The grand Ram Mandir built at the sacred birthplace of Lord Rama in Ayodhya. A stunning masterpiece of Nagara-style architecture, featuring hand-carved pink sandstone and five ornate mandapas.",
                image: "https://res.cloudinary.com/eayitgbp/image/upload/v1783664645/images_sp2oxl.jpg",
                mapLink: "https://www.google.com/maps?q=Shri+Ram+Janmabhoomi+Mandir+Ayodhya",
                tags: ["Must Visit", "Top Attraction", "Pilgrimage", "Iconic"]
            }
        );

        const goldenTemple = findSpot(
            s => s.name && s.name.includes('Golden Temple') && s.city === 'Amritsar',
            {
                name: "Golden Temple",
                city: "Amritsar",
                state: "Punjab",
                category: "Temple / Religious",
                rating: 5,
                tier: "most famous",
                description: "The holiest Sikh pilgrimage shrine, globally renowned for its gold-gilded sanctum, shimmering sacred Amrit Sarovar water pool, and 24/7 peaceful community langar.",
                image: "https://res.cloudinary.com/eayitgbp/image/upload/v1790234491/1280px-The_Golden_Temple_of_Amrithsar_7.jpg_m5pv76.jpg",
                mapLink: "https://www.google.com/maps?q=Golden+Temple+Amritsar",
                tags: ["Must Visit", "Top Attraction", "Pilgrimage", "Historic"]
            }
        );

        const vishwanathTemple = findSpot(
            s => s.name && s.name.includes('Kashi Vishwanath') && s.city === 'Varanasi',
            {
                name: "Kashi Vishwanath Temple",
                city: "Varanasi",
                state: "Uttar Pradesh",
                category: "Temple / Religious",
                rating: 5,
                tier: "most famous",
                description: "One of the twelve sacred Jyotirlingas dedicated to Lord Shiva, situated in the ancient holy city of Varanasi on the western bank of the Ganges with an iconic gold-plated spire and sacred temple corridor.",
                image: "https://res.cloudinary.com/eayitgbp/image/upload/v1783621714/temple_To4YlfIJ_202308271009080_ed8btc.jpg",
                mapLink: "https://www.google.com/maps?q=Kashi+Vishwanath+Temple+Varanasi",
                tags: ["Must Visit", "Top Attraction", "Pilgrimage", "Iconic"]
            }
        );

        return [ramMandir, goldenTemple, vishwanathTemple];
    }, [allSpots]);

    // Top 3 luxury palace hotels requested: The Taj Mahal Palace, Taj Falaknuma Palace, The Oberoi Udaivilas
    const topHotels = useMemo(() => {
        const findHotel = (predicate, fallback) => {
            const match = allHotels.find(predicate);
            if (!match) return fallback;
            return {
                ...match,
                ...fallback,
                image: fallback.image || match.image
            };
        };

        const tajMahal = findHotel(
            h => h.name.toLowerCase().includes('taj mahal palace'),
            {
                name: "The Taj Mahal Palace",
                city: "Mumbai",
                state: "Maharashtra",
                type: "Hotel",
                priceRange: "₹25,000 - ₹80,000",
                priceMin: 25000,
                rating: 4.9,
                amenities: ["Pool", "Spa", "WiFi", "Restaurant", "Bar", "Gym", "Concierge"],
                image: "https://upload.wikimedia.org/wikipedia/commons/0/09/Mumbai_Aug_2018_%2843397784544%29.jpg",
                mapLink: "https://www.google.com/maps?q=The+Taj+Mahal+Palace+Mumbai",
                lat: 18.9217,
                lng: 72.8332
            }
        );

        const falaknuma = findHotel(
            h => h.name.toLowerCase().includes('falaknuma'),
            {
                name: "Taj Falaknuma Palace",
                city: "Hyderabad",
                state: "Telangana",
                type: "Resort",
                priceRange: "₹35,000 - ₹1,20,000",
                priceMin: 35000,
                rating: 4.9,
                amenities: ["Pool", "Spa", "Heritage", "Fine Dining", "Bar", "Concierge", "Palace Tour"],
                image: "https://res.cloudinary.com/eayitgbp/image/upload/v1790243833/1920px-Falaknuma_Palace_01.jpg_alunh0.jpg",
                mapLink: "https://www.google.com/maps?q=Taj+Falaknuma+Palace+Hyderabad",
                lat: 17.3314,
                lng: 78.4674
            }
        );

        const oberoi = findHotel(
            h => h.name.toLowerCase().includes('oberoi udaivilas'),
            {
                name: "The Oberoi Udaivilas",
                city: "Udaipur",
                state: "Rajasthan",
                type: "Resort",
                priceRange: "₹30,000 - ₹1,00,000",
                priceMin: 30000,
                rating: 4.9,
                amenities: ["Pool", "Spa", "Lake View", "WiFi", "Restaurant", "Bar", "Boat Ride"],
                image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
                mapLink: "https://www.google.com/maps?q=The+Oberoi+Udaivilas+Udaipur",
                lat: 24.5672,
                lng: 73.6812
            }
        );

        return [
            { ...tajMahal, name: "The Taj Mahal Palace" },
            { ...falaknuma, name: "Taj Falaknuma Palace" },
            { ...oberoi, name: "The Oberoi Udaivilas" }
        ];
    }, [allHotels]);

    // Curated states for the single-row horizontal swipe/scroll track:
    // First 6 match the desktop viewport: Goa, Himachal Pradesh, Karnataka, Kerala, Maharashtra, Rajasthan
    // Followed by Tamil Nadu, Uttarakhand, Gujarat, Uttar Pradesh, Punjab, West Bengal
    const featuredStates = useMemo(() => {
        const stateOrder = ['Goa', 'Himachal Pradesh', 'Karnataka', 'Kerala', 'Maharashtra', 'Rajasthan', 'Tamil Nadu', 'Uttarakhand', 'Gujarat', 'Uttar Pradesh', 'Punjab', 'West Bengal'];
        return stateOrder
            .map(name => states.find(s => s.name === name))
            .filter(Boolean);
    }, [states]);

    // Horizontal scroll & swipe controls for Explore by State
    const stateScrollRef = useRef(null);
    const isDownRef = useRef(false);
    const startXRef = useRef(0);
    const scrollLeftPosRef = useRef(0);
    const hasMovedRef = useRef(false);

    const scrollStates = (direction) => {
        if (stateScrollRef.current) {
            const amount = direction === 'left' ? -380 : 380;
            stateScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
        }
    };

    const handleStateMouseDown = (e) => {
        if (!stateScrollRef.current) return;
        isDownRef.current = true;
        hasMovedRef.current = false;
        startXRef.current = e.pageX - stateScrollRef.current.offsetLeft;
        scrollLeftPosRef.current = stateScrollRef.current.scrollLeft;
    };

    const handleStateMouseMove = (e) => {
        if (!isDownRef.current || !stateScrollRef.current) return;
        const x = e.pageX - stateScrollRef.current.offsetLeft;
        const walk = (x - startXRef.current) * 1.4;
        if (Math.abs(walk) > 4) {
            hasMovedRef.current = true;
            e.preventDefault();
        }
        stateScrollRef.current.scrollLeft = scrollLeftPosRef.current - walk;
    };

    const handleStateMouseUpOrLeave = () => {
        isDownRef.current = false;
    };

    const handleStateCardClick = (e) => {
        if (hasMovedRef.current) {
            e.preventDefault();
        }
    };

    // Regional food specialties requested: Biryani, Butter Chicken (Murgh Makhani), Mutton, Masala Dosa, Chole Bhature
    const featuredFoods = useMemo(() => [
        {
            name: "Biryani",
            state: "Telangana",
            rank: 1,
            description: "World-famous fragrant basmati rice slow-cooked (dum) with saffron-marinated tender meat, caramelized onions, and aromatic royal spices.",
            image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80"
        },
        {
            name: "Butter Chicken (Murgh Makhani)",
            state: "Punjab",
            rank: 2,
            description: "Tandoori chicken pieces cooked in a luxurious, creamy tomato gravy with butter, fresh cream, and aromatic fenugreek leaves.",
            image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=80"
        },
        {
            name: "Mutton (Rogan Josh)",
            state: "Delhi",
            rank: 3,
            description: "Tender slow-cooked mutton pieces simmered in an intensely aromatic Kashmiri red chilli, yogurt, and authentic whole-spice gravy.",
            image: "https://images.unsplash.com/photo-1545247181-516773cae754?w=500&auto=format&fit=crop&q=80"
        },
        {
            name: "Masala Dosa",
            state: "Tamil Nadu",
            description: "Thin, crispy golden rice-lentil crepes stuffed with spiced potato mash, served with piping hot sambar and fresh coconut chutneys.",
            image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=80"
        },
        {
            name: "Chole Bhature",
            state: "Delhi",
            description: "Spicy chickpea curry cooked with tangy spices and herbs, paired with giant, fluffy deep-fried bhature and pickled onions.",
            image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&auto=format&fit=crop&q=80"
        }
    ], []);

    if (!dataLoaded) {
        return (
            <div className="home-page">
                <India3DBackground />
            </div>
        );
    }

    return (
        <div className="home-page">
            <India3DBackground />
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-bg-pattern" />
                <div className="hero-content">
                    <h1 className="hero-title">
                        Discover <span className="hero-india-word gradient-text">India's</span> Hidden Gems
                    </h1>
                    <p className="hero-subtitle">
                        Explore 21000+ tourist destinations, hotels & attractions across 29 states
                    </p>
                    <div className="hero-search-wrapper">
                        <input type="text" className="hero-search" placeholder="Where do you want to go?"
                            onFocus={() => navigate('/explore')} readOnly />
                        <button className="hero-search-btn" onClick={() => navigate('/explore')}>Explore →</button>
                    </div>
                    <div className="hero-stats">
                        <div className="stat-item"><span className="stat-number">{allSpots.length}+</span><span className="stat-label">Places</span></div>
                        <div className="stat-item"><span className="stat-number">28 + 8</span><span className="stat-label">States</span></div>
                        <div className="stat-item"><span className="stat-number">{allHotels.length}+</span><span className="stat-label">Hotels</span></div>
                        <div className="stat-item"><span className="stat-number">{categories.length}</span><span className="stat-label">Categories</span></div>
                    </div>
                </div>
            </section>

            {/* Explore by State - Single horizontal swipe/scroll track */}
            <section className="home-section">
                <div className="section-header">
                    <h2 className="section-title"><Icon name="map" size={22} className="section-title-icon" /> Explore by State</h2>
                    <div className="section-header-actions">
                        <div className="scroll-nav-controls">
                            <button className="scroll-nav-btn" onClick={() => scrollStates('left')} aria-label="Scroll left">‹</button>
                            <button className="scroll-nav-btn" onClick={() => scrollStates('right')} aria-label="Scroll right">›</button>
                        </div>
                        <Link to="/explore" className="see-all-link">See All →</Link>
                    </div>
                </div>
                <div 
                    className="state-scroll" 
                    ref={stateScrollRef}
                    onMouseDown={handleStateMouseDown}
                    onMouseMove={handleStateMouseMove}
                    onMouseUp={handleStateMouseUpOrLeave}
                    onMouseLeave={handleStateMouseUpOrLeave}
                >
                    {featuredStates.map(s => (
                        <Link 
                            to={`/explore?state=${encodeURIComponent(s.name)}`} 
                            key={s.code} 
                            className="state-card"
                            onClick={handleStateCardClick}
                        >
                            <span className="state-card-code">{s.code}</span>
                            <span className="state-card-name">{s.name}</span>
                            <span className="state-card-count">{allSpots.filter(sp => sp.state === s.name).length} places</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Explore by Category */}
            <section className="home-section">
                <div className="section-header">
                    <h2 className="section-title"><Icon name="folder-open" size={22} className="section-title-icon" /> Explore by Category</h2>
                    <Link to="/categories" className="see-all-link">See All →</Link>
                </div>
                <div className="category-scroll">
                    {categories.map((cat, i) => (
                        <Link to={`/categories?cat=${encodeURIComponent(cat.name)}`} key={i} className="category-card">
                            <span className="category-icon"><Icon name={cat.icon} size={28} /></span>
                            <span className="category-name">{cat.name}</span>
                            <span className="category-count">{allSpots.filter(s => s.category === cat.name).length}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Popular Destinations - Only 3 requested */}
            <section className="home-section">
                <div className="section-header">
                    <h2 className="section-title"><Icon name="sparkles" size={22} className="section-title-icon" /> Popular Destinations</h2>
                    <Link to="/explore" className="see-all-link">See All →</Link>
                </div>
                <div className="spots-grid">
                    {popularSpots.map((spot, i) => (
                        <SpotCard key={i} spot={spot} style={{ animationDelay: `${i * 0.05}s` }} />
                    ))}
                </div>
            </section>

            {/* Regional Food Specialties - 5 requested dishes */}
            {featuredFoods.length > 0 && (
                <section className="home-section">
                    <div className="section-header">
                        <h2 className="section-title"><span style={{ marginRight: '8px', fontSize: '1.2rem' }}>🍽️</span> Regional Food Specialties</h2>
                        <Link to="/explore" className="see-all-link">Explore Cuisine →</Link>
                    </div>
                    <div className="home-foods-scroll">
                        {featuredFoods.map((food, i) => (
                            <Link to={`/explore?state=${encodeURIComponent(food.state)}`} key={i} className="home-food-link">
                                <FoodCard food={food} stateName={food.state} style={{ animationDelay: `${i * 0.05}s` }} />
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Top Hotels - 3 luxury palace hotels requested */}
            <section className="home-section">
                <div className="section-header">
                    <h2 className="section-title"><Icon name="hotel" size={22} className="section-title-icon" /> Top Hotels & Resorts</h2>
                    <Link to="/hotels" className="see-all-link">See All →</Link>
                </div>
                <div className="hotels-grid">
                    {topHotels.map((hotel, i) => (
                        <HotelCard key={i} hotel={hotel} />
                    ))}
                </div>
            </section>
        </div>
    );
}
