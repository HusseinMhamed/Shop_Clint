import React, {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../Store.Types.ts";
import { close, loading } from "../../../slices/SuccessFaildState/SFS.ts";
import axios from "axios";
// تعريف أنواع البيانات لتتوافق مع الـ Mongoose Schema
interface IType {
  _id: string;
  name: string;
}
const apiUrl = "http://localhost:5000";
interface ICategory extends IType {
  parentType: string;
}
interface IModel extends IType {
  parentCategory: string;
}
const initialFormData = {
  name: "",
  selectedTypeIndex: -1,
  selectedCategoryIndex: -1,
};

const AddCategoryStructure: React.FC = () => {
  const Dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState<"type" | "category" | "model">(
    "type",
  );

  // حالات الإدخال
  const [formData, setFormData] = useState(initialFormData);

  // مثال لبيانات تجريبية (سيتم جلبها لاحقاً من Redux أو API)
  // const types: IType[] = [];
  const [types, setTypes] = useState<IType[]>([]);
  // const categories: ICategory[] = [];
  const [categories, setCategories] = useState<ICategory[]>([]);

  useEffect(() => {
    if (activeTab === "category" || activeTab === "model") {
      const fetchTypes = async () => {
        Dispatch(loading());
        // هنا يتم جلب الأنواع من الـ API أو Redux
        try {
          const response = await axios.get(`${apiUrl}/productsmetadata/types`);
          // console.log("00000000", response.data);
          setTypes(response.data?.data || []);
          setFormData(initialFormData);
        } catch (error: any) {
          console.log("Error fetching types:", error.response || error);
        }
        Dispatch(close());
      };
      fetchTypes();
    }
  }, [activeTab]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    if (e.target.name === "name") {
      setFormData({
        ...formData,
        name: e.target.value,
      });
    } else if (e.target.name === "selectedCategoryIndex") {
      const selectedCategoryIndex = parseInt(e.target.value);
      setFormData({
        ...formData,
        selectedCategoryIndex,
      });
    } else if (e.target.name === "selectedTypeIndex") {
      const selectedTypeIndex = parseInt(e.target.value);
      setFormData({
        ...formData,
        selectedCategoryIndex: -1, // إعادة تعيين الفئة المحددة عند تغيير النوع
        selectedTypeIndex,
      });
      if (activeTab === "model" && selectedTypeIndex !== -1) {
        console.log("Fetching categories for type index:", selectedTypeIndex);
        const fetchCategories = async () => {
          Dispatch(loading());
          // هنا يتم جلب الفئات من الـ API أو Redux
          try {
            const response = await axios.get(
              `${apiUrl}/productsmetadata/categories/${selectedTypeIndex !== -1 ? types[selectedTypeIndex]?._id : ""}`,
            );
            console.log("1111111111", response.data);
            setCategories(response.data?.data || []);
            // setFormData(initialFormData);
          } catch (error: any) {
            console.log("Error fetching categories:", error.response || error);
          }
          Dispatch(close());
        };
        fetchCategories();
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log("Sending Data:", formData);
    Dispatch(loading());
    if (activeTab === "type") {
      // إرسال طلب لإنشاء نوع جديد
      try {
        const response = await axios.post(`${apiUrl}/productsmetadata/types`, {
          name: formData.name,
        });
        console.log("Type created successfully:", response.data);
      } catch (error: any) {
        console.log("Error creating type:", error.response || error);
      }
    } else if (activeTab === "category") {
      // إرسال طلب لإنشاء فئة جديدة
      try {
        if (formData.selectedTypeIndex === -1) {
          throw new Error("Please select a type for the category.");
        }
        const response = await axios.post(
          `${apiUrl}/productsmetadata/categories`,
          {
            name: formData.name,
            typeId: types[formData.selectedTypeIndex]?._id || "",
          },
        );
        console.log("Category created successfully:", response.data);
      } catch (error: any) {
        console.log("Error creating category:", error.response || error);
      }
    } else if (activeTab === "model") {
      try {
        if (
          formData.selectedTypeIndex === -1 ||
          formData.selectedCategoryIndex === -1
        ) {
          throw new Error("Please select a type and category for the model.");
        }
        const response = await axios.post(`${apiUrl}/productsmetadata/models`, {
          name: formData.name,
          categoryId: categories[formData.selectedCategoryIndex]?._id || "",
        });
        console.log("Model created successfully:", response.data);
      } catch (error: any) {
        console.log("Error creating model:", error.response || error);
      }
    }

    Dispatch(close());
  };

  return (
    <div
      className="w-full mt-6 bg-[#1e293b]/20 p-6 rounded-xl border border-gray-700 backdrop-blur-sm"
      dir="rtl"
    >
      {/* Tabs Switcher */}
      <div className="flex space-x-2 mb-6 bg-[#0f172a] p-1 rounded-lg">
        {(["type", "category", "model"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === tab
                ? "bg-blue-600 text-white shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            {tab === "type"
              ? "إضافة نوع"
              : tab === "category"
                ? "إضافة فئة"
                : "إضافة موديل"}
          </button>
        ))}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {activeTab !== "type" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              name="selectedTypeIndex"
              value={formData.selectedTypeIndex}
              onChange={handleInputChange}
              className="bg-[#0f172a] border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none"
            >
              <option value="-1" hidden>
                اختر النوع...
              </option>
              {types.map((t, index) => (
                <option key={t._id} value={index}>
                  {t.name}
                </option>
              ))}
            </select>

            {activeTab === "model" && (
              <select
                name="selectedCategoryIndex"
                value={formData.selectedCategoryIndex}
                onChange={handleInputChange}
                className="bg-[#0f172a] border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none"
              >
                <option value="-1" hidden>
                  اختر الفئة...
                </option>
                {categories.map((c, index) => (
                  <option key={c._id} value={index}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        <div className="flex gap-3 flex-col md:flex-row">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder={`اسم ال${activeTab === "type" ? "نوع" : activeTab === "category" ? "فئة" : "موديل"} الجديد...`}
            className="flex-1 bg-[#0f172a] border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 outline-none"
            required
          />
          <button
            type="submit"
            className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors w-full md:w-auto"
          >
            حفظ الإضافة
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCategoryStructure;
