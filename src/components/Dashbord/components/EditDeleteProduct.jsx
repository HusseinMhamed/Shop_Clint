import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../../AxiosApi.jsx";
import { SERVER_URL } from "../../../Constant.js";
import { useDispatch } from "react-redux";
import { loading, close } from "../../../slices/SuccessFaildState/SFS.js";

const initialFormState = {
  _id: "",
  name: "",
  description: "",
  price: 0,
  images: [],
  isFeatured: false,
  discountPercentage: 0,
  priceAfterDiscount: 0,
  priority: 0,
  type: "",
  category: "",
  model: "",
  createdAt: "",
  updatedAt: "",
};

const ProductAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const Dispatch = useDispatch();

  const [product, setProduct] = useState(initialFormState);
  const [types, setTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [models, setModels] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const initData = async () => {
      Dispatch(loading());
      try {
        const [prodRes, typeRes] = await Promise.all([
          axios.get(`${SERVER_URL}/products/${id}`),
          axios.get(`${SERVER_URL}/productsmetadata/types`),
        ]);
        const prodData = prodRes.data.data;
        setTypes(typeRes.data.data);

        setProduct({
          ...prodData,
          type: prodData.type?._id || "",
          category: prodData.category?._id || "",
          model: prodData.model?._id || "",
          isFeatured: prodData.isFeatured || false,
          discountPercentage: prodData.discountPercentage || 0,
        });

        if (prodData.type?._id) fetchCategories(prodData.type._id);
        if (prodData.category?._id) fetchModels(prodData.category._id);
      } catch (err) {
        console.error("Initialization error:", err);
      }
      Dispatch(close());
    };
    initData();
  }, [id]);

  const fetchCategories = async (typeId) => {
    try {
      const res = await axios.get(
        `${SERVER_URL}/productsmetadata/categories/${typeId}`,
      );
      setCategories(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchModels = async (categoryId) => {
    try {
      const res = await axios.get(
        `${SERVER_URL}/productsmetadata/models/${categoryId}`,
      );
      setModels(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    let finalValue = value;

    if (type === "checkbox") {
      finalValue = e.target.checked;
    } else if (name === "price" || name === "discountPercentage") {
      finalValue = Number(value) < 0 ? 0 : Number(value);
      if (name === "discountPercentage" && finalValue > 100) finalValue = 100;
    }

    setProduct((prev) => ({ ...prev, [name]: finalValue }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "type") {
      fetchCategories(value);
      setProduct((prev) => ({
        ...prev,
        type: value,
        category: "",
        model: "",
      }));
      setCategories([]);
      setModels([]);
    }
    if (name === "category") {
      fetchModels(value);
      setProduct((prev) => ({ ...prev, category: value, model: "" }));
      setModels([]);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!product.name) newErrors.name = "يجب إدخال اسم المنتج";
    if (!product.price || product.price <= 0)
      newErrors.price = "يجب إدخال سعر صحيح";
    if (!product.type) newErrors.type = "يجب اختيار النوع";
    if (!product.category) newErrors.category = "يجب اختيار الفئة";
    if (!product.model) newErrors.model = "يجب اختيار الموديل";
    if (!product.images || product.images.length === 0)
      newErrors.images = "يجب وجود صورة واحدة على الأقل";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    console.log(product);
    Dispatch(loading());
    try {
      await axios.put(`${SERVER_URL}/products/${id}`, product);

      setTimeout(() => {
        alert("تم التحديث بنجاح");
      }, 500);
    } catch (err) {
      setTimeout(() => {
        alert(
          "خطأ في التحديث: " + (err.response?.data?.message || err.message),
        );
      }, 500);
    }
    Dispatch(close());
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (files) {
      const currentImagesCount = product.images?.length || 0;
      const remainingSlots = 6 - currentImagesCount;
      if (remainingSlots <= 0) {
        alert("لقد وصلت للحد الأقصى (6 صور)");
        return;
      }
      const filesArray = Array.from(files).slice(0, remainingSlots);
      const newImagesPromises = filesArray.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      });
      const newImagesBase64 = await Promise.all(newImagesPromises);
      setProduct((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...newImagesBase64],
      }));
      setErrors((prev) => ({ ...prev, images: "" }));
    }
  };

  if (!product) return null;

  return (
    <div className="p-6 bg-[#0f172a] min-h-screen text-white" dir="rtl">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h3
            className={`text-lg font-bold flex items-center gap-2 ${errors.images ? "text-red-500" : "text-indigo-400"}`}
          >
            <span>🖼️</span> صور المنتج ({product.images?.length}/6)
          </h3>

          <div
            className={`grid grid-cols-2 gap-3 bg-[#1e293b] p-4 rounded-xl border ${errors.images ? "border-red-500" : "border-gray-700"}`}
          >
            {product.images?.map((img, i) => (
              <div key={i} className="relative group aspect-square">
                <img
                  src={img}
                  className="rounded-lg h-full w-full object-cover border border-gray-600"
                />

                {product.images?.length > 1 && (
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white w-6 h-6 rounded-full text-xs shadow-lg transition-transform hover:scale-110"
                    onClick={() => {
                      if (product.images.length <= 1) {
                        alert(
                          "لا يمكن حذف آخر صورة، يجب أن يحتوي المنتج على صورة واحدة على الأقل.",
                        );
                        return;
                      }

                      const newImages = product.images.filter(
                        (_, index) => index !== i,
                      );

                      setProduct({ ...product, images: newImages });
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}

            {product.images?.length < 6 && (
              <label className="relative aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg hover:border-indigo-500 hover:bg-indigo-500/5 cursor-pointer transition-all">
                <span className="text-2xl text-gray-400">+</span>

                <span className="text-[10px] text-gray-500 text-center px-1">
                  إضافة ({6 - product.images.length} متاح)
                </span>

                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                />
              </label>
            )}
          </div>

          {errors.images && (
            <p className="text-red-500 text-xs mt-1">{errors.images}</p>
          )}
        </div>

        <div className="lg:col-span-2 bg-[#1e293b] p-6 rounded-2xl border border-gray-700 shadow-2xl">
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  اسم المنتج
                </label>
                <input
                  name="name"
                  value={product.name}
                  onChange={handleInputChange}
                  className={`w-full bg-[#0f172a] border p-2.5 rounded-lg outline-none transition-all ${errors.name ? "border-red-500" : "border-gray-600 focus:ring-indigo-500"}`}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  السعر الأصلي (ج.م)
                </label>
                <input
                  name="price"
                  type="number"
                  value={product.price}
                  onChange={handleInputChange}
                  className={`w-full bg-[#0f172a] border p-2.5 rounded-lg outline-none transition-all ${errors.price ? "border-red-500" : "border-gray-600 focus:ring-indigo-500"}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#0f172a]/50 p-4 rounded-xl border border-dashed border-gray-600 ">
              <div>
                <label className="block text-sm text-gray-400 mb-1 font-bold ">
                  نسبة الخصم (%)
                </label>
                <input
                  name="discountPercentage"
                  type="number"
                  value={product.discountPercentage}
                  onChange={handleInputChange}
                  placeholder="مثلاً: 20"
                  className="w-full bg-[#0f172a] border border-gray-600 p-2.5 rounded-lg outline-none focus:ring-red-500"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  السعر الحالي بعد الخصم:{" "}
                  <span className="text-green-400 font-bold">
                    {(
                      product.price -
                      product.price * (product.discountPercentage / 100)
                    ).toFixed(2)}{" "}
                    ج.م
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1 font-bold ">
                  ترتيب الأولوية
                </label>
                <input
                  name="priority"
                  type="number"
                  value={product.priority || 0}
                  onChange={handleInputChange}
                  placeholder="كلما زاد الرقم ظهر أولاً"
                  className="w-full bg-[#0f172a] border border-gray-600 p-2.5 rounded-lg outline-none focus:ring-blue-500"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  مثال: 10 يظهر قبل 1
                </p>
              </div>

              <div className="flex items-center gap-4 pt-6">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={product.isFeatured}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                  <span className="ms-3 text-sm font-bold text-yellow-500">
                    منتج مميز ✨
                  </span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  النوع
                </label>
                <select
                  name="type"
                  value={product.type}
                  onChange={handleInputChange}
                  className="w-full bg-[#0f172a] border border-gray-600 p-2.5 rounded-lg text-sm"
                >
                  <option value="" hidden>
                    اختر النوع
                  </option>
                  {types.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  الفئة
                </label>
                <select
                  name="category"
                  disabled={!product.type}
                  value={product.category}
                  onChange={handleInputChange}
                  className="w-full bg-[#0f172a] border border-gray-600 p-2.5 rounded-lg text-sm"
                >
                  <option value="" hidden>
                    اختر الفئة
                  </option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  الموديل
                </label>
                <select
                  name="model"
                  disabled={!product.category}
                  value={product.model}
                  onChange={handleInputChange}
                  className="w-full bg-[#0f172a] border border-gray-600 p-2.5 rounded-lg text-sm"
                >
                  <option value="" hidden>
                    اختر الموديل
                  </option>
                  {models.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                وصف المنتج
              </label>
              <textarea
                name="description"
                value={product.description}
                onChange={handleInputChange}
                className="w-full bg-[#0f172a] border border-gray-600 p-2.5 rounded-lg h-32 outline-none"
              />
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-700">
              <button
                type="submit"
                className="flex-[2] bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl font-bold shadow-lg shadow-indigo-900/20 transition-all active:scale-95"
              >
                💾 حفظ التغييرات الشاملة
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (
                    window.confirm("⚠️ هل أنت متأكد من حذف هذا المنتج نهائياً؟")
                  ) {
                    Dispatch(loading());
                    try {
                      await axios.delete(`${SERVER_URL}/products/${id}`);
                      navigate("/products");
                    } catch {
                      alert("فشل الحذف");
                    }
                    Dispatch(close());
                  }
                }}
                className="flex-1 bg-red-600/10 text-red-500 border border-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all font-bold"
              >
                🗑️ حذف
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductAdmin;
