import { SITE } from "@/lib/constants";
import { getAllPosts } from "@/lib/posts";
import { Feed } from "feed";

export const dynamic = "force-dynamic";

export async function GET() {
  const posts = getAllPosts();
  const feed = new Feed({
    title: SITE.title,
    description: SITE.description,
    id: SITE.url,
    link: SITE.url,
    language: "en",
    favicon: `${SITE.url}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}`,
    updated: posts.length > 0 ? new Date(posts[0].frontmatter.date) : new Date(),
    author: {
      name: SITE.author.name,
    },
    feedLinks: {
      rss: `${SITE.url}/feed.xml`,
    },
  });

  for (const post of posts) {
    feed.addItem({
      title: post.frontmatter.title,
      id: `${SITE.url}/blog/${post.slug}`,
      link: `${SITE.url}/blog/${post.slug}`,
      description: post.frontmatter.description,
      content: post.content.slice(0, 2000),
      date: new Date(post.frontmatter.date),
      author: [
        {
          name: post.frontmatter.author || SITE.author.name,
        },
      ],
      category: post.frontmatter.tags.map((tag) => ({
        name: tag,
      })),
    });
  }

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
