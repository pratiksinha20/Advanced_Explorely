import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
    X, MapPin, MessageSquare, UploadCloud, CheckCircle2, 
    AlertCircle, Image as ImageIcon, Send, RefreshCw, Trash2
} from 'lucide-react';
import './FeedbackModal.css';

const WEB3FORMS_KEY = process.env.REACT_APP_WEB3FORMS_KEY || "0ce71c61-e3fc-4e36-9cdc-8cb9c43aec87";

// Cloudinary credentials for permanent free image hosting
const CLOUD_NAME = (process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'eayitgbp').trim();
const CLOUD_API_KEY = (process.env.REACT_APP_CLOUDINARY_API_KEY || '148866454152935').trim();
const CLOUD_API_SECRET = (process.env.REACT_APP_CLOUDINARY_API_SECRET || 'QjpxNTzhL96eFykM_x7c5V5FpRI').trim();

// SHA-1 signature generator using native browser crypto
async function generateSha1Signature(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await window.crypto.subtle.digest('SHA-1', data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Upload file directly to Cloudinary so Web3Forms doesn't trigger Pro attachment error
async function uploadToCloudinary(file) {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'user_submissions';
    const strToSign = `folder=${folder}&timestamp=${timestamp}${CLOUD_API_SECRET}`;
    const signature = await generateSha1Signature(strToSign);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', CLOUD_API_KEY);
    formData.append('timestamp', String(timestamp));
    formData.append('folder', folder);
    formData.append('signature', signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Image upload failed (status ${res.status})`);
    }

    const data = await res.json();
    return data.secure_url || data.url;
}

export default function FeedbackModal() {
    const { feedbackModalOpen, closeFeedbackModal, feedbackModalData } = useApp();

    // Determine modal mode: 'spot' for Suggest Place, 'feedback' for General Feedback
    const [modalMode, setModalMode] = useState('spot');

    // ==========================================
    // 1. COMPLETELY SEPARATE SPOT FORM STATE
    // ==========================================
    const [spotName, setSpotName] = useState('');
    const [spotAddress, setSpotAddress] = useState('');
    const [spotCategory, setSpotCategory] = useState('');
    const [spotDescription, setSpotDescription] = useState('');
    const [spotImageUrl, setSpotImageUrl] = useState('');
    const [spotImageFile, setSpotImageFile] = useState(null);
    const [spotImagePreview, setSpotImagePreview] = useState(null);
    const [spotUserName, setSpotUserName] = useState('');
    const [spotUserEmail, setSpotUserEmail] = useState('');

    // ==========================================
    // 2. COMPLETELY SEPARATE FEEDBACK FORM STATE
    // ==========================================
    const [feedbackTopic, setFeedbackTopic] = useState('General Feedback');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [feedbackFile, setFeedbackFile] = useState(null);
    const [feedbackFilePreview, setFeedbackFilePreview] = useState(null);
    const [feedbackUserName, setFeedbackUserName] = useState('');
    const [feedbackUserEmail, setFeedbackUserEmail] = useState('');

    // Submission states: 'idle' | 'loading' | 'success' | 'error'
    const [status, setStatus] = useState('idle');
    const [statusStep, setStatusStep] = useState(''); // e.g. "Uploading photo..." or "Sending details..."
    const [statusMessage, setStatusMessage] = useState('');

    const spotFileInputRef = useRef(null);
    const feedbackFileInputRef = useRef(null);

    // Synchronize initial data when modal opens
    useEffect(() => {
        if (feedbackModalOpen) {
            setStatus('idle');
            setStatusMessage('');
            setStatusStep('');

            if (feedbackModalData.type === 'feedback') {
                setModalMode('feedback');
            } else {
                setModalMode('spot');
            }

            if (feedbackModalData.spotName) {
                setSpotName(feedbackModalData.spotName);
            }
            if (feedbackModalData.spotAddress) {
                setSpotAddress(feedbackModalData.spotAddress);
            }
            if (feedbackModalData.spotCategory) {
                setSpotCategory(feedbackModalData.spotCategory);
            }
        }
    }, [feedbackModalOpen, feedbackModalData]);

    // Handle Escape key to close
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && feedbackModalOpen) {
                closeFeedbackModal();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [feedbackModalOpen, closeFeedbackModal]);

    // Spot image handlers
    const handleSpotFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 8 * 1024 * 1024) {
                alert('Image size exceeds 8MB limit. Please choose a smaller photo.');
                return;
            }
            setSpotImageFile(file);
            const previewUrl = URL.createObjectURL(file);
            setSpotImagePreview(previewUrl);
        }
    };

    const handleRemoveSpotImage = () => {
        setSpotImageFile(null);
        if (spotImagePreview) {
            URL.revokeObjectURL(spotImagePreview);
            setSpotImagePreview(null);
        }
        if (spotFileInputRef.current) {
            spotFileInputRef.current.value = '';
        }
    };

    // Feedback file handlers
    const handleFeedbackFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 8 * 1024 * 1024) {
                alert('Image size exceeds 8MB limit.');
                return;
            }
            setFeedbackFile(file);
            const previewUrl = URL.createObjectURL(file);
            setFeedbackFilePreview(previewUrl);
        }
    };

    const handleRemoveFeedbackFile = () => {
        setFeedbackFile(null);
        if (feedbackFilePreview) {
            URL.revokeObjectURL(feedbackFilePreview);
            setFeedbackFilePreview(null);
        }
        if (feedbackFileInputRef.current) {
            feedbackFileInputRef.current.value = '';
        }
    };

    // Reset spot form
    const resetSpotForm = () => {
        setSpotName('');
        setSpotAddress('');
        setSpotCategory('');
        setSpotDescription('');
        setSpotImageUrl('');
        setSpotUserName('');
        setSpotUserEmail('');
        handleRemoveSpotImage();
        setStatus('idle');
        setStatusMessage('');
        setStatusStep('');
    };

    // Reset feedback form
    const resetFeedbackForm = () => {
        setFeedbackTopic('General Feedback');
        setFeedbackMessage('');
        setFeedbackUserName('');
        setFeedbackUserEmail('');
        handleRemoveFeedbackFile();
        setStatus('idle');
        setStatusMessage('');
        setStatusStep('');
    };

    // ==========================================
    // SUBMIT SPOT FORM
    // ==========================================
    const handleSpotSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setStatusMessage('');

        try {
            let uploadedSpotImageUrl = '';

            // Step 1: Upload image file to Cloudinary if provided
            if (spotImageFile) {
                setStatusStep('Uploading spot picture to cloud...');
                uploadedSpotImageUrl = await uploadToCloudinary(spotImageFile);
            }

            // Step 2: Send data via Web3Forms (no attachment key, so no Pro error!)
            setStatusStep('Sending spot details to Explorely team...');

            const formData = new FormData();
            formData.append('access_key', WEB3FORMS_KEY);
            formData.append('from_name', 'Explorely Spot Submitter');
            formData.append('replyto', spotUserEmail);
            formData.append('to_email', 'pratiksinha198@gmail.com');
            formData.append('name', spotUserName);
            formData.append('email', spotUserEmail);
            formData.append('subject', `[Explorely Spot Request] ${spotName} - ${spotAddress || 'India'}`);
            formData.append('Request Type', 'Add New Spot / Place');
            formData.append('Spot Name', spotName);
            formData.append('Spot Address / Location', spotAddress);
            formData.append('Spot Category', spotCategory || 'Uncategorized');
            
            if (uploadedSpotImageUrl) {
                formData.append('Uploaded Picture (Cloudinary Link)', uploadedSpotImageUrl);
            }
            if (spotImageUrl.trim()) {
                formData.append('Online Image URL', spotImageUrl.trim());
            }

            formData.append('Description & Travel Tips', spotDescription.trim() || 'None provided');

            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setStatus('success');
                setStatusMessage(`Thank you! "${spotName}" has been submitted. Our team will review the details and add it to Explorely!`);
            } else {
                setStatus('error');
                setStatusMessage(data.message || 'Submission error. Please check your connection and try again.');
            }
        } catch (err) {
            console.error('Spot submission error:', err);
            setStatus('error');
            setStatusMessage(err.message || 'Failed to submit. Please check your internet connection.');
        }
    };

    // ==========================================
    // SUBMIT GENERAL FEEDBACK FORM
    // ==========================================
    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setStatusMessage('');

        try {
            let uploadedFeedbackFileUrl = '';

            // Step 1: Upload file if provided
            if (feedbackFile) {
                setStatusStep('Uploading screenshot...');
                uploadedFeedbackFileUrl = await uploadToCloudinary(feedbackFile);
            }

            // Step 2: Send via Web3Forms
            setStatusStep('Sending feedback to Explorely team...');

            const formData = new FormData();
            formData.append('access_key', WEB3FORMS_KEY);
            formData.append('from_name', 'Explorely Traveler Feedback');
            formData.append('replyto', feedbackUserEmail);
            formData.append('to_email', 'pratiksinha198@gmail.com');
            formData.append('name', feedbackUserName);
            formData.append('email', feedbackUserEmail);
            formData.append('subject', `[Explorely Feedback] ${feedbackTopic} from ${feedbackUserName}`);
            formData.append('Request Type', 'User Feedback / Suggestion');
            formData.append('Feedback Topic', feedbackTopic);
            formData.append('Feedback Message', feedbackMessage);

            if (uploadedFeedbackFileUrl) {
                formData.append('Attached Screenshot URL', uploadedFeedbackFileUrl);
            }

            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setStatus('success');
                setStatusMessage('Thank you for your valuable feedback! We appreciate you helping make Explorely better.');
            } else {
                setStatus('error');
                setStatusMessage(data.message || 'Submission error. Please check your connection and try again.');
            }
        } catch (err) {
            console.error('Feedback submission error:', err);
            setStatus('error');
            setStatusMessage(err.message || 'Failed to submit feedback. Please check your internet connection.');
        }
    };

    if (!feedbackModalOpen) return null;

    const isSpotMode = modalMode === 'spot';

    return (
        <div className="feedback-modal-backdrop" onClick={closeFeedbackModal}>
            <div className="feedback-modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
                
                {/* Modal Header */}
                <div className="feedback-modal-header">
                    <div className="feedback-modal-title-box">
                        <div className={`feedback-title-icon-badge ${isSpotMode ? 'spot-badge' : 'feedback-badge'}`}>
                            {/* Authentic travel map pin or message icon (NO AI sparkle icon!) */}
                            {isSpotMode ? <MapPin size={20} /> : <MessageSquare size={20} />}
                        </div>
                        <div>
                            <h3 className="feedback-modal-title">
                                {isSpotMode ? 'Suggest a Place to Add' : 'Send Us Your Feedback'}
                            </h3>
                            <p className="feedback-modal-subtitle">
                                {isSpotMode 
                                    ? "Know a hidden gem or missing destination? Help us expand Explorely!"
                                    : "We'd love to hear your thoughts, ideas, or suggestions."}
                            </p>
                        </div>
                    </div>
                    <button className="feedback-modal-close-btn" onClick={closeFeedbackModal} aria-label="Close modal">
                        <X size={18} />
                    </button>
                </div>

                {/* Modal Body / Forms */}
                <div className="feedback-modal-body">
                    {status === 'success' ? (
                        <div className="feedback-success-state">
                            <div className="success-icon-ring">
                                <CheckCircle2 size={44} className="success-check-icon" />
                            </div>
                            <h4 className="success-title">Submission Received!</h4>
                            <p className="success-message">{statusMessage}</p>
                            <p className="success-email-notice">
                                Sent to <strong>pratiksinha198@gmail.com</strong>
                            </p>
                            <div className="success-actions">
                                <button 
                                    type="button" 
                                    className="feedback-btn-secondary" 
                                    onClick={isSpotMode ? resetSpotForm : resetFeedbackForm}
                                >
                                    <RefreshCw size={14} /> Submit Another
                                </button>
                                <button type="button" className="feedback-btn-primary" onClick={closeFeedbackModal}>
                                    Done
                                </button>
                            </div>
                        </div>
                    ) : isSpotMode ? (
                        /* =========================================================
                           FORM 1: SUGGEST A PLACE TO ADD (COMPLETELY INDEPENDENT)
                           ========================================================= */
                        <form className="feedback-form" onSubmit={handleSpotSubmit}>
                            {status === 'error' && (
                                <div className="feedback-alert error">
                                    <AlertCircle size={16} />
                                    <span>{statusMessage}</span>
                                </div>
                            )}

                            <div className="feedback-form-grid">
                                <div className="feedback-form-group">
                                    <label className="feedback-label">
                                        Spot / Destination Name <span className="req">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="feedback-input"
                                        placeholder="e.g., Jog Falls, Nohkalikai Falls, etc."
                                        value={spotName}
                                        onChange={(e) => setSpotName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="feedback-form-group">
                                    <label className="feedback-label">
                                        Spot Address / Location <span className="req">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="feedback-input"
                                        placeholder="e.g., Shimoga District, Karnataka"
                                        value={spotAddress}
                                        onChange={(e) => setSpotAddress(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="feedback-form-grid">
                                <div className="feedback-form-group">
                                    <label className="feedback-label">Category</label>
                                    <select
                                        className="feedback-select"
                                        value={spotCategory}
                                        onChange={(e) => setSpotCategory(e.target.value)}
                                    >
                                        <option value="">Select a Category</option>
                                        <option value="Temple / Religious">Temple / Religious</option>
                                        <option value="Mountains / Hills">Mountains / Hills</option>
                                        <option value="Beaches">Beaches & Coastal</option>
                                        <option value="Waterfalls & Lakes">Waterfalls & Lakes</option>
                                        <option value="Forts & Palaces">Forts & Palaces</option>
                                        <option value="Adventure / Trekking">Adventure / Trekking</option>
                                        <option value="Wildlife Sanctuaries">Wildlife Sanctuaries</option>
                                        <option value="Hidden Gem">Hidden Scenic Gem</option>
                                        <option value="Historic Monument">Historic Monument</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="feedback-form-group">
                                    <label className="feedback-label">Online Image URL (Optional)</label>
                                    <input
                                        type="url"
                                        className="feedback-input"
                                        placeholder="https://example.com/spot-photo.jpg"
                                        value={spotImageUrl}
                                        onChange={(e) => setSpotImageUrl(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Picture Upload Zone */}
                            <div className="feedback-form-group">
                                <label className="feedback-label">
                                    Upload Spot Picture <span className="feedback-hint">(JPG, PNG, WebP up to 8MB)</span>
                                </label>
                                
                                {!spotImagePreview ? (
                                    <div 
                                        className="feedback-file-dropzone"
                                        onClick={() => spotFileInputRef.current?.click()}
                                    >
                                        <UploadCloud size={26} className="dropzone-icon" />
                                        <div className="dropzone-texts">
                                            <span className="dropzone-primary-text">Click or drag a photo here</span>
                                            <span className="dropzone-sub-text">Attach an authentic picture of the destination</span>
                                        </div>
                                        <input
                                            ref={spotFileInputRef}
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={handleSpotFileChange}
                                        />
                                    </div>
                                ) : (
                                    <div className="feedback-preview-container">
                                        <div className="feedback-preview-img-box">
                                            <img src={spotImagePreview} alt="Spot Preview" className="feedback-preview-img" />
                                        </div>
                                        <div className="feedback-preview-details">
                                            <div className="preview-filename">{spotImageFile?.name}</div>
                                            <div className="preview-filesize">
                                                {(spotImageFile?.size ? (spotImageFile.size / 1024).toFixed(1) + ' KB' : '')}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="feedback-remove-file-btn"
                                            onClick={handleRemoveSpotImage}
                                            title="Remove picture"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Spot Description */}
                            <div className="feedback-form-group">
                                <label className="feedback-label">
                                    Description & Travel Tips <span className="feedback-hint">(Optional)</span>
                                </label>
                                <textarea
                                    className="feedback-textarea"
                                    rows={2}
                                    placeholder="What makes this place special? Best season to visit, entry fees, or hidden spots nearby..."
                                    value={spotDescription}
                                    onChange={(e) => setSpotDescription(e.target.value)}
                                />
                            </div>

                            {/* User Name & Email */}
                            <div className="feedback-form-grid user-info-row">
                                <div className="feedback-form-group">
                                    <label className="feedback-label">
                                        Your Name <span className="req">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="feedback-input"
                                        placeholder="Enter your name"
                                        value={spotUserName}
                                        onChange={(e) => setSpotUserName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="feedback-form-group">
                                    <label className="feedback-label">
                                        Your Email <span className="req">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        className="feedback-input"
                                        placeholder="your.email@example.com"
                                        value={spotUserEmail}
                                        onChange={(e) => setSpotUserEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Footer Submit */}
                            <div className="feedback-form-footer">
                                <span className="feedback-footer-note">
                                    Submissions are sent directly to the Explorely curator team.
                                </span>
                                <div className="feedback-btn-group">
                                    <button
                                        type="button"
                                        className="feedback-btn-secondary"
                                        onClick={closeFeedbackModal}
                                        disabled={status === 'loading'}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="feedback-btn-primary"
                                        disabled={status === 'loading'}
                                    >
                                        {status === 'loading' ? (
                                            <>
                                                <div className="feedback-btn-spinner" />
                                                <span>{statusStep || 'Submitting...'}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Submit Spot</span>
                                                <Send size={15} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    ) : (
                        /* =========================================================
                           FORM 2: GENERAL FEEDBACK (COMPLETELY INDEPENDENT)
                           ========================================================= */
                        <form className="feedback-form" onSubmit={handleFeedbackSubmit}>
                            {status === 'error' && (
                                <div className="feedback-alert error">
                                    <AlertCircle size={16} />
                                    <span>{statusMessage}</span>
                                </div>
                            )}

                            <div className="feedback-form-group">
                                <label className="feedback-label">Feedback Topic</label>
                                <select
                                    className="feedback-select"
                                    value={feedbackTopic}
                                    onChange={(e) => setFeedbackTopic(e.target.value)}
                                >
                                    <option value="General Feedback">💡 General Feedback</option>
                                    <option value="Feature Idea">🚀 Feature Idea / Request</option>
                                    <option value="Spot Info Correction">✏️ Spot Information Correction</option>
                                    <option value="Report an Issue">⚠️ Bug / Technical Issue</option>
                                    <option value="Partnership / Inquiry">🤝 Partnership / Inquiry</option>
                                </select>
                            </div>

                            <div className="feedback-form-group">
                                <label className="feedback-label">
                                    Your Message <span className="req">*</span>
                                </label>
                                <textarea
                                    className="feedback-textarea"
                                    rows={4}
                                    placeholder="Share your experience, suggest an improvement, or report any discrepancies..."
                                    value={feedbackMessage}
                                    onChange={(e) => setFeedbackMessage(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Optional attachment */}
                            <div className="feedback-form-group">
                                <label className="feedback-label">
                                    Attach Screenshot / Photo <span className="feedback-hint">(Optional)</span>
                                </label>
                                {!feedbackFilePreview ? (
                                    <div 
                                        className="feedback-file-dropzone compact"
                                        onClick={() => feedbackFileInputRef.current?.click()}
                                    >
                                        <ImageIcon size={20} className="dropzone-icon" />
                                        <span className="dropzone-primary-text">Click to attach screenshot or image</span>
                                        <input
                                            ref={feedbackFileInputRef}
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={handleFeedbackFileChange}
                                        />
                                    </div>
                                ) : (
                                    <div className="feedback-preview-container">
                                        <div className="feedback-preview-img-box">
                                            <img src={feedbackFilePreview} alt="Screenshot preview" className="feedback-preview-img" />
                                        </div>
                                        <div className="feedback-preview-details">
                                            <div className="preview-filename">{feedbackFile?.name}</div>
                                        </div>
                                        <button
                                            type="button"
                                            className="feedback-remove-file-btn"
                                            onClick={handleRemoveFeedbackFile}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Feedback User Name & Email */}
                            <div className="feedback-form-grid user-info-row">
                                <div className="feedback-form-group">
                                    <label className="feedback-label">
                                        Your Name <span className="req">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="feedback-input"
                                        placeholder="Enter your name"
                                        value={feedbackUserName}
                                        onChange={(e) => setFeedbackUserName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="feedback-form-group">
                                    <label className="feedback-label">
                                        Your Email <span className="req">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        className="feedback-input"
                                        placeholder="your.email@example.com"
                                        value={feedbackUserEmail}
                                        onChange={(e) => setFeedbackUserEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Feedback Footer Submit */}
                            <div className="feedback-form-footer">
                                <span className="feedback-footer-note">
                                    Feedback is sent directly to the Explorely curator team.
                                </span>
                                <div className="feedback-btn-group">
                                    <button
                                        type="button"
                                        className="feedback-btn-secondary"
                                        onClick={closeFeedbackModal}
                                        disabled={status === 'loading'}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="feedback-btn-primary"
                                        disabled={status === 'loading'}
                                    >
                                        {status === 'loading' ? (
                                            <>
                                                <div className="feedback-btn-spinner" />
                                                <span>{statusStep || 'Sending...'}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Send Feedback</span>
                                                <Send size={15} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
