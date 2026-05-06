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

interface IType {
  _id: string;
  name: string;
}
interface ICategory extends IType {
  parentType: string;
}
interface IModel extends IType {
  parentCategory: string;
}

const apiUrl = "http://localhost:5000";

const initialFormData = {
  selectedTypeIndex: -1,
  selectedCategoryIndex: -1,
  selectedModelIndex: -1,
};

const DeleteCategoryStructure: React.FC = () => {
  const Dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState<"type" | "category" | "model">(
    "type",
  );

  const [formData, setFormData] = useState(initialFormData);
  const [types, setTypes] = useState<IType[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [models, setModels] = useState<IModel[]>([]);

  // جلب الأنواع عند تحميل الصفحة أو تغيير التبويب
  useEffect(() => {
    const fetchTypes = async () => {
      Dispatch(loading());
      try {
        const response = await axios.get(`${apiUrl}/productsmetadata/types`);
        setTypes(response.data?.data || []);
        setFormData(initialFormData); // إعادة تعيين الاختيارات
      } catch (error: any) {
        console.error("Error fetching types:", error);
      }
      Dispatch(close());
    };
    fetchTypes();
  }, [activeTab]);

  const handleInputChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value);
    const name = e.target.name;

    if (name === "selectedTypeIndex") {
      setFormData({ ...initialFormData, selectedTypeIndex: value });

      // جلب الفئات إذا كنا في تبويب الفئة أو الموديل
      if ((activeTab === "category" || activeTab === "model") && value !== -1) {
        fetchCategories(types[value]?._id || "");
      }
    } else if (name === "selectedCategoryIndex") {
      setFormData({
        ...formData,
        selectedCategoryIndex: value,
        selectedModelIndex: -1,
      });

      // جلب الموديلات إذا كنا في تبويب الموديل
      if (activeTab === "model" && value !== -1) {
        fetchModels(categories[value]?._id || "");
      }
    } else if (name === "selectedModelIndex") {
      setFormData({ ...formData, selectedModelIndex: value });
    }
  };

  const fetchCategories = async (typeId: string) => {
    Dispatch(loading());
    try {
      const response = await axios.get(
        `${apiUrl}/productsmetadata/categories/${typeId}`,
      );
      setCategories(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
    Dispatch(close());
  };

  const fetchModels = async (categoryId: string) => {
    Dispatch(loading());
    try {
      // افترضت هنا مسار جلب الموديلات بناءً على الفئة
      const response = await axios.get(
        `${apiUrl}/productsmetadata/models/${categoryId}`,
      );
      setModels(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching models:", error);
    }
    Dispatch(close());
  };

  const handleDelete = async (e: FormEvent) => {
    e.preventDefault();

    // التأكد من اختيار العنصر المراد حذفه
    let idToDelete = "";
    let endpoint = "";

    if (activeTab === "type" && formData.selectedTypeIndex !== -1) {
      idToDelete = types[formData.selectedTypeIndex]?._id || "";
      endpoint = "types";
    } else if (
      activeTab === "category" &&
      formData.selectedCategoryIndex !== -1
    ) {
      idToDelete = categories[formData.selectedCategoryIndex]?._id || "";
      endpoint = "categories";
    } else if (activeTab === "model" && formData.selectedModelIndex !== -1) {
      idToDelete = models[formData.selectedModelIndex]?._id || "";
      endpoint = "models";
    }

    if (!idToDelete) return alert("الرجاء تحديد العنصر المراد حذفه");

    if (
      !window.confirm(
        "هل أنت متأكد من قرار الحذف؟ لا يمكن التراجع عن هذه الخطوة.",
      )
    )
      return;

    console.log(idToDelete, endpoint);
    Dispatch(loading());
    try {
      await axios.delete(
        `${apiUrl}/productsmetadata/${endpoint}/${idToDelete}`,
      );
      //   alert("تم الحذف بنجاح");
      setFormData(initialFormData);
      // إعادة تحديث القوائم بعد الحذف
      setActiveTab(activeTab);
    } catch (error: any) {
      console.error("Error deleting:", error);
      alert(`فشل الحذف : ${error.message || ""}`);
    }
    Dispatch(close());
  };

  return (
    <div
      className="w-full mt-6 bg-[#450a0a]/10 p-6 rounded-xl border border-red-900/30 backdrop-blur-sm"
      dir="rtl"
    >
      <h2 className="text-red-500 font-bold mb-4 flex items-center gap-2">
        <span>⚠️ إدارة حذف البيانات</span>
      </h2>

      <div className="text-justify p-3 border-blue-700 border rounded-lg bg-blue-100 my-2">
        <p>
          لاحظ عند حذف اي شيء سوف يتم حذف كل العناصر التي لها علاقة بهذا النوع
          او الفئة او الموديل وسوف يتم حذف كل الفئات والاموديلات التي تلي النوع
          الذي حذفتة وقيس على ذلك
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex space-x-2 mb-6 bg-[#0f172a] p-1 rounded-lg flex-row-reverse">
        {(["model", "category", "type"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === tab
                ? "bg-red-700 text-white shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            {tab === "type"
              ? "حذف نوع"
              : tab === "category"
                ? "حذف فئة"
                : "حذف موديل"}
          </button>
        ))}
      </div>

      <form onSubmit={handleDelete} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* اختيار النوع - يظهر دائماً لأن الفئات والموديلات تعتمد عليه */}
          <select
            name="selectedTypeIndex"
            value={formData.selectedTypeIndex}
            onChange={handleInputChange}
            className="bg-[#0f172a] border border-gray-600 text-white text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5 outline-none"
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

          {/* اختيار الفئة - يظهر في تبويب الفئة والموديل */}
          {(activeTab === "category" || activeTab === "model") && (
            <select
              name="selectedCategoryIndex"
              value={formData.selectedCategoryIndex}
              onChange={handleInputChange}
              disabled={formData.selectedTypeIndex === -1}
              className="bg-[#0f172a] border border-gray-600 text-white text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5 outline-none disabled:opacity-50"
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

          {/* اختيار الموديل - يظهر فقط في تبويب الموديل */}
          {activeTab === "model" && (
            <select
              name="selectedModelIndex"
              value={formData.selectedModelIndex}
              onChange={handleInputChange}
              disabled={formData.selectedCategoryIndex === -1}
              className="bg-[#0f172a] border border-gray-600 text-white text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5 outline-none disabled:opacity-50"
            >
              <option value="-1" hidden>
                اختر الموديل...
              </option>
              {models.map((m, index) => (
                <option key={m._id} value={index}>
                  {m.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-800 font-medium rounded-lg text-sm px-10 py-2.5 text-center transition-colors w-full md:w-auto"
          >
            حذف العنصر المحدد
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeleteCategoryStructure;
