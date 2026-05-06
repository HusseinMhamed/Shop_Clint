import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  Layers,
  Tag,
  Menu, // إضافة أيقونة القائمة
  X, // إضافة أيقونة الإغلاق
} from "lucide-react";
import axios from "axios";
import { useSearchParams } from "react-router-dom"; // استيراد الهوك المطلوب

interface IModel {
  _id: string;
  name: string;
}
interface ICategory {
  _id: string;
  name: string;
  models: IModel[];
}
interface IType {
  _id: string;
  name: string;
  categories: ICategory[];
}

const apiUrl = "http://localhost:5000";

const StoreStructureSidebar = ({
  filterByQueryParams,
}: {
  filterByQueryParams: (params: {
    tId?: string;
    cId?: string;
    mId?: string;
  }) => void;
}) => {
  const [openTypes, setOpenTypes] = useState<Record<string, boolean>>({});
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    {},
  );
  const [structure, setStructure] = useState<IType[]>([]);

  // حالة جديدة للتحكم في ظهور القائمة في الموبايل
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [searchParams] = useSearchParams();
  // ربط الـ Active States بالـ URL مباشرة أو بالـ State
  const [activeType, setActiveType] = useState<string | null>(
    searchParams.get("type"),
  );
  const [activeCategory, setActiveCategory] = useState<string | null>(
    searchParams.get("category"),
  );
  const [activeModel, setActiveModel] = useState<string | null>(
    searchParams.get("model"),
  );

  useEffect(() => {
    const fetchStructure = async () => {
      try {
        const response = await axios(`${apiUrl}/productsmetadata/structure`);
        const treeType = [
          {
            _id: null,
            name: "الكل",
            categories: [],
          },
          ...(response.data?.data || []),
        ];
        // منطق "تذكر" القوائم المفتوحة بناءً على الرابط عند التحميل لأول مرة
        const tId = searchParams.get("type");
        const cId = searchParams.get("category");
        const mId = searchParams.get("model");
        if (tId) {
          setOpenTypes((prev) => ({ ...prev, [tId]: true }));
          setActiveType(tId);
        }
        if (cId) {
          setOpenCategories((prev) => ({ ...prev, [cId]: true }));
          setActiveCategory(cId);
        }

        if (mId) {
          setActiveModel(mId);
        }

        setStructure(treeType);
      } catch (error: any) {
        console.error(
          "Error fetching store structure:",
          error.message || error,
        );
      }
    };
    fetchStructure();
  }, []);

  const toggleType = (id: string) => {
    setOpenTypes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCategory = (id: string) => {
    setOpenCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleChosenType = (tId: string) => {
    setActiveType(tId);
    setActiveCategory(null);
    setActiveModel(null);
    filterByQueryParams({ tId: tId });
  };

  const handleChosenCategory = (tId: string, cId: string) => {
    setActiveType(tId);
    setActiveCategory(cId);
    setActiveModel(null);
    filterByQueryParams({ cId, tId });
  };

  const handleChosenModel = (tId: string, cId: string, mId: string) => {
    setActiveType(tId);
    setActiveCategory(cId);
    setActiveModel(mId);
    filterByQueryParams({ cId, tId, mId });
  };

  return (
    <>
      {/* 1. زر الموبايل - يظهر فقط في الشاشات الأصغر من md */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-20 right-4 z-[60] bg-blue-600 p-2 rounded-md text-white shadow-lg"
      >
        <Menu size={20} />
      </button>

      {/* 2. طبقة التعتيم (Overlay) للموبايل */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* 3. حاوية السايدبار الرئيسية */}
      <div
        className={`
          fixed top-0 right-0 h-screen z-[70] transition-transform duration-300
          md:sticky md:translate-x-0 md:z-50
          ${isMobileOpen ? "translate-x-0" : "translate-x-full"}
          w-72 bg-[#1a1a1ae9] backdrop-blur-md overflow-y-auto p-4 border-l border-gray-800 shadow-xl
        `}
        dir="rtl"
      >
        {/* زر إغلاق للموبايل داخل السايدبار */}
        <div className="flex justify-between items-center mb-6 px-2">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <LayoutGrid className="text-blue-500" size={24} />
            أقسام المتجر
          </h2>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-2">
          {structure.map((type) => (
            <div key={type._id} className="border-b border-gray-800/50 pb-2">
              <button
                className={`w-full flex items-center justify-between p-2 transition-colors text-sm ${activeType === type._id ? "bg-gray-700/50 rounded-md" : ""}`}
                onClick={() => handleChosenType(type._id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-blue-600/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Layers size={18} />
                  </div>
                  <span className="font-semibold text-gray-100">
                    {type.name}
                  </span>
                </div>
                {type.categories &&
                  type.categories.length > 0 &&
                  (openTypes[type._id] ? (
                    <div
                      className="hover:text-blue-400 p-1 "
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleType(type._id);
                      }}
                    >
                      <ChevronDown size={18} />
                    </div>
                  ) : (
                    <div
                      className="hover:text-blue-400 p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleType(type._id);
                      }}
                    >
                      <ChevronRight size={18} />
                    </div>
                  ))}
              </button>

              {openTypes[type._id] && (
                <div className="mr-6 mt-1 space-y-1 border-r border-gray-700 pr-2">
                  {type.categories.map((category) => (
                    <div key={category._id}>
                      <button
                        onClick={() =>
                          handleChosenCategory(type._id, category._id)
                        }
                        className={`w-full flex items-center justify-between p-2 text-xs transition-colors ${activeCategory === category._id ? "bg-gray-700/50 rounded-md" : "text-gray-500 hover:text-white"}`}
                      >
                        <span>{category.name}</span>
                        {category.models.length > 0 &&
                          (openCategories[category._id] ? (
                            <div
                              className="hover:text-blue-400 p-1 "
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCategory(category._id);
                              }}
                            >
                              <ChevronDown size={14} />
                            </div>
                          ) : (
                            <div
                              className="hover:text-blue-400 p-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCategory(category._id);
                              }}
                            >
                              <ChevronRight size={14} />
                            </div>
                          ))}
                      </button>

                      {openCategories[category._id] && (
                        <ul className="mr-4 space-y-1 mt-1">
                          {category.models.map((model) => (
                            <li
                              key={model._id}
                              className={`flex items-center gap-2 p-2 text-xs text-gray-500 hover:text-white cursor-pointer ${activeModel === model._id ? "bg-gray-700/50 rounded-md" : ""}`}
                              onClick={() => {
                                console.log("Chosen Model ID:", model._id);
                                handleChosenModel(
                                  type._id,
                                  category._id,
                                  model._id,
                                );
                              }}
                            >
                              <Tag size={12} className="text-gray-600" />
                              {model.name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default StoreStructureSidebar;
