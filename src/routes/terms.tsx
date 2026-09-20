import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/divhub/site-header";
import { Breadcrumbs } from "@/components/divhub/ui-bits";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | SPACE" },
      {
        name: "description",
        content: "Terms and conditions for using Space, MITAOE academic resource platform.",
      },
      { property: "og:title", content: "Terms of Service | SPACE" },
      {
        property: "og:description",
        content: "Terms of service and educational usage guidelines for Space.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: TermsOfServicePage,
});

function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="container-page flex-1 py-10 sm:py-14 px-4 sm:px-6">
        <div className="max-w-3xl">
          <Breadcrumbs
            items={[
              { label: "Home", to: "/" },
              { label: "Terms of Service" },
            ]}
          />

          <div className="mt-8 space-y-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
                Terms of Service for Space
              </h1>
              <p className="mt-3 text-sm text-mute">
                Last Updated: September 6, 2026
              </p>
            </div>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-ink">
                1. Purpose of the Platform
              </h2>
              <p className="text-[15px] sm:text-base leading-relaxed text-body">
                Space is an open educational platform designed to make academic resources, including lecture notes, syllabus documents, and previous year question papers, accessible and organized in one place for MITAOE students.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-ink">
                2. Permitted Use
              </h2>
              <p className="text-[15px] sm:text-base leading-relaxed text-body">
                All materials provided on Space are intended strictly for personal study, exam preparation, and educational use. Users can view, preview, and download resources freely without requiring an account or login.
              </p>
              <p className="text-[15px] sm:text-base leading-relaxed text-body">
                Automated bulk downloading, scraping, or malicious attempts to disrupt platform availability are prohibited.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-ink">
                3. Academic Content and Intellectual Property
              </h2>
              <p className="text-[15px] sm:text-base leading-relaxed text-body">
                The study notes, presentations, and educational documents hosted on this platform are the intellectual property of their respective student contributors, faculty, and creators. Space functions solely as a central repository and viewer to help students access learning materials.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-ink">
                4. Contributing Material
              </h2>
              <p className="text-[15px] sm:text-base leading-relaxed text-body">
                Students and educators are encouraged to share notes, question papers, and verified academic references for the benefit of the student community. By sharing materials, contributors confirm that content is provided for educational assistance.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-ink">
                5. Disclaimer of Warranties
              </h2>
              <p className="text-[15px] sm:text-base leading-relaxed text-body">
                All content on Space is provided on an as is basis for reference purposes. While we strive to maintain accurate, high quality resources, Space does not guarantee that materials are error free or fully exhaustive. Students are encouraged to cross reference with official institutional curriculum guidelines.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-ink">
                6. Content Review and Takedown
              </h2>
              <p className="text-[15px] sm:text-base leading-relaxed text-body">
                We respect intellectual property rights. If you are a copyright holder, instructor, or contributor and believe any document should be corrected, updated, or removed, please contact us with the document details and we will promptly review and take appropriate action.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-ink">
                7. Changes to Terms
              </h2>
              <p className="text-[15px] sm:text-base leading-relaxed text-body">
                These terms may be updated periodically to reflect improvements to platform functionality and community guidelines. Continued use of Space constitutes agreement with the latest published terms.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-ink">
                8. Contact Information
              </h2>
              <p className="text-[15px] sm:text-base leading-relaxed text-body">
                If you have questions or inquiries regarding these Terms of Service, you can reach out via email at:
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
