import { IconButton, Tooltip } from '@radix-ui/themes';
import { Heart } from 'lucide-react';
import React from 'react';

const WishlistToggle = ({
  isInWishlist = false,
  onToggle,
  size = 18,
  iconButtonSize = "2",
  variant = "soft",
  className = "",
  loading = false,
  tooltip = true
}) => {
  const handleClick = (e) => {
    e.preventDefault(); // Prevent navigation if used inside links
    e.stopPropagation(); // Prevent event bubbling
    if (!loading && onToggle) {
      onToggle();
    }
  };

  const IconButtonComponent = (
    <IconButton
      variant={variant}
      color={isInWishlist ? "red" : "gray"}
      size={iconButtonSize}
      className={`${className}`}
      onClick={handleClick}
      loading={loading}
      radius='full'
    >
      <Heart
        size={size}
        className={`${isInWishlist ? 'scale-105 fill-[--red-9] text-[--red-9]' : 'text-black'}`}
      />
    </IconButton>
  );

  if (!tooltip) {
    return IconButtonComponent;
  }

  return (
    <Tooltip content={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}>
      {IconButtonComponent}
    </Tooltip>
  );
};

export default WishlistToggle; 