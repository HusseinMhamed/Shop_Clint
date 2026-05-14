import React, {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../Store.Types.ts";
import { close, loading } from "../../../slices/SuccessFaildState/SFS.ts";
import axios from "../../../AxiosApi.jsx";
import { SERVER_URL } from "../../../Constant.js";

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

const initialFormData = {
  selectedTypeIndex: -1,
  selectedCategoryIndex: -1,
  selectedModelIndex: -1,
  newName: "", // الاسم الجديد بعد التعديل
};

const EditCategoryStructure: React.FC = () => {
  const Dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState<"type" | "category" | "model">(
    "type",
  );

  const [formData, setFormData] = useState(initialFormData);
  const [types, setTypes] = useState<IType[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [models, setModels] = useState<IModel[]>([]);

  useEffect(() => {
    const fetchTypes = async () => {
      Dispatch(loading());
      try {
        const response = await axios.get(
          `${SERVER_URL}/productsmetadata/types`,
        );
        setTypes(response.data?.data || []);
        setFormData(initialFormData);
      } catch (error: any) {
        console.error("Error fetching types:", error);
      }
      Dispatch(close());
    };
    fetchTypes();
  }, [activeTab]);

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value);
    const name = e.target.name;

    if (name === "selectedTypeIndex") {
      const selectedName = value !== -1 ? types[value]?.name : "";
      setFormData({
        ...initialFormData,
        selectedTypeIndex: value,
        newName: activeTab === "type" && selectedName ? selectedName : "",
      });
      if ((activeTab === "category" || activeTab === "model") && value !== -1) {
        fetchCategories(types[value]?._id || "");
      }
    } else if (name === "selectedCategoryIndex") {
      const selectedName = value !== -1 ? categories[value]?.name : "";
      setFormData({
        ...formData,
        selectedCategoryIndex: value,
        selectedModelIndex: -1,
        newName: activeTab === "category" && selectedName ? selectedName : "",
      });
      if (activeTab === "model" && value !== -1) {
        fetchModels(categories[value]?._id || "");
      }
    } else if (name === "selectedModelIndex") {
      const selectedName = value !== -1 ? models[value]?.name : "";
      setFormData({
        ...formData,
        selectedModelIndex: value,
        newName: selectedName || "",
      });
    }
  };

  const fetchCategories = async (typeId: string) => {
    Dispatch(loading());
    try {
      const response = await axios.get(
        `${SERVER_URL}/productsmetadata/categories/${typeId}`,
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
      const response = await axios.get(
        `${SERVER_URL}/productsmetadata/models/${categoryId}`,
      );
      setModels(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching models:", error);
    }
    Dispatch(close());
  };

  const handleEdit = async (e: FormEvent) => {
    e.preventDefault();

    let idToEdit = "";
    let endpoint = "";

    if (activeTab === "type" && formData.selectedTypeIndex !== -1) {
      idToEdit = types[formData.selectedTypeIndex]?._id || "";
      endpoint = "types";
    } else if (
      activeTab === "category" &&
      formData.selectedCategoryIndex !== -1
    ) {
      idToEdit = categories[formData.selectedCategoryIndex]?._id || "";
      endpoint = "categories";
    } else if (activeTab === "model" && formData.selectedModelIndex !== -1) {
      idToEdit = models[formData.selectedModelIndex]?._id || "";
      endpoint = "models";
    }

    if (!idToEdit || !formData.newName.trim())
      return alert("الرجاء اختيار عنصر وإدخال الاسم الجديد");

    Dispatch(loading());
    try {
      await axios.patch(
        `${SERVER_URL}/productsmetadata/${endpoint}/${idToEdit}`,
        {
          name: formData.newName,
        },
      );
      setFormData(initialFormData);
      setActiveTab(activeTab); // لإعادة التحميل
      setTimeout(() => {
        alert("تم التعديل بنجاح");
      }, 500);
    } catch (error: any) {
      console.error("Error editing:", error);

      setTimeout(() => {
        alert(`فشل التعديل: ${error.response?.data?.message || error.message}`);
      }, 500);
    }
    Dispatch(close());
  };

  return (
    <div
      className="w-full mt-6 bg-[#1e1b4b]/20 p-6 rounded-xl border border-indigo-900/30 backdrop-blur-sm"
      dir="rtl"
    >
      <h2 className="text-indigo-400 font-bold mb-4 flex items-center gap-2">
        <span>📝 تعديل المسميات</span>
      </h2>

      <div className="flex space-x-2 mb-6 bg-[#0f172a] p-1 rounded-lg flex-row-reverse">
        {(["model", "category", "type"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === tab
                ? "bg-indigo-600 text-white shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            {tab === "type"
              ? "تعديل نوع"
              : tab === "category"
                ? "تعديل فئة"
                : "تعديل موديل"}
          </button>
        ))}
      </div>

      <form onSubmit={handleEdit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            name="selectedTypeIndex"
            value={formData.selectedTypeIndex}
            onChange={handleSelectChange}
            className="bg-[#0f172a] border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 outline-none"
          >
            <option value="-1" hidden>
              اختر النوع المراد تعديله...
            </option>
            {types.map((t, index) => (
              <option key={t._id} value={index}>
                {t.name}
              </option>
            ))}
          </select>

          {(activeTab === "category" || activeTab === "model") && (
            <select
              name="selectedCategoryIndex"
              value={formData.selectedCategoryIndex}
              onChange={handleSelectChange}
              disabled={formData.selectedTypeIndex === -1}
              className="bg-[#0f172a] border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 outline-none disabled:opacity-50"
            >
              <option value="-1" hidden>
                اختر الفئة المراد تعديلها...
              </option>
              {categories.map((c, index) => (
                <option key={c._id} value={index}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          {activeTab === "model" && (
            <select
              name="selectedModelIndex"
              value={formData.selectedModelIndex}
              onChange={handleSelectChange}
              disabled={formData.selectedCategoryIndex === -1}
              className="bg-[#0f172a] border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 outline-none disabled:opacity-50"
            >
              <option value="-1" hidden>
                اختر الموديل المراد تعديله...
              </option>
              {models.map((m, index) => (
                <option key={m._id} value={index}>
                  {m.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* حقل إدخال الاسم الجديد يظهر عند اختيار أي عنصر */}
        {(formData.newName !== "" ||
          (activeTab === "type" && formData.selectedTypeIndex !== -1)) && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="block mb-2 text-sm font-medium text-gray-300">
              الاسم الجديد:
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={formData.newName}
                onChange={(e) =>
                  setFormData({ ...formData, newName: e.target.value })
                }
                placeholder="أدخل الاسم الجديد هنا..."
                className="flex-1 bg-[#0f172a] border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2.5 outline-none"
              />
              <button
                type="submit"
                className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-800 font-medium rounded-lg text-sm px-8 py-2.5 text-center transition-all"
              >
                تحديث الاسم
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default EditCategoryStructure;
