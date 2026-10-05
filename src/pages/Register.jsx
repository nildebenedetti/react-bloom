import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuthContext } from "../contexts/AuthContext";

function Register() {
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ passwordConfirm, setPasswordConfirm ] = useState('');
    const [ userName, setUserName ] = useState('');
    const [ errorMsg, setErrorMsg ] = useState('');
    const [ isSubmitting, setIsSubmitting ] = useState(false);
    const { register } = useAuthContext();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        const formData = {
            "name": userName,
            "email": email,
            "password": password,
            "password_confirmation": passwordConfirm
        }

        try {
            setIsSubmitting(true);
            await register(formData);
            // if no error
            navigate('/dashboard')
        } catch (error) {
            setErrorMsg(error.message || error.data?.message || error.data?.msg || 'invalid credentials');
        } finally {
            setIsSubmitting(false);
        }
    };

    return <>
        <section className="d-flex flex-column align-items-center justify-content-center page-fill w-100 py-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-8 col-md-6 col-lg-5">
                        <div className="surface-card auth-panel p-4 p-md-5">
                            <form onSubmit={handleSubmit} noValidate>
                                <div className="text-center mb-4">
                                    <h1 className="h3 auth-panel-title mb-2">Register</h1>
                                    <p className="auth-panel-subtitle mb-0">Join Bloom's <span className="fst-italic">Community</span>.</p>
                                </div>

                                {errorMsg && (
                                    <div className="alert alert-danger mb-4" role="alert">
                                        {errorMsg}
                                    </div>
                                )}

                                <div className="mb-3">
                                    <label htmlFor="name" className="form-label">Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        className="form-control"
                                        placeholder="Your name"
                                        value={ userName }
                                        onChange={ (e) => setUserName(e.target.value) }
                                        autoComplete="name"
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        className="form-control"
                                        placeholder="name@example.com"
                                        value={ email }
                                        onChange={ (e) => setEmail(e.target.value) }
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                                {/* psw */}
                                <div className="mb-4">
                                    <label htmlFor="password" className="form-label">Password</label>
                                    <input
                                        type="password"
                                        id="password"
                                        className="form-control"
                                        placeholder="Your password"
                                        value={ password }
                                        onChange={ (e) => setPassword(e.target.value) }
                                        autoComplete="new-password"
                                        required
                                    />
                                </div>
                                {/* confirm psw */}
                                <div className="mb-4">
                                    <label htmlFor="password_confirmation" className="form-label">Confirm Password</label>
                                    <input
                                        type="password"
                                        id="password_confirmation"
                                        className="form-control"
                                        placeholder="Confirm password"
                                        value={ passwordConfirm }
                                        onChange={ (e) => setPasswordConfirm(e.target.value) }
                                        autoComplete="new-password"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn-action w-100"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Creating User...' : 'Register'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </>
}
export default Register;