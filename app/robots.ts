import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Only allow freecoino.com in search engines, block vercel.app subdomain
  const host = process.env.VERCEL_URL?.includes('vercel.app') 
    ? 'https://freecoino.com' 
    : 'https://freecoino.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/auth/', '/profile/', '/history/', '/cashout/', '/daily-bonus/', '/banned/'],
      },
    ],
    sitemap: `${host}/sitemap.xml`,
    host: host,
  };
}
