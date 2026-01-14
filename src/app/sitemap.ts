import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://apt-data-web.vercel.app';

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/map`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/favorites`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // 동적 페이지 (인기 아파트 상위 1000개)
  try {
    const apartments = await prisma.$queryRaw<
      Array<{ apt_id: number; updated_at: Date | null }>
    >`
      SELECT apt_id, updated_at
      FROM apt_master
      WHERE lat IS NOT NULL AND lng IS NOT NULL
      ORDER BY apt_id DESC
      LIMIT 1000
    `;

    const apartmentPages: MetadataRoute.Sitemap = apartments.map((apt) => ({
      url: `${baseUrl}/apt/${apt.apt_id}`,
      lastModified: apt.updated_at || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [...staticPages, ...apartmentPages];
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return staticPages;
  }
}
