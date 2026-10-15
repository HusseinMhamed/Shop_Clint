import {
  useEffect,
  useState,
} from "react";
import { useDispatch } from "react-redux";
import { close, loading } from "../../../slices/SuccessFaildState/SFS.js";
import axios from "../../../AxiosApi.jsx";
import { SERVER_URL } from "../../../Constant.js";

const initialFormData = {
  name: "",
  selectedTypeIndex: -1,
  selectedCategoryIndex: -1,
};

const AddCategoryStructure = () => {
  const Dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("type");

  const [formData, setFormData] = useState(initialFormData);

  const [types, setTypes] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (activeTab === "category" || activeTab === "model") {
      const fetchTypes = async () => {
        Dispatch(loading());
        try {
          const response = await axios.get(
            `${SERVER_URL}/productsmetadata/types`,
          );
          setTypes(response.data?.data || []);
          setFormData(initialFormData);
        } catch (error) {
          console.log("Error fetching types:", error.response || error);
          setTimeout(
            () => alert("هناك مشكلة : " + error.response.data.message || error),
            500,
          );
        }
        Dispatch(close());
      };
      fetchTypes();
    }
  }, [activeTab]);

  const handleInputChange = (
    e,
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
        selectedCategoryIndex: -1,
        selectedTypeIndex,
      });
      if (activeTab === "model" && selectedTypeIndex !== -1) {
        console.log("Fetching categories for type index:", selectedTypeIndex);
        const fetchCategories = async () => {
          Dispatch(loading());
          try {
            const response = await axios.get(
              `${SERVER_URL}/productsmetadata/categories/${selectedTypeIndex !== -1 ? types[selectedTypeIndex]?._id : ""}`,
            );
            setCategories(response.data?.data || []);
          } catch (error) {
            console.log("Error fetching categories:", error.response || error);
          }
          Dispatch(close());
        };
        fetchCategories();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Sending Data:", formData);
    Dispatch(loading());
    if (activeTab === "type") {
      try {
        await axios.post(
          `${SERVER_URL}/productsmetadata/types`,
          {
            name: formData.name,
          },
        );
        setTimeout(() => alert("تم الحفظ بنجاح"), 500);
      } catch (error) {
        console.log("Error creating type:", error.response || error);
        setTimeout(
          () => alert("هناك مشكلة : " + error.response.data.message || error),
          500,
        );
      }
    } else if (activeTab === "category") {
      try {
        if (formData.selectedTypeIndex === -1) {
          throw new Error("Please select a type for the category.");
        }
        await axios.post(
          `${SERVER_URL}/productsmetadata/categories`,
          {
            name: formData.name,
            typeId: types[formData.selectedTypeIndex]?._id || "",
          },
        );
        setTimeout(() => alert("تم الحفظ بنجاح"), 500);
      } catch (error) {
        console.log("Error creating category:", error.response || error);
        setTimeout(
          () => alert("هناك مشكلة : " + error.response.data.message || error),
          500,
        );
      }
    } else if (activeTab === "model") {
      try {
        if (
          formData.selectedTypeIndex === -1 ||
          formData.selectedCategoryIndex === -1
        ) {
          throw new Error("Please select a type and category for the model.");
        }
        await axios.post(
          `${SERVER_URL}/productsmetadata/models`,
          {
            name: formData.name,
            categoryId: categories[formData.selectedCategoryIndex]?._id || "",
          },
        );
        setTimeout(() => alert("تم الحفظ بنجاح"), 500);
      } catch (error) {
        console.log(
          "Error creating model:",
          error.response.data.message || error,
        );
        setTimeout(
          () => alert("هناك مشكلة : " + error.response.data.message || error),
          500,
        );
      }
    }

    Dispatch(close());
  };

  return (
    <div
      className="w-full mt-6 bg-[#1e293b]/20 p-6 rounded-xl border border-gray-700 backdrop-blur-sm"
      dir="rtl"
    >
      <div className="flex space-x-2 mb-6 bg-[#0f172a] p-1 rounded-lg">
        {["type", "category", "model"].map((tab) => (
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
