import { NextRequest, NextResponse } from 'next/server';

/**
 * Vercel Cron Job Endpoint
 *
 * This endpoint is called by Vercel's cron service every 2 hours.
 * It forwards the request to the backend NestJS API which processes
 * pending anonymization jobs.
 *
 * Security: Only Vercel cron can call this (via Authorization header)
 *
 * Configuration: See vercel.json
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('[CRON] CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn('[CRON] Unauthorized anonymization request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[CRON] Starting anonymization job...');

    // Call backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${backendUrl}/anonymization/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cronSecret}`,
      },
      body: JSON.stringify({
        batchSize: 200, // Process up to 200 hands per run
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[CRON] Backend returned error: ${response.status}`, error);
      return NextResponse.json(
        {
          error: 'Backend processing failed',
          details: error,
          status: response.status,
        },
        { status: 500 }
      );
    }

    const result = await response.json();
    const duration = Date.now() - startTime;

    console.log(
      `[CRON] Anonymization completed in ${duration}ms:`,
      `${result.handsProcessed} hands processed,`,
      `${result.jobsProcessed} jobs completed,`,
      `${result.errors} errors`
    );

    return NextResponse.json({
      success: true,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      ...result,
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[CRON] Anonymization job failed:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint
 * Verifies cron configuration without processing jobs
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json(
        { error: 'CRON_SECRET not configured' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check backend connectivity
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${backendUrl}/health`, {
      method: 'GET',
    });

    return NextResponse.json({
      status: 'healthy',
      backend: response.ok ? 'connected' : 'unreachable',
      cronSecret: 'configured',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
