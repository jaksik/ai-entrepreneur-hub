import { NextRequest, NextResponse } from 'next/server';

type BeehiivAPIResponse = {
    error?: { message?: string } | string;
    errors?: string[] | string;
    [key: string]: unknown;
};

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        // Validate email
        if (!email) {
            return NextResponse.json(
                { success: false, error: 'Email is required' },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Get environment variables
        const publicationId = process.env.NEXT_PUBLIC_BEEHIIV_PUBLICATION_ID;
        const apiKey = process.env.BEEHIIV_API_KEY;

        if (!publicationId) {
            console.error('Missing NEXT_PUBLIC_BEEHIIV_PUBLICATION_ID');
            return NextResponse.json(
                { success: false, error: 'Configuration error: Missing publication ID' },
                { status: 500 }
            );
        }

        if (!apiKey) {
            console.error('Missing BEEHIIV_API_KEY');
            return NextResponse.json(
                { success: false, error: 'Configuration error: API key not set' },
                { status: 500 }
            );
        }

        // Call Beehiiv API to subscribe
        const beehiivUrl = `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`;
        console.log('Calling Beehiiv API:', beehiivUrl);
        
        const beehiivResponse = await fetch(
            beehiivUrl,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    reactivate_existing: true,
                    send_welcome_email: true,
                    referring_site: request.headers.get('referer') || '',
                }),
            }
        );

        console.log('Beehiiv response status:', beehiivResponse.status);
        console.log('Beehiiv response headers:', Object.fromEntries(beehiivResponse.headers));
        
        const responseText = await beehiivResponse.text();
        console.log('Beehiiv raw response:', responseText);
        
        let beehiivData: BeehiivAPIResponse = {};
        const trimmedResponse = responseText.trim();
        if (trimmedResponse) {
            try {
                beehiivData = JSON.parse(trimmedResponse) as BeehiivAPIResponse;
            } catch (parseError) {
                console.error('Failed to parse Beehiiv response as JSON:', parseError);
                beehiivData = {};
            }
        }

        if (!beehiivResponse.ok) {
            console.error('Beehiiv API error:', beehiivData);
            
            let errorMessage = 'Failed to subscribe. Please try again.';
            
            if (beehiivResponse.status === 404) {
                errorMessage = 'Beehiiv API endpoint not found (404). Check your publication ID configuration.';
            } else if (
                typeof beehiivData.error === 'object' &&
                beehiivData.error !== null &&
                'message' in beehiivData.error &&
                typeof (beehiivData.error as { message?: unknown }).message === 'string' &&
                (beehiivData.error as { message?: string }).message
            ) {
                errorMessage = (beehiivData.error as { message?: string }).message as string;
            } else if (beehiivData.errors) {
                errorMessage = Array.isArray(beehiivData.errors) ? beehiivData.errors[0] : beehiivData.errors;
            }
            
            return NextResponse.json(
                {
                    success: false,
                    error: errorMessage,
                },
                { status: beehiivResponse.status }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Successfully subscribed',
                data: beehiivData,
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Subscription API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'An unexpected error occurred',
            },
            { status: 500 }
        );
    }
}
