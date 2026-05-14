import React, { useEffect, useState, type FormEvent } from "react";
import {
  Trash2,
  Plus,
  Mail,
  Phone,
  Link,
  Type,
  Save,
  Eye,
  GripVertical,
} from "lucide-react";
// مكتبات السحب والإفلات
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  TouchSensor, // 1. إضافة حساس اللمس
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../Store.Types.ts";
import { close, loading } from "../../../slices/SuccessFaildState/SFS.ts";
import axios from "../../../AxiosApi.jsx";
import { SERVER_URL } from "../../../Constant.js";

// --- مكون الحقل القابل للسحب (Sortable Item) ---
// --- مكون الحقل القابل للسحب (Sortable Item) المحدث ---
const SortableField = ({ field, updateField, deleteField, errors }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: transform ? 99 : 1,
  };

  // استخراج الأخطاء الخاصة بهذا الحقل تحديداً
  const labelError = errors[`${field.id}-label`];
  const valueError = errors[`${field.id}-value`];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 border rounded-lg bg-gray-50 space-y-3 relative group shadow-sm text-black"
    >
      <div className="flex justify-between items-center touch-none">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab hover:text-blue-600 flex items-center gap-1"
        >
          <GripVertical size={18} />
          <span className="text-[10px] font-bold uppercase">ترتيب الحقل</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* حقل عنوان الحقل */}
        <div>
          <label className="block text-xs mb-1 text-gray-500">
            عنوان الحقل
          </label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => updateField(field.id, "label", e.target.value)}
            className={`w-full p-2 border rounded bg-white outline-none transition ${
              labelError
                ? "border-red-500 ring-1 ring-red-100"
                : "focus:ring-2 focus:ring-blue-400"
            }`}
            placeholder="مثلاً: واتساب"
          />
          {labelError && (
            <p className="text-red-500 text-[10px] mt-1 font-bold">
              {labelError}
            </p>
          )}
        </div>

        {/* حقل نوع البيانات */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            نوع البيانات
          </label>
          <select
            value={field.type}
            onChange={(e) =>
              updateField(field.id, "type", e.target.value as any)
            }
            className="w-full p-2 border rounded bg-white outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="text">نص عادي</option>
            <option value="email">بريد إلكتروني</option>
            <option value="phone">رقم هاتف</option>
            <option value="link">رابط موقع</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 items-start">
        {/* حقل القيمة */}
        <div className="flex-1">
          <label className="block text-xs mb-1 text-gray-500">القيمة</label>
          <input
            type="text"
            value={field.value}
            onChange={(e) => updateField(field.id, "value", e.target.value)}
            className={`w-full p-2 border rounded bg-white outline-none text-left transition ${
              valueError
                ? "border-red-500 ring-1 ring-red-100"
                : "focus:ring-2 focus:ring-blue-400"
            }`}
            dir="ltr"
            placeholder="Enter value..."
          />
          {valueError && (
            <p className="text-red-500 text-[10px] mt-1 font-bold">
              {valueError}
            </p>
          )}
        </div>

        {/* زر الحذف */}
        <button
          type="button"
          onClick={() => deleteField(field.id)}
          className="mt-6 p-2 text-red-500 hover:bg-red-50 rounded-full transition"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
};
// --- المكون الرئيسي ---
const DynamicContactManager = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [contacts, setContacts] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        // setLoading(true);
        dispatch(loading());
        const response = await axios.get(`${SERVER_URL}/contact/contact-info`); // استبدله برابط الباك إند الخاص بك
        const contacts = response.data.contacts;
        if (!contacts) throw new Error("هناك مشكلة والروت خاطأ");
        // console.log(contacts);
        if (contacts && contacts.length > 0) {
          setContacts(contacts);
        }
      } catch (error: any) {
        console.log("Error fetching data:", error.message || error);
      } finally {
        // setLoading(false);
        dispatch(close());
      }
    };
    fetchContacts();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // يتطلب تحريك الماوس 5 بكسل قبل بدء السحب (لمنع التداخل مع النقرات)
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      // إعدادات الموبايل: يتطلب الضغط المستمر لمدة 250ms أو التحريك لمسافة 5px
      // هذا يسمح للمستخدم بعمل Scroll للصفحة بشكل طبيعي
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
  );

  // أيقونات العرض
  const getIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail size={18} className="text-blue-500" />;
      case "phone":
        return <Phone size={18} className="text-green-500" />;
      case "link":
        return <Link size={18} className="text-purple-500" />;
      default:
        return <Type size={18} className="text-gray-500" />;
    }
  };

  // التحقق من البيانات
  const validate = () => {
    const newErrors: Record<string, string> = {};

    contacts.forEach((f) => {
      // 1. التأكد من عنوان الحقل (Label)
      if (!f.label || !f.label.trim()) {
        newErrors[`${f.id}-label`] = "عنوان الحقل مطلوب";
      }

      // 2. التأكد من القيمة (Value)
      if (!f.value || !f.value.trim()) {
        newErrors[`${f.id}-value`] = "هذا الحقل لا يمكن أن يكون فارغاً";
      }
      // 3. التأكد من الصيغ الخاصة (Email / Link)
      else if (f.type === "email" && !/\S+@\S+\.\S+/.test(f.value)) {
        newErrors[`${f.id}-value`] = "صيغة بريد غير صحيحة";
      } else if (f.type === "link" && !f.value.startsWith("http")) {
        newErrors[`${f.id}-value`] = "يجب أن يبدأ بـ http";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setContacts((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const updateField = (id: string, key: string, val: string) => {
    setContacts(contacts.map((f) => (f.id === id ? { ...f, [key]: val } : f)));
    if (errors[id]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[id];
      setErrors(updatedErrors);
    }
  };

  // 2. دالة حفظ البيانات وتعديلها في الباك إند
  const handelSaveData = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;
    try {
      // console.log(contacts);

      dispatch(loading());
      // إرسال المصفوفة كاملة للسيرفر (التحديث يتم ككتلة واحدة للمحافظة على الترتيب)
      const response = await axios.put(`${SERVER_URL}/contact/contact-info`, {
        contacts,
      });
      const ResposneContacts = response.data.contacts;
      if (!Array.isArray(ResposneContacts))
        throw new Error("هناك مشكلة والروت خاطأ");
      setContacts(ResposneContacts);
      setTimeout(() => alert("تم حفظ جميع التغييرات والترتيب بنجاح!"), 500);
    } catch (error: any) {
      console.log("Error saving data:", error.response?.data?.error || error);
      setTimeout(() => alert(error.response?.data?.error || error), 500);
    }
    dispatch(close());
  };

  return (
    <div className="p-6 bg-gray-300 min-h-screen" dir="rtl">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* القسم الأول: الإعدادات (مع السحب) */}
        <form
          className="bg-white/60 p-6 rounded-xl shadow-md border border-gray-200"
          onSubmit={handelSaveData}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              تخصيص بيانات التواصل
            </h2>
            <button
              onClick={() =>
                setContacts([
                  ...contacts,
                  {
                    id: Date.now().toString(),
                    label: "",
                    value: "",
                    type: "text",
                  },
                ])
              }
              type="button"
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Plus size={18} /> إضافة حقل
            </button>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={contacts}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {contacts.map((field) => (
                  <SortableField
                    key={field.id}
                    field={field}
                    updateField={updateField}
                    deleteField={(id: string) =>
                      setContacts(contacts.filter((c) => c.id !== id))
                    }
                    errors={errors} // تأكد من وجود هذا السطر
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <button
            type="submit"
            // onClick={() =>
            //   validate() && alert("تم حفظ البيانات والترتيب بنجاح!")
            // }
            className="w-full mt-6 bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition"
          >
            <Save size={20} /> حفظ جميع التغييرات
          </button>
        </form>

        {/* القسم الثاني: المعاينة (نفس التصميم السابق) */}
        <div className="bg-white/60 p-6 rounded-xl shadow-md border border-gray-200 h-fit sticky top-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Eye className="text-blue-600" /> معاينة العرض للجمهور
          </h2>

          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 bg-gray-50">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center text-blue-600 text-2xl font-bold">
                C
              </div>
              <h3 className="text-lg font-bold">بطاقة التواصل</h3>
              <p className="text-sm text-gray-500">
                سيتم عرض البيانات التالية للزوار
              </p>
            </div>

            <div className="space-y-4">
              {contacts.map((field) => (
                <div
                  key={field.id}
                  className="flex items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"
                >
                  <div className="p-3 bg-gray-50 rounded-lg ml-4">
                    {getIcon(field.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 mb-1">
                      {field.label || "بدون عنوان"}
                    </p>
                    <p className="font-medium text-gray-800 break-all">
                      {field.value || "لم يتم إدخال قيمة"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicContactManager;
