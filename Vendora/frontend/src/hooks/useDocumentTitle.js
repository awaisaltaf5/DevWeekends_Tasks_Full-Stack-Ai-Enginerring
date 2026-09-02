import { useEffect } from "react";

/**
 * Sets the document title for the current page. Cleans up on unmount.
 */
const useDocumentTitle = (title) => {
  useEffect(() => {
    const previous = document.title;
    document.title = title
      ? `${title} — Vendora`
      : "Vendora — Multi-Vendor Marketplace";
    return () => {
      document.title = previous;
    };
  }, [title]);
};

export default useDocumentTitle;
