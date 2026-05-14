import { useEffect, useState } from "react";
import axios from "../AxiosApi.jsx";
import { SERVER_URL } from "../Constant.js";
import StoreStructureSidebar from "./StoreStructureSidebar.tsx";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";

interface IProduct {
  _id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  type: string;
  category: string;
  model: string;
  // الحقول الجديدة التي أضفناها للسكيما
  isFeatured?: boolean;
  discountPercentage?: number;
  priceAfterDiscount?: number;
}

const Products = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<IProduct[]>([]);
  const { userInfo } = useSelector((state) => state.auth);

  const filterByQueryParams = ({
    tId,
    cId,
    mId,
  }: {
    tId?: string;
    cId?: string;
    mId?: string;
  }) => {
    if (mId) {
      setSearchParams({
        model: mId,
        ...(tId && { type: tId }),
        ...(cId && { category: cId }),
      });
    } else if (cId) {
      setSearchParams({ category: cId, ...(tId && { type: tId }) });
    } else if (tId) {
      setSearchParams({ type: tId });
    } else {
      setSearchParams({});
    }
  };

  async function fetchProducts() {
    try {
      const OBG = Object.fromEntries(searchParams.entries());
      let URLrequest = `${SERVER_URL}/products/all?`;
      for (let i in OBG) URLrequest += `${i}=${OBG[i]}&`;
      URLrequest = URLrequest.slice(0, -1);
      const response = await axios.get(URLrequest);
      setProducts(response.data?.products || []);
    } catch (error: any) {
      console.error("Error fetching products:", error.message || error);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  return (
    <div className="flex min-h-screen bg-[#121212]" dir="rtl">
      <StoreStructureSidebar filterByQueryParams={filterByQueryParams} />

      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold text-center text-white mb-12">
            منتجاتنا
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
            {products.map((product) => (
              <div
                key={product._id}
                className={`group flex flex-col bg-[#1e1e1e] rounded-2xl border shadow-lg overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                  product.isFeatured
                    ? "border-yellow-500/50 shadow-yellow-500/10"
                    : "border-gray-800 hover:border-blue-500/50"
                }`}
              >
                {/* حاوية الصورة */}
                <div className="relative h-60 w-full overflow-hidden bg-gray-900">
                  <img
                    src={
                      product.images?.length > 0
                        ? product.images[0]
                        : "/placeholder.png"
                    }
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* شارة المنتج المميز */}
                  {product.isFeatured && (
                    <div className="absolute top-3 right-3 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
                      مميز ✨
                    </div>
                  )}

                  {/* شارة الخصم */}
                  {product.discountPercentage &&
                    product.discountPercentage > 0 && (
                      <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
                        خصم {product.discountPercentage}%
                      </div>
                    )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                {/* محتوى الكارت */}
                <div className="flex flex-col flex-grow p-5 space-y-3">
                  <h2 className="text-lg font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                    {product.name}
                  </h2>

                  <div className="flex flex-col">
                    {product.discountPercentage &&
                    product.discountPercentage > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-red-500">
                          {product.priceAfterDiscount?.toLocaleString()} ج.م
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {product.price.toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xl font-black text-blue-500">
                        {product.price.toLocaleString()} ج.م
                      </span>
                    )}
                  </div>

                  <p className="text-gray-400 text-sm line-clamp-2 min-h-[40px] leading-relaxed">
                    {product.description}
                  </p>

                  <div className="mt-auto pt-4 gap-2 flex flex-col text-center">
                    <Link
                      to={`/product/${product._id}`}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-blue-900/20"
                    >
                      عرض التفاصيل
                    </Link>
                    {userInfo && userInfo.role === "admin" && (
                      <Link
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-blue-900/20"
                        to={`/product_patch_delete/${product._id}`}
                      >
                        تعديل
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Products;
