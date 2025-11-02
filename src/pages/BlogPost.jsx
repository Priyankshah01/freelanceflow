// src/pages/public/BlogPost.jsx
import React from "react";
import { useParams, Link } from "react-router-dom";
import LandingLayout from "../../layouts/LandingLayout";

const POSTS = {
  "how-to-hire-remote-ui-ux-designer": {
    title: "How to hire a remote UI/UX designer in 2025",
    body: [
      "Remote hiring is normal now. But evaluating design talent remotely still feels fuzzy.",
      "In this guide, we'll cover the exact screening questions, portfolio checks, and trial tasks you can use.",
      "Use FreelanceFlow to post a job and receive pre-vetted designers.",
    ],
  },
  "top-freelance-developer-rates": {
    title: "Freelance developer rates: what’s normal?",
    body: [
      "Developer rates vary by stack, location, and urgency.",
      "Across our platform, senior React/Node developers average $55–$85/hr.",
      "For fixed-price work, always write crystal-clear requirements first.",
    ],
  },
  "how-to-win-more-gigs": {
    title: "How freelancers can win more gigs on platforms",
    body: [
      "Clients scan fast. Make your first 3 lines relevant.",
      "Add 2–3 linked case studies.",
      "Reply within 2 hours to stay on top of the list.",
    ],
  },
};

const BlogPost = () => {
  const { slug } = useParams();
  const post = POSTS[slug];

  return (
    <LandingLayout>
      <div className="max-w-3xl mx-auto px-4 py-16">
        {!post ? (
          <div>
            <p className="text-gray-600 mb-4">Post not found.</p>
            <Link to="/blog" className="text-indigo-600">
              ← Back to blog
            </Link>
          </div>
        ) : (
          <>
            <Link
              to="/blog"
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              ← Back to blog
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mt-4 mb-6">
              {post.title}
            </h1>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              {post.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </>
        )}
      </div>
    </LandingLayout>
  );
};

export default BlogPost;
