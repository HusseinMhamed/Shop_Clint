import { useEffect, useState } from "react";
import axios from "../../../AxiosApi.jsx";
import { SERVER_URL } from "../../../Constant.js";
import { useDispatch } from "react-redux";
import { close, loading } from "../../../slices/SuccessFaildState/SFS.js";

const initialFormErrors = {
  name: "",
  price: "",
  type: "",
  category: "",
  model: "",
  description: "",
  images: "",
};

const initialFormData = {
  name: "",
  price: "",
  selectedTypeIndex: -1,
  selectedCategoryIndex: -1,
  selectedModelIndex: -1,
  description: "",
  images: [],
};

function NewProduct() {
  const Dispatch = useDispatch();

  const [formData, setFormData] = useState(initialFormData);

  const [formErrors, setFormErrors] = useState(initialFormErrors);

  const [previews, setPreviews] = useState([]);

  const [types, setTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [models, setModels] = useState([]);

  useEffect(() => {
    const fetchTypes = async () => {
      Dispatch(loading());
      try {
        const response = await axios.get(
          `${SERVER_URL}/productsmetadata/types`,
        );
        setTypes(response.data?.data || []);
      } catch (error) {
        console.log("Error fetching types:", error.response || error);
      }
      Dispatch(close());
    };
    fetchTypes();
  }, []);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    if (name === "price" && Number(value) < 0) return;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" ||
        name === "selectedTypeIndex" ||
        name === "selectedCategoryIndex" ||
        name === "selectedModelIndex"
          ? Number(value)
          : value,
    }));

    if (name === "selectedTypeIndex") {
      const selectedTypeIndex = Number(value);
      Dispatch(loading());
      try {
        const response = await axios.get(
          `${SERVER_URL}/productsmetadata/categories/${selectedTypeIndex >= 0 ? types[selectedTypeIndex]?._id : ""}`,
        );
        setCategories(response.data?.data || []);
        setFormData((prev) => ({
          ...prev,
          selectedCategoryIndex: -1,
          selectedModelIndex: -1,
        }));
      } catch (error) {
        console.log("Error fetching categories:", error.response || error);
      }
      Dispatch(close());
    } else if (name === "selectedCategoryIndex") {
      const selectedCategoryIndex = Number(value);
      Dispatch(loading());
      try {
        const response = await axios.get(
          `${SERVER_URL}/productsmetadata/models/${selectedCategoryIndex >= 0 ? categories[selectedCategoryIndex]?._id : ""}`,
        );
        setModels(response.data?.data || []);
        setFormData((prev) => ({
          ...prev,
          selectedModelIndex: -1,
        }));
      } catch (error) {
        console.log("Error fetching models:", error.response || error);
      }
      Dispatch(close());
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...selectedFiles],
      }));

      const newPreviews = selectedFiles.map((file) =>
        URL.createObjectURL(file),
      );
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormErrors(initialFormErrors);
    let errorObj = {};
    if (!formData.name)
      errorObj = { name: "Product name is required." };
    if (!formData.price)
      errorObj = { ...errorObj, price: "Price is required." };
    if (formData.images.length === 0)
      errorObj = { ...errorObj, images: "At least one image is required." };
    if (formData.images.length > 6)
      errorObj = {
        ...errorObj,
        images: "You can upload a maximum of 6 images.",
      };
    if (formData.selectedTypeIndex < 0)
      errorObj = {
        ...errorObj,
        type: "Please select a type.",
      };
    if (formData.selectedCategoryIndex < 0)
      errorObj = {
        ...errorObj,
        category: "Please select a category.",
      };
    if (formData.selectedModelIndex < 0)
      errorObj = {
        ...errorObj,
        model: "Please select a model.",
      };

    let hasErrors = false;
    Object.values(errorObj).forEach((error) => {
      if (error) hasErrors = true;
    });
    if (hasErrors) {
      setFormErrors(errorObj);
      return;
    }
    Dispatch(loading());
    try {
      const formDataSend = new FormData();
      formDataSend.append("name", formData.name);
      formDataSend.append("price", formData.price);
      formDataSend.append("description", formData.description);
      formDataSend.append("type", types[formData.selectedTypeIndex]?._id || "");
      formDataSend.append(
        "category",
        categories[formData.selectedCategoryIndex]?._id || "",
      );
      formDataSend.append(
        "model",
        models[formData.selectedModelIndex]?._id || "",
      );

      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((file) => {
          formDataSend.append("images", file);
        });
      }

      await axios.post(
        `${SERVER_URL}/products/create`,
        formDataSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      setFormData(initialFormData);
      setPreviews([]);
      setTimeout(() => alert("تمت إضافة المنتج بنجاح"), 500);
    } catch (error) {
      console.log(
        "Error creating product:",
        error.response.data.message || error,
      );
      setTimeout(() => alert(error.response.data.message || error), 500);
    }
    Dispatch(close());
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          name="name"
          placeholder="Product Name *"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          onChange={handleInputChange}
          value={formData.name}
        />
        {formErrors.name && (
          <p className="text-red-500 text-sm">{formErrors.name}</p>
        )}
      </div>

      <div>
        <select
          name="selectedTypeIndex"
          value={formData.selectedTypeIndex}
          onChange={handleInputChange}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        >
          <option value="" hidden className="w-full">
            اختر النوع...
          </option>
          {types.map((t, index) => (
            <option key={t._id} value={index} className="w-full">
              {t.name}
            </option>
          ))}
        </select>
        {formErrors.type && (
          <p className="text-red-500 text-sm">{formErrors.type}</p>
        )}
      </div>

      <div>
        <select
          name="selectedCategoryIndex"
          value={formData.selectedCategoryIndex}
          onChange={handleInputChange}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        >
          <option value="-1" hidden className="w-full">
            اختر الفئة...
          </option>
          {categories.map((t, index) => (
            <option key={t._id} value={index} className="w-full">
              {t.name}
            </option>
          ))}
        </select>
        {formErrors.category && (
          <p className="text-red-500 text-sm">{formErrors.category}</p>
        )}
      </div>

      <div>
        <select
          name="selectedModelIndex"
          value={formData.selectedModelIndex}
          onChange={handleInputChange}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        >
          <option value="" hidden className="w-full">
            اختر الموديل...
          </option>
          {models.map((t, index) => (
            <option key={t._id} value={index} className="w-full">
              {t.name}
            </option>
          ))}
        </select>
        {formErrors.model && (
          <p className="text-red-500 text-sm">{formErrors.model}</p>
        )}
      </div>

      <div>
        <input
          type="number"
          name="price"
          placeholder="Price *"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          onChange={handleInputChange}
          value={formData.price}
        />
        {formErrors.price && (
          <p className="text-red-500 text-sm">{formErrors.price}</p>
        )}
      </div>

      <div>
        <textarea
          name="description"
          placeholder="Description *"
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
          onChange={handleInputChange}
          value={formData.description}
        ></textarea>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Upload Images
        </label>
        <div className="flex items-center  w-full flex-col">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-sm text-gray-500">
                Click to upload multiple images
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              multiple
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>
          {formErrors.images && (
            <p className="text-red-500 text-sm mt-2 w-full">
              {formErrors.images}
            </p>
          )}
        </div>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-4">
          {previews.map((src, index) => (
            <div key={index} className="relative group h-24 w-full">
              <img
                src={src}
                alt="Preview"
                className="h-full w-full object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-[#1d70d2] hover:bg-[#155ab0] text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors uppercase tracking-wider mt-6"
      >
        Add Product
      </button>
    </form>
  );
}

export default NewProduct;
