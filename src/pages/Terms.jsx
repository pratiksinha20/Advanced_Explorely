import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import siteConfig from '../config/siteConfig';
import { FileText, ChevronDown, ChevronUp, AlertCircle, Mail } from 'lucide-react';
import './Legal.css';

const sections = [
    { id: 'acceptance-of-terms', num: '01', title: 'Acceptance of Terms' },
    { id: 'about-explorely', num: '02', title: 'About Explorely' },
    { id: 'use-of-the-website', num: '03', title: 'Use of the Website' },
    { id: 'tourist-information', num: '04', title: 'Tourist Information & Discovery' },
    { id: 'accuracy-of-information', num: '05', title: 'Accuracy & User Verification' },
    { id: 'external-services', num: '06', title: 'External Services & Links' },
    { id: 'google-maps-services', num: '07', title: 'Google Maps & Google Services' },
    { id: 'user-submissions', num: '08', title: 'User Submissions & Feedback' },
    { id: 'suggest-a-place', num: '09', title: 'Suggest a Place Guidelines' },
    { id: 'uploaded-images', num: '10', title: 'Uploaded Images & Rights' },
    { id: 'intellectual-property', num: '11', title: 'Intellectual Property' },
    { id: 'prohibited-activities', num: '12', title: 'Prohibited Activities' },
    { id: 'third-party-content', num: '13', title: 'Third-Party Content & Trademarks' },
    { id: 'website-availability', num: '14', title: 'Website Availability' },
    { id: 'changes-to-platform', num: '15', title: 'Changes to the Platform' },
    { id: 'limitation-of-liability', num: '16', title: 'Limitation of Liability' },
    { id: 'governing-law', num: '17', title: 'Governing Law & Jurisdiction' },
    { id: 'contact-information', num: '18', title: 'Contact Information' },
];

export default function Terms() {
    const [mobileTocOpen, setMobileTocOpen] = useState(false);

    useEffect(() => {
        document.title = siteConfig.seo.terms.title;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', siteConfig.seo.terms.description);
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
                    <FileText size={14} />
                    <span>Terms & Conditions</span>
                </div>
                <h1 className="legal-header-title">Terms & Conditions</h1>
                <p className="legal-header-intro">
                    Please read these terms carefully before exploring or submitting content on Explorely. By accessing our platform, you agree to these guidelines designed to keep travel discovery authentic, safe, and helpful for everyone.
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

            {/* Main Layout */}
            <div className="legal-layout">
                {/* Desktop Sticky Table of Contents */}
                <aside className="legal-sidebar" aria-label="Table of Contents">
                    <div className="legal-toc-title">
                        <span>On this page</span>
                    </div>
                    <ul className="legal-toc-list">
                        {sections.map((sec) => (
                            <li key={sec.id}>
                                <a
                                    href={`/terms#${sec.id}`}
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
                    {/* Mobile Collapsible TOC */}
                    <div className="legal-mobile-toc">
                        <button
                            type="button"
                            className="legal-mobile-toc-header"
                            onClick={() => setMobileTocOpen(!mobileTocOpen)}
                            aria-expanded={mobileTocOpen}
                        >
                            <span>Table of Contents ({sections.length} sections)</span>
                            {mobileTocOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                        {mobileTocOpen && (
                            <ul className="legal-toc-list" style={{ marginTop: '14px' }}>
                                {sections.map((sec) => (
                                    <li key={sec.id}>
                                        <a
                                            href={`/terms#${sec.id}`}
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
                    <section id="acceptance-of-terms" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">01</span>
                            <h2 className="legal-section-title">Acceptance of Terms</h2>
                        </div>
                        <p>
                            By accessing, viewing, browsing, or using Explorely (accessible at <strong>{siteConfig.domain}</strong>), you acknowledge that you have read, understood, and agreed to be bound by these Terms & Conditions and our Privacy Policy.
                        </p>
                        <p>
                            If you do not agree with any part of these terms, please discontinue your use of the website.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section id="about-explorely" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">02</span>
                            <h2 className="legal-section-title">About Explorely</h2>
                        </div>
                        <p>
                            Explorely is an independent online travel discovery platform providing curated information, photo galleries, category filters, interactive travel generators (Spin & Go), and cost-splitting utilities to assist individuals in planning trips across India.
                        </p>
                        <p>
                            Explorely operates strictly as an informational discovery directory and travel aid. Explorely is <strong>not</strong> a travel agency, tour operator, commercial transport carrier, hotel owner or operator, or travel booking agent.
                        </p>
                    </section>

                    {/* Section 3 */}
                    <section id="use-of-the-website" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">03</span>
                            <h2 className="legal-section-title">Use of the Website</h2>
                        </div>
                        <p>
                            You agree to use Explorely exclusively for lawful, personal, non-commercial travel planning and discovery purposes. You agree not to disrupt website operations, alter client-side code maliciously, or harvest public data via automated mass scrapers without prior written consent.
                        </p>
                    </section>

                    {/* Section 4 */}
                    <section id="tourist-information" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">04</span>
                            <h2 className="legal-section-title">Tourist Information & Discovery</h2>
                        </div>
                        <p>
                            Explorely provides listings for tourist spots across India, including fortresses, hill stations, beaches, sanctuaries, cultural monuments, and temples.
                        </p>
                        <p>
                            These listings are assembled from public travel resources, open regional guides, curated tourism research, and community submissions to help inspire exploration.
                        </p>
                    </section>

                    {/* Section 5 */}
                    <section id="accuracy-of-information" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">05</span>
                            <h2 className="legal-section-title">Accuracy & User Verification</h2>
                        </div>
                        <p>
                            While we strive to keep place descriptions, ratings, and locations up to date, travel information changes continuously due to seasonal closures, local government advisories, renovation projects, ticket price adjustments, and environmental factors.
                        </p>
                        <div className="legal-callout">
                            <AlertCircle size={20} className="legal-callout-icon" />
                            <p className="legal-callout-text">
                                <strong>Traveler Verification Notice:</strong> Explorely does not guarantee that timings, entry permits, accessibility conditions, or ticket costs shown on the platform are real-time accurate. Travelers are strongly encouraged to cross-check with official state tourism departments or local district administrations prior to travel.
                            </p>
                        </div>
                    </section>

                    {/* Section 6 */}
                    <section id="external-services" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">06</span>
                            <h2 className="legal-section-title">External Services & Links</h2>
                        </div>
                        <p>
                            Our platform includes direct links to third-party services, such as Google Maps, hotel reservation portals, state tourism bodies, and social platforms. These external websites are independently owned and operated. Explorely does not endorse, control, or assume liability for the availability, safety, or content of third-party platforms.
                        </p>
                    </section>

                    {/* Section 7 */}
                    <section id="google-maps-services" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">07</span>
                            <h2 className="legal-section-title">Google Maps & Google Services</h2>
                        </div>
                        <p>
                            Links labeled "View on Maps" or "Google Photos" launch Google services in an external tab. By utilizing these navigation links, you are subject to Google's Terms of Service and applicable safety guidelines. Explorely is not responsible for road navigation errors or route detours suggested by third-party mapping providers.
                        </p>
                    </section>

                    {/* Section 8 */}
                    <section id="user-submissions" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">08</span>
                            <h2 className="legal-section-title">User Submissions & Feedback</h2>
                        </div>
                        <p>
                            When you submit travel spots, descriptions, or feedback through Explorely's forms, you grant Explorely a non-exclusive, royalty-free license to review, edit, format, publish, or remove such content in connection with operating and improving the platform.
                        </p>
                        <p>
                            <strong>Editorial Discretion:</strong> Explorely reserves the full right to review, edit for clarity, accept, decline, or remove any submitted place recommendation or photograph at our sole editorial discretion without compensation.
                        </p>
                    </section>

                    {/* Section 9 */}
                    <section id="suggest-a-place" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">09</span>
                            <h2 className="legal-section-title">Suggest a Place Guidelines</h2>
                        </div>
                        <p>
                            When using "Suggest a Place", you provide the required spot name and location/address, and may optionally include a description, category, and an image (via direct file upload or online image URL). When contributing destinations, you agree that:
                        </p>
                        <ul>
                            <li>The destination exists and is an authentic, publicly accessible location.</li>
                            <li>You do not submit private residences, restricted military zones, or environmentally fragile sanctuaries closed to the public.</li>
                            <li>The information provided is truthful, safe, and respectful of local cultures and wildlife.</li>
                        </ul>
                    </section>

                    {/* Section 10 */}
                    <section id="uploaded-images" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">10</span>
                            <h2 className="legal-section-title">Uploaded Images & Rights</h2>
                        </div>
                        <p>
                            Users who submit photographs (either via direct file upload or online image URL) through "Suggest a Place" must hold all necessary rights and copyright ownership to the submitted image, or have explicit legal authority from the rights holder to distribute it.
                        </p>
                        <p>
                            You must not submit watermarked stock photos without license, abusive content, or images violating personal privacy. If a copyright holder believes an image on Explorely infringes their work, they may email <code>{siteConfig.contactEmail}</code> for prompt review and takedown.
                        </p>
                    </section>

                    {/* Section 11 */}
                    <section id="intellectual-property" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">11</span>
                            <h2 className="legal-section-title">Intellectual Property</h2>
                        </div>
                        <p>
                            The Explorely name, brand logo, software code, UI design, color schemes, animations, and database structure are the intellectual property of Explorely and its creators, protected under applicable copyright and intellectual property laws of India.
                        </p>
                    </section>

                    {/* Section 12 */}
                    <section id="prohibited-activities" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">12</span>
                            <h2 className="legal-section-title">Prohibited Activities</h2>
                        </div>
                        <p>While using Explorely, you agree not to:</p>
                        <ul>
                            <li>Submit deceptive, spam, or malicious form entries through Web3Forms or feedback channels.</li>
                            <li>Attempt to reverse-engineer, decompile, or bypass security barriers on the website or connected APIs.</li>
                            <li>Transmit harmful software, viruses, or automated scripts designed to overload platform servers.</li>
                            <li>Impersonate any person, travel authority, or official government entity.</li>
                        </ul>
                    </section>

                    {/* Section 13 */}
                    <section id="third-party-content" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">13</span>
                            <h2 className="legal-section-title">Third-Party Content & Trademarks</h2>
                        </div>
                        <p>
                            Any product names, trademarks, logos, or brand marks referenced on Explorely (including Google, Cloudinary, Unsplash, or state tourism monikers) are the property of their respective trademark holders. Reference to them does not imply sponsorship or affiliation unless explicitly stated.
                        </p>
                    </section>

                    {/* Section 14 */}
                    <section id="website-availability" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">14</span>
                            <h2 className="legal-section-title">Website Availability</h2>
                        </div>
                        <p>
                            Explorely is provided on an "as is" and "as available" basis. Explorely does not guarantee uninterrupted or error-free availability. Maintenance, server upgrades, or third-party service outages may temporarily affect website access without liability.
                        </p>
                    </section>

                    {/* Section 15 */}
                    <section id="changes-to-platform" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">15</span>
                            <h2 className="legal-section-title">Changes to the Platform</h2>
                        </div>
                        <p>
                            We reserve the right to modify, expand, or discontinue features (such as Spin & Go, Near Me, or specific state filters) at any time to enhance user experience. We may also revise these Terms & Conditions by updating this page with an updated timestamp.
                        </p>
                    </section>

                    {/* Section 16 */}
                    <section id="limitation-of-liability" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">16</span>
                            <h2 className="legal-section-title">Limitation of Liability</h2>
                        </div>
                        <p>
                            To the maximum extent permitted by applicable law, Explorely, its founder, and contributors shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from:
                        </p>
                        <ul>
                            <li>Your reliance on any destination information, opening hours, or directions provided on the site.</li>
                            <li>Travel delays, accidents, unexpected expenses, or personal injuries incurred during trips.</li>
                            <li>Actions or service deficiencies of third-party hotels, drivers, or booking portals.</li>
                            <li>Unavailability of the platform or loss of client-side wishlist data.</li>
                        </ul>
                    </section>

                    {/* Section 17 */}
                    <section id="governing-law" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">17</span>
                            <h2 className="legal-section-title">Governing Law & Jurisdiction</h2>
                        </div>
                        <p>
                            These Terms & Conditions shall be governed by and interpreted in accordance with the laws of the Republic of India. Any disputes arising out of or related to these terms shall be subject to the exclusive jurisdiction of the competent courts in India.
                        </p>
                    </section>

                    {/* Section 18 */}
                    <section id="contact-information" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">18</span>
                            <h2 className="legal-section-title">Contact Information</h2>
                        </div>
                        <p>
                            For inquiries concerning these Terms & Conditions or intellectual property matters, please contact:
                        </p>
                        <div className="legal-callout">
                            <Mail size={20} className="legal-callout-icon" />
                            <div className="legal-callout-text">
                                <p style={{ margin: 0 }}>
                                    <strong>Explorely Legal Desk</strong>
                                    <br />
                                    Email: <a href={`mailto:${siteConfig.contactEmail}`} style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{siteConfig.contactEmail}</a>
                                    <br />
                                    Platform: <a href={siteConfig.domain} target="_blank" rel="noopener noreferrer">{siteConfig.domain}</a>
                                    <br />
                                    You can also reach out through our <Link to="/contact" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Contact Page</Link>.
                                </p>
                            </div>
                        </div>
                    </section>
                </article>
            </div>
        </div>
    );
}
