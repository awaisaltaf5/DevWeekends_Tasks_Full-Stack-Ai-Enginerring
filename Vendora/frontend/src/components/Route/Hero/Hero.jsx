import React from 'react';
import { Link } from "react-router-dom";

const Hero = () => {
    return (
        <section
            aria-label="Welcome to Vendora"
            className="relative min-h-[78vh] w-full flex items-center bg-cover bg-center"
            style={{
                backgroundImage:
                    "url(https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1600&q=80)",
            }}
        >
            {/* legibility overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/55 to-ink/20" aria-hidden="true" />

            <div className="relative z-10 w-[90%] 800px:w-[60%] max-w-[1280px] mx-auto px-4 py-16">
                <div className="animate-hero-in">
                    <h1 className="text-white text-[34px] leading-[1.15] 800px:text-[54px] font-[700] font-Poppins capitalize max-w-[16ch]">
                        Everything you need, from sellers you can trust.
                    </h1>
                    <p className="pt-5 text-white/90 text-[16px] 800px:text-[18px] font-[400] max-w-[52ch] leading-relaxed">
                        Discover unique products from trusted independent sellers — with
                        secure payments, fast delivery and buyer protection on every order.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center gap-4">
                        <Link
                            to="/products"
                            className="inline-flex items-center justify-center px-8 h-[50px] rounded-lg bg-brand hover:bg-brand-dark text-white text-[16px] font-[600] transition-colors shadow-card-hover"
                        >
                            Shop Now
                        </Link>
                        <Link
                            to="/shop-create"
                            className="inline-flex items-center justify-center px-8 h-[50px] rounded-lg bg-white/10 hover:bg-white/20 border border-white/30 text-white text-[16px] font-[600] backdrop-blur-sm transition-colors"
                        >
                            Become a Seller
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;