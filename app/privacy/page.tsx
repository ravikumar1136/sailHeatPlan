import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

          <div className="prose dark:prose-invert max-w-none">
            <p>
              This Privacy Policy describes how SAIL Heat Plan Generator collects, uses, and discloses your information
              when you use our service.
            </p>

            <h2>Information Collection</h2>
            <p>We collect information that you provide directly to us when you:</p>
            <ul>
              <li>Create an account</li>
              <li>Upload order and stock data</li>
              <li>Generate heat plans</li>
              <li>Contact customer support</li>
            </ul>

            <h2>Use of Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Process and complete transactions</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Develop new products and services</li>
            </ul>

            <h2>Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information from unauthorized access,
              alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic
              storage is 100% secure, and we cannot guarantee absolute security.
            </p>

            <h2>Data Retention</h2>
            <p>
              We retain your information for as long as your account is active or as needed to provide you services. We
              will also retain and use your information as necessary to comply with our legal obligations, resolve
              disputes, and enforce our agreements.
            </p>

            <h2>Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
              Privacy Policy on this page and updating the "Last Updated" date.
            </p>

            <h2>Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at privacy@sail.co.in.</p>

            <p className="text-sm text-muted-foreground mt-8">Last Updated: March 29, 2025</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

