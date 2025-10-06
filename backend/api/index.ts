import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { INestApplication } from '@nestjs/common';

let app: INestApplication | null = null;

async function bootstrap() {
  if (!app) {
    // Log environment variables for debugging (mask sensitive data)
    const dbUrl = process.env.DATABASE_URL;
    const dbUrlMasked = dbUrl ? `${dbUrl.substring(0, 30)}...${dbUrl.substring(dbUrl.length - 20)}` : 'NOT SET';

    console.log('🔧 Environment Check:', {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: dbUrlMasked,
      DATABASE_URL_LENGTH: dbUrl?.length || 0,
      HAS_JWT_SECRET: !!process.env.JWT_SECRET,
      HAS_ALLOWED_ORIGINS: !!process.env.ALLOWED_ORIGINS,
    });

    app = await NestFactory.create(AppModule);

    // Enable CORS for frontend
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()) || ['*'];

    console.log('🌐 CORS Configuration:', {
      NODE_ENV: process.env.NODE_ENV,
      ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
      allowedOrigins,
    });

    app.enableCors({
      origin: process.env.NODE_ENV === 'production' ? allowedOrigins : true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // Enable validation pipes
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    await app.init();

    console.log('🚀 Backend initialized for Vercel');
    console.log('📝 Environment:', process.env.NODE_ENV || 'development');
    console.log('🌐 CORS enabled for:', allowedOrigins.join(', '));
  }
  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers manually (belt and suspenders approach)
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || ['*'];
  const origin = req.headers.origin || '';

  console.log('🔍 CORS Check:', {
    requestOrigin: origin,
    allowedOrigins,
    method: req.method,
  });

  if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    console.log('✅ Preflight request handled');
    res.status(200).end();
    return;
  }

  const app = await bootstrap();
  const server = app.getHttpAdapter().getInstance();
  return server(req, res);
}
