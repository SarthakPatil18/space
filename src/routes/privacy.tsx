import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, Eye, Lock, FileText, Server, AlertCircle, Mail, Clock } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/divhub/site-header";
import { Breadcrumbs } from "@/components/divhub/ui-bits";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — SPACE" },
      {
        name: "description",
        content: "Learn how Space protects student privacy, handles academic data, and safeguards study materials.",
      },
      { property: "og:title", content: "Privacy Policy — SPACE" },
      {
        property: "og:description",
        content: "Transparent data and privacy policy for Space — MITAOE's academic resource platform.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: PrivacyPolicyPage,
});

const SECTIONS = [
  {
    icon: Eye,
    title: "1. Information We Collect",
    content: [
      {
        subtitle: "No Account Required for Browsing",
        text: "Space is an open academic repository. Students can freely search, preview, and download study notes, previous year question papers (PYQs), syllabus documents, and subject files without registering an account or providing personal information.",
      },
      {
        subtitle: "Local Preferences",
        text: "We store your interface preferences (such as Light/Dark theme mode) locally on your device using your browser's localStorage. This information never leaves your browser.",
      },
      {
        subtitle: "Technical & Performance Data",
        text: "Like most web services, our servers and CDN (Content Delivery Network) automatically receive standard non-personally identifiable technical information (e.g. IP address, browser type, referring pages) strictly to maintain server uptime, security, and fast content delivery.",
      },
    ],
  },
  {
    icon: FileText,
    title: "2. Academic Materials & Uploads",
    content: [
      {
        subtitle: "Educational Resources",
        text: "All documents hosted on Space — including handwritten notes, reference materials, PYQs, and syllabi — are uploaded to assist students with coursework and exam preparation.",
      },
      {
        subtitle: "Secure File Storage",
        text: "Uploaded files are stored on secure cloud storage infrastructure. Download links and preview links are generated with time-limited security tokens to prevent unauthorized scraping and bandwidth abuse.",
      },
    ],
  },
  {
    icon: Lock,
    title: "3. How We Use Information",
    content: [
      {
        subtitle: "Zero Commercial Tracking or Selling",
        text: "We do not sell, rent, or monetize student data. We do not display third-party advertisements or use tracking pixels.",
      },
      {
        subtitle: "Core Platform Functionality",
        text: "Any data processed is strictly utilized to operate search indexing, organize subjects and categories, resolve document previews, and deliver fast file downloads.",
      },
    ],
  },
  {
    icon: Server,
    title: "4. Third-Party Infrastructure",
    content: [
      {
        subtitle: "Database & Storage Providers",
        text: "Space uses Supabase and Cloudflare to reliably host our database and static file assets. These service providers adhere to industry-standard data security and encryption protocols (SOC 2, ISO 27001).",
      },
    ],
  },
  {
    icon: AlertCircle,
    title: "5. Fair Use & Content Removal",
    content: [
      {
        subtitle: "Educational Fair Use",
        text: "Materials shared on Space are intended solely for personal study and educational reference. If you are a copyright holder, professor, or contributor and believe any material has been uploaded without authorization or should be updated/removed, please reach out to us and we will promptly review and take appropriate action.",
      },
    ],
  },
  {
    icon: Shield,
    title: "6. Data Security",
    content: [
      {
        subtitle: "Encryption in Transit",
        text: "All traffic between your device and Space is encrypted using modern Transport Layer Security (HTTPS/TLS).",
      },
    ],
  },
];

function PrivacyPolicyPage() {
  const lastUpdated = "September 2026";

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container-page py-10">
        <Breadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: "Privacy Policy" },
          ]}
        />

        {/* Hero Section */}
        <div className="mt-4 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-card/60 px-3 py-1 text-xs font-medium text-mute backdrop-blur-sm">
            <Shield className="size-3.5 text-primary" />
            <span>Student Privacy First</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              Last Updated: {lastUpdated}
            </span>
          </div>

          <h1 className="heading-xl tracking-tight">Privacy Policy</h1>
          <p className="text-[15px] sm:text-base leading-relaxed text-body">
            At <strong>Space</strong>, we are committed to transparent and student-first data practices. 
            We believe academic materials should be accessible without sacrificing privacy, intrusive tracking, or mandatory logins.
          </p>
        </div>

        {/* Main Content Sections */}
        <div className="mt-10 grid gap-8 lg:grid-cols-12">
          {/* Policy Cards */}
          <div className="space-y-6 lg:col-span-8">
            {SECTIONS.map((section, idx) => {
              const Icon = section.icon;
              return (
                <article
                  key={idx}
                  className="hairline-card rounded-2xl p-6 sm:p-8 space-y-5 transition-shadow hover:shadow-whisper"
                >
                  <div className="flex items-center gap-3 border-b border-hairline pb-4">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-ink">{section.title}</h2>
                  </div>

                  <div className="space-y-4">
                    {section.content.map((item, itemIdx) => (
                      <div key={itemIdx} className="space-y-1">
                        <h3 className="text-sm font-semibold text-ink">{item.subtitle}</h3>
                        <p className="text-sm leading-relaxed text-body">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>

          {/* Sidebar Info Card */}
          <div className="space-y-6 lg:col-span-4">
            <div className="hairline-card sticky top-24 rounded-2xl p-6 space-y-5 bg-card/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-ink font-semibold text-base">
                <Mail className="size-4 text-primary" />
                <span>Contact & Inquiries</span>
              </div>

              <p className="text-xs sm:text-sm leading-relaxed text-body">
                Have questions about our privacy practices, or want to request a revision or removal of uploaded content?
              </p>

              <div className="rounded-xl border border-hairline bg-background/60 p-3.5 space-y-1.5 text-xs">
                <span className="font-semibold text-ink block">Platform Admin & Support</span>
                <span className="text-mute block">MITAOE Space Community</span>
                <a
                  href="mailto:contact@mitaoe.space"
                  className="text-primary hover:underline font-medium break-all block"
                >
                  contact@mitaoe.space
                </a>
              </div>

              <div className="border-t border-hairline pt-4 flex flex-col gap-2">
                <Link to="/" className="btn-primary-sm justify-center py-2 text-xs">
                  Back to Materials
                </Link>
                <Link to="/subjects" className="btn-ghost-sm justify-center py-2 text-xs">
                  Browse All Subjects
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
