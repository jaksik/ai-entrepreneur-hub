'use client';

import React from 'react';
import { useBeehiivSubscription } from '@/hooks/useBeehiivSubscription';

interface BeehiivFormProps {
    publicationId?: string;
    className?: string;
    title?: string;
    description?: string;
    buttonText?: string;
    placeholder?: string;
    enableDebugLogging?: boolean;
}

export const BeehiivForm: React.FC<BeehiivFormProps> = ({
    publicationId,
    className = "",
    title = "Stay Updated",
    description = "Stay up to date by joining our newsletter.",
    buttonText = "Subscribe",
    placeholder = "Enter your email address",
    enableDebugLogging = false
}) => {
    const {
        email,
        setEmail,
        isLoading,
        isSuccess,
        error,
        subscribe,
        resetSuccess
    } = useBeehiivSubscription({
        publicationId,
        enableDebugLogging
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await subscribe(email);
    };

    if (isSuccess) {
        return (
            <div className={`bg-(--color-card-bg) rounded-xl shadow-lg border border-(--color-card-border) p-6 text-center ${className}`}>
                <div className="text-green-600 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-(--color-text-primary) mb-2 font-inter">
                    Subscribed! You have successfully opted in
                </h3>
                <p className="text-(--color-text-secondary) font-inter">
                    Check your email for a confirmation message.
                </p>
                <button
                    onClick={() => resetSuccess()}
                    className="mt-4 px-4 py-2 bg-(--color-accent-primary) text-white hover:bg-(--color-accent-hover) rounded-md font-semibold transition-colors font-inter"
                >
                    Subscribe another email
                </button>
            </div>
        );
    }

    return (
        <div className={`p-4 ${className}`}>
            <div className="text-center mb-6">
                <p className="mx-auto max-w-800px text-(--color-text-secondary) md:text-xl font-inter">
                    {description}
                </p>
            </div>

            <div className="flex w-full flex-col items-center justify-center">
                <div className="w-full max-w-600px">
                    <form onSubmit={handleSubmit} className="group w-full">
                        <div className="flex flex-col">
                            <div className="flex w-full flex-col items-center sm:flex-row overflow-hidden rounded-lg bg-(--color-card-bg) border-2" style={{ borderColor: 'var(--color-border)' }}>
                                <div className="flex w-full items-center bg-(--color-card-bg) pt-3 pb-4">
                                    <div className="px-3 text-(--color-text-primary)">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" className="h-6 w-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"></path>
                                        </svg>
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={placeholder}
                                        className="z-10 w-full border-none bg-transparent placeholder-shown:text-ellipsis text-lg focus:text-lg active:text-lg sm:text-lg text-(--color-text-primary) placeholder-(--color-text-secondary) focus:outline-none font-inter"
                                        disabled={isLoading}
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="cursor-pointer px-5 py-3 font-semibold w-full sm:w-auto text-lg focus:text-lg active:text-lg sm:text-lg rounded-md bg-(--color-accent-primary) text-white hover:bg-(--color-accent-hover) disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-inter"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Subscribing...
                                        </div>
                                    ) : (
                                        buttonText
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {error && (
                <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3 mt-4 font-inter">
                    {error}
                </div>
            )}
        </div>
    );
};

export default BeehiivForm;
