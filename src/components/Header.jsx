import { NavLink } from "react-router";
import useTheme from "../hooks/useTheme";

export default function Header() {
    const { theme, toggleTheme } = useTheme();

    return (
        <header>
            <nav className="navbar navbar-expand-lg glass-bar fixed-top">
                <div className="container-fluid px-3">
                    {/* Brand / Logo */}
                    <NavLink className="navbar-brand fw-semibold d-flex align-items-center gap-2" to="/">
                        <img className="navbar-logo" src="logos/bloom-logo.svg" alt="Bloom logo" />
                        <span>Bloom</span>
                    </NavLink>

                    {/* Hamburger Button */}
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#mainNav"
                        aria-controls="mainNav"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon" />
                    </button>

                    <div className="collapse navbar-collapse" id="mainNav">
                        {/* Navigazione Principale (Sinistra) */}
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/">Home</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/about">About</NavLink>
                            </li>
                        </ul>

                        {/* Autenticazione e Cambio Tema (Destra) */}
                        <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center">
                            {/* Link per Ospiti */}
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/login">Login</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/register">Register</NavLink>
                            </li>

                            {/* Dropdown Utente Autenticato */}
                            <li className="nav-item dropdown">
                                <a
                                    id="navbarDropdown"
                                    className="nav-link dropdown-toggle"
                                    href="#"
                                    role="button"
                                    data-bs-toggle="dropdown"
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                >
                                    User Name
                                </a>

                                <div className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                                    <NavLink className="dropdown-item" to="/dashboard">Dashboard</NavLink>
                                    <NavLink className="dropdown-item" to="/profile">Profile</NavLink>
                                    
                                    <hr className="dropdown-divider" />
                                    
                                    <button type="button" className="dropdown-item">
                                        Logout
                                    </button>
                                </div>
                            </li>

                            {/* Bottone Toggle Tema */}
                            <li className="nav-item ms-lg-2">
                                <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={toggleTheme}
                                    aria-label="Cambia tema"
                                >
                                    {theme === 'light' ? '🌙' : '☀️'}
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    );
}