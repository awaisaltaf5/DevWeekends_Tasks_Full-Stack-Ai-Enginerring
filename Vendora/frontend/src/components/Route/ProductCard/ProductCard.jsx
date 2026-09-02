import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../../../styles/styles";
import {
  AiFillHeart,
  AiOutlineEye,
  AiOutlineHeart,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import ProductDetailsCard from "../ProductDetailsCard/ProductDetailsCard.jsx";
import { useDispatch, useSelector } from "react-redux";
import { addToWishlist, removeFromWishlist } from "../../../redux/actions/wishlist";
import { addTocart } from "../../../redux/actions/cart";
import { toast } from "react-toastify";
import Ratings from "../../Products/Ratings";

const ProductCard = ({ data, isEvent }) => {
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const [click, setClick] = useState(false);
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (wishlist && wishlist.find((i) => i._id === data._id)) {
      setClick(true);
    } else {
      setClick(false);
    }
  }, [wishlist]);

  const removeFromWishlistHandler = (data) => {
    setClick(!click);
    dispatch(removeFromWishlist(data));
  };

  const addToWishlistHandler = (data) => {
    setClick(!click);
    dispatch(addToWishlist(data));
  };

  const addToCartHandler = (id) => {
    const isItemExists = cart && cart.find((i) => i._id === id);
    if (isItemExists) {
      toast.error("item already in cart!");
    } else {
      if (data.stock < 1) {
        toast.error("Product stock limited!");
      } else {
        const cartData = { ...data, qty: 1 };
        dispatch(addTocart(cartData));
        toast.success("Item added to cart Successfully!");
      }
    }
  };

  return (
    <>
      <div className="w-full h-[392px] bg-white rounded-xl border border-line p-3 relative cursor-pointer card-hover overflow-hidden flex flex-col">
        {/* Discount badge */}
        {data.originalPrice && data.discountPrice && data.originalPrice > data.discountPrice ? (
          <span className="absolute top-2.5 left-2.5 z-10 bg-warning text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
            {Math.round(((data.originalPrice - data.discountPrice) / data.originalPrice) * 100)}% OFF
          </span>
        ) : null}

        <Link
          to={`${isEvent === true ? `/product/${data._id}?isEvent=true` : `/product/${data._id}`}`}
          aria-label={data.name}
        >
          <div className="w-full h-[170px] flex items-center justify-center bg-surface-muted rounded-lg overflow-hidden">
            <img
              src={data.images && data.images[0]}
              alt={data.name}
              loading="lazy"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.opacity = 0.35;
              }}
            />
          </div>
        </Link>
        <Link
          to={`${isEvent === true ? `/product/${data._id}?isEvent=true` : `/product/${data._id}`}`}
        >
          <h5 className="pt-3 text-[13px] font-medium text-brand hover:text-brand-dark">
            {data.shop?.name}
          </h5>
        </Link>
        <Link to={`/product/${data._id}`} className="flex-1">
          <h4 className="pt-1 text-[15px] font-[600] text-ink leading-snug line-clamp-2 min-h-[42px]">
            {data.name.length > 50 ? data.name.slice(0, 50) + "..." : data.name}
          </h4>
          {/* Star Rating */}
          <div className="flex items-center mt-2">
            <Ratings rating={data?.ratings} />
            <span className="ml-1 text-[12px] text-ink-faint">
              {data?.sold_out ? `(${data.sold_out} sold)` : ""}
            </span>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-baseline">
              <h5 className={`${styles.productDiscountPrice} !text-[18px]`}>
                ${data.originalPrice === 0 ? data.originalPrice : data.discountPrice}
              </h5>
              {data.originalPrice && data.originalPrice > data.discountPrice ? (
                <h4 className="font-[500] text-[14px] text-ink-faint pl-2 line-through">
                  ${data.originalPrice}
                </h4>
              ) : null}
            </div>

            <span className={`font-[500] text-[13px] ${data.stock > 0 ? "text-success" : "text-errorred"}`}>
              {data.stock > 0 ? "In Stock" : "Out of Stock"}
            </span>
          </div>
        </Link>

        {/* side option */}
        <div className="absolute right-2.5 top-3 flex flex-col gap-3">
          <button
            onClick={() => (click ? removeFromWishlistHandler(data) : addToWishlistHandler(data))}
            aria-label={click ? "Remove from wishlist" : "Add to wishlist"}
            className="w-8 h-8 rounded-full bg-white shadow-card flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
          >
            {click ? (
              <AiFillHeart size={18} color="#dc2626" title="Remove from wishlist" />
            ) : (
              <AiOutlineHeart size={18} color="#334155" title="Add to wishlist" />
            )}
          </button>
          <button
            onClick={() => setOpen(!open)}
            aria-label="Quick view"
            className="w-8 h-8 rounded-full bg-white shadow-card flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
          >
            <AiOutlineEye size={18} color="#334155" title="Quick view" />
          </button>
          <button
            onClick={() => addToCartHandler(data._id)}
            aria-label="Add to cart"
            disabled={data.stock < 1}
            className="w-8 h-8 rounded-full bg-white shadow-card flex items-center justify-center hover:scale-110 transition-transform cursor-pointer disabled:opacity-50"
          >
            <AiOutlineShoppingCart size={19} color="#334155" title="Add to cart" />
          </button>
        </div>
        {open ? <ProductDetailsCard setOpen={setOpen} data={data} /> : null}
      </div>
    </>
  );
};

export default ProductCard;
