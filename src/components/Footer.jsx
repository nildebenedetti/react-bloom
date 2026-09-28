import { NavLink } from "react-router";

function Footer() {
    const currentYear = new Date().getFullYear();

    return <>
        <footer className="footer mt-auto py-4 glass-bar border-top">
            <div className="container-fluid px-3">
                <div className="row gy-3 align-items-center">
                    {/* Brand & Copyright */}
                    <div className="col-md-4 text-center text-md-start">
                        <NavLink className="navbar-brand fw-semibold d-inline-flex align-items-center gap-2" to="/">
                            <img className="navbar-logo" src="/logos/bloom-logo.svg" alt="Bloom logo" style={{ height: '24px' }} />
                            <span>Bloom</span>
                        </NavLink>
                        <p className="small text-muted mb-0 mt-1">
                            &copy; {currentYear} Bloom. All rights reserved.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="col-md-4 text-center">
                        <ul className="list-inline mb-0">
                            <li className="list-inline-item mx-2">
                                <NavLink className="nav-link d-inline" to="/">Home</NavLink>
                            </li>
                            <li className="list-inline-item mx-2">
                                <NavLink className="nav-link d-inline" to="/#">About</NavLink>
                            </li>
                            <li className="list-inline-item mx-2">
                                <NavLink className="nav-link d-inline" to="/#">Records</NavLink>
                            </li>
                            <li className="list-inline-item mx-2">
                                <NavLink className="nav-link d-inline" to="/#">Dashboard</NavLink>
                            </li>
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div className="col-md-4 text-center text-md-end">
                        <ul className="list-inline mb-0 small text-muted">
                            <li className="list-inline-item me-3">
                                <NavLink className="text-muted text-decoration-none" to="#">
                                    Privacy Policy
                                </NavLink>
                            </li>
                            <li className="list-inline-item">
                                <NavLink className="text-muted text-decoration-none" to="#">
                                    Terms of Service
                                </NavLink>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    </>
}

export default Footer;
