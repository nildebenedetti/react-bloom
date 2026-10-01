import { Outlet } from "react-router";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import ScrollToTopBtn from "../components/ScrollToTopBtn.jsx";

function MainLayout() {
    return <>
        <div className="d-flex flex-column min-vh-100">
            <Header />
            <main className="flex-grow-1 d-flex flex-column align-items-center w-100">
                <Outlet />
            </main>

            <Footer />
            <ScrollToTopBtn />
        </div>
        </>;
}

export default MainLayout;