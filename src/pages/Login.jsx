import { useState } from "react";
import { useAuthContext } from "../contexts/AuthContext.jsx";
import { useNavigate } from "react-router";


function Login() {
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ errorMsg, setErrorMsg ] = useState('');
    const [ isSubmitting, setIsSubmitting ] = useState(false);
    const { login } = useAuthContext();
    const navigate = useNavigate();

    const handleSubmit = async (e) =>{
        e.preventDefault();
        setErrorMsg('');

        try {
            setIsSubmitting(true);
            await login(email, password);
            // if no error thrown
            navigate('/dashboard');
        } catch (error) {
            setErrorMsg(error.message || error.data?.message || error.data?.msg || 'invalid credentials');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="d-flex flex-column align-items-center justify-content-center page-fill py-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
                        <div className="surface-card auth-panel p-4 p-md-5">
                            <form onSubmit={handleSubmit} noValidate>
                                <div className="text-center mb-4">
                                    <h1 className="h3 auth-panel__title mb-2">Log in</h1>
                                    <p className="auth-panel__subtitle mb-0">Welcome back to <span className="fst-italic">Bloom</span>.</p>
                                </div>

                                {errorMsg && (
                                    <div className="alert alert-danger mb-4" role="alert">
                                        {errorMsg}
                                    </div>
                                )}

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
                                        autoFocus
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="password" className="form-label">Password</label>
                                    <input
                                        type="password"
                                        id="password"
                                        className="form-control"
                                        placeholder="Your password"
                                        value={ password }
                                        onChange={ (e) => setPassword(e.target.value) }
                                        autoComplete="current-password"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn-action w-100"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Signing in...' : 'Sign in'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Login;
