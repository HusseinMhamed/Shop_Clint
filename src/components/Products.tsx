import { useEffect, useState } from "react";
import axios from "axios";
import StoreStructureSidebar from "./StoreStructureSidebar.tsx";
import { useNavigate, useSearchParams } from "react-router-dom";
const apiUrl = "http://localhost:5000";

interface IProduct {
  _id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  type: string;
  category: string;
  model: string;
}
const Products = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

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

  const [products, setProducts] = useState<IProduct[]>([]);

  async function fetchProducts() {
    try {
      const OBG = Object.fromEntries(searchParams.entries());
      let URLrequest = `${apiUrl}/products/all?`;
      for (let i in OBG) URLrequest += `${i}=${OBG[i]}&`;
      // console.log("URL", URLrequest);
      URLrequest = URLrequest.slice(0, -1);
      // console.log("Constructed query parameter:", OBG);
      const response = await axios.get(URLrequest);
      // console.log("Fetched products:", response.data?.products);
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
      {/* الشريط الجانبي */}
      <StoreStructureSidebar filterByQueryParams={filterByQueryParams} />

      {/* القسم الرئيسي للمنتجات */}
      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold text-center text-white mb-12">
            منتجاتنا
          </h1>

          {/* شبكة المنتجات (Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
            {products.map((product) => (
              <div
                key={product._id}
                className="group flex flex-col bg-[#1e1e1e] rounded-2xl border border-gray-800 shadow-lg overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-blue-500/50"
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
                  {/* طبقة تظليل خفيفة فوق الصورة */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                {/* محتوى الكارت */}
                <div className="flex flex-col flex-grow p-5 space-y-3">
                  <h2 className="text-lg font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                    {product.name}
                  </h2>

                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-blue-500">
                      {product.price.toLocaleString()} ج.م
                    </span>
                  </div>

                  {/* الوصف مع تحديد عدد الأسطر */}
                  <p className="text-gray-400 text-sm line-clamp-2 min-h-[40px] leading-relaxed">
                    {product.description}
                  </p>

                  {/* زر الإضافة - دائماً في الأسفل */}
                  <div className="mt-auto pt-4">
                    <button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-blue-900/20"
                      onClick={() => navigate(`/product/${product._id}`)}
                    >
                      إضافة للسلة
                    </button>
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
