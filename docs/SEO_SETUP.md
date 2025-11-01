# SEO Setup Guide

This document outlines the complete SEO setup for Trust My MRR.

## 📋 What's Implemented

### 1. Dynamic Sitemap (`app/sitemap.ts`)

A dynamic sitemap that automatically includes:

- **Home page** (priority: 1.0)
- **Startup list page** (priority: 0.9)
- **Founder list page** (priority: 0.9)
- **All individual startup pages** (priority: 0.8)
- **All individual founder pages** (priority: 0.7)

The sitemap:

- Updates automatically when new startups/founders are added
- Includes `lastModified` dates from the database
- Sets appropriate `changeFrequency` for each page type
- Available at: `https://yourdomain.com/sitemap.xml`

### 2. Robots.txt (`app/robots.ts`)

Configured to:

- Allow all search engines to crawl public pages
- Block crawling of `/api/` and `/admin/` routes
- Point to the sitemap location
- Available at: `https://yourdomain.com/robots.txt`

### 3. Enhanced Metadata (`app/layout.tsx`)

Root layout includes:

- **Title template** for consistent branding across pages
- **Rich meta description** with keywords
- **SEO keywords** (MRR, startup metrics, revenue tracking, etc.)
- **Open Graph tags** for social media sharing
- **Twitter Card tags** for Twitter/X optimization
- **Robot directives** for search engine indexing
- **Canonical URL** to prevent duplicate content issues
- **metadataBase** for absolute URLs

### 4. Page-Specific Metadata

#### Startup Pages

- Dynamic title: `{Startup Name} - Metrics Dashboard`
- SEO-optimized description with startup-specific keywords
- Keywords array including startup name and relevant terms
- Canonical URL for each startup page
- Custom OG image per startup

#### Founder Pages

- Dynamic title: `{Founder Name} - Founder Dashboard`
- Description highlighting portfolio and aggregated metrics
- Keywords including founder name and indie hacker terms
- Canonical URL for each founder page
- Custom OG image per founder

### 5. Open Graph Images

Dynamic OG images generated for:

- Home page (static branding)
- Each startup page (with logo and metrics)
- Each founder page (with profile and portfolio stats)

All images are 1200×630px (optimal for social sharing)

## 🚀 Setup Instructions

### 1. Set Environment Variable

Add to your `.env` file:

```bash
NEXT_PUBLIC_BASE_URL=https://trustmymrr.com
```

Replace `trustmymrr.com` with your actual domain.

### 2. Verify Sitemap

Once deployed, check:

- `https://yourdomain.com/sitemap.xml`
- Should list all startups and founders

### 3. Submit to Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property (domain)
3. Verify ownership
4. Submit sitemap: `https://yourdomain.com/sitemap.xml`

### 4. Submit to Bing Webmaster Tools

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Add your site
3. Submit sitemap

### 5. Update Twitter Username (Optional)

In `app/layout.tsx`, update:

```typescript
twitter: {
  creator: "@trustmymrr", // ← Your Twitter handle
  site: "@trustmymrr",     // ← Your Twitter handle
}
```

## 📊 SEO Best Practices Implemented

### Technical SEO

✅ Clean URL structure (`/startup/slug`, `/founder/username`)
✅ Canonical URLs to prevent duplicate content
✅ Proper HTTP status codes (404 for not found)
✅ Fast loading with Next.js optimization
✅ Mobile-responsive design
✅ Semantic HTML structure

### On-Page SEO

✅ Title tags optimized (50-60 characters)
✅ Meta descriptions (150-160 characters)
✅ Heading hierarchy (H1, H2, etc.)
✅ Descriptive alt text for images
✅ Internal linking structure
✅ Keywords naturally integrated

### Content SEO

✅ Unique content for each page
✅ Real-time data adds value
✅ Clear information architecture
✅ User-focused content

### Social SEO

✅ Open Graph tags for Facebook/LinkedIn
✅ Twitter Card tags for Twitter/X
✅ Custom preview images (OG images)
✅ Branded social sharing

## 🔍 Monitoring SEO Performance

### Google Search Console

Monitor:

- Index coverage
- Search performance
- Click-through rates
- Search queries
- Mobile usability

### Key Metrics to Track

1. **Organic traffic** from Google Analytics
2. **Click-through rate (CTR)** from search results
3. **Average position** for target keywords
4. **Indexed pages** vs total pages
5. **Core Web Vitals** scores

### Target Keywords

Primary:

- "startup revenue tracking"
- "transparent MRR"
- "Stripe revenue analytics"
- "startup metrics"

Long-tail:

- "{Startup name} revenue"
- "{Founder name} startups"
- "indie hacker revenue"
- "transparent startup data"

## 🎯 Additional Recommendations

### 1. Content Strategy

- Add blog/articles about startup metrics
- Create comparison pages
- Add success stories
- Write about transparency in startups

### 2. Link Building

- Get listed on startup directories
- Partner with indie hacker communities
- Guest posts on relevant blogs
- Share on Product Hunt, Hacker News, etc.

### 3. Technical Improvements

- Implement structured data (JSON-LD) for rich snippets
- Add breadcrumbs for better navigation
- Optimize Core Web Vitals
- Consider AMP for mobile pages (if needed)

### 4. Local SEO (if applicable)

- Add location data if targeting specific regions
- Create Google Business Profile
- Add local schema markup

## 📈 Expected Timeline

- **Week 1-2**: Google starts crawling and indexing
- **Week 3-4**: Pages appear in search results
- **Month 2-3**: Rankings begin to improve
- **Month 4-6**: Steady organic traffic growth

## 🐛 Troubleshooting

### Sitemap not showing up?

- Check `NEXT_PUBLIC_BASE_URL` is set correctly
- Verify database connection is working
- Check browser console for errors

### Pages not getting indexed?

- Submit sitemap to Google Search Console
- Check robots.txt isn't blocking pages
- Ensure canonical URLs are correct
- Verify no `noindex` meta tags

### OG images not showing?

- Test with [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- Test with [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- Clear social media cache

## 📚 Resources

- [Google Search Central](https://developers.google.com/search)
- [Next.js SEO Documentation](https://nextjs.org/learn/seo/introduction-to-seo)
- [Moz SEO Learning Center](https://moz.com/learn/seo)
- [Ahrefs SEO Guides](https://ahrefs.com/blog/seo-basics/)

## ✅ SEO Checklist

Before launch:

- [ ] Set `NEXT_PUBLIC_BASE_URL` environment variable
- [ ] Update Twitter handle in metadata
- [ ] Test sitemap.xml is accessible
- [ ] Test robots.txt is accessible
- [ ] Verify all OG images generate correctly
- [ ] Check meta descriptions are unique
- [ ] Test mobile responsiveness
- [ ] Verify page load speed
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Set up Google Analytics
- [ ] Monitor Core Web Vitals

After launch:

- [ ] Monitor indexing status weekly
- [ ] Track keyword rankings
- [ ] Analyze user behavior
- [ ] Optimize based on data
- [ ] Continue content creation
- [ ] Build quality backlinks
