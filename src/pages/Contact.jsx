import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import siteConfig from '../config/siteConfig';
import { 
    Mail, MapPin, Send, MessageSquare, Compass, CheckCircle2, 
    AlertCircle
} from 'lucide-react';
import './Legal.css';

const InstagramIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
);

const XIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
);

const LinkedinIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
        <rect width="4" height="12" x="2" y="9"/>
        <circle cx="4" cy="4" r="2"/>
    </svg>
);

export default function Contact() {
    const { openFeedbackModal } = useApp();

    const [formName, setFormName] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formCategory, setFormCategory] = useState('General Inquiry');
    const [formMessage, setFormMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        document.title = siteConfig.seo.contact.title;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', siteConfig.seo.contact.description);
        }
        
        // Handle hash navigation if arriving with #about
        if (window.location.hash === '#about') {
            const aboutEl = document.getElementById('about');
            if (aboutEl) {
                setTimeout(() => aboutEl.scrollIntoView({ behavior: 'smooth' }), 100);
            }
        } else {
            window.scrollTo(0, 0);
        }
    }, []);

    const handleSubmitMessage = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (!formName.trim() || !formEmail.trim() || !formMessage.trim()) {
            setErrorMessage('Please fill in your name, email, and message.');
            return;
        }

        setSubmitting(true);

        try {
            const accessKey = process.env.REACT_APP_WEB3FORMS_KEY || '0ce71c61-e3fc-4e36-9cdc-8cb9c43aec87';
            const formData = new FormData();
            formData.append('access_key', accessKey);
            formData.append('subject', `[Explorely Contact] ${formCategory} from ${formName.trim()}`);
            formData.append('from_name', formName.trim());
            formData.append('email', formEmail.trim());
            formData.append('to_email', siteConfig.contactEmail);
            formData.append('category', formCategory);
            formData.append('message', formMessage.trim());

            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                setSubmitted(true);
            } else {
                setErrorMessage(data.message || 'Submission failed. Please try emailing us directly.');
            }
        } catch (err) {
            setErrorMessage('Unable to connect to submission service. Please email us directly.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="contact-page">
            {/* Header */}
            <div className="legal-header-wrapper">
                <div className="legal-header-badge">
                    <Mail size={14} />
                    <span>Get in Touch</span>
                </div>
                <h1 className="legal-header-title">Contact Explorely</h1>
                <p className="legal-header-intro">
                    Have a question, suggestion, correction, or feedback? We'd love to hear from you. Reach out to our team or connect directly with the creator.
                </p>
            </div>

            {/* Main Contact Container */}
            <div className="contact-container">
                <div className="contact-grid">
                    {/* Left Column: Direct Info & Quick Triggers */}
                    <div className="contact-info-column">
                        {/* Direct Email Card */}
                        <div className="contact-card">
                            <div className="contact-card-header">
                                <div className="contact-card-icon">
                                    <Mail size={20} />
                                </div>
                                <h3 className="contact-card-title">General Inquiries & Editorial</h3>
                            </div>
                            <p className="contact-card-desc">
                                For platform questions, corrections, tourism partnerships, or media inquiries, send us a direct email. We typically respond within 24–48 hours.
                            </p>
                            <a href={`mailto:${siteConfig.contactEmail}`} className="contact-email-link">
                                <Mail size={16} />
                                <span>{siteConfig.contactEmail}</span>
                            </a>
                        </div>

                        {/* Interactive Contribution Card */}
                        <div className="contact-card">
                            <div className="contact-card-header">
                                <div className="contact-card-icon">
                                    <MapPin size={20} />
                                </div>
                                <h3 className="contact-card-title">Contribute or Report</h3>
                            </div>
                            <p className="contact-card-desc">
                                Know a scenic spot or hidden monument not listed on Explorely? Or have quick feedback on website features? Use our streamlined tools:
                            </p>
                            <div className="contact-actions-row">
                                <button
                                    type="button"
                                    className="contact-action-btn primary"
                                    onClick={() => openFeedbackModal({ type: 'spot' })}
                                >
                                    <MapPin size={15} />
                                    <span>Suggest a Spot</span>
                                </button>
                                <button
                                    type="button"
                                    className="contact-action-btn"
                                    onClick={() => openFeedbackModal({ type: 'feedback' })}
                                >
                                    <MessageSquare size={15} />
                                    <span>Send Feedback</span>
                                </button>
                            </div>
                        </div>

                        {/* Social Connect Card */}
                        <div className="contact-card">
                            <div className="contact-card-header">
                                <div className="contact-card-icon">
                                    <Compass size={20} />
                                </div>
                                <h3 className="contact-card-title">Follow & Connect</h3>
                            </div>
                            <p className="contact-card-desc">
                                Connect with Pratik Sinha (Founder & Developer) across social media:
                            </p>
                            <div className="contact-social-grid">
                                <a
                                    href={siteConfig.social.x}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="contact-social-tile"
                                    title={`Follow on X (${siteConfig.social.xHandle})`}
                                >
                                    <XIcon size={18} />
                                    <span>X (Twitter)</span>
                                </a>
                                <a
                                    href={siteConfig.social.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="contact-social-tile"
                                    title={`Follow on Instagram (${siteConfig.social.instagramHandle})`}
                                >
                                    <InstagramIcon size={18} />
                                    <span>Instagram</span>
                                </a>
                                <a
                                    href={siteConfig.social.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="contact-social-tile"
                                    title={`Connect on LinkedIn (${siteConfig.social.linkedinName})`}
                                >
                                    <LinkedinIcon size={18} />
                                    <span>LinkedIn</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Direct Contact Form */}
                    <div className="contact-form-card">
                        {submitted ? (
                            <div className="contact-success-state">
                                <div className="contact-success-icon">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h3>Message Sent Successfully!</h3>
                                <p style={{ color: 'var(--muted)', fontSize: '0.92rem', maxWidth: '380px' }}>
                                    Thank you for reaching out, <strong>{formName}</strong>. Your message has been sent to our team at <code>{siteConfig.contactEmail}</code>. We will get back to you shortly.
                                </p>
                                <button
                                    type="button"
                                    className="contact-action-btn primary"
                                    style={{ marginTop: '16px' }}
                                    onClick={() => {
                                        setSubmitted(false);
                                        setFormMessage('');
                                    }}
                                >
                                    Send Another Note
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmitMessage}>
                                <h2 className="contact-form-title">Send a Direct Message</h2>
                                <p className="contact-form-sub">
                                    Fill out this form and your inquiry will be delivered directly to our mailbox.
                                </p>

                                {errorMessage && (
                                    <div className="legal-callout" style={{ borderColor: '#e74c3c', background: 'rgba(231, 76, 60, 0.08)', marginBottom: '16px' }}>
                                        <AlertCircle size={18} style={{ color: '#e74c3c', flexShrink: 0 }} />
                                        <p style={{ color: '#e74c3c', fontSize: '0.85rem', margin: 0 }}>{errorMessage}</p>
                                    </div>
                                )}

                                <div className="contact-form-group">
                                    <label className="contact-form-label" htmlFor="contact-name">Your Full Name *</label>
                                    <input
                                        id="contact-name"
                                        type="text"
                                        className="contact-form-input"
                                        placeholder="e.g., Ananya Sharma"
                                        value={formName}
                                        onChange={(e) => setFormName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="contact-form-group">
                                    <label className="contact-form-label" htmlFor="contact-email">Email Address *</label>
                                    <input
                                        id="contact-email"
                                        type="email"
                                        className="contact-form-input"
                                        placeholder="name@example.com"
                                        value={formEmail}
                                        onChange={(e) => setFormEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="contact-form-group">
                                    <label className="contact-form-label" htmlFor="contact-category">Subject Category</label>
                                    <select
                                        id="contact-category"
                                        className="contact-form-select"
                                        value={formCategory}
                                        onChange={(e) => setFormCategory(e.target.value)}
                                    >
                                        <option value="General Inquiry">General Inquiry</option>
                                        <option value="Place Suggestion">Place Suggestion / Add Spot</option>
                                        <option value="Content Correction">Content Correction / Outdated Info</option>
                                        <option value="Bug Report">Technical Bug Report</option>
                                        <option value="Partnership">Partnership & Media</option>
                                    </select>
                                </div>

                                <div className="contact-form-group">
                                    <label className="contact-form-label" htmlFor="contact-message">Message *</label>
                                    <textarea
                                        id="contact-message"
                                        className="contact-form-textarea"
                                        rows={5}
                                        placeholder="Tell us what's on your mind..."
                                        value={formMessage}
                                        onChange={(e) => setFormMessage(e.target.value)}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="contact-submit-btn"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <span>Sending Message...</span>
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            <span>Send Message to Explorely</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* About Explorely Section (Anchored to #about) */}
                <section id="about" className="about-explorely-section">
                    <div>
                        <div className="legal-header-badge" style={{ marginBottom: '8px' }}>
                            <Compass size={13} />
                            <span>About Explorely</span>
                        </div>
                        <h2 className="about-explorely-title">Discover India Deeper</h2>
                        <p className="about-explorely-desc">
                            Explorely was founded with a clear vision: to create an intuitive, modern, and comprehensive travel catalog for India. From the mist-draped peaks of Himachal and tea slopes of Munnar to the royal bastions of Rajasthan and ancient stone carvings of Hampi, Explorely brings India's vast geography within easy reach.
                        </p>
                        <p className="about-explorely-desc">
                            Built and curated by <strong>Pratik Sinha</strong>, Explorely operates completely free for all explorers, travelers, and cultural enthusiasts worldwide.
                        </p>
                    </div>

                    <div className="about-stats-row">
                        <div className="about-stat-item">
                            <strong>21,500+</strong>
                            <span>Tourist Spots Curated</span>
                        </div>
                        <div className="about-stat-item">
                            <strong>36</strong>
                            <span>States & Territories</span>
                        </div>
                        <div className="about-stat-item">
                            <strong>100% Free</strong>
                            <span>Community Travel Discovery</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
