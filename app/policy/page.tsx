import React from "react";

export const metadata = {
  title: "Privacy Policy | StockSimulatorBD",
  description: "StockSimulatorBD Privacy Policy: Learn how we store, use, and protect your personal information when using our platform.",
};

export default function PolicyPage() {
  return (
    <main className="max-w-2xl mx-auto pt-40 pb-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <p className="mb-4">
        <strong>Last updated:</strong> June 20, 2026
      </p>

      <p className="mb-4">
        StockSimulatorBD (previously known as SkillDash) is committed to protecting your privacy. This policy outlines how we collect, use, store, and protect your personal information while using our platform.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">Information We Collect</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Account information (such as name, email, profile details)</li>
        <li>Usage data (pages, actions, interactions)</li>
        <li>Content and submissions you make (comments, simulation activity, community participation)</li>
        <li>Technical data (device, browser, IP address, session details)</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2">How We Use Your Information</h2>
      <ul className="list-disc list-inside mb-4">
        <li>To provide and improve StockSimulatorBD services</li>
        <li>To personalize your experience (recommendations, dashboard, notifications)</li>
        <li>To communicate updates, offers, or critical information regarding our platform</li>
        <li>For analytics and troubleshooting</li>
        <li>To comply with legal obligations</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2">Data Protection & Security</h2>
      <ul className="list-disc list-inside mb-4">
        <li>All data is securely stored and transmitted using industry standards.</li>
        <li>We do not sell or share your personal data with third parties except as required by law or with partnership disclosure.</li>
        <li>Access to personal data is restricted to authorized staff only.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2">Your Choices & Rights</h2>
      <ul className="list-disc list-inside mb-4">
        <li>You can update, correct, or delete your profile at any time.</li>
        <li>Contact us to request data deletion or for additional privacy queries.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2">Contact</h2>
      <p className="mb-2">
        For any questions or concerns about our privacy policy, please email us at{" "}
        <a href="mailto:alshahoriar.hossain@gmail.com" className="underline text-indigo-600">
          alshahoriar.hossain@gmail.com
        </a>.
      </p>
      <p>
        Your continued use of StockSimulatorBD means you agree to this policy and any updates posted on this page.
      </p>
    </main>
  );
}