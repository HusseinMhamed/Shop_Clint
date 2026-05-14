import React, { useEffect, useState } from "react";
import axios from "../../../AxiosApi.jsx";
import { SERVER_URL } from "../../../Constant.js";
import {
  Mail,
  Phone,
  Link,
  Type,
  MessageCircle,
  X,
  Loader2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../../Store.Types.ts";
import { close, loading } from "../../../slices/SuccessFaildState/SFS.ts";
import { open, close as Close } from "../../../slices/ContactSlice.js";

// دالة الأيقونات
const getIcon = (type: string) => {
  switch (type) {
    case "email":
      return <Mail size={22} className="text-blue-600" />;
    case "phone":
      return <Phone size={22} className="text-green-600" />;
    case "link":
      return <Link size={22} className="text-purple-600" />;
    default:
      return <Type size={22} className="text-gray-600" />;
  }
};

const FloatingContactSupport = () => {
  // const [isOpen, setIsOpen] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const isOpen = useSelector((state) => state.ContactReducer.openOverlay);

  // console.log(isOpen2);

  useEffect(() => {
    if (isOpen) {
      document.documentElement.classList.add("no-scroll");
      document.body.classList.add("no-scroll");
    } else {
      document.documentElement.classList.remove("no-scroll");
      document.body.classList.remove("no-scroll");
    }

    return () => {
      document.documentElement.classList.remove("no-scroll");
      document.body.classList.remove("no-scroll");
    };
  }, [isOpen]);

  // جلب البيانات عند فتح النافذة فقط لتقليل الضغط على السيرفر
  useEffect(() => {
    if (isOpen) {
      const fetchContacts = async () => {
        try {
          setFetching(true);
          dispatch(loading());
          const response = await axios.get(
            `${SERVER_URL}/contact/contact-info`,
          );
          const contactsData = response.data.contacts;

          if (contactsData) {
            setContacts(contactsData);
          }
        } catch (error: any) {
          console.error("Error fetching contacts:", error.message);
        } finally {
          setFetching(false);
          dispatch(close());
        }
      };
      fetchContacts();
    }
  }, [isOpen, dispatch]);

  return (
    <>
      {/* 1. الزر العائم (Floating Button) - مثبت في أسفل اليسار */}
      <button
        title="تواصل معنا"
        onClick={() => dispatch(open())}
        className="fixed bottom-6 left-6 z-[999] bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 group"
      >
        <MessageCircle size={28} />
      </button>

      {/* 2. الـ Layout (Overlay) والنافذة */}
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all animate-in fade-in duration-300">
          {/* خلفية للإغلاق عند الضغط خارج النافذة */}
          <div className="absolute inset-0" onClick={() => dispatch(Close())} />

          {/* صفحة العرض (نفس تصميم المعاينة الخاص بك) */}
          {/* 1. الأب الرئيسي - أزلنا منه overflow-hidden إذا كنت لا تحتاجه بشده أو أضفنا له padding بسيط */}
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl animate-in zoom-in duration-300">
            {/* زر الإغلاق العلوي - زدنا الـ z-index لضمان ظهوره */}
            <button
              onClick={() => dispatch(Close())}
              className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full text-gray-500 z-50 transition"
            >
              <X size={20} />
            </button>

            {/* 2. محتوى العرض - تأكد أن الـ rounded هنا متناسق مع الأب */}
            <div
              className="p-6 bg-white rounded-3xl border border-gray-200 shadow-sm"
              dir="rtl"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 ">
                <MessageCircle className="text-blue-600" /> بطاقة التواصل
              </h2>

              {/* الكرت الداخلي المنقط */}
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 bg-gray-200">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center text-blue-600 text-2xl font-bold">
                    <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                      <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    تواصل معنا
                  </h3>
                  <p className="text-sm text-gray-500">نحن هنا لتنفيذ طلباتك</p>
                </div>

                {/* قائمة الحقول - أضفنا pl-2 بدلاً من pr-2 لأننا في وضع rtl */}
                <div
                  className="space-y-4 max-h-[350px] overflow-y-auto p-2 custom-scrollbar"
                  dir="rtl"
                >
                  {contacts.length > 0 ? (
                    contacts.map((field) => (
                      <div
                        key={field.id}
                        className="flex items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition hover:border-blue-200 group"
                      >
                        <div className="p-3 bg-gray-50 rounded-lg ml-4 group-hover:bg-blue-50 transition-colors">
                          {getIcon(field.type)}
                        </div>
                        <div className="flex-1 text-right">
                          <p className="text-xs text-gray-600 mb-1">
                            {field.label || "بدون عنوان"}
                          </p>
                          {field.type === "link" ? (
                            <a
                              href={
                                field.value.startsWith("http")
                                  ? field.value
                                  : `https://${field.value}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-blue-600 hover:underline break-all text-sm"
                              dir="ltr"
                            >
                              {field.value}
                            </a>
                          ) : (
                            <p
                              className="font-medium text-gray-800 break-all text-sm"
                              dir="ltr"
                            >
                              {field.value || "لم يتم إدخال قيمة"}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-400 italic py-4">
                      لا توجد بيانات متاحة حالياً
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => dispatch(Close())}
                className="w-full mt-6 bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition shadow-lg"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingContactSupport;
