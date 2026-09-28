import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, ShieldCheck } from 'lucide-react';
import ReCAPTCHA from "react-google-recaptcha";
import { useLanguage } from '../../context/LanguageContext';
import { RECAPTCHA_SITE_KEY } from '../../lib/recaptcha';
import "./Contact.css";

const Contact = () => {
    const { t } = useLanguage();
    const [captchaToken, setCaptchaToken] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!captchaToken) return;
        
        setIsSubmitting(true);
        
        const formData = new FormData(e.target);
        const name = formData.get('name');
        const email = formData.get('email');
        const subject = formData.get('subject');
        const message = formData.get('message');

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, subject, message }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || t('contact', 'errorMsg'));

            await fetch('https://formspree.io/f/sdialfakhir@gmail.com', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            alert(t('contact', 'successMsg'));
            e.target.reset();
            setCaptchaToken(null);
        } catch (error) {
            console.error('Submit error:', error);
            alert(t('contact', 'errorMsg'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="contact" className="contact-section">
            <div className="container">
                <div className="contact-header">
                    <span className="contact-small-title">
                        {t('contact', 'smallTitle')}
                    </span>
                    <h2 className="section-title">{t('contact', 'title')}</h2>
                    <p className="contact-desc">{t('contact', 'desc')}</p>
                </div>
                
                <div className="contact-grid">
                    <div className="contact-info-card">
                        <div className="info-item">
                            <div className="icon-box primary">
                                <MapPin size={28} />
                            </div>
                            <div className="info-content">
                                <h4>{t('contact', 'locTitle')}</h4>
                                <p>{t('contact', 'locDesc')}</p>
                            </div>
                        </div>
                        
                        <div className="info-item">
                            <div className="icon-box accent">
                                <Phone size={28} />
                            </div>
                            <div className="info-content">
                                <h4>{t('contact', 'phoneTitle')}</h4>
                                <p>+62 813-9526-221</p>
                            </div>
                        </div>
                        
                        <div className="info-item">
                            <div className="icon-box primary">
                                <Mail size={28} />
                            </div>
                            <div className="info-content">
                                <h4>{t('contact', 'emailTitle')}</h4>
                                <p>sdialfakhir@gmail.com</p>
                            </div>
                        </div>
                    </div>
                
                    <form onSubmit={handleSubmit} className="contact-form">
                        <div className="form-row">
                            <input name="name" className="form-input" type="text" placeholder={t('contact', 'placeholderName')} aria-label={t('contact', 'placeholderName')} required />
                            <input name="email" className="form-input" type="email" placeholder={t('contact', 'placeholderEmail')} aria-label={t('contact', 'placeholderEmail')} required />
                        </div>
                        <input name="subject" className="form-input" type="text" placeholder={t('contact', 'placeholderSubj')} aria-label={t('contact', 'placeholderSubj')} />
                        <textarea name="message" className="form-input form-textarea" placeholder={t('contact', 'placeholderMsg')} aria-label={t('contact', 'placeholderMsg')} required></textarea>
                        
                        <div className="security-panel">
                            <div className="security-label">
                                <ShieldCheck size={16} /> SECURITY VERIFICATION
                            </div>
                            <ReCAPTCHA
                                sitekey={RECAPTCHA_SITE_KEY}
                                onChange={(token) => setCaptchaToken(token)}
                            />
                        </div>

                        <button 
                            className="send-button" 
                            disabled={!captchaToken || isSubmitting}
                        >
                            {isSubmitting ? 'SENDING...' : t('contact', 'btnSend')} <Send size={20} />
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Contact;
