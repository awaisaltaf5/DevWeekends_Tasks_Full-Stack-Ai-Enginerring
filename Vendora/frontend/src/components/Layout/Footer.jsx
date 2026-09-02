import React from "react";
import { Link } from "react-router-dom";
import {
  footercompanyLinks,
  footerProductLinks,
  footerSupportLinks,
} from "../../static/data";

const Footer = () => {
  return (
    <footer className="bg-ink text-white">
      {/* CTA / trust band */}
      <div className="bg-brand-dark">
        <div className="max-w-[1280px] mx-auto px-4 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold leading-snug">
              Ready to start selling on Vendora?
            </h2>
            <p className="text-white/80 text-sm mt-1">
              Join thousands of trusted sellers and reach millions of buyers.
            </p>
          </div>
          <Link
            to="/shop-create"
            className="inline-flex items-center justify-center px-7 h-[48px] rounded-lg bg-white text-brand-dark font-[600] hover:bg-surface-soft transition-colors shrink-0"
          >
            Open a Shop — It’s Free
          </Link>
        </div>
      </div>

      {/* Link columns */}
      <div className="max-w-[1280px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-4 py-14">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <span className="text-[26px] font-Poppins font-bold tracking-tight">
            <span className="text-white">Ven</span>
            <span className="text-[#a78bfa]">dora</span>
          </span>
          <p className="text-white/70 text-sm leading-relaxed mt-3">
            A modern multi-vendor marketplace connecting buyers with trusted
            independent sellers — secure payments, fast delivery and buyer
            protection on every order.
          </p>
        </div>

        <div className="md:col-span-1">
          <h3 className="text-[15px] font-semibold mb-4">Marketplace</h3>
          <ul className="space-y-2.5">
            {footerProductLinks.map((link, index) => (
              <li key={index}>
                <Link
                  className="text-white/70 hover:text-white text-sm transition-colors"
                  to={link.link}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-1">
          <h3 className="text-[15px] font-semibold mb-4">Shop</h3>
          <ul className="space-y-2.5">
            {footercompanyLinks.map((link, index) => (
              <li key={index}>
                <Link
                  className="text-white/70 hover:text-white text-sm transition-colors"
                  to={link.link}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-1">
          <h3 className="text-[15px] font-semibold mb-4">Support</h3>
          <ul className="space-y-2.5">
            {footerSupportLinks.map((link, index) => (
              <li key={index}>
                <Link
                  className="text-white/70 hover:text-white text-sm transition-colors"
                  to={link.link}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-[1280px] mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[13px] text-white/60">
          <span>© 2026 Vendora. All rights reserved.</span>
          <span>
            Developed by{" "}
            <span className="text-white/80 font-medium">Muhammad Awais Altaf</span>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;