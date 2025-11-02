// src/pages/public/Contact.jsx
import React, { useState } from "react";
import LandingLayout from "../layouts/LandingLayout";

const ContactPage = () => {
  const [status, setStatus] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // later you can POST to backend
    setStatus("Thanks — we'll get back to you within 1 business day.");
  };

  return (
    <LandingLayout>
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Contact us
            </h1>
            <p className="text-gray-600">
              Questions about hiring or freelancing? Send us a note.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <form
              onSubmit={handleSubmit}
              className="bg-gray-50 rounded-lg p-8 border border-gray-100 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full name
                </label>
                <input
                  required
                  type="text"
                  className="w-full border-gray-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  required
                  type="email"
                  className="w-full border-gray-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  How can we help?
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full border-gray-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-semibold"
              >
                Send message
              </button>
              {status && (
                <p className="text-green-600 text-sm mt-2">{status}</p>
              )}
            </form>

            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Talk to sales
                </h2>
                <p className="text-gray-600">
                  For team plans, enterprise, and partnerships.
                </p>
                <p className="text-gray-800 mt-2">hello@freelanceflow.com</p>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Office
                </h2>
                <p className="text-gray-600">
                  Toronto, Canada
                  <br />
                  Remote-first team
                </p>
              </div>
              <div className="rounded-lg bg-indigo-50 p-4">
                <p className="text-sm text-indigo-900">
                  Tip: if you're a client, the fastest way to start is to{" "}
                  <span className="font-semibold">create a client account</span>{" "}
                  and post a job — we'll route it to the right talent pool.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
};

export default ContactPage;
