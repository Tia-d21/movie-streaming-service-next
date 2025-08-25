import Navbar from '../../app/components/layout/Navbar';
import Footer from '../../app/components/layout/Footer';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4 md:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">Privacy Policy</h1>
        <p className="text-gray-400 text-center mb-10">Last Updated: August 24, 2025</p>

        <div className="prose prose-invert prose-lg mx-auto space-y-6 text-gray-300">
          <p>
            NetStream (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and disclose information about you when you use our streaming service.
          </p>

          <h2 className="text-2xl font-semibold text-white !mt-10">1. Information We Collect</h2>
          <h3 className="text-xl font-semibold text-white !mt-6">A. Information You Provide to Us</h3>
          <p>
            We collect information you provide directly to us when you create an account, such as your name, email address, and password.
          </p>
          <h3 className="text-xl font-semibold text-white !mt-6">B. Information We Collect Automatically</h3>
          <p>
            When you use our service, we automatically collect certain information, including:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Usage Data:</strong> We collect information about your activity on our service, such as search queries and content you add to &quot;My List&quot; or &quot;Favorites.&quot;</li>
            <li><strong>Device Information:</strong> We may collect information about the device you use to access our service, such as browser type and IP address. (Note: This is a placeholder for future implementation).</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white !mt-10">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide, maintain, and improve our service.</li>
            <li>Personalize the service by suggesting content you might like.</li>
            <li>Communicate with you about your account and our service.</li>
            <li>Protect the security and integrity of our platform.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white !mt-10">3. Data Storage and Security</h2>
          <p>
            <strong>For this prototype version of the application, all user registration and list data is stored in your browser&#39;s `localStorage`.</strong> When you log out, this information is cleared. In a future production release, this data will be stored securely on our backend servers with industry-standard encryption. We take reasonable measures to protect your information, but no security system is impenetrable.
          </p>

          <h2 className="text-2xl font-semibold text-white !mt-10">4. Third-Party Services</h2>
          <p>
            Our service uses The Movie Database (TMDB) API to provide movie and TV show data. We are not responsible for the privacy practices of TMDB. We encourage you to review their privacy policy.
          </p>
          
          <h2 className="text-2xl font-semibold text-white !mt-10">5. Your Choices</h2>
          <p>
            You can access and update your account information at any time through your <Link href="/main/profile" className="text-red-500 hover:underline">Profile</Link> page. You may also &quot;log out&quot; of your account, which, in the current version of this application, will clear all your session and registration data from your browser.
          </p>

          <h2 className="text-2xl font-semibold text-white !mt-10">6. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.
          </p>
          
          <h2 className="text-2xl font-semibold text-white !mt-10">7. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@netstream.example.com" className="text-red-500 hover:underline">privacy@netstream.example.com</a>.
          </p>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}