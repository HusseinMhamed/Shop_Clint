import React, { useEffect, useState, type ChangeEvent } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../Store.Types.ts";
import { close, loading } from "../../../slices/SuccessFaildState/SFS.ts";

interface ProductData {
  name: string;
  price: string;
  selectedTypeIndex: number;
  selectedCategoryIndex: number;
  selectedModelIndex: number;
  description: string;
  images: File[];
}
const initialFormErrors = {
  name: "",
  price: "",
  type: "",
  category: "",
  model: "",
  description: "",
  images: "",
};
const initialFormData: ProductData = {
  name: "",
  price: "",
  selectedTypeIndex: -1,
  selectedCategoryIndex: -1,
  selectedModelIndex: -1,
  description: "",
  images: [],
};
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
function NewProduct() {
  const Dispatch = useDispatch<AppDispatch>();

  const [formData, setFormData] = useState<ProductData>(initialFormData);

  const [formErrors, setFormErrors] = useState(initialFormErrors);

  const [previews, setPreviews] = useState<string[]>([]);

  const [types, setTypes] = useState<IType[]>([]);
  // const categories: ICategory[] = [];
  const [categories, setCategories] = useState<ICategory[]>([]);
  // const models: IModel[] = [];
  const [models, setModels] = useState<IModel[]>([]);

  useEffect(() => {
    const fetchTypes = async () => {
      Dispatch(loading());
      // هنا يتم جلب الأنواع من الـ API أو Redux
      try {
        const response = await axios.get(`${apiUrl}/productsmetadata/types`);
        setTypes(response.data?.data || []);
      } catch (error: any) {
        console.log("Error fetching types:", error.response || error);
      }
      Dispatch(close());
    };
    fetchTypes();
  }, []);

  const handleInputChange = async (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    // console.log("Input changed:", name, value);
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
      // console.log("Selected type index:", selectedTypeIndex);
      Dispatch(loading());
      // هنا يتم جلب الفئات من الـ API أو Redux
      try {
        const response = await axios.get(
          `${apiUrl}/productsmetadata/categories/${selectedTypeIndex >= 0 ? types[selectedTypeIndex]?._id : ""}`,
        );
        setCategories(response.data?.data || []);
        setFormData((prev) => ({
          ...prev,
          selectedCategoryIndex: -1,
          selectedModelIndex: -1,
        }));
        // setFormData(initialFormData);
      } catch (error: any) {
        console.log("Error fetching categories:", error.response || error);
      }
      Dispatch(close());
    } else if (name === "selectedCategoryIndex") {
      const selectedCategoryIndex = Number(value);
      Dispatch(loading());
      try {
        const response = await axios.get(
          `${apiUrl}/productsmetadata/models/${selectedCategoryIndex >= 0 ? categories[selectedCategoryIndex]?._id : ""}`,
        );
        setModels(response.data?.data || []);
        setFormData((prev) => ({
          ...prev,
          selectedModelIndex: -1,
        }));
      } catch (error: any) {
        console.log("Error fetching models:", error.response || error);
      }
      Dispatch(close());
    }
  };
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
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

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send formData to your backend API

    setFormErrors(initialFormErrors);
    if (!formData.name)
      setFormErrors((prev) => ({ ...prev, name: "Product name is required." }));
    if (!formData.price)
      setFormErrors((prev) => ({ ...prev, price: "Price is required." }));
    if (formData.images.length === 0)
      setFormErrors((prev) => ({
        ...prev,
        images: "At least one image is required.",
      }));
    if (formData.images.length > 6)
      setFormErrors((prev) => ({
        ...prev,
        images: "You can upload a maximum of 6 images.",
      }));
    if (formData.selectedTypeIndex < 0)
      setFormErrors((prev) => ({
        ...prev,
        type: "Please select a type.",
      }));
    if (formData.selectedCategoryIndex < 0)
      setFormErrors((prev) => ({
        ...prev,
        category: "Please select a category.",
      }));
    if (formData.selectedModelIndex < 0)
      setFormErrors((prev) => ({
        ...prev,
        model: "Please select a model.",
      }));

    let hasErrors = false;
    Object.values(formErrors).forEach((error) => {
      if (error) hasErrors = true;
    });
    if (hasErrors) return;
    Dispatch(loading());
    // console.log("Submitting product:", formData);
    try {
      // Reset form after submission
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
      // Replace with your actual API endpoint
      const apiUrl = "http://localhost:5000";

      const response = await axios.post(
        `${apiUrl}/products/create`,
        formDataSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      // console.log("Product created successfully:", response.data);
      setFormData(initialFormData);
      setPreviews([]);
      setTimeout(() => alert("تمت إضافة المنتج بنجاح"), 500);
    } catch (error: any) {
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
      {/* Product Name */}
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

      {/* Type Name */}
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
      {/* categorie Name */}
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
      {/* model Name */}
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

      {/* Price */}
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

      {/* Description */}
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

      {/* Multiple Image Upload */}
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

      {/* Image Previews */}
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

      {/* Submit Button */}
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
