import { Link } from "react-router";

function NotFound() {
    return (
        <section className="d-flex flex-column align-items-center justify-content-center page-fill w-100 py-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-8 col-md-6 col-lg-5">
                        <div className="surface-card p-4 p-md-5 text-center">
                            <h1 className="display-1 fw-bold title-color mb-2">404</h1>
                            <p className="auth-panel-subtitle mb-4">This page has not bloomed yet.</p>
                            <Link className="btn-action" to="/">Back to Homepage</Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
export default NotFound;