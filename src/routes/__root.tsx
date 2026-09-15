import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { LocaleProvider } from "@/components/locale-context";
import { NotFoundPage } from "@/components/not-found";
import { Toaster } from "sonner";
import { DEFAULT_LOCALE, localeFromHeaders, type Locale } from "@/lib/locale";
import { SITE } from "@/lib/seo";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  loader: async (): Promise<{ locale: Locale }> => {
    if (import.meta.env.SSR) {
      try {
        const mod = await import("@tanstack/react-start/server");
        const request = mod.getRequest?.();
        if (request) {
          return {
            locale: localeFromHeaders(
              request.headers.get("cookie"),
              request.headers.get("accept-language"),
            ),
          };
        }
      } catch {
        /* client bundle */
      }
    }
    return { locale: DEFAULT_LOCALE };
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: SITE.title },
      { name: "description", content: SITE.description },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { name: "theme-color", content: SITE.themeColor },
      { name: "application-name", content: SITE.name },
      { name: "apple-mobile-web-app-title", content: SITE.name },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "format-detection", content: "telephone=no" },
      { name: "author", content: SITE.name },
      { name: "google-site-verification", content: SITE.googleSiteVerification },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "apple-touch-icon", href: "/icons/icon-192.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/__grok/icon-180.png" },
    ],
  }),
  notFoundComponent: NotFoundPage,
  component: RootDocument,
});

function RootDocument() {
  const { locale } = Route.useLoaderData();
  return (
    <html lang={locale} className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-background text-foreground">
        <PreviewHostBridge />
        <AuthProvider>
          <LocaleProvider initial={locale}>
            <Outlet />
          </LocaleProvider>
        </AuthProvider>
        <Toaster
          theme="dark"
          position="bottom-center"
          toastOptions={{
            className:
              "!bg-card !text-foreground !border-0 !shadow-[var(--shadow-border)] !font-[inherit]",
          }}
        />
        <Scripts />
      </body>
    </html>
  );
}
