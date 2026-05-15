import axios from "axios";
import { SERVER_URL } from "./Constant";

// إنشاء النسخة
const apiClient = axios.create({
  baseURL: SERVER_URL, // أضف رابط السيرفر الخاص بك هنا
  withCredentials: true, // مهم جداً لإرسال الـ Cookies (Refresh Token) للسيرفر
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. Interceptor للطلبات (Request): لتحديث التوكن قبل خروج أي طلب
apiClient.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      const token = JSON.parse(userInfo).accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 2. Interceptor للاستجابات (Response): للتعامل مع الـ Expired Token
apiClient.interceptors.response.use(
  (response) => response, // إذا كان الطلب ناجحاً، مرره
  async (error) => {
    const prevRequest = error?.config;

    // إذا رجع السيرفر 401 (معناه التوكن انتهى) ولم نقم بإعادة المحاولة بعد
    if (error?.response?.status === 401 && !prevRequest?.sent) {
      prevRequest.sent = true;
      console.log("Tring ...");
      try {
        // طلب توكن جديد من روت الـ refresh
        // نستخدم axios العادي وليس apiClient لتجنب حلقة تكرار لا نهائية
        const response = await axios.get(`${SERVER_URL}/auth/refresh`, {
          withCredentials: true,
        });

        const newAccessToken = response.data.accessToken;

        // تحديث التوكن في الـ localStorage
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        localStorage.setItem(
          "userInfo",
          JSON.stringify({ ...userInfo, accessToken: newAccessToken }),
        );

        // تحديث الهيدر في الطلب الفاشل وإعادة تنفيذه
        prevRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(prevRequest);
      } catch (refreshError) {
        // إذا فشل الـ refresh (مثلاً انتهت جلسة المستخدم تماماً)
        localStorage.removeItem("userInfo");
        // window.location.href = "/login"; // اختيارياً: تحويل المستخدم لتسجيل الدخول
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
