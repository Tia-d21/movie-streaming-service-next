import Navbar from "../../app/components/layout/Navbar";
import Footer from "../../app/components/layout/Footer";

export default function TermsOfUsePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="pt-24 pb-16 px-4 md:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">Terms of Use</h1>
        <p className="text-gray-400 text-center mb-10">
          Last Updated: August 24, 2025
        </p>

        <div className="prose prose-invert prose-lg mx-auto space-y-6 text-gray-300">
          <p>
            Welcome to NetStream! These Terms of Use (&quote; Terms &quote;)
            govern your use of our streaming service, including all content,
            features, and functionalities. By creating an account or using our
            service, you agree to be bound by these Terms.
          </p>

          <h2 className="text-2xl font-semibold text-white !mt-10">
            1. Account Registration
          </h2>
          <p>
            To use the NetStream service, you must create an account. You agree
            to provide accurate and complete information during the registration
            process. You are solely responsible for all activities that occur
            under your account and for keeping your password confidential and
            secure.
          </p>

          <h2 className="text-2xl font-semibold text-white !mt-10">
            2. Service Usage and Content
          </h2>
          <p>
            The NetStream service and any content viewed through our service are
            for your personal and non-commercial use only. We grant you a
            limited, non-exclusive, non-transferable license to access the
            content on a streaming-only basis.
          </p>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Archive, download, reproduce, distribute, or publicly exhibit any
              content from the service.
            </li>
            <li>Use the service for any public performance.</li>
            <li>
              Attempt to circumvent, remove, or alter any of the content
              protections in the service.
            </li>
            <li>
              Use the service for any unlawful purpose or in any way that might
              harm NetStream or its users.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold text-white !mt-10">
            3. User-Generated Lists
          </h2>
          <p>
            Our service allows you to create and manage personal lists, such as
            &quote;My List&quote; and &quote;Favorites.&quote; This data is tied
            to your account. NetStream is not responsible for any loss of this
            data and reserves the right to remove or modify this feature at any
            time.
          </p>

          <h2 className="text-2xl font-semibold text-white !mt-10">
            4. Termination
          </h2>
          <p>
            We may terminate or suspend your account at our sole discretion,
            without prior notice or liability, for any reason whatsoever,
            including without limitation if you breach the Terms. Upon
            termination, your right to use the service will immediately cease.
          </p>

          <h2 className="text-2xl font-semibold text-white !mt-10">
            5. Changes to Terms of Use
          </h2>
          <p>
            NetStream reserves the right to modify these Terms at any time. We
            will notify you of any changes by posting the new Terms on this
            page. Your continued use of the service after such changes
            constitutes your acceptance of the new Terms.
          </p>

          <h2 className="text-2xl font-semibold text-white !mt-10">
            6. Contact Us
          </h2>
          <p>
            If you have any questions about these Terms, please contact us at{" "}
            <a
              href="mailto:support@netstream.example.com"
              className="text-red-500 hover:underline"
            >
              support@netstream.example.com
            </a>
            .
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
