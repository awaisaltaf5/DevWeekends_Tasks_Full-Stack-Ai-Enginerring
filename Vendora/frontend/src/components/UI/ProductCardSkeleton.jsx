import React from "react";

/**
 * Skeleton placeholder for a product card while data loads.
 */
const ProductCardSkeleton = () => {
  return (
    <div className="w-full bg-white rounded-xl border border-line p-3">
      <div className="skeleton w-full h-[170px]" />
      <div className="skeleton w-1/3 h-3 mt-3" />
      <div className="skeleton w-3/4 h-4 mt-3" />
      <div className="skeleton w-1/2 h-3 mt-3" />
      <div className="skeleton w-full h-5 mt-4" />
    </div>
  );
};

export default ProductCardSkeleton;
