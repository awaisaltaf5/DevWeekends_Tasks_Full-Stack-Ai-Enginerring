import React from "react";
import { useNavigate } from "react-router-dom";
import { brandingData, categoriesData } from "../../../static/data";
import styles from "../../../styles/styles";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=400&q=80";

const Categories = () => {
  const navigate = useNavigate();
  const openCategory = (title) => navigate(`/products?category=${title}`);
  return (
    <>
      {/* Trust / benefits strip */}
      <div className={`${styles.section} hidden md:block`}>
        <div className="branding my-12 flex flex-wrap justify-between gap-6 w-full shadow-card bg-white p-6 rounded-xl border border-line">
          {brandingData &&
            brandingData.map((i, index) => (
              <div className="flex items-start gap-3" key={index}>
                <span className="text-brand">{i.icon}</span>
                <div className="px-1">
                  <h3 className="font-bold text-sm md:text-base text-ink">
                    {i.title}
                  </h3>
                  <p className="text-xs md:text-sm text-ink-soft">
                    {i.Description}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Popular categories */}
      <div
        className={`${styles.section} bg-white p-6 rounded-2xl mb-12`}
        id="categories"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[22px] md:text-[26px] font-[600] text-ink">
            Shop by Category
          </h2>
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="text-[14px] font-[500] text-brand hover:text-brand-dark"
          >
            View all ›
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 md:gap-4">
          {categoriesData &&
            categoriesData.map((i) => (
              <button
                type="button"
                aria-label={`Shop ${i.title}`}
                className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-line bg-surface-soft p-4 transition-all duration-200 hover:shadow-card-hover hover:border-brand-light hover:-translate-y-0.5 text-center"
                key={i.id}
                onClick={() => openCategory(i.title)}
              >
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white flex items-center justify-center overflow-hidden border border-line shrink-0">
                  <img
                    src={i.image_Url}
                    onError={(e) => {
                      if (e.currentTarget.src !== FALLBACK_IMG) {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_IMG;
                      }
                    }}
                    className="w-full h-full object-cover"
                    alt={i.title}
                    loading="lazy"
                  />
                </div>
                <h3 className="text-[13px] md:text-[14px] font-[500] text-ink group-hover:text-brand leading-snug">
                  {i.title}
                </h3>
              </button>
            ))}
        </div>
      </div>
    </>
  );
};

export default Categories;