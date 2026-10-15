import { useEffect } from "react";
import { useSelector } from "react-redux";
function Loading() {
  const isGLoading =
    useSelector((state) => state.SuccFaildComponent.state) ===
    "loading";
  useEffect(() => {
    if (isGLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isGLoading]);
  if (!isGLoading) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative flex flex-col items-center gap-4 bg-white p-8 rounded-3xl shadow-2xl">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-indigo-900 font-bold text-lg animate-pulse">
          جاري حفظ البيانات...
        </p>
        <div className="absolute -z-10 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full"></div>
      </div>
    </div>
  );
}
export default Loading;
