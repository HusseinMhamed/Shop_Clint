import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { logout } from "../slices/authSlice";
import {
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  LayoutDashboard,
  Info,
  ShoppingBag,
} from "lucide-react"; // مكتبة أيقونات خفيفة

function ResponsiveAppBar() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // إغلاق قائمة المستخدم عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setIsUserMenuOpen(false);
    navigate("/login");
  };

  const pages = [
    { name: "Products", path: "/products", icon: <ShoppingBag size={18} /> },
  ];
  if (userInfo?.role === "admin") {
    pages.push({
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={18} />,
    });
    pages.push({ name: "About", path: "/about", icon: <Info size={18} /> });
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-blue-600 text-white shadow-lg z-[200]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* الجزء الأيسر: الشعار والقائمة للأجهزة الكبيرة */}
            <div className="flex items-center gap-8">
              <Link
                to="/"
                className="flex items-center gap-2 border-l-2 border-white/20 pl-4 hover:opacity-80 transition-opacity"
              >
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                  <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" />
                </svg>
                <span className="font-mono font-bold text-xl tracking-[0.3rem]">
                  SHOP
                </span>
              </Link>

              {/* روابط التنقل - Desktop */}
              <div className="hidden md:flex items-center gap-6">
                {pages.map((page) => (
                  <Link
                    key={page.name}
                    to={page.path}
                    className="text-sm font-medium hover:text-blue-200 transition-colors"
                  >
                    {page.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* الجزء الأيمن: المستخدم والجوال */}
            <div className="flex items-center gap-4">
              {userInfo ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 focus:outline-none"
                  >
                    <img
                      className="w-9 h-9 rounded-full border-2 border-white/50 object-cover"
                      src={
                        userInfo.avatar ||
                        "https://ui-avatars.com/api/?name=" + userInfo.name
                      }
                      alt="User profile"
                    />
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* قائمة المستخدم المنسدلة */}
                  {isUserMenuOpen && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 text-gray-800 animate-in fade-in zoom-in duration-150">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User size={16} /> Profile
                      </Link>
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="bg-white text-blue-600 px-5 py-1.5 rounded-full font-bold hover:bg-blue-50 transition-colors text-sm"
                >
                  Login
                </Link>
              )}

              {/* زر قائمة الجوال */}
              <button
                className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsNavOpen(!isNavOpen)}
              >
                {isNavOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* قائمة الجوال المنسدلة */}
        {isNavOpen && (
          <div className="md:hidden bg-blue-700 border-t border-white/10 animate-in slide-in-from-top duration-300">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {pages.map((page) => (
                <Link
                  key={page.name}
                  to={page.path}
                  onClick={() => setIsNavOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-md text-base font-medium hover:bg-blue-800 transition-colors"
                >
                  {page.icon} {page.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer لتعويض الـ Fixed Nav */}
      <div className="h-16" />
    </>
  );
}

export default ResponsiveAppBar;
