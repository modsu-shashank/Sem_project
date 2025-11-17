import React from "react";

const About = () => (
  <div className="container mx-auto px-4 py-12 max-w-3xl">
    <h1 className="text-4xl font-bold mb-6 text-green-800">About Us</h1>
    <p className="text-lg text-gray-700 mb-4">
      Welcome to RGO Organic Millets! We are passionate about providing the
      highest quality organic millets, grains, and cereals to promote a healthy
      lifestyle. Our mission is to connect you with farm-fresh, premium products
      that are both nutritious and delicious.
    </p>
    <p className="text-gray-600 mb-2">
      <strong>Why choose us?</strong>
    </p>
    <ul className="list-disc pl-6 text-gray-600 mb-4">
      <li>100% certified organic products</li>
      <li>Directly sourced from trusted farmers</li>
      <li>Premium quality and freshness guaranteed</li>
      <li>Fast and reliable delivery</li>
      <li>Dedicated to your health and satisfaction</li>
    </ul>
    <p className="text-gray-700">
      Thank you for choosing RGO Organic Millets. We look forward to being a
      part of your healthy journey!
    </p>
  </div>
);

export default About;
