import { BrowserRouter, Route, Routes } from "react-router";
import { ThemeProvider } from "./contexts/ThemeContext";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop.jsx";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
      <ScrollToTop />
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
export default App;
