// Static fallback for the storefront before the API is wired in.
// Mirrors what the backend seeder inserts (vastriq.seeder.ts).
export interface SampleOutfit {
  slug: string;
  title: string;
  category: string;
  occasions: string[];
  color: string;
  fabric: string;
  mrp: number;
  rentPerDay: number;
  securityDeposit: number;
  sizes: string[];
  description: string;
}

export const SAMPLE_OUTFITS: SampleOutfit[] = [
  {
    slug: 'emerald-bandhani-bridal-lehenga',
    title: 'Emerald Bandhani Bridal Lehenga',
    category: 'lehenga',
    occasions: ['bridal', 'reception'],
    color: 'Emerald',
    fabric: 'Silk',
    mrp: 65000,
    rentPerDay: 1050,
    securityDeposit: 8000,
    sizes: ['S', 'M', 'L'],
    description:
      'A premium emerald silk lehenga with intricate bandhani work — handpicked for bridal moments.',
  },
  {
    slug: 'ivory-champagne-sherwani',
    title: 'Ivory Champagne Sherwani',
    category: 'sherwani',
    occasions: ['sangeet', 'reception'],
    color: 'Ivory',
    fabric: 'Raw Silk',
    mrp: 45000,
    rentPerDay: 900,
    securityDeposit: 6000,
    sizes: ['M', 'L', 'XL'],
    description: 'Tailored ivory raw silk sherwani with champagne embroidery for the modern groom.',
  },
  {
    slug: 'mehendi-yellow-sharara-set',
    title: 'Mehendi Yellow Sharara Set',
    category: 'lehenga',
    occasions: ['mehendi', 'haldi'],
    color: 'Yellow',
    fabric: 'Georgette',
    mrp: 22000,
    rentPerDay: 600,
    securityDeposit: 3500,
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Flowy yellow georgette sharara — perfect for sun-drenched mehendi celebrations.',
  },
  {
    slug: 'royal-maroon-banarasi-saree',
    title: 'Royal Maroon Banarasi Saree',
    category: 'saree',
    occasions: ['reception', 'sangeet'],
    color: 'Maroon',
    fabric: 'Banarasi Silk',
    mrp: 28000,
    rentPerDay: 700,
    securityDeposit: 4000,
    sizes: ['Free'],
    description: 'Heritage maroon Banarasi silk saree with gold zari border.',
  },
  {
    slug: 'polki-choker-earring-set',
    title: 'Polki Choker & Earring Set',
    category: 'jewellery',
    occasions: ['bridal', 'reception'],
    color: 'Gold',
    fabric: 'Brass + Polki',
    mrp: 35000,
    rentPerDay: 800,
    securityDeposit: 10000,
    sizes: ['Free'],
    description:
      'Statement polki choker with matching earrings — the finishing touch for the bride.',
  },
];

export const CATEGORY_LABELS: Record<string, string> = {
  lehenga: 'Lehenga',
  sherwani: 'Sherwani',
  saree: 'Saree',
  choli: 'Choli',
  kids: 'Kids',
  jewellery: 'Jewellery',
  all: 'All Outfits',
};
