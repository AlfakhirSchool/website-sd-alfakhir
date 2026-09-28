export const RECAPTCHA_SITE_KEY =
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ||
    process.env.VITE_RECAPTCHA_SITE_KEY ||
    (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_RECAPTCHA_SITE_KEY : null) ||
    "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";
