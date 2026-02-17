import { useState, useEffect } from 'react';

interface UseBeehiivSubscriptionProps {
    publicationId?: string;
    enableDebugLogging?: boolean;
}

interface UseBeehiivSubscriptionReturn {
    email: string;
    setEmail: (email: string) => void;
    isLoading: boolean;
    isSuccess: boolean;
    error: string;
    subscribe: (email: string) => Promise<void>;
    resetSuccess: () => void;
    validateEmail: (email: string) => boolean;
}

export const useBeehiivSubscription = ({
    publicationId = process.env.NEXT_PUBLIC_BEEHIIV_PUBLICATION_ID,
    enableDebugLogging = false
}: UseBeehiivSubscriptionProps = {}): UseBeehiivSubscriptionReturn => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    // Debug logging on hook initialization
    useEffect(() => {
        if (enableDebugLogging) {
            console.log('🔧 useBeehiivSubscription hook initialized');
            console.log('🔧 Environment variables check:');
            console.log('  - NEXT_PUBLIC_BEEHIIV_PUBLICATION_ID:', process.env.NEXT_PUBLIC_BEEHIIV_PUBLICATION_ID);
            console.log('🔧 Resolved publication ID:', publicationId);
        }
    }, [publicationId, enableDebugLogging]);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const subscribe = async (emailToSubscribe: string) => {
        if (enableDebugLogging) {
            console.log('🚀 Subscription started');
            console.log('📧 Email:', emailToSubscribe);
            console.log('🔑 Publication ID:', publicationId);
        }

        if (!emailToSubscribe) {
            if (enableDebugLogging) console.log('❌ No email provided');
            setError('Email address is required');
            return;
        }

        if (!validateEmail(emailToSubscribe)) {
            if (enableDebugLogging) console.log('❌ Invalid email format');
            setError('Please enter a valid email address');
            return;
        }

        if (!publicationId) {
            if (enableDebugLogging) console.log('❌ No publication ID found');
            setError('Configuration error: Missing publication ID');
            return;
        }

        if (enableDebugLogging) console.log('✅ Validation passed, calling API');
        setIsLoading(true);
        setError('');

        try {
            if (enableDebugLogging) console.log('🌐 Making API call to /api/subscribe');

            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: emailToSubscribe,
                }),
            });

            if (enableDebugLogging) console.log('📡 API Response status:', response.status);

            let data: any = {};
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                try {
                    data = await response.json();
                } catch (parseError) {
                    console.error('Failed to parse response as JSON:', parseError);
                    data = { success: false, error: 'Invalid response from server' };
                }
            } else {
                const text = await response.text();
                if (text) {
                    try {
                        data = JSON.parse(text);
                    } catch (parseError) {
                        console.error('Failed to parse response as JSON:', parseError);
                        data = { success: false, error: 'Invalid response from server' };
                    }
                }
            }
            if (enableDebugLogging) console.log('📡 API Response data:', data);

            if (response.ok && data.success) {
                if (enableDebugLogging) console.log('✅ Subscription successful!');
                setIsSuccess(true);
                setEmail('');
            } else {
                console.error('❌ Subscription failed:', data);
                setError(data.error || 'Subscription failed. Please try again.');
            }

        } catch (err) {
            console.error('💥 Subscription error:', err);
            console.error('💥 Error details:', {
                message: err instanceof Error ? err.message : 'Unknown error',
                stack: err instanceof Error ? err.stack : undefined
            });
            setError(`Failed to subscribe: ${err instanceof Error ? err.message : 'Please try again later'}`);
        } finally {
            setIsLoading(false);
            if (enableDebugLogging) console.log('🏁 Subscription completed');
        }
    };

    const resetSuccess = () => {
        setIsSuccess(false);
    };

    return {
        email,
        setEmail,
        isLoading,
        isSuccess,
        error,
        subscribe,
        resetSuccess,
        validateEmail
    };
};
