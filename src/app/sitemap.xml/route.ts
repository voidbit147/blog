import { SITE } from "@/lib/constants";
import { getAllPosts, getAllCategories, getAllTags } from "@/lib/posts";

export const dynamic = "force-dynamic";

export async function GET() {
  const posts = getAllPosts();
  const categories = getAllCategories();
  const tags = getAllTags();

  const urls = [
    { loc: SITE.url, priority: 1.0, changefreq: "daily" },
    { loc: `${SITE.url}/blog`, priority: 0.9, changefreq: "daily" },
    { loc: `${SITE.url}/search`, priority: 0.5, changefreq: "monthly" },
    { loc: `${SITE.url}/about`, priority: 0.6, changefreq: "monthly" },
  ];

  // Blog post pages
  for (const post of posts) {
    urls.push({
      loc: `${SITE.url}/blog/${post.slug}`,
      priority: 0.8,
      changefreq: "monthly",
    });
  }

  // Category pages
  for (const cat of categories) {
    urls.push({
      loc: `${SITE.url}/blog/category/${cat.slug}`,
      priority: 0.7,
      changefreq: "weekly",
    });
  }

  // Tag pages
  for (const tag of tags) {
    urls.push({
      loc: `${SITE.url}/blog/tag/${tag.name}`,
      priority: 0.6,
      changefreq: "weekly",
    });
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
