import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { loading, close } from "../../../slices/SuccessFaildState/SFS.ts";
import { Tag, Star, ArrowRight, Percent } from "lucide-react"; // أيقونات إضافية لمظهر أفضل
import { open } from "../../../slices/ContactSlice.js";

// تحديث الـ Interface بناءً على الإسكيمة الجديدة
export interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  isFeatured: boolean;
  discountPercentage: number;
  priceAfterDiscount: number;
  priority: number;
  type: any; // استخدمت any لأن الباك إند قد يرسل كائن (Populated) أو ID
  category: any;
  model: any;
  createdAt: string;
  updatedAt: string;
}

const apiUrl = "http://localhost:5000";

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [activeImage, setActiveImage] = useState<string>("");

  useEffect(() => {
    const fetchProduct = async () => {
      dispatch(loading());
      try {
        const response = await axios.get(`${apiUrl}/products/${id}`);
        const data = response.data?.data;
        setProduct(data);
        if (data?.images?.length > 0) {
          setActiveImage(data.images[0]);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
      dispatch(close());
    };

    if (id) fetchProduct();
  }, [id, dispatch]);

  if (!product)
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0f172a] text-white">
        <p className="animate-pulse">جاري تحميل تفاصيل المنتج...</p>
      </div>
    );

  // التأكد من وجود خصم
  const hasDiscount = product.discountPercentage > 0;

  return (
    <div
      className="max-w-7xl mx-auto p-4 md:p-8 bg-[#0f172a] min-h-screen text-white"
      dir="rtl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* القسم الأيمن: معرض الصور */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-gray-700 bg-[#1e293b] group">
            {/* شارة المنتج المميز */}
            {product.isFeatured && (
              <div className="absolute top-4 right-4 z-10 bg-yellow-500 text-black px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                <Star size={16} fill="currentColor" /> مميز
              </div>
            )}

            {/* شارة الخصم */}
            {hasDiscount && (
              <div className="absolute top-4 left-4 z-10 bg-red-600 text-white px-3 py-1 rounded-lg text-lg font-black shadow-lg animate-bounce">
                {product.discountPercentage}%-
              </div>
            )}

            <img
              src={activeImage || "/placeholder-image.png"}
              alt={product.name}
              className="w-full h-full object-contain transition-all duration-700 group-hover:scale-110"
            />
          </div>

          {/* المصغرات */}
          <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar p-4">
            {product.images.map((img, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(img)}
                className={`w-20 h-20 rounded-xl border-2 overflow-hidden flex-shrink-0 transition-all duration-300 ${
                  activeImage === img
                    ? "border-blue-500 scale-105 shadow-lg shadow-blue-500/20"
                    : "border-gray-800 opacity-50 hover:opacity-100"
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
        <div className="flex flex-col space-y-6">
          <div>
            <nav className="flex items-center text-sm text-gray-400 mb-4 gap-2 bg-[#1e293b] w-fit px-4 py-1.5 rounded-full border border-gray-700">
              <span className="hover:text-white cursor-pointer transition-colors">
                {product.type?.name || "عام"}
              </span>
              <ArrowRight size={14} className="rotate-180" />
              <span className="hover:text-white cursor-pointer transition-colors">
                {product.category?.name || "قسم"}
              </span>
              <ArrowRight size={14} className="rotate-180" />
              <span className="text-blue-400 font-medium">
                {product.model?.name || "موديل"}
              </span>
            </nav>

            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              {product.name}
            </h1>

            {/* عرض السعر الجديد */}
            <div className="flex items-end gap-4 mb-2">
              <p className="text-4xl text-green-400 font-black tracking-tight">
                {(product.priceAfterDiscount || product.price).toLocaleString()}{" "}
                ج.م
              </p>
              {hasDiscount && (
                <p className="text-xl text-gray-500 line-through mb-1 decoration-red-500/50">
                  {product.price.toLocaleString()} ج.م
                </p>
              )}
            </div>
            {hasDiscount && (
              <p className="text-sm text-red-400 font-medium">
                لقد وفرت{" "}
                {(product.price - product.priceAfterDiscount).toLocaleString()}{" "}
                ج.م!
              </p>
            )}
          </div>

          <div className="bg-[#1e293b]/50 p-6 rounded-2xl border border-gray-700/50">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-blue-300">
              <Tag size={18} /> عن هذا المنتج:
            </h3>
            <p className="text-gray-300 leading-relaxed text-lg italic font-light">
              {product.description || "لا يوجد وصف تفصيلي متوفر حالياً."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="bg-[#1e293b] p-4 rounded-2xl border border-gray-700 group hover:border-blue-500/50 transition-colors">
              <span className="text-gray-400 text-xs block mb-1">
                الفئة الرئيسية
              </span>
              <span className="font-bold text-gray-100">
                {product.category?.name || "غير محدد"}
              </span>
            </div>
            <div className="bg-[#1e293b] p-4 rounded-2xl border border-gray-700 group hover:border-blue-500/50 transition-colors">
              <span className="text-gray-400 text-xs block mb-1">
                موديل الإصدار
              </span>
              <span className="font-bold text-gray-100">
                {product.model?.name || "غير محدد"}
              </span>
            </div>
          </div>

          <div className="mt-auto pt-6 flex flex-col sm:flex-row gap-4">
            <button
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] flex justify-center items-center gap-2 text-lg"
              onClick={() => dispatch(open())}
            >
              تواصل للطلب الآن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
