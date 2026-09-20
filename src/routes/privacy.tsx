import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/divhub/site-header";
import { Breadcrumbs } from "@/components/divhub/ui-bits";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | SPACE" },
      {
        name: "description",
        content: "Privacy policy for Space, MITAOE academic resource platform.",
      },
      { property: "og:title", content: "Privacy Policy | SPACE" },
      {
        property: "og:description",
        content: "Privacy policy for Space, MITAOE academic resource platform.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="container-page flex-1 py-10 sm:py-14 px-4 sm:px-6">
        <div className="max-w-3xl">
          <Breadcrumbs
            items={[
              { label: "Home", to: "/" },
              { label: "Privacy Policy" },
            ]}
          />

          <div className="mt-8 space-y-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
                Privacy Policy for Space
              </h1>
              <p className="mt-3 text-sm text-mute">
                Last Updated: September 6, 2026
              </p>
            </div>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-ink">
                Overview
              </h2>
              <p className="text-[15px] sm:text-base leading-relaxed text-body">
                This website, Space, is an educational resource that makes academic notes, syllabus documents, and previous year question papers publicly available to users in a more accessible way. The Site does not require user login or authentication and is designed solely as a public educational resource for MITAOE students.
              </p>
              <p className="text-[15px] sm:text-base leading-relaxed text-body">
                This Site is an open educational project. Anyone is free to explore the material and utilize the resources for their coursework and exam preparation.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-ink">
                Data Collection
              </h2>
              <p className="text-[15px] sm:text-base leading-relaxed text-body">
                The Site does not collect any personal information from its visitors. No user account creation or login is required to access the content.
              </p>
              <p className="text-[15px] sm:text-base leading-relaxed text-body">
                <strong>Analytics and Preferences:</strong> User interface preferences, such as theme settings like Light or Dark mode, are stored locally on your device in your browser local storage and are never transmitted to our servers. Anonymous, aggregated usage metrics may be collected for the sole purpose of monitoring server uptime, preventing bandwidth abuse, and improving the Site performance. This data cannot be used to identify individual users.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-ink">
                Content Source and Academic Materials
              </h2>
              <p className="text-[15px] sm:text-base leading-relaxed text-body">
                The content displayed on the Site consists of study notes, syllabus references, and previous year examination papers organized specifically for the purpose of student learning. The Site acts as a fast, searchable viewer and repository for designated educational content.
              </p>
              <p className="text-[15px] sm:text-base leading-relaxed text-body">
                File previews and downloads are provided through secure cloud storage with secure expiring access tokens to ensure stable delivery and prevent automated scraping.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-ink">
                Third Party Services
              </h2>
              <p className="text-[15px] sm:text-base leading-relaxed text-body">
                The Site relies on secure third party cloud infrastructure, such as Supabase for database and storage management, and Cloudflare for content delivery, to host and serve files. These service providers adhere to industry standard data security and privacy protocols.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-ink">
                Fair Use and Content Removal
              </h2>
              <p className="text-[15px] sm:text-base leading-relaxed text-body">
                All materials provided on this platform are intended strictly for educational use and personal study under fair use principles.
              </p>
              <p className="text-[15px] sm:text-base leading-relaxed text-body">
                If you are a copyright holder, professor, or author and believe any document on this site should be updated or removed, please contact us and we will promptly review and take down the specified material.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-ink">
                Contact Information
              </h2>
              <p className="text-[15px] sm:text-base leading-relaxed text-body">
                If you have questions, feedback, or content removal requests regarding this Privacy Policy, you can reach out via email at:
              </p>
              <p className="text-[15px] sm:text-base font-medium text-ink">
                <a
                  href="mailto:space.mitaoe@gmail.com"
                  className="text-primary underline underline-offset-4 hover:opacity-80 transition-opacity"
                >
                  space.mitaoe@gmail.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
