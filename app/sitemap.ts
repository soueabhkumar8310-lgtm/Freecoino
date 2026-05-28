import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://Freecoino.app', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://Freecoino.app/earn', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://Freecoino.app/leaderboard', lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: 'https://Freecoino.app/referrals', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: 'https://Freecoino.app/contact', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://Freecoino.app/privacy', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: 'https://Freecoino.app/terms', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ];
}
