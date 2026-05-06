import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { loading, close } from "../../../slices/SuccessFaildState/SFS.ts";

interface IProduct {
  _id: string;
  name: string;
  price: number;
  description: string;
  type: { name: string };
  category: { name: string };
  model: { name: string };
  images: string[];
}

const apiUrl = "http://localhost:5000";

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const Dispatch = useDispatch();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [activeImage, setActiveImage] = useState<string>("");

  useEffect(() => {
    // console.log(id);
    const fetchProduct = async () => {
      Dispatch(loading());
      try {
        const response = await axios.get(`${apiUrl}/products/${id}`);
        const data = response.data?.data;
        setProduct(data);
        if (data?.images?.length > 0) {
          setActiveImage(data.images[0]); // تعيين أول صورة كصورة رئيسية
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
      Dispatch(close());
    };

    if (id) fetchProduct();
  }, [id, Dispatch]);

  if (!product)
    return (
      <div className="text-white text-center mt-20">جاري تحميل المنتج...</div>
    );

  return (
    <div
      className="max-w-7xl mx-auto p-4 md:p-8 bg-[#0f172a] min-h-screen text-white"
      dir="rtl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* القسم الأيمن: معرض الصور */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-gray-700 bg-[#1e293b]">
            <img
              src={activeImage || "/placeholder-image.png"}
              alt={product.name}
              className="w-full h-full object-contain transition-all duration-500 hover:scale-105"
            />
          </div>

          <div className="flex gap-4 overflow-x-auto p-2">
            {product.images.map((img, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(img)}
                className={`w-20 h-20 rounded-lg border-2 overflow-hidden flex-shrink-0 transition-all ${
                  activeImage === img
                    ? "border-blue-500 scale-105"
                    : "border-gray-700 opacity-60"
                }`}
              >
                <img
                  src={img}
                  alt={`${product.name}-${index}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* القسم الأيسر: تفاصيل المنتج */}
        <div className="flex flex-col justify-start space-y-6">
          <div>
            <nav className="flex text-sm text-gray-400 mb-4 gap-2">
              <span>{product.type?.name}</span>
              <span>/</span>
              <span>{product.category?.name}</span>
              <span>/</span>
              <span className="text-blue-400">{product.model?.name}</span>
            </nav>
            <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
            <p className="text-3xl text-green-400 font-semibold tracking-wide">
              {product.price.toLocaleString()} ج.م
            </p>
          </div>

          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-xl font-medium mb-3">الوصف:</h3>
            <p className="text-gray-300 leading-relaxed text-lg">
              {product.description || "لا يوجد وصف متوفر لهذا المنتج حالياً."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 py-6">
            <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-700">
              <span className="text-gray-400 text-sm block">الفئة</span>
              <span className="font-medium">{product.category?.name}</span>
            </div>
            <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-700">
              <span className="text-gray-400 text-sm block">الموديل</span>
              <span className="font-medium">{product.model?.name}</span>
            </div>
          </div>

          <div className="mt-auto pt-8">
            <button className="w-full md:w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95">
              تواصل معنا لإتمام عملية الشراء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
