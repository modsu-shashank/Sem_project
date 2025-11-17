import React, { useState } from "react";

const Feedback = () => {
  const [form, setForm] = useState({ name: "", feedback: "" });
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
      <h1 className="text-4xl font-bold mb-6 text-green-800">Feedback</h1>
      <p className="mb-6 text-gray-700">
        We value your feedback! Please let us know your thoughts below.
      </p>
      {submitted ? (
        <div className="bg-green-100 text-green-800 p-4 rounded mb-6">
          Thank you for your feedback!
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
            <label className="block text-gray-700 mb-1">Feedback</label>
            <textarea
              name="feedback"
              value={form.feedback}
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
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default Feedback;
