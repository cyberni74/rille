import { Downloader } from "@/components/downloader";
import { FaqSection } from "@/components/faq-section";
import { FeatureGrid } from "@/components/feature-grid";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { JsonLd } from "@/components/json-ld";
import { PlatformProvider } from "@/components/platform-context";
import { PlatformSwitcher } from "@/components/platform-switcher";
import { SeoGuide } from "@/components/seo-guide";
import { SiteShell } from "@/components/site-shell";
import type { PlatformId } from "@/lib/platform";
import { jsonLdForPlatform } from "@/lib/seo";

export function HomePage({ platform }: { platform: PlatformId }) {
  return (
    <PlatformProvider platform={platform}>
      <JsonLd data={jsonLdForPlatform(platform)} />
      <main id="top">
        <SiteShell>
          <PlatformSwitcher />
          <Hero />
          <Downloader />
          <HowItWorks />
          <SeoGuide />
          <FeatureGrid />
          <FaqSection />
        </SiteShell>
      </main>
    </PlatformProvider>
  );
}
