import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../styles/styles";
import { categoriesData, navItems } from "../../static/data";
import {
  AiOutlineHeart,
  AiOutlineSearch,
  AiOutlineShoppingCart,
  AiOutlineSetting,
  AiOutlineMenu,
} from "react-icons/ai";
import { IoIosArrowDown } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import DropDown from "./DropDown";
import Navbar from "./Navbar";
import { useSelector } from "react-redux";
import Cart from "../cart/Cart";
import Wishlist from "../Wishlist/Wishlist";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";

const Header = ({ activeHeading }) => {
  const { isSeller } = useSelector((state) => state.seller);
  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const { allProducts } = useSelector((state) => state.products);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchData, setSearchData] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [dropDown, setDropDown] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const [openWishlist, setOpenWishlist] = useState(false);
  const [open, setOpen] = useState(false); // mobile menu drawer
  const [mobileSearch, setMobileSearch] = useState(false);
  const [accountMenu, setAccountMenu] = useState(false);
  const accountRef = useRef(null);
  const navigate = useNavigate();

  // Sticky/compact navbar on scroll (listener bound once)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 70);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close account menu on outside click / Escape
  useEffect(() => {
    if (!accountMenu) return;
    const onClick = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountMenu(false);
      }
    };
    const onKey = (e) => e.key === "Escape" && setAccountMenu(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [accountMenu]);

  // Lock body scroll while mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    const filteredProducts =
      allProducts &&
      allProducts.filter((product) =>
        product.name.toLowerCase().includes(term.toLowerCase())
      );
    setSearchData(term ? filteredProducts.slice(0, 6) : null);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setSearchData(null);
    setOpen(false);
    setMobileSearch(false);
    navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
  };

  const logoutHandler = () => {
    setAccountMenu(false);
    axios
      .get(`${server}/user/logout`, { withCredentials: true })
      .then(() => {
        window.location.replace("/");
        toast.success("Logged out successfully");
      })
      .catch(() => toast.error("Could not log out. Please try again."));
  };

  const SearchBox = ({ autoFocus }) => (
    <form onSubmit={submitSearch} role="search" className="relative w-full">
      <div className="flex items-center border-2 border-[#3b2fc9] rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#3b2fc9]/30 bg-white">
        <input
          type="search"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search products, brands and more…"
          aria-label="Search products"
          autoFocus={autoFocus}
          className="h-[44px] flex-1 px-4 text-[15px] outline-none bg-white min-w-0"
        />
        <button
          type="submit"
          aria-label="Search"
          className="h-[44px] px-5 bg-[#3b2fc9] hover:bg-[#2f24a3] text-white flex items-center justify-center transition-colors"
        >
          <AiOutlineSearch size={22} />
        </button>
      </div>
      {searchData && searchData.length > 0 && (
        <div className="absolute top-[50px] left-0 w-full bg-white shadow-lg rounded-lg border border-[#ececf3] py-2 z-40 max-h-[360px] overflow-y-auto">
          {searchData.map((p) => (
            <Link
              key={p._id}
              to={`/product/${p._id}`}
              onClick={() => setSearchData(null)}
              className="flex items-center gap-3 px-4 py-2 hover:bg-[#f6f6fb]"
            >
              <img
                src={p.images && p.images[0]}
                alt=""
                className="w-[40px] h-[40px] rounded object-cover shrink-0"
                loading="lazy"
              />
              <span className="text-[14px] text-[#1c1c28] line-clamp-1">{p.name}</span>
            </Link>
          ))}
        </div>
      )}
    </form>
  );

  return (
    <>
      {/* ===== Desktop top bar ===== */}
      <header
        className={`hidden 800px:block sticky top-0 z-30 bg-white transition-shadow duration-300 ${
          scrolled ? "shadow-md" : "border-b border-[#e8e8f2]"
        }`}
      >
        <div className={`${styles.section} transition-all duration-300 ${scrolled ? "py-2" : "py-4"}`}>
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link to="/" aria-label="Vendora home" className="shrink-0">
              <span className="text-[26px] font-Poppins font-bold tracking-tight">
                <span className="text-[#3b2fc9]">Ven</span>
                <span className="text-[#7c3aed]">dora</span>
              </span>
            </Link>

            {/* Search with live suggestions */}
            <div className="flex-1">
              <SearchBox />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-5 shrink-0">
              {/* Wishlist */}
              <button
                type="button"
                aria-label={`Wishlist (${wishlist ? wishlist.length : 0} items)`}
                onClick={() => setOpenWishlist(true)}
                className="relative p-1 text-[#1c1c28] hover:text-[#3b2fc9] transition-colors"
              >
                <AiOutlineHeart size={26} />
                {wishlist && wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#7c3aed] text-white text-[11px] font-semibold flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Cart */}
              <button
                type="button"
                aria-label={`Cart (${cart ? cart.length : 0} items)`}
                onClick={() => setOpenCart(true)}
                className="relative p-1 text-[#1c1c28] hover:text-[#3b2fc9] transition-colors"
              >
                <AiOutlineShoppingCart size={26} />
                {cart && cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#3b2fc9] text-white text-[11px] font-semibold flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>

              {/* Account dropdown */}
              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={accountMenu}
                  aria-label="Account menu"
                  onClick={() => setAccountMenu((v) => !v)}
                  className="flex items-center gap-1 p-1 text-[#1c1c28] hover:text-[#3b2fc9] transition-colors"
                >
                  {isAuthenticated && user && user.avatar ? (
                    <img src={user.avatar} alt="" className="w-[30px] h-[30px] rounded-full object-cover" />
                  ) : (
                    <CgProfile size={28} />
                  )}
                  <IoIosArrowDown size={14} />
                </button>
                {accountMenu && (
                  <div
                    role="menu"
                    className="absolute right-0 top-[44px] w-[210px] bg-white shadow-lg rounded-lg border border-[#ececf3] py-2 z-40"
                  >
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-2 border-b border-[#ececf3]">
                          <p className="text-[14px] font-semibold text-[#1c1c28] truncate">{user?.name}</p>
                          <p className="text-[12px] text-[#6b6b7b] truncate">{user?.email}</p>
                        </div>
                        <Link
                          to="/profile"
                          role="menuitem"
                          onClick={() => setAccountMenu(false)}
                          className="flex items-center gap-2 px-4 py-2 text-[14px] text-[#1c1c28] hover:bg-[#f6f6fb]"
                        >
                          <CgProfile size={16} /> Profile
                        </Link>
                        <Link
                          to="/profile"
                          role="menuitem"
                          onClick={() => setAccountMenu(false)}
                          className="flex items-center gap-2 px-4 py-2 text-[14px] text-[#1c1c28] hover:bg-[#f6f6fb]"
                        >
                          <AiOutlineSetting size={16} /> Settings
                        </Link>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={logoutHandler}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 text-[14px] text-errorred hover:bg-errorred-soft"
                        >
                          Log out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          role="menuitem"
                          onClick={() => setAccountMenu(false)}
                          className="flex items-center gap-2 px-4 py-2 text-[14px] font-medium text-brand hover:bg-brand-soft"
                        >
                          <CgProfile size={16} /> Log in
                        </Link>
                        <Link
                          to="/sign-up"
                          role="menuitem"
                          onClick={() => setAccountMenu(false)}
                          className="flex items-center gap-2 px-4 py-2 text-[14px] text-[#1c1c28] hover:bg-[#f6f6fb]"
                        >
                          Create account
                        </Link>
                      </>
                    )}
                    {!isSeller && (
                      <Link
                        to="/shop-create"
                        role="menuitem"
                        onClick={() => setAccountMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-[14px] text-[#1c1c28] hover:bg-[#f6f6fb] border-t border-[#ececf3] mt-1 pt-2"
                      >
                        <AiOutlineMenu size={15} /> Become a Seller
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Secondary navigation bar */}
          <nav
            aria-label="Primary"
            className="hidden 800px:block bg-brand text-white border-t border-brand-dark"
          >
            <div className="max-w-[1280px] mx-auto px-4 flex items-center">
              {/* All Categories */}
              <div className="relative">
                <button
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={dropDown}
                  onClick={() => setDropDown((v) => !v)}
                  className="flex items-center gap-1 pr-6 py-3 text-[15px] font-[500] text-white hover:bg-brand-dark transition-colors"
                >
                  All Categories <IoIosArrowDown size={14} />
                </button>
                {dropDown && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setDropDown(false)}
                    />
                    <div className="absolute left-0 top-full z-30">
                      <DropDown categoriesData={categoriesData} setDropDown={setDropDown} />
                    </div>
                  </>
                )}
              </div>
              <Navbar />
              <div className="ml-auto hidden 1100px:flex items-center gap-2">
                <Link
                  to="/shop-create"
                  className="px-4 py-2 rounded-md bg-white/15 hover:bg-white/25 border border-white/20 text-[14px] font-semibold text-white transition-colors"
                >
                  Become a Seller
                </Link>
              </div>
            </div>
          </nav>
        </div>
        </header>

        {/* ===== Mobile header bar ===== */}
        <header className="800px:hidden sticky top-0 z-30 bg-white border-b border-line shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 gap-2">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
              className="p-2 -ml-2 text-ink rounded-md hover:bg-surface-soft transition-colors"
            >
              <AiOutlineMenu size={26} />
            </button>
            <Link to="/" aria-label="Vendora home" className="shrink-0">
              <span className="text-[22px] font-Poppins font-bold tracking-tight">
                <span className="text-brand">Ven</span>
                <span className="text-[#7c3aed]">dora</span>
              </span>
            </Link>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Search"
                onClick={() => setMobileSearch(true)}
                className="p-2 text-ink rounded-md hover:bg-surface-soft transition-colors"
              >
                <AiOutlineSearch size={24} />
              </button>
              <span className="hidden" aria-hidden="true" />
              <button
                type="button"
                aria-label="Open wishlist"
                onClick={() => setOpenWishlist(true)}
                className="relative p-2 text-ink rounded-md hover:bg-surface-soft transition-colors"
              >
                <AiOutlineHeart size={24} />
                {wishlist && wishlist.length > 0 && (
                  <span className="absolute top-1 -right-0 min-w-[18px] h-[18px] px-1 rounded-full bg-[#7c3aed] text-white text-[11px] font-semibold flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                aria-label="Open cart"
                onClick={() => setOpenCart(true)}
                className="relative p-2 text-ink rounded-md hover:bg-surface-soft transition-colors"
              >
                <AiOutlineShoppingCart size={24} />
                {cart && cart.length > 0 && (
                  <span className="absolute top-1 -right-0 min-w-[18px] h-[18px] px-1 rounded-full bg-brand text-white text-[11px] font-semibold flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile drawer */}
        {open && (
          <div className="fixed inset-0 z-50 800px:hidden" role="dialog" aria-modal="true">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-[300px] max-w-[85%] bg-white shadow-pop flex flex-col overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-line">
                <span className="text-[20px] font-bold text-brand">Vendora</span>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="p-2 text-ink"
                >
                  ✕
                </button>
              </div>
              <div className="p-4">
                <SearchBox autoFocus />
              </div>
              <nav className="flex-1">
                {navItems.map((i) => (
                  <Link
                    key={i.url}
                    to={i.url}
                    onClick={() => setOpen(false)}
                    className="block px-5 py-3 text-[15px] font-medium text-ink border-b border-line"
                  >
                    {i.title}
                  </Link>
                ))}
                {categoriesData.map((c) => (
                  <button
                    key={c.title}
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      navigate(`/products?category=${c.title}`);
                    }}
                    className="w-full text-left flex items-center gap-3 px-5 py-3 text-[15px] text-ink border-b border-line"
                  >
                    <img
                      src={c.image_Url}
                      onError={(e) => {
                        if (!e.currentTarget.dataset.fb) {
                          e.currentTarget.dataset.fb = "1";
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=60&q=80";
                        }
                      }}
                      alt=""
                      className="w-6 h-6 object-cover rounded"
                    />
                    {c.title}
                  </button>
                ))}
              </nav>
              <div className="p-4 border-t border-line space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setOpen(false)}
                      className="block text-center py-2.5 rounded-lg bg-brand text-white font-medium"
                    >
                      My Account
                    </Link>
                    <button
                      type="button"
                      onClick={logoutHandler}
                      className="w-full py-2.5 rounded-lg border border-line text-ink font-medium"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="block text-center py-2.5 rounded-lg bg-brand text-white font-medium"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/sign-up"
                      onClick={() => setOpen(false)}
                      className="block text-center py-2.5 rounded-lg border border-line text-ink font-medium"
                    >
                      Create account
                    </Link>
                  </>
                )}
                {!isSeller && (
                  <Link
                    to="/shop-create"
                    onClick={() => setOpen(false)}
                    className="block text-center py-2.5 rounded-lg bg-warning-soft text-warning font-medium"
                  >
                    Become a Seller
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile search overlay */}
        {mobileSearch && (
          <div className="fixed inset-x-0 top-0 z-50 bg-white p-4 shadow-pop 800px:hidden">
            <div className="flex items-center gap-3">
              <SearchBox autoFocus />
              <button
                type="button"
                aria-label="Close search"
                onClick={() => setMobileSearch(false)}
                className="p-2 text-ink"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {openCart && <Cart setOpenCart={setOpenCart} />}
        {openWishlist && <Wishlist setOpenWishlist={setOpenWishlist} />}
      </>
  );
};

export default Header;

