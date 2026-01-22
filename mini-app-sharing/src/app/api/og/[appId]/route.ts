import { appRegistryService } from '@/lib/app-registry';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  try {
    const { appId } = await params;
    const app = await appRegistryService.getApp(appId);

    if (!app) {
      return new NextResponse('App not found', { status: 404 });
    }

    // Generate OG image using HTML/CSS
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              width: 1200px;
              height: 630px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
              overflow: hidden;
            }
            
            .container {
              background: white;
              border-radius: 20px;
              padding: 40px;
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
              max-width: 1000px;
              width: 90%;
              display: flex;
              align-items: center;
              gap: 30px;
            }
            
            .app-icon {
              width: 120px;
              height: 120px;
              border-radius: 20px;
              object-fit: cover;
              box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
            }
            
            .content {
              flex: 1;
            }
            
            .app-name {
              font-size: 48px;
              font-weight: 700;
              color: #1a202c;
              margin-bottom: 10px;
              line-height: 1.2;
            }
            
            .app-description {
              font-size: 24px;
              color: #4a5568;
              margin-bottom: 20px;
              line-height: 1.4;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
            
            .app-meta {
              display: flex;
              align-items: center;
              gap: 20px;
              margin-bottom: 20px;
            }
            
            .rating {
              display: flex;
              align-items: center;
              gap: 5px;
              font-size: 20px;
              color: #f6ad55;
            }
            
            .category {
              background: #e2e8f0;
              color: #4a5568;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 16px;
              font-weight: 500;
              text-transform: capitalize;
            }
            
            .developer {
              font-size: 18px;
              color: #718096;
            }
            
            .verified {
              display: flex;
              align-items: center;
              gap: 5px;
              color: #38a169;
              font-size: 16px;
              font-weight: 500;
            }
            
            .footer {
              position: absolute;
              bottom: 20px;
              right: 20px;
              display: flex;
              align-items: center;
              gap: 10px;
              color: white;
              font-size: 18px;
              font-weight: 600;
            }
            
            .logo {
              width: 40px;
              height: 40px;
              background: white;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 700;
              color: #667eea;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="${app.icon}" alt="${app.name}" class="app-icon" />
            <div class="content">
              <h1 class="app-name">${app.name}</h1>
              <p class="app-description">${app.description}</p>
              <div class="app-meta">
                <div class="rating">
                  ⭐ ${appRegistryService.formatAppRating(app)}
                </div>
                <div class="category">${app.category}</div>
                ${app.verified ? '<div class="verified">✓ Verified</div>' : ''}
              </div>
              <div class="developer">by ${app.developer_name}</div>
            </div>
          </div>
          <div class="footer">
            <div class="logo">ME</div>
            <span>Move Everything</span>
          </div>
        </body>
      </html>
    `;

    // For now, return a simple response
    // In production, you'd use a service like Puppeteer or @vercel/og to generate actual images
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('Error generating OG image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
