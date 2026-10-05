import { NavLink, useNavigate } from "react-router";
import { MoonStarsFill, SunFill } from "react-bootstrap-icons";
import  useTheme  from "../hooks/useTheme.js";
import { useState } from "react";
import { useAuthContext } from "../contexts/AuthContext";

export default function Header() {
    const { theme, toggleTheme } = useTheme();
    const { logout } = useAuthContext();
    const { user, token } = useAuthContext();
    const navigate = useNavigate();
    const [ isLoggingOut, setIsLoggingOut ] = useState(false);

    const handleLogout = async () => {
        if (isLoggingOut) return;

        setIsLoggingOut(true);
        // logout() never rejects: it clears the token and the user state in its
        // own finally, so once this resolves the local session is really gone.
        // Awaiting it also guarantees the token is out of storage before we
        // navigate, otherwise a refresh would restore the session.
        await logout();
        setIsLoggingOut(false);
        navigate('/logout');

    };

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
                        {/* main navigation - LEFT */}
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/">Home</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/about">About</NavLink>
                            </li>
                        </ul>

                        {/* Auth & them toggle - RIGHT  */}
                        <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center">
                            {/* GUEST */}
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/login">Login</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/register">Register</NavLink>
                            </li>

                            {/* Dropdown AUTH USER */}
                            {token && <li className="nav-item dropdown">
                                <a
                                    id="navbarDropdown"
                                    className="nav-link dropdown-toggle"
                                    href="#"
                                    role="button"
                                    data-bs-toggle="dropdown"
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                >
                                    {user?.name }
                                </a>
                                
                                <div className="dropdown-menu dropdown-menu-end" 
                                aria-labelledby="navbarDropdown">
                                    { user && <>
                                    <NavLink className="dropdown-item" to="/dashboard">Dashboard</NavLink>
                                    <NavLink className="dropdown-item" to="/my-records">My Records</NavLink>
                                    <NavLink className="dropdown-item" to="/profile">Profile</NavLink>
                                    
                                    
                                    <hr className="dropdown-divider" />
                                    
                                    <button
                                        type="button"
                                        className="dropdown-item"
                                        onClick={handleLogout}
                                        disabled={isLoggingOut}>
                                        {isLoggingOut ? 'Logging out...' : 'Logout'}
                                    </button> 
                                    </>
                                }
                                </div> 
                            </li>
                            }
                            {/* toggle Theme */}
                            <li className="nav-item ms-lg-2">
                                <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={toggleTheme}
                                    aria-label="Cambia tema"
                                >
                                    {theme === 'light' ? (
                                        <MoonStarsFill />
                                    ) : (
                                        <SunFill />
                                    )}
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    );
}