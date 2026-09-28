import { Link } from "react-router";

function NotFound() {
    return (
        <div className="text-center py-5">
            <h1 className="display-1 fw-bold text-secondary">404</h1>
            <p className="lead">Page not found.</p>
            <Link className="btn btn-primary" to="/">Back to Homepage</Link>
        </div>
    );
}
export default NotFound;