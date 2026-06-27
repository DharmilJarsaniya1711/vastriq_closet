import Link from 'next/link';

import OutfitImage from './OutfitImage';
import WishlistButton from './WishlistButton';

export interface OutfitCardProps {
  slug: string;
  title: string;
  category?: string;
  rentPerDay: number;
  securityDeposit: number;
  color?: string;
  imageUrl?: string;
  // When present, a wishlist heart is shown in the top-right corner.
  id?: string;
}

const OutfitCard = ({
  slug,
  title,
  category,
  rentPerDay,
  securityDeposit,
  color,
  imageUrl,
  id,
}: OutfitCardProps) => (
  <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gold-200 bg-cream-25 transition hover:border-gold-500 hover:shadow-md">
    <Link href={`/outfit/${slug}`} className="flex flex-col">
      <OutfitImage title={title} color={color} src={imageUrl} />
      <div className="space-y-1 p-4">
        {category && <p className="vc-wordmark text-[10px] text-gold-700">{category}</p>}
        <h3 className="font-serif text-lg leading-snug text-primary-900">{title}</h3>
        <p className="text-sm text-gray-500">
          ₹ {rentPerDay.toLocaleString('en-IN')} <span className="text-gray-400">/ day</span>
        </p>
        <p className="text-xs text-gray-400">Deposit ₹ {securityDeposit.toLocaleString('en-IN')}</p>
      </div>
    </Link>
    {id && <WishlistButton outfitId={id} className="absolute right-2 top-2 z-10" />}
  </div>
);

export default OutfitCard;
