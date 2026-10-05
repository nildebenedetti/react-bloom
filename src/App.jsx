import { BrowserRouter, Route, Routes } from "react-router";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import RecordsPage from "./pages/RecordsPage.jsx";




function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
          <Routes>
            <Route element={<MainLayout />}>
              {/* public routes */}
              <Route index element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />             
              
              {/* private routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/my-records" element={<RecordsPage />} />
              </Route>

              {/* fallback */}
              <Route path="*" element={<NotFound />} />

            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
export default App;
