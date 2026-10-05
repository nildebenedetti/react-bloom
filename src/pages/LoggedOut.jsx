import { Link } from "react-router";

function LoggedOut() {
    return (
        <section className="d-flex flex-column align-items-center justify-content-center page-fill w-100 py-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-8 col-md-6 col-lg-5">
                        <div className="surface-card p-4 p-md-5 text-center">
                            <h1 className="h3 auth-panel-title mb-2">Logged out successfully</h1>
                            <p className="auth-panel-subtitle mb-4 lh-md">
                                
                                Can't wait to have you back! <br /> <span className="fst-italic">May your path bloom gracefully while our steps meet again.</span>
                            </p>
                            <Link className="btn-action" to="/">Back to Homepage</Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
export default LoggedOut;