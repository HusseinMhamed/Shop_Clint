import axios from "axios";
import { SERVER_URL } from "./Constant";
const apiClient = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
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
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const prevRequest = error?.config;
    if (error?.response?.status === 401 && !prevRequest?.sent) {
      prevRequest.sent = true;
      console.log("Tring ...");
      try {
        const response = await axios.get(`${SERVER_URL}/auth/refresh`, {
          withCredentials: true,
        });
        const newAccessToken = response.data.accessToken;
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        localStorage.setItem(
          "userInfo",
          JSON.stringify({ ...userInfo, accessToken: newAccessToken }),
        );
        prevRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(prevRequest);
      } catch (refreshError) {
        localStorage.removeItem("userInfo");
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);
export default apiClient;
