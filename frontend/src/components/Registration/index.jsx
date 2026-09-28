"use client";
import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Users2, ArrowRight, MapPin, CreditCard, School, ChevronRight, ChevronLeft, CheckCircle2, Upload, AlertCircle, ShieldCheck } from 'lucide-react'
import ReCAPTCHA from "react-google-recaptcha";
import { useLanguage } from '../../context/LanguageContext';
import { RECAPTCHA_SITE_KEY } from '../../lib/recaptcha';
import "./Registration.css";

const getAutoYear = () => {
    const now = new Date();
    const startYear = now.getMonth() >= 9 ? now.getFullYear() + 1 : now.getFullYear();
    return `${startYear}/${startYear + 1}`;
};

const emptyFormData = () => ({
    // Biodata calon peserta didik
    name: '', gender: 'Laki-laki', birthPlace: '', birthDate: '', nik: '', nisn: '',
    religion: '', kip: '', childOrder: '', siblingOf: '', siblingsCount: '',
    dailyLanguage: '', height: '', weight: '', studentPhone: '',
    // Sekolah asal
    schoolName: '', schoolAddress: '', schoolNpsn: '', graduationYear: '',
    // Domisili
    address: '', city: '', province: '', zipCode: '',
    // Wali (kontak utama admin)
    parentName: '', whatsapp: '', parentPhone: '', parentJob: '', parentIncome: '',
    // Data ayah & ibu kandung
    nikAyah: '', fatherName: '', fatherBirthInfo: '', fatherEducation: '', fatherJob: '',
    fatherIncome: '', fatherPhone: '', fatherStatus: '',
    nikIbu: '', motherName: '', motherBirthInfo: '', motherEducation: '', motherJob: '',
    motherIncome: '', motherPhone: '', motherStatus: '',
    paymentMethod: 'Transfer Bank (BRI/BSI/BCA)',
    year: getAutoYear(), wave: '1',
});

const RegistrationForm = ({ onSuccess }) => {
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [captchaToken, setCaptchaToken] = useState(null);
    const [errors, setErrors] = useState({});
    const fileInputRef = useRef(null);
    const captchaRef = useRef(null);

    const getInitialData = () => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('alfakhir_registration_draft');
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    console.error("Failed to parse saved draft", e);
                }
            }
        }
        return emptyFormData();
    };

    const [formData, setFormData] = useState(emptyFormData);

    useEffect(() => {
        const initial = getInitialData();
        setFormData(initial);
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('alfakhir_registration_draft', JSON.stringify(formData));
        }
    }, [formData]);

    const totalSteps = 6;

    const validateStep = () => {
        let newErrors = {};
        if (step === 1) {
            if (!formData.name) newErrors.name = t('reg', 'form.errors.name');
            if (!formData.nik || formData.nik.length !== 16) newErrors.nik = t('reg', 'form.errors.nik');
            if (!formData.birthDate) newErrors.birthDate = t('reg', 'form.errors.birthDate');
        } else if (step === 4) {
            if (!formData.address) newErrors.address = t('reg', 'form.errors.address');
        } else if (step === 5) {
            if (!formData.parentName) newErrors.parentName = t('reg', 'form.errors.parentName');
            if (!formData.whatsapp || formData.whatsapp.length < 10) newErrors.whatsapp = t('reg', 'form.errors.whatsapp');
        } else if (step === 6) {
            if (!selectedFile) newErrors.paymentProof = t('reg', 'form.errors.paymentProof');
            if (!captchaToken) newErrors.captcha = t('reg', 'form.errors.captcha');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep()) {
            setStep(prev => Math.min(prev + 1, totalSteps));
            window.scrollTo({ top: 300, behavior: 'smooth' });
        }
    };
    
    const prevStep = () => {
        setStep(prev => Math.max(prev - 1, 1));
        setErrors({});
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert(t('reg', 'form.errors.fileSize'));
                return;
            }
            setSelectedFile(file);
            setErrors(prev => ({ ...prev, paymentProof: null }));
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep()) return;

        setIsLoading(true);
        try {
            // Registration record (Sanity), payment proof (Drive), and the
            // selection spreadsheet row are all created server-side in one
            // call — the browser never touches a Sanity write token.
            const extForm = new FormData();
            Object.entries(formData).forEach(([key, value]) => extForm.append(key, value ?? ''));
            extForm.append('registrationType', 'formulir');
            if (selectedFile) extForm.append('paymentProof', selectedFile);

            const res = await fetch('/api/register-external', { method: 'POST', body: extForm });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || t('reg', 'form.errors.submitFailed'));

            localStorage.removeItem('alfakhir_registration_draft');
            onSuccess({ ...formData, id: data.studentId });
        } catch (err) {
            console.error(err);
            alert('Error: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let finalValue = value;

        const numericFields = ['nik', 'nikAyah', 'nikIbu', 'whatsapp', 'parentPhone', 'nisn', 'schoolNpsn', 'zipCode', 'studentPhone', 'fatherPhone', 'motherPhone', 'childOrder', 'siblingOf', 'siblingsCount', 'height', 'weight', 'graduationYear'];
        if (numericFields.includes(name)) {
            finalValue = value.replace(/\D/g, '');
            if (['nik', 'nikAyah', 'nikIbu'].includes(name)) finalValue = finalValue.slice(0, 16);
            if (['whatsapp', 'parentPhone', 'studentPhone', 'fatherPhone', 'motherPhone'].includes(name)) finalValue = finalValue.slice(0, 14);
            if (name === 'nisn') finalValue = finalValue.slice(0, 10);
            if (name === 'schoolNpsn') finalValue = finalValue.slice(0, 8);
            if (name === 'zipCode') finalValue = finalValue.slice(0, 5);
            if (name === 'graduationYear') finalValue = finalValue.slice(0, 4);
        }

        const alphabetFields = ['name', 'parentName', 'birthPlace', 'city', 'province', 'parentJob', 'religion', 'dailyLanguage', 'fatherName', 'motherName', 'fatherJob', 'motherJob'];
        if (alphabetFields.includes(name)) {
            finalValue = value.replace(/[^a-zA-Z\s'.,]/g, '');
        }

        setFormData(prev => ({ ...prev, [name]: finalValue }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const progressWidth = (step / totalSteps) * 100;

    return (
        <div className="registration-container">
            <div className="registration-progress-header">
                <div className="progress-info">
                    <span className="progress-label">
                        {t('reg', 'form.stepOf').replace('{curr}', step).replace('{total}', totalSteps)}
                    </span>
                    <span className="progress-label">
                        {t('reg', 'form.complete').replace('{val}', Math.round(progressWidth))}
                    </span>
                </div>
                <div className="progress-track">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressWidth}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="progress-bar"
                    />
                </div>
                <p className="save-note">{t('reg', 'form.saveNote')}</p>
            </div>

            <div className="step-header">
                <div className="step-icon-frame">
                    <FileText size={22} />
                </div>
                <h2 className="step-title">
                    {step === 1 && t('reg', 'form.step1')}
                    {step === 2 && t('reg', 'form.step2')}
                    {step === 3 && t('reg', 'form.step3')}
                    {step === 4 && t('reg', 'form.step4')}
                    {step === 5 && t('reg', 'form.step5')}
                    {step === 6 && t('reg', 'form.step6')}
                </h2>
            </div>

            <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.8 }}>
                            <div className="form-stack">
                                <div>
                                    <label htmlFor="name-input" className="form-label">{t('reg', 'form.labelName')} <span className="required-star">*</span></label>
                                    <input id="name-input" name="name" className={`form-input-primary ${errors.name ? 'error' : ''}`} onChange={handleChange} value={formData.name} type="text" placeholder={t('reg', 'form.placeholders.name')} />
                                    {errors.name && <p className="error-text">{errors.name}</p>}
                                </div>
                                <div className="form-grid-2">
                                    <div>
                                        <label htmlFor="nik-input" className="form-label">{t('reg', 'form.labelNik')} <span className="required-star">*</span></label>
                                        <input id="nik-input" name="nik" className={`form-input-primary ${errors.nik ? 'error' : ''}`} onChange={handleChange} value={formData.nik} type="text" placeholder={t('reg', 'form.placeholders.nik')} />
                                        {errors.nik && <p className="error-text">{errors.nik}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="nisn-input" className="form-label">{t('reg', 'form.labelNisn')}</label>
                                        <input id="nisn-input" name="nisn" className="form-input-primary" onChange={handleChange} value={formData.nisn} type="text" placeholder={t('reg', 'form.placeholders.nisn')} />
                                    </div>
                                </div>
                                <div className="form-grid-2">
                                    <div>
                                        <label htmlFor="birthPlace-input" className="form-label">{t('reg', 'form.labelBirthPlace')}</label>
                                        <input id="birthPlace-input" name="birthPlace" className="form-input-primary" onChange={handleChange} value={formData.birthPlace} type="text" placeholder={t('reg', 'form.placeholders.birthPlace')} />
                                    </div>
                                    <div>
                                        <label htmlFor="birthDate-input" className="form-label">{t('reg', 'form.labelBirthDate')} <span className="required-star">*</span></label>
                                        <input id="birthDate-input" name="birthDate" className={`form-input-primary ${errors.birthDate ? 'error' : ''}`} onChange={handleChange} value={formData.birthDate} type="date" />
                                        {errors.birthDate && <p className="error-text">{errors.birthDate}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="gender-input" className="form-label">{t('reg', 'form.labelGender')}</label>
                                    <select id="gender-input" name="gender" className="form-input-primary" onChange={handleChange} value={formData.gender} aria-label={t('reg', 'form.labelGender')}>
                                        <option value="Laki-laki">{t('reg', 'form.labelMale')}</option>
                                        <option value="Perempuan">{t('reg', 'form.labelFemale')}</option>
                                    </select>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.8 }}>
                            <div className="form-stack">
                                <div className="form-grid-2">
                                    <div>
                                        <label htmlFor="religion-input" className="form-label">{t('reg', 'form.labelReligion')}</label>
                                        <input id="religion-input" name="religion" className="form-input-primary" onChange={handleChange} value={formData.religion} type="text" placeholder={t('reg', 'form.placeholders.religion')} />
                                    </div>
                                    <div>
                                        <label htmlFor="kip-input" className="form-label">{t('reg', 'form.labelKip')}</label>
                                        <input id="kip-input" name="kip" className="form-input-primary" onChange={handleChange} value={formData.kip} type="text" placeholder={t('reg', 'form.placeholders.kip')} />
                                    </div>
                                </div>
                                <div className="form-grid-2">
                                    <div>
                                        <label htmlFor="childOrder-input" className="form-label">{t('reg', 'form.labelChildOrder')}</label>
                                        <input id="childOrder-input" name="childOrder" className="form-input-primary" onChange={handleChange} value={formData.childOrder} type="text" inputMode="numeric" placeholder={t('reg', 'form.placeholders.childOrder')} />
                                    </div>
                                    <div>
                                        <label htmlFor="siblingOf-input" className="form-label">{t('reg', 'form.labelSiblingOf')}</label>
                                        <input id="siblingOf-input" name="siblingOf" className="form-input-primary" onChange={handleChange} value={formData.siblingOf} type="text" inputMode="numeric" placeholder={t('reg', 'form.placeholders.siblingOf')} />
                                    </div>
                                </div>
                                <div className="form-grid-2">
                                    <div>
                                        <label htmlFor="siblingsCount-input" className="form-label">{t('reg', 'form.labelSiblingsCount')}</label>
                                        <input id="siblingsCount-input" name="siblingsCount" className="form-input-primary" onChange={handleChange} value={formData.siblingsCount} type="text" inputMode="numeric" />
                                    </div>
                                    <div>
                                        <label htmlFor="dailyLanguage-input" className="form-label">{t('reg', 'form.labelDailyLanguage')}</label>
                                        <input id="dailyLanguage-input" name="dailyLanguage" className="form-input-primary" onChange={handleChange} value={formData.dailyLanguage} type="text" placeholder={t('reg', 'form.placeholders.dailyLanguage')} />
                                    </div>
                                </div>
                                <div className="form-grid-2">
                                    <div>
                                        <label htmlFor="height-input" className="form-label">{t('reg', 'form.labelHeight')}</label>
                                        <input id="height-input" name="height" className="form-input-primary" onChange={handleChange} value={formData.height} type="text" inputMode="numeric" placeholder={t('reg', 'form.placeholders.height')} />
                                    </div>
                                    <div>
                                        <label htmlFor="weight-input" className="form-label">{t('reg', 'form.labelWeight')}</label>
                                        <input id="weight-input" name="weight" className="form-input-primary" onChange={handleChange} value={formData.weight} type="text" inputMode="numeric" placeholder={t('reg', 'form.placeholders.weight')} />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="studentPhone-input" className="form-label">{t('reg', 'form.labelStudentPhone')}</label>
                                    <input id="studentPhone-input" name="studentPhone" className="form-input-primary" onChange={handleChange} value={formData.studentPhone} type="tel" placeholder={t('reg', 'form.placeholders.studentPhone')} />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.8 }}>
                            <div className="form-stack">
                                <div>
                                    <label htmlFor="schoolName-input" className="form-label">{t('reg', 'form.labelPrevSchool')}</label>
                                    <input id="schoolName-input" name="schoolName" className="form-input-primary" onChange={handleChange} value={formData.schoolName} type="text" placeholder={t('reg', 'form.placeholders.schoolName')} />
                                </div>
                                <div>
                                    <label htmlFor="schoolAddress-input" className="form-label">{t('reg', 'form.labelSchoolLoc')}</label>
                                    <input id="schoolAddress-input" name="schoolAddress" className="form-input-primary" onChange={handleChange} value={formData.schoolAddress} type="text" placeholder={t('reg', 'form.placeholders.schoolLoc')} />
                                </div>
                                <div className="form-grid-2">
                                    <div>
                                        <label htmlFor="schoolNpsn-input" className="form-label">{t('reg', 'form.labelNpsn')}</label>
                                        <input id="schoolNpsn-input" name="schoolNpsn" className="form-input-primary" onChange={handleChange} value={formData.schoolNpsn} type="text" placeholder={t('reg', 'form.placeholders.npsn')} />
                                    </div>
                                    <div>
                                        <label htmlFor="graduationYear-input" className="form-label">{t('reg', 'form.labelGraduationYear')}</label>
                                        <input id="graduationYear-input" name="graduationYear" className="form-input-primary" onChange={handleChange} value={formData.graduationYear} type="text" inputMode="numeric" placeholder={t('reg', 'form.placeholders.graduationYear')} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div key="step4" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.8 }}>
                            <div className="form-stack">
                                <div>
                                    <label htmlFor="address-input" className="form-label">{t('reg', 'form.labelAddress')} <span className="required-star">*</span></label>
                                    <textarea id="address-input" name="address" className={`form-input-primary form-textarea ${errors.address ? 'error' : ''}`} onChange={handleChange} value={formData.address} rows="3" placeholder={t('reg', 'form.placeholders.address')}></textarea>
                                    {errors.address && <p className="error-text">{errors.address}</p>}
                                </div>
                                <div className="form-grid-2">
                                    <div>
                                        <label htmlFor="city-input" className="form-label">{t('reg', 'form.labelCity')}</label>
                                        <input id="city-input" name="city" className="form-input-primary" onChange={handleChange} value={formData.city} type="text" placeholder={t('reg', 'form.placeholders.city')} />
                                    </div>
                                    <div>
                                        <label htmlFor="province-input" className="form-label">{t('reg', 'form.labelProvince')}</label>
                                        <input id="province-input" name="province" className="form-input-primary" onChange={handleChange} value={formData.province} type="text" placeholder={t('reg', 'form.placeholders.province')} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 5 && (
                        <motion.div key="step5" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.8 }}>
                            <div className="form-stack">
                                <div>
                                    <label htmlFor="parentName-input" className="form-label">{t('reg', 'form.labelParentName')} <span className="required-star">*</span></label>
                                    <input id="parentName-input" name="parentName" className={`form-input-primary ${errors.parentName ? 'error' : ''}`} onChange={handleChange} value={formData.parentName} type="text" placeholder={t('reg', 'form.placeholders.parentName')} />
                                    {errors.parentName && <p className="error-text">{errors.parentName}</p>}
                                </div>
                                <div>
                                    <label htmlFor="whatsapp-input" className="form-label">{t('reg', 'form.labelWhatsapp')} <span className="required-star">*</span></label>
                                    <input id="whatsapp-input" name="whatsapp" className={`form-input-primary ${errors.whatsapp ? 'error' : ''}`} onChange={handleChange} value={formData.whatsapp} type="tel" placeholder={t('reg', 'form.placeholders.whatsapp')} />
                                    {errors.whatsapp && <p className="error-text">{errors.whatsapp}</p>}
                                </div>

                                <h4 className="form-section-title">{t('reg', 'form.labelFatherSection')}</h4>
                                <div className="form-grid-2">
                                    <div>
                                        <label htmlFor="fatherName-input" className="form-label">{t('reg', 'form.labelFullName')}</label>
                                        <input id="fatherName-input" name="fatherName" className="form-input-primary" onChange={handleChange} value={formData.fatherName} type="text" placeholder={t('reg', 'form.placeholders.fullName')} />
                                    </div>
                                    <div>
                                        <label htmlFor="nikAyah-input" className="form-label">{t('reg', 'form.labelNikFather')}</label>
                                        <input id="nikAyah-input" name="nikAyah" className="form-input-primary" onChange={handleChange} value={formData.nikAyah} type="text" placeholder={t('reg', 'form.placeholders.nik')} />
                                    </div>
                                </div>
                                <div className="form-grid-2">
                                    <div>
                                        <label htmlFor="fatherBirthInfo-input" className="form-label">{t('reg', 'form.labelBirthInfo')}</label>
                                        <input id="fatherBirthInfo-input" name="fatherBirthInfo" className="form-input-primary" onChange={handleChange} value={formData.fatherBirthInfo} type="text" placeholder={t('reg', 'form.placeholders.birthInfo')} />
                                    </div>
                                    <div>
                                        <label htmlFor="fatherEducation-input" className="form-label">{t('reg', 'form.labelEducation')}</label>
                                        <input id="fatherEducation-input" name="fatherEducation" className="form-input-primary" onChange={handleChange} value={formData.fatherEducation} type="text" placeholder={t('reg', 'form.placeholders.education')} />
                                    </div>
                                </div>
                                <div className="form-grid-2">
                                    <div>
                                        <label htmlFor="fatherJob-input" className="form-label">{t('reg', 'form.labelOccupation')}</label>
                                        <input id="fatherJob-input" name="fatherJob" className="form-input-primary" onChange={handleChange} value={formData.fatherJob} type="text" placeholder={t('reg', 'form.placeholders.job')} />
                                    </div>
                                    <div>
                                        <label htmlFor="fatherIncome-input" className="form-label">{t('reg', 'form.labelIncome')}</label>
                                        <input id="fatherIncome-input" name="fatherIncome" className="form-input-primary" onChange={handleChange} value={formData.fatherIncome} type="text" placeholder={t('reg', 'form.placeholders.income')} />
                                    </div>
                                </div>
                                <div className="form-grid-2">
                                    <div>
                                        <label htmlFor="fatherPhone-input" className="form-label">{t('reg', 'form.labelPhone')}</label>
                                        <input id="fatherPhone-input" name="fatherPhone" className="form-input-primary" onChange={handleChange} value={formData.fatherPhone} type="tel" placeholder={t('reg', 'form.placeholders.phone')} />
                                    </div>
                                    <div>
                                        <label htmlFor="fatherStatus-input" className="form-label">{t('reg', 'form.labelLifeStatus')}</label>
                                        <input id="fatherStatus-input" name="fatherStatus" className="form-input-primary" onChange={handleChange} value={formData.fatherStatus} type="text" placeholder={t('reg', 'form.optAlive')} />
                                    </div>
                                </div>

                                <h4 className="form-section-title">{t('reg', 'form.labelMotherSection')}</h4>
                                <div className="form-grid-2">
                                    <div>
                                        <label htmlFor="motherName-input" className="form-label">{t('reg', 'form.labelFullName')}</label>
                                        <input id="motherName-input" name="motherName" className="form-input-primary" onChange={handleChange} value={formData.motherName} type="text" placeholder={t('reg', 'form.placeholders.fullName')} />
                                    </div>
                                    <div>
                                        <label htmlFor="nikIbu-input" className="form-label">{t('reg', 'form.labelNikMother')}</label>
                                        <input id="nikIbu-input" name="nikIbu" className="form-input-primary" onChange={handleChange} value={formData.nikIbu} type="text" placeholder={t('reg', 'form.placeholders.nik')} />
                                    </div>
                                </div>
                                <div className="form-grid-2">
                                    <div>
                                        <label htmlFor="motherBirthInfo-input" className="form-label">{t('reg', 'form.labelBirthInfo')}</label>
                                        <input id="motherBirthInfo-input" name="motherBirthInfo" className="form-input-primary" onChange={handleChange} value={formData.motherBirthInfo} type="text" placeholder={t('reg', 'form.placeholders.birthInfo')} />
                                    </div>
                                    <div>
                                        <label htmlFor="motherEducation-input" className="form-label">{t('reg', 'form.labelEducation')}</label>
                                        <input id="motherEducation-input" name="motherEducation" className="form-input-primary" onChange={handleChange} value={formData.motherEducation} type="text" placeholder={t('reg', 'form.placeholders.education')} />
                                    </div>
                                </div>
                                <div className="form-grid-2">
                                    <div>
                                        <label htmlFor="motherJob-input" className="form-label">{t('reg', 'form.labelOccupation')}</label>
                                        <input id="motherJob-input" name="motherJob" className="form-input-primary" onChange={handleChange} value={formData.motherJob} type="text" placeholder={t('reg', 'form.placeholders.job')} />
                                    </div>
                                    <div>
                                        <label htmlFor="motherIncome-input" className="form-label">{t('reg', 'form.labelIncome')}</label>
                                        <input id="motherIncome-input" name="motherIncome" className="form-input-primary" onChange={handleChange} value={formData.motherIncome} type="text" placeholder={t('reg', 'form.placeholders.income')} />
                                    </div>
                                </div>
                                <div className="form-grid-2">
                                    <div>
                                        <label htmlFor="motherPhone-input" className="form-label">{t('reg', 'form.labelPhone')}</label>
                                        <input id="motherPhone-input" name="motherPhone" className="form-input-primary" onChange={handleChange} value={formData.motherPhone} type="tel" placeholder={t('reg', 'form.placeholders.phone')} />
                                    </div>
                                    <div>
                                        <label htmlFor="motherStatus-input" className="form-label">{t('reg', 'form.labelLifeStatus')}</label>
                                        <input id="motherStatus-input" name="motherStatus" className="form-input-primary" onChange={handleChange} value={formData.motherStatus} type="text" placeholder={t('reg', 'form.optAlive')} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 6 && (
                        <motion.div key="step6" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.8 }}>
                            <div className="form-stack">
                                <div>
                                    <label className="form-label">{t('reg', 'form.labelFeeSettlement')}</label>
                                    <div className="payment-info-box">
                                        <div className="acc-label">
                                            {t('reg', 'form.labelAccNo')}
                                        </div>
                                        <div className="acc-number">
                                            BSI 7344437836
                                        </div>
                                        <div className="acc-name">
                                            Sdit Al Fakhir
                                        </div>
                                    </div>
                                </div>

                                <div onClick={() => fileInputRef.current.click()} className={`upload-dropzone ${errors.paymentProof ? 'has-error' : ''}`}>
                                    <input id="paymentProof-input" type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} style={{ display: 'none' }} aria-label={t('reg', 'form.labelUploadProof')} />
                                    {!selectedFile ? (
                                        <div>
                                            <div className="upload-icon-circle">
                                                <Upload size={24} />
                                            </div>
                                            <label htmlFor="paymentProof-input" style={{ cursor: 'pointer', textAlign: 'center' }}>
                                                <p className="upload-label-main">{t('reg', 'form.labelUploadProof')} <span className="required-star">*</span></p>
                                                <p style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'none', letterSpacing: 'normal' }}>{t('reg', 'form.labelLimit')}</p>
                                            </label>
                                        </div>
                                    ) : (
                                        <div style={{ position: 'relative' }}>
                                            {previewUrl && <img src={previewUrl} alt="Review" className="preview-img" />}
                                            <p style={{ fontWeight: 700, color: '#059669', fontSize: '0.85rem' }}>{selectedFile.name}</p>
                                            <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setPreviewUrl(null); }} className="change-file-btn">{t('reg', 'form.labelBtnChange')}</button>
                                        </div>
                                    )}
                                    {errors.paymentProof && <p className="error-text" style={{ marginTop: '15px' }}>{errors.paymentProof}</p>}
                                </div>

                                <div className={`security-card ${errors.captcha ? 'has-error' : ''}`}>
                                    <label className="form-label">{t('reg', 'form.labelSecurity')}</label>
                                    <ReCAPTCHA ref={captchaRef} sitekey={RECAPTCHA_SITE_KEY} onChange={(token) => { setCaptchaToken(token); setErrors(prev => ({ ...prev, captcha: null })); }} />
                                    {errors.captcha && <p className="error-text">{errors.captcha}</p>}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="reg-action-row">
                    {step > 1 && (
                        <motion.button whileHover={{ y: -2 }} type="button" onClick={prevStep} className="btn-prev">
                            <ChevronLeft size={18} /> {t('reg', 'form.btnPrev')}
                        </motion.button>
                    )}
                    {step < totalSteps ? (
                        <motion.button whileHover={{ y: -2 }} type="button" onClick={nextStep} className="btn-next">
                            {t('reg', 'form.btnNext')} <ChevronRight size={18} />
                        </motion.button>
                    ) : (
                        <motion.button whileHover={{ scale: 1.02 }} type="submit" disabled={isLoading} className="btn-finish">
                            {isLoading ? t('reg', 'form.btnLoading') : t('reg', 'form.btnFinish')} <ShieldCheck size={20} />
                        </motion.button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default RegistrationForm;
