import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
const Home = React.lazy(() => import("./pages/Home/Home"));
const RegistrationPage = React.lazy(
  () => import("./pages/Registration/RegistrationPage"),
);
const PPDBPage = React.lazy(() => import("./pages/PPDB/PPDBPage"));
const ContactPage = React.lazy(() => import("./pages/Contact/ContactPage"));
const AdminPage = React.lazy(() => import("./pages/Admin/AdminPage"));
const GalleryPage = React.lazy(() => import("./pages/Gallery/GalleryPage"));
const NewsPage = React.lazy(() => import("./pages/News/NewsPage"));
const FacilitiesPage = React.lazy(
  () => import("./pages/Facilities/FacilitiesPage"),
);
const HistoryPage = React.lazy(() => import("./pages/History/HistoryPage"));
const SambutanPage = React.lazy(() => import("./pages/Sambutan/SambutanPage"));
const VisiMisiPage = React.lazy(() => import("./pages/VisiMisi/VisiMisiPage"));
const StrukturPage = React.lazy(() => import("./pages/Struktur/StrukturPage"));
const StaffPage = React.lazy(() => import("./pages/Staff/StaffPage"));
import Loading from "./components/Loading/LoadingSpinner";
import FloatingChat from "./components/FloatingChat";
import PromoPopup from "./components/PromoPopup";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="App">
      <React.Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ppdb" element={<PPDBPage />} />
          <Route path="/pendaftaran" element={<RegistrationPage />} />
          <Route path="/kontak" element={<ContactPage />} />
          <Route path="/gaming" element={<AdminPage />} />
          <Route path="/galeri" element={<GalleryPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/fasilitas" element={<FacilitiesPage />} />
          <Route path="/sejarah" element={<HistoryPage />} />
          <Route path="/sambutan" element={<SambutanPage />} />
          <Route path="/visimisi" element={<VisiMisiPage />} />
          <Route path="/struktur" element={<StrukturPage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </React.Suspense>
      <FloatingChat />
      <PromoPopup />
    </div>
  );
}

export default App;
