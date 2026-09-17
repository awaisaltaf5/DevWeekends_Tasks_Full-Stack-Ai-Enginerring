import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import Loader from "../components/Layout/Loader";
import ProductCard from "../components/Route/ProductCard/ProductCard";
import styles from "../styles/styles";
import { getAllProducts } from "../redux/actions/product";

const ProductsPage = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const categoryData = searchParams.get("category");
  const searchData = searchParams.get("search")?.trim().toLowerCase() || "";
  const { allProducts, error, isLoading } = useSelector((state) => state.products);
  const [data, setData] = useState([]);

  useEffect(() => {
    const filteredProducts = (allProducts || []).filter((product) => {
      const matchesCategory =
        categoryData === null || product.category === categoryData;
      const searchableText = [
        product.name,
        product.description,
        product.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesCategory && (!searchData || searchableText.includes(searchData));
    });

    setData(filteredProducts);
    //    window.scrollTo(0,0);
  }, [allProducts, categoryData, searchData]);

  return (
    <>
      {isLoading && !allProducts ? (
        <Loader />
      ) : error && !allProducts ? (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-5 text-center">
          <h1 className="text-[24px] font-[600]">Products are temporarily unavailable</h1>
          <p className="text-[#666]">{error}</p>
          <button
            type="button"
            className={`${styles.button} w-[140px]`}
            onClick={() => dispatch(getAllProducts())}
          >
            Try again
          </button>
        </div>
      ) : (
        <div>
          <Header activeHeading={3} />
          <br />
          <br />
          <div className={`${styles.section}`}>
            <div className="mb-6">
              <h1 className="text-[28px] font-[600]">Products</h1>
              <p className="text-[15px] text-[#666]">
                {searchData
                  ? `Results for "${searchParams.get("search")}" (${data.length})`
                  : categoryData
                    ? `${categoryData} (${data.length})`
                    : `${data.length} products`}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-4 lg:gap-[25px] xl:grid-cols-5 xl:gap-[30px] mb-12">
              {data &&
                data.map((i, index) => <ProductCard data={i} key={index} />)}
            </div>
            {data && data.length === 0 ? (
              <h1 className="text-center w-full pb-[100px] text-[20px]">
                No products Found!
              </h1>
            ) : null}
          </div>
          <Footer />
        </div>
      )}
    </>
  );
};

export default ProductsPage;
