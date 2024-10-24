import { getSealFaqItems } from '../getSealFaqItems';
import { FaqAccordion } from '@/modules/ui/components/FaqAccordion';

export function SealFaq() {
  const faqItems = getSealFaqItems();

  return <FaqAccordion items={faqItems} />;
}
