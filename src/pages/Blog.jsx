// src/pages/public/Blog.jsx
import React from "react";
import { Link } from "react-router-dom";
import LandingLayout from "../../layouts/LandingLayout";

const posts = [
  {
    slug: "how-to-hire-remote-ui-ux-designer",
    title: "How to hire a remote UI/UX designer in 2025",
    excerpt:
      "Checklist, interview questions, and red flags to spot before you sign a contract.",
    readTime: "6 min read",
    tag: "Hiring",
  },
  {
    slug: "top-freelance-developer-rates",
    title: "Freelance developer rates: what’s normal?",
    excerpt:
      "We analyzed 1,200+ projects on FreelanceFlow. Here is the price range.",
    readTime: "4 min read",
    tag: "Pricing",
  },
  {
    slug: "how-to-win-more-gigs",
    title: "How freelancers can win more gigs on platforms",
    excerpt:
      "Small profile changes that make a big impact on your proposal acceptance rate.",
    readTime: "5 min read",
    tag: "Freelancers",
  },
];

const BlogPage = () => {
  return (
    <LandingLayout>
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              FreelanceFlow Blog
            </h1>
            <p className="text-gray-600">
              Stories, guides, and resources for remote employers and
              freelancers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="bg-gray-50 rounded-lg p-6 border border-gray-100 flex flex-col"
              >
                <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium mb-3">
                  {post.tag}
                </span>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  {post.title}
                </h2>
                <p className="text-gray-600 mb-6 flex-1">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">{post.readTime}</p>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    Read →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </LandingLayout>
  );
};

export default BlogPage;
