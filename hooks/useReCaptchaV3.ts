"use client";

import firebaseApp from '@/firebase/init';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { useEffect, useRef } from 'react'

const useReCaptchaV3 = () => {
    const initialized = useRef(false);

    useEffect(() => {
        // Only initialize on client side
        if (typeof window === 'undefined') return;

        // Prevent duplicate initialization
        if (initialized.current) return;

        const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_V3;

        if (!recaptchaKey) {
            console.warn('ReCAPTCHA v3 site key is not set. Please set NEXT_PUBLIC_RECAPTCHA_V3 environment variable.');
            return;
        }

        try {
            // Pass your reCAPTCHA v3 site key (public key) to activate(). Make sure this
            // key is the counterpart to the secret key you set in the Firebase console.
            initializeAppCheck(firebaseApp, {
                provider: new ReCaptchaV3Provider(recaptchaKey),

                // Optional argument. If true, the SDK automatically refreshes App Check
                // tokens as needed.
                isTokenAutoRefreshEnabled: true
            });
            initialized.current = true;
            console.log('✅ App Check with ReCAPTCHA v3 initialized successfully');
        } catch (error) {
            // If App Check is already initialized, this will throw an error
            // which is fine - we just want to prevent duplicate initialization
            if (error instanceof Error && error.message.includes('already initialized')) {
                initialized.current = true;
                console.log('ℹ️ App Check already initialized');
            } else {
                console.error('❌ Error initializing App Check with ReCAPTCHA v3:', error);
            }
        }
    }, []);
}

export default useReCaptchaV3