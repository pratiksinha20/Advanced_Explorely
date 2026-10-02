import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import siteConfig from '../config/siteConfig';
import { Shield, ChevronDown, ChevronUp, MapPin, Mail, CheckCircle2 } from 'lucide-react';
import './Legal.css';

const sections = [
    { id: 'introduction', num: '01', title: 'Introduction' },
    { id: 'information-we-collect', num: '02', title: 'Information We May Collect' },
    { id: 'how-we-use-information', num: '03', title: 'How We Use Information' },
    { id: 'location-information', num: '04', title: 'Location Information (Near Me)' },
    { id: 'user-submitted-content', num: '05', title: 'User-Submitted Content' },
    { id: 'images-and-uploaded-content', num: '06', title: 'Images and Uploaded Content' },
    { id: 'contact-and-feedback', num: '07', title: 'Contact and Feedback Submissions' },
    { id: 'third-party-services', num: '08', title: 'Third-Party Services Overview' },
    { id: 'google-services', num: '09', title: 'Google Maps and Google Search' },
    { id: 'web3forms', num: '10', title: 'Web3Forms API Processing' },
    { id: 'cloudinary', num: '11', title: 'Cloudinary Image Hosting' },
    { id: 'cookies-and-local-storage', num: '12', title: 'Local Storage & Browser Preferences' },
    { id: 'data-security', num: '13', title: 'Data Security Measures' },
    { id: 'data-retention', num: '14', title: 'Data Retention' },
    { id: 'external-links', num: '15', title: 'External Links & Third Parties' },
    { id: 'children-privacy', num: '16', title: "Children's Privacy" },
    { id: 'privacy-rights', num: '17', title: 'Your Privacy Choices & Rights' },
    { id: 'changes-to-policy', num: '18', title: 'Changes to This Privacy Policy' },
    { id: 'contact-us', num: '19', title: 'Contact Us' },
];

export default function PrivacyPolicy() {
    const [mobileTocOpen, setMobileTocOpen] = useState(false);

    useEffect(() => {
        document.title = siteConfig.seo.privacy.title;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', siteConfig.seo.privacy.description);
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
            {/* Header / Intro */}
            <div className="legal-header-wrapper">
                <div className="legal-header-badge">
                    <Shield size={14} />
                    <span>Legal & Trust</span>
                </div>
                <h1 className="legal-header-title">Privacy Policy</h1>
                <p className="legal-header-intro">
                    Your Privacy Matters. This Privacy Policy describes transparently how Explorely handles information when you discover destinations, explore spots, or contribute to our platform.
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

            {/* Layout: Sidebar TOC + Main Content */}
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
                                    href={`/privacy-policy#${sec.id}`}
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

                {/* Main Content Body */}
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
                                            href={`/privacy-policy#${sec.id}`}
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
                    <section id="introduction" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">01</span>
                            <h2 className="legal-section-title">Introduction</h2>
                        </div>
                        <p>
                            Welcome to Explorely (accessible at <strong>{siteConfig.domain}</strong>). We built Explorely as a community-driven travel discovery platform dedicated to helping travelers explore India's vibrant heritage, cultural landmarks, natural marvels, and hidden gems.
                        </p>
                        <p>
                            We believe privacy should be simple, transparent, and respectful. Explorely is fundamentally an open travel reference website: you can browse destinations, view photos, filter states, spin travel ideas, and calculate travel expenses without ever creating an account, logging in, or providing personal payment credentials.
                        </p>
                        <div className="legal-callout">
                            <CheckCircle2 size={20} className="legal-callout-icon" />
                            <p className="legal-callout-text">
                                <strong>Our Core Commitment:</strong> Explorely does not operate user accounts, does not store passwords, does not run ad-tracking surveillance networks, and does not sell or rent any user data to third parties.
                            </p>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section id="information-we-collect" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">02</span>
                            <h2 className="legal-section-title">Information We May Collect</h2>
                        </div>
                        <p>
                            Explorely does not require user accounts or login, and does not collect passwords or payment details. We collect minimal information only when you interact with specific features:
                        </p>
                        <ul>
                            <li>
                                <strong>Suggest a Place:</strong> When submitting a destination recommendation, you provide the required spot name and location/address. You may optionally provide a description, category, and an image (either as an uploaded photograph file or an online image URL). Submitter name and email are optional fields used if you choose to receive confirmation or credit.
                            </li>
                            <li>
                                <strong>Feedback & Contact Forms:</strong> When sending thoughts via our Feedback modal or Contact page, you provide your name, email address, inquiry topic, and message, along with an optional screenshot attachment.
                            </li>
                            <li>
                                <strong>Temporary Geolocation (Near Me):</strong> When you use "Near Me", your browser prompts for permission and computes distance to nearby spots strictly in-browser. Explorely does not store your GPS coordinates on any server.
                            </li>
                            <li>
                                <strong>Local Device Preferences:</strong> Your dark/light theme choice and bookmarked wishlist destinations are stored solely on your device via browser localStorage.
                            </li>
                        </ul>
                    </section>

                    {/* Section 3 */}
                    <section id="how-we-use-information" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">03</span>
                            <h2 className="legal-section-title">How We Use Information</h2>
                        </div>
                        <p>Any information collected is used exclusively for the operational purpose intended:</p>
                        <ul>
                            <li>To verify and curate user-submitted tourist spots before publishing them to the public catalog.</li>
                            <li>To review bugs, suggestions, and corrections sent through our feedback forms.</li>
                            <li>To respond to your inquiries if you requested a reply via email.</li>
                            <li>To sort and display tourist destinations nearest to your current location when you activate "Near Me".</li>
                            <li>To maintain platform security, prevent automated form abuse, and ensure website stability.</li>
                        </ul>
                    </section>

                    {/* Section 4 */}
                    <section id="location-information" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">04</span>
                            <h2 className="legal-section-title">Location Information (Near Me Feature)</h2>
                        </div>
                        <p>
                            Explorely includes a "Near Me" feature designed to help travelers discover nearby attractions, viewpoints, and hotels.
                        </p>
                        <p>
                            When you navigate to "Near Me" or click "Allow Location", your browser prompts you with an explicit permission dialog. If granted, your browser's Geolocation API (<code>navigator.geolocation</code>) provides your current latitude and longitude coordinates.
                        </p>
                        <div className="legal-callout">
                            <MapPin size={20} className="legal-callout-icon" />
                            <p className="legal-callout-text">
                                <strong>Crucial Technical Detail:</strong> Your GPS coordinates are processed <strong>strictly client-side in your own browser's memory</strong> using the mathematical Haversine formula to compute distance (in kilometers) to known Indian tourist spots. <strong>Explorely does NOT continuously track your movements and does NOT store your location coordinates on any server or database.</strong>
                            </p>
                        </div>
                        <p>
                            You may revoke location permissions at any time through your web browser's site settings.
                        </p>
                    </section>

                    {/* Section 5 */}
                    <section id="user-submitted-content" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">05</span>
                            <h2 className="legal-section-title">User-Submitted Content</h2>
                        </div>
                        <p>
                            Explorely welcomes travel contributions from community explorers. When using "Suggest a Place", the submission form includes:
                        </p>
                        <ul>
                            <li><strong>Place & Location (Required):</strong> The name of the tourist spot and its geographical address or location.</li>
                            <li><strong>Description (Optional):</strong> Context, tips, or highlights about the destination.</li>
                            <li><strong>Image / Image URL (Optional):</strong> A photograph of the location, submitted either as a direct file upload or an online image link.</li>
                            <li><strong>Name & Email (Optional):</strong> Contact details if you wish to receive confirmation or follow-up regarding your submission.</li>
                        </ul>
                        <p>
                            Explorely does not collect ratings or require user accounts to submit destinations. All submissions are reviewed by our editorial team prior to publication.
                        </p>
                    </section>

                    {/* Section 6 */}
                    <section id="images-and-uploaded-content" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">06</span>
                            <h2 className="legal-section-title">Images and Uploaded Content</h2>
                        </div>
                        <p>
                            When suggesting a place, users may optionally submit an image of the destination. Users may either upload a photo file from their device or supply an existing online image URL.
                        </p>
                        <p>
                            Users must only submit photographs they personally took or have the necessary rights and permissions to share. Do not submit images containing private individuals without consent or copyrighted material without permission.
                        </p>
                        <p>
                            When a file is uploaded directly from your device, it is transmitted to Cloudinary media storage to generate a secure link for editorial review. If an image URL is entered, the link is processed directly without a file upload to Cloudinary.
                        </p>
                    </section>

                    {/* Section 7 */}
                    <section id="contact-and-feedback" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">07</span>
                            <h2 className="legal-section-title">Contact and Feedback Submissions</h2>
                        </div>
                        <p>
                            When you reach out via our Feedback modal or Contact page, we collect your name, email address, topic (such as General Feedback, Bug Report, Feature Request, or Content Correction), and your message.
                        </p>
                        <p>
                            This data is solely used by our editorial team to review suggestions, debug reported platform issues, or reply directly to your query. We do not add your email to promotional marketing newsletters or automated spam blasts.
                        </p>
                    </section>

                    {/* Section 8 */}
                    <section id="third-party-services" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">08</span>
                            <h2 className="legal-section-title">Third-Party Services Overview</h2>
                        </div>
                        <p>
                            To deliver a fast, reliable, and secure experience, Explorely relies on a curated set of reputable third-party infrastructure providers. Each provider handles data in accordance with their respective industry-standard privacy protocols:
                        </p>
                        <ul>
                            <li><strong>Web3Forms:</strong> For dispatching form submissions directly to our administration mailbox.</li>
                            <li><strong>Cloudinary:</strong> For secure image upload and content delivery network (CDN) hosting.</li>
                            <li><strong>Vercel Analytics:</strong> For aggregate, privacy-friendly performance telemetry (page load times, CWV metrics) without storing personal identity or tracking individuals across the web.</li>
                            <li><strong>Google Maps & Google Search:</strong> For external navigation and photo exploration links.</li>
                        </ul>
                    </section>

                    {/* Section 9 */}
                    <section id="google-services" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">09</span>
                            <h2 className="legal-section-title">Google Maps and Google Search</h2>
                        </div>
                        <p>
                            On individual tourist spot cards, Explorely provides outbound convenience links:
                        </p>
                        <ul>
                            <li><strong>"View on Maps":</strong> Links out to Google Maps to help you view exact geographical coordinates, driving routes, and turn-by-turn navigation.</li>
                            <li><strong>"Google Photos":</strong> Links out to Google Images search queries so travelers can view recent visitor photos of the destination.</li>
                        </ul>
                        <p>
                            When you click these links, you leave Explorely and navigate to Google's platform, which is governed independently by Google's Privacy Policy (<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">policies.google.com/privacy</a>) and Google Terms of Service.
                        </p>
                    </section>

                    {/* Section 10 */}
                    <section id="web3forms" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">10</span>
                            <h2 className="legal-section-title">Web3Forms API Processing</h2>
                        </div>
                        <p>
                            Form submissions (Suggest a Place, Feedback, and Contact inquiries) are processed using Web3Forms.
                        </p>
                        <p>
                            Web3Forms is used to process and deliver submitted form information to the designated Explorely email address (<code>{siteConfig.contactEmail}</code>). Web3Forms' own privacy policy applies to its processing of submitted information.
                        </p>
                    </section>

                    {/* Section 11 */}
                    <section id="cloudinary" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">11</span>
                            <h2 className="legal-section-title">Cloudinary Image Hosting</h2>
                        </div>
                        <p>
                            Where users choose to upload a photograph file from their device, Cloudinary is used to host the uploaded image so our editorial team can review it. Cloudinary's own privacy policy and terms apply to files hosted on its platform.
                        </p>
                    </section>

                    {/* Section 12 */}
                    <section id="cookies-and-local-storage" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">12</span>
                            <h2 className="legal-section-title">Local Storage & Browser Preferences</h2>
                        </div>
                        <p>
                            Explorely does not use advertising cookies, third-party remarketing pixels, or invasive behavioral tracking cookies.
                        </p>
                        <p>
                            We utilize your web browser's standard <strong>HTML5 LocalStorage</strong> API solely for client-side user experience preferences:
                        </p>
                        <ul>
                            <li><code>theme</code>: Remembers whether you prefer Dark Mode or Light Mode.</li>
                            <li><code>explorely_wishlist</code>: Stores your bookmarked favorite places and hotels so they remain accessible when you revisit.</li>
                        </ul>
                        <p>
                            This data remains entirely on your personal computer or mobile device. You can clear this data at any time by clearing your browser cache/storage.
                        </p>
                    </section>

                    {/* Section 13 */}
                    <section id="data-security" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">13</span>
                            <h2 className="legal-section-title">Data Security Measures</h2>
                        </div>
                        <p>
                            We take reasonable and appropriate technical safeguards to protect all information transmitted to us:
                        </p>
                        <ul>
                            <li>All data in transit is encrypted using modern Transport Layer Security (HTTPS / TLS 1.3).</li>
                            <li>API interactions with Web3Forms and Cloudinary utilize authenticated API tokens and signatures.</li>
                            <li>Minimalism principle: because we do not collect passwords or financial credentials, the risk of data compromise is inherently minimized.</li>
                        </ul>
                    </section>

                    {/* Section 14 */}
                    <section id="data-retention" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">14</span>
                            <h2 className="legal-section-title">Data Retention</h2>
                        </div>
                        <p>
                            We retain user-submitted communications (feedback and place suggestions) only as long as necessary to review and incorporate the suggested travel spots or address the user inquiry. If you would like your submitted suggestion or email removed from our records, simply email us at <code>{siteConfig.contactEmail}</code>.
                        </p>
                    </section>

                    {/* Section 15 */}
                    <section id="external-links" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">15</span>
                            <h2 className="legal-section-title">External Links & Third Parties</h2>
                        </div>
                        <p>
                            Explorely contains links to external websites, including Google Maps, state tourism boards, booking partners, and social media platforms. We do not control and are not responsible for the privacy practices, content, or cookie policies of external sites. We encourage you to review their privacy statements upon visiting.
                        </p>
                    </section>

                    {/* Section 16 */}
                    <section id="children-privacy" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">16</span>
                            <h2 className="legal-section-title">Children's Privacy</h2>
                        </div>
                        <p>
                            Explorely is a general audience travel discovery guide. We do not knowingly collect personal identifiable information from children under the age of 13. If you believe a child has provided us with personal contact information, please contact us and we will promptly remove such records.
                        </p>
                    </section>

                    {/* Section 17 */}
                    <section id="privacy-rights" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">17</span>
                            <h2 className="legal-section-title">Your Privacy Choices & Rights</h2>
                        </div>
                        <p>You have full autonomy over how you interact with Explorely:</p>
                        <ul>
                            <li><strong>Location Permissions:</strong> You can disable or revoke browser geolocation permission at any time.</li>
                            <li><strong>Local Data:</strong> You can wipe your wishlist and theme preference by clearing your browser's site data.</li>
                            <li><strong>Correction & Deletion:</strong> If you submitted a place or image and wish to have it amended or withdrawn, contact us at <code>{siteConfig.contactEmail}</code>.</li>
                        </ul>
                    </section>

                    {/* Section 18 */}
                    <section id="changes-to-policy" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">18</span>
                            <h2 className="legal-section-title">Changes to This Privacy Policy</h2>
                        </div>
                        <p>
                            We may occasionally update this Privacy Policy to reflect platform enhancements or changes in applicable legal standards. When modifications occur, we will update the "Last Updated" date at the top of this document. Continued use of Explorely constitutes acceptance of any revised policies.
                        </p>
                    </section>

                    {/* Section 19 */}
                    <section id="contact-us" className="legal-section">
                        <div className="legal-section-header">
                            <span className="legal-section-index">19</span>
                            <h2 className="legal-section-title">Contact Us</h2>
                        </div>
                        <p>
                            If you have questions, feedback, or concerns regarding this Privacy Policy or our data practices, we welcome you to reach out:
                        </p>
                        <div className="legal-callout">
                            <Mail size={20} className="legal-callout-icon" />
                            <div className="legal-callout-text">
                                <p style={{ margin: 0 }}>
                                    <strong>Explorely Privacy Inquiries</strong>
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
