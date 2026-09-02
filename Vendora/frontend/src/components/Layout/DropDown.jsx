import React from "react";
import { useNavigate } from "react-router-dom";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=40&q=80";

const DropDown = ({ categoriesData, setDropDown }) => {
  const navigate = useNavigate();
  const submitHandle = (title) => {
    navigate(`/products?category=${title}`);
    setDropDown(false);
  };
  return (
    <div className="w-[270px] bg-white absolute z-30 rounded-b-xl shadow-pop border border-line">
      <div className="py-2">
        {categoriesData &&
          categoriesData.map((i, index) => (
            <button
              type="button"
              key={index}
              onClick={() => submitHandle(i.title)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-soft transition-colors"
            >
              <img
                src={i.image_Url}
                onError={(e) => {
                  if (e.currentTarget.src !== FALLBACK_IMG) {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_IMG;
                  }
                }}
                style={{ width: "26px", height: "26px", objectFit: "cover", borderRadius: "6px", userSelect: "none", flexShrink: 0 }}
                alt={i.title}
                loading="lazy"
              />
              <span className="text-[14px] text-ink font-[400] select-none">
                {i.title}
              </span>
            </button>
          ))}
      </div>
    </div>
  );
};

export default DropDown;