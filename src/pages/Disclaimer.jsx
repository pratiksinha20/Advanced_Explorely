import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import siteConfig from '../config/siteConfig';
import { AlertTriangle, ChevronDown, ChevronUp, Info, Mail } from 'lucide-react';
import './Legal.css';

const sections = [
    { id: 'general-information', num: '01', title: 'General Information & Nature of Platform' },
    { id: 'accuracy-of-information', num: '02', title: 'Accuracy of Tourist Information' },
    { id: 'travel-decisions', num: '03', title: 'Travel Decisions & Personal Safety' },
    { id: 'prices-and-availability', num: '04', title: 'Prices, Entry Fees, and Tickets' },
    { id: 'opening-hours-seasons', num: '05', title: 'Opening Hours & Seasonal Closures' },
    { id: 'weather-local-conditions', num: '06', title: 'Weather, Terrain, and Local Conditions' },
    { id: 'maps-and-directions', num: '07', title: 'Maps, Routes, and Navigation Directions' },
    { id: 'hotels-third-parties', num: '08', title: 'Hotels, Stays, and Hospitality Services' },
    { id: 'external-websites', num: '09', title: 'External Websites & Third-Party Outbound Links' },
    { id: 'user-submitted-information', num: '10', title: 'User-Submitted Places & Community Data' },
    { id: 'photography-and-images', num: '11', title: 'Photography, Media, and Visual Assets' },
    { id: 'no-guarantee-endorsement', num: '12', title: 'No Guarantee of Availability or Endorsement' },
    { id: 'contact-reporting', num: '13', title: 'Contact & Reporting Inaccuracies' },
];

export default function Disclaimer() {
    const [mobileTocOpen, setMobileTocOpen] = useState(false);

    useEffect(() => {
        document.title = siteConfig.seo.disclaimer.title;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', siteConfig.seo.disclaimer.description);
        }
        window.scrollTo(0, 0);
    }, []);

    const scrollToSection = (e, id) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setMobileTocOpen(false);
        }
    };

    return (
        <div className="legal-page">
            {/* Header */}
            <div className="legal-header-wrapper">
                <div className="legal-header-badge">
                    <AlertTriangle size={14} />
                    <span>Traveler Advisory</span>
                </div>
                <h1 className="legal-header-title">Travel & Information Disclaimer</h1>
                <p className="legal-header-intro">
                    Explorely provides curated information intended to help users discover, appreciate, and explore destinations across India. Please review this disclaimer to understand how destination details, timings, and routes are maintained.
                </p>
                <div className="legal-meta-row">
                    <span className="legal-meta-item">
                        <strong>Last Updated:</strong> {siteConfig.legalLastUpdated}
                    </span>
                    <span className="legal-meta-item">
                        <strong>Platform:</strong>{' '}
                        <a href={siteConfig.domain} target="_blank" rel="noopener noreferrer" className="legal-meta-link">
                            {siteConfig.domain}
                        </a>
                    </span>
                    <span className="legal-meta-item">
                        <strong>Contact:</strong>{' '}
                        <a href={`mailto:${siteConfig.contactEmail}`} className="legal-meta-link">
                            {siteConfig.contactEmail}
                        </a>
                    </span>
                </div>
            </div>

            {/* Layout */}
            <div className="legal-layout">
                {/* Desktop Sidebar */}
                <aside className="legal-sidebar" aria-label="Table of Contents">
                    <div className="legal-toc-title">
                        <span>On this page</span>
                    </div>
                    <ul className="legal-toc-list">
                        {sections.map((sec) => (
                            <li key={sec.id}>
                                <a
                                    href={`/disclaimer#${sec.id}`}
                                    onClick={(e) => scrollToSection(e, sec.id)}
                                    className="legal-toc-link"
                                >
                                    <span className="legal-toc-num">{sec.num}</span>
                                    <span>{sec.title}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* Content */}
                <article className="legal-content">
                    {/* Mobile TOC */}
                    <div className="legal-mobile-toc">
                        <button
                            type="button"
                            className="legal-mobile-toc-header"
                            onClick={() => setMobileTocOpen(!mobileTocOpen)}
                            aria-expanded={mobileTocOpen}
                        >
                            <span>Disclaimer Sections ({sections.length})</span>
                            {mobileTocOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                        {mobileTocOpen && (
                            <ul className="legal-toc-list" style={{ marginTop: '14px' }}>
                                {sections.map((sec) => (
                                    <li key={sec.id}>
                                        <a
                                            href={`/disclaimer#${sec.id}`}
                                            onClick={(e) => scrollToSection(e, sec.id)}
                                            className="legal-toc-link"
                                        >
                                            <span className="legal-toc-num">{sec.num}</span>
                                            <span>{sec.title}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Section 1 */}
                    <section id="general-information" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">01</span>
                            <h2 className="legal-section-title">General Information & Nature of Platform</h2>
                        </div>
                        <p>
                            All content published on Explorely (accessible at <strong>{siteConfig.domain}</strong>)—including tourist spots, cultural summaries, photographs, state travel overviews, and expense tools—is provided for general informational, educational, and travel inspiration purposes only.
                        </p>
                        <p>
                            Explorely does not operate as a licensed travel broker, booking agent, government tourist desk, or tour escort.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section id="accuracy-of-information" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">02</span>
                            <h2 className="legal-section-title">Accuracy of Tourist Information</h2>
                        </div>
                        <p>
                            While our team and contributors strive to maintain high-quality, up-to-date travel information, details such as opening hours, ticket prices, seasonal closures, photography rules, and road conditions are subject to continuous change without notice.
                        </p>
                        <div className="legal-callout">
                            <Info size={20} className="legal-callout-icon" />
                            <p className="legal-callout-text">
                                <strong>Always Verify Locally:</strong> We strongly encourage all travelers to independently verify vital details—especially entry permit requirements, temple dress codes, ferry schedules, and ticket availability—with official state tourism boards, archaeological departments (ASI), or local forest authorities prior to embarking on a journey.
                            </p>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section id="travel-decisions" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">03</span>
                            <h2 className="legal-section-title">Travel Decisions & Personal Safety</h2>
                        </div>
                        <p>
                            Travel inevitably entails personal discretion and physical risk, especially when visiting high-altitude Himalayan passes, deep forest trails, waterfalls, coastal marine spots, or desert circuits.
                        </p>
                        <p>
                            Travelers are solely responsible for assessing their personal fitness, health conditions, altitude acclimatization, local wildlife safety advisories, and vehicle suitability. Explorely assumes no responsibility or liability for any personal injury, illness, accident, damage, loss, or expense incurred during travel.
                        </p>
                    </section>

                    {/* Section 4 */}
                    <section id="prices-and-availability" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">04</span>
                            <h2 className="legal-section-title">Prices, Entry Fees, and Tickets</h2>
                        </div>
                        <p>
                            Any entry ticket prices, museum entry charges, camera fees, or transport estimates mentioned on Explorely represent historical or reported averages. Monument authorities and private heritage trusts may adjust ticketing structures, differentiate between domestic and foreign tourist rates, or introduce mandatory online advance reservations. Explorely does not sell tickets and is not liable for price discrepancies.
                        </p>
                    </section>

                    {/* Section 5 */}
                    <section id="opening-hours-seasons" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">05</span>
                            <h2 className="legal-section-title">Opening Hours & Seasonal Closures</h2>
                        </div>
                        <p>
                            Attractions may have weekly closures, seasonal restrictions, festival-specific hours, temporary closures, or other access limitations. Explorely cannot guarantee that an attraction will be open at the time of your visit.
                        </p>
                    </section>

                    {/* Section 6 */}
                    <section id="weather-local-conditions" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">06</span>
                            <h2 className="legal-section-title">Weather, Terrain, and Local Conditions</h2>
                        </div>
                        <p>
                            Weather across India varies dramatically across subcontinental regions—from monsoon downpours and mountain landslides to intense summer heat waves. Always check real-time meteorological forecasts from the India Meteorological Department (IMD) and heed local safety advisories before traveling to remote or high-risk zones.
                        </p>
                    </section>

                    {/* Section 7 */}
                    <section id="maps-and-directions" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">07</span>
                            <h2 className="legal-section-title">Maps, Routes, and Navigation Directions</h2>
                        </div>
                        <p>
                            Geographical coordinates, distance calculations in "Near Me", and external Google Maps links are provided solely as approximate orientation guides.
                        </p>
                        <p>
                            GPS data in mountainous or dense jungle terrain may sometimes be imperfect. Travelers should always look out for official road signage and consult local drivers or forest rangers rather than blindly following automated GPS prompts.
                        </p>
                    </section>

                    {/* Section 8 */}
                    <section id="hotels-third-parties" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">08</span>
                            <h2 className="legal-section-title">Hotels, Stays, and Hospitality Services</h2>
                        </div>
                        <p>
                            Explorely includes a directory of hotels and accommodations for traveler convenience. Explorely does not own, manage, inspect, or endorse any listed lodging establishment.
                        </p>
                        <p>
                            Room tariffs, hygiene standards, amenity availability, cancellation policies, and booking fulfillment are solely the responsibility of the respective hotel management and your chosen reservation platform.
                        </p>
                    </section>

                    {/* Section 9 */}
                    <section id="external-websites" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">09</span>
                            <h2 className="legal-section-title">External Websites & Third-Party Outbound Links</h2>
                        </div>
                        <p>
                            Our platform contains links to external websites, including Google Maps, Google Images, third-party hotel platforms, and social networks. Explorely exercises no editorial control over the content, security, or privacy policies of third-party platforms. Following any external link is done strictly at your own discretion.
                        </p>
                    </section>

                    {/* Section 10 */}
                    <section id="user-submitted-information" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">10</span>
                            <h2 className="legal-section-title">User-Submitted Places & Community Data</h2>
                        </div>
                        <p>
                            Explorely welcomes suggestions from community explorers. Although we review incoming suggestions, we cannot physically visit every submitted spot across India. Explorely makes no warranty regarding the safety, accessibility, or current status of community-submitted locations.
                        </p>
                    </section>

                    {/* Section 11 */}
                    <section id="photography-and-images" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">11</span>
                            <h2 className="legal-section-title">Photography, Media, and Visual Assets</h2>
                        </div>
                        <p>
                            Images and visual media displayed on Explorely are used to provide illustrative context for destinations. These visual assets may include photographs sourced from open and public repositories (such as Unsplash, Wikimedia Commons, and Openverse), user contributions uploaded via Cloudinary, and platform assets.
                        </p>
                        <p>
                            Third-party images remain subject to their respective creators' copyright, attribution, and license terms. Explorely does not claim exclusive ownership over third-party visual works. For user-submitted images, contributors must have the necessary rights or permission to share them.
                        </p>
                        <p>
                            Actual on-ground site appearances may vary depending on seasonal changes, weather conditions, water levels, crowd density, local construction, or conservation activities.
                        </p>
                    </section>

                    {/* Section 12 */}
                    <section id="no-guarantee-endorsement" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">12</span>
                            <h2 className="legal-section-title">No Guarantee of Availability or Endorsement</h2>
                        </div>
                        <p>
                            Inclusion of any tourist spot, monument, beach, hotel, or eatery on Explorely does not constitute a formal commercial endorsement, sponsorship, or guarantee of quality by Explorely or its creators.
                        </p>
                    </section>

                    {/* Section 13 */}
                    <section id="contact-reporting" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">13</span>
                            <h2 className="legal-section-title">Contact & Reporting Inaccuracies</h2>
                        </div>
                        <p>
                            Found an outdated timing, incorrect location, or misspelled place name? Help fellow travelers by sending a quick correction!
                        </p>
                        <div className="legal-callout">
                            <Mail size={20} className="legal-callout-icon" />
                            <div className="legal-callout-text">
                                <p style={{ margin: 0 }}>
                                    <strong>Report a Correction:</strong>
                                    <br />
                                    Email: <a href={`mailto:${siteConfig.contactEmail}`} style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{siteConfig.contactEmail}</a>
                                    <br />
                                    Or submit directly via our <Link to="/contact" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Contact & Feedback form</Link>. Our team reviews reports promptly.
                                </p>
                            </div>
                        </div>
                    </section>
                </article>
            </div>
        </div>
    );
}
