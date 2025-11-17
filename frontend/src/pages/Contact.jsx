import React, { useState } from "react";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-4xl font-bold mb-6 text-green-800">Contact Us</h1>
      <p className="mb-6 text-gray-700">
        Have a question or feedback? Fill out the form below or email us at{" "}
        <a href="mailto:support@rgo.com" className="text-orange-600 underline">
          support@rgo.com
        </a>
        .
      </p>
      {submitted ? (
        <div className="bg-green-100 text-green-800 p-4 rounded mb-6">
          Thank you for reaching out! We'll get back to you soon.
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white p-6 rounded shadow"
        >
          <div>
            <label className="block text-gray-700 mb-1">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
              rows={4}
            />
          </div>
          <button
            type="submit"
            className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600"
          >
            Send
          </button>
        </form>
      )}
      <div className="mt-8 text-gray-600">
        <p>
          <strong>Email:</strong> support@rgo.com
        </p>
        <p>
          <strong>Phone:</strong> +91 12345 67890
        </p>
        <p>
          <strong>Address:</strong> 123, Organic Lane, Healthy City, India
        </p>
      </div>
    </div>
  );
};

export default Contact;
