import { useState } from "react";
import NewProduct from "./components/NewProduct.tsx";
import AddCategoryStructure from "./components/AddCategoryStructure.tsx";
import DeleteCategoryStructure from "./components/DeleteCategoryStructure.tsx";
import EditCategoryStructure from "./components/EditCategoryStructure.tsx";

const List = [
  {
    id: 1,
    title: "Add new products to the store",
    buttonName: "Add Product",
    component: <NewProduct />,
  },
  {
    id: 2,
    title: "Add new Type or Category or Model to the store",
    buttonName: "Add Type/Category/Model",
    component: <AddCategoryStructure />,
  },
  {
    id: 3,
    title: "Delete Type or Category or Model from the store",
    buttonName: "Delete Type/Category/Model",
    component: <DeleteCategoryStructure />,
  },
  {
    id: 4,
    title: "Edit Type or Category or Model to the store",
    buttonName: "Edit Type/Category/Model",
    component: <EditCategoryStructure />,
  },
];
const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  function handleTabChange(index: number) {
    setActiveTab(index);
  }
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 text-slate-900">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Admin Dashboard
          </h1>
          <div className="flex justify-center space-x-4 mb-4 flex-wrap gap-2">
            {List.map((item, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === index
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => handleTabChange(index)}
              >
                {item.buttonName}
              </button>
            ))}
          </div>
          <p className="text-gray-600">{List[activeTab]?.title}</p>
          <hr className="my-3 border-t border-gray-300" />

          <div>{List[activeTab]?.component}</div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
