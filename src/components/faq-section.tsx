import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useActivePlatform } from "@/components/platform-context";
import { useLocale } from "@/components/locale-context";
import { platformCopy } from "@/lib/platform";

export function FaqSection() {
  const platform = useActivePlatform();
  const { locale, t } = useLocale();
  const copy = platformCopy(platform, locale);

  return (
    <section
      id="faq"
      className="mx-auto w-full max-w-lg scroll-mt-24 px-4 py-14 sm:max-w-xl lg:max-w-5xl"
      aria-labelledby="faq-heading"
    >
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {t.faqEyebrow}
      </p>
      <h2
        id="faq-heading"
        className="mt-2 font-display text-2xl tracking-[-0.03em] text-foreground"
      >
        {t.faqTitle(copy.label)}
      </h2>
      <Accordion type="single" collapsible className="mt-6">
        {copy.faq.map((item, index) => (
          <AccordionItem key={item.question} value={`q-${index}`}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
