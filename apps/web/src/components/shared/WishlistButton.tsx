import { ActionIcon, Button } from '@mantine/core';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/router';

import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useWishlist,
} from '@/apis/queries/social.queries';
import { ACCESS_TOKEN } from '@/utils/constants';

interface WishlistButtonProps {
  outfitId?: string;
  // 'icon' = compact heart for cards, 'full' = labelled button for the detail page.
  variant?: 'icon' | 'full';
  className?: string;
}

const WishlistButton = ({ outfitId, variant = 'icon', className }: WishlistButtonProps) => {
  const router = useRouter();
  const loggedIn = !!getCookie(ACCESS_TOKEN);
  // Only signed-in users have a wishlist; derive the saved state from the server
  // so it stays correct across refreshes and across every card/detail view.
  const { data: items } = useWishlist(loggedIn);
  const add = useAddToWishlist();
  const remove = useRemoveFromWishlist();

  const wishlisted = !!outfitId && (items ?? []).some((it) => it.outfit.id === outfitId);
  const busy = add.isPending || remove.isPending;

  // Cards wrap their content in a <Link>; stop the click from navigating.
  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!loggedIn || !outfitId) {
      router.push('/login');
      return;
    }
    if (wishlisted) remove.mutate(outfitId);
    else add.mutate(outfitId);
  };

  if (variant === 'full') {
    return (
      <Button
        size="lg"
        variant={wishlisted ? 'filled' : 'outline'}
        color="primary"
        radius="md"
        onClick={toggle}
        loading={busy}
        className={className}>
        {wishlisted ? '♥ Wishlisted' : '♡ Wishlist'}
      </Button>
    );
  }

  return (
    <ActionIcon
      variant="white"
      radius="xl"
      size="lg"
      onClick={toggle}
      loading={busy}
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      className={className}
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>
      <span className={wishlisted ? 'text-lg text-red-500' : 'text-lg text-gray-400'}>
        {wishlisted ? '♥' : '♡'}
      </span>
    </ActionIcon>
  );
};

export default WishlistButton;
