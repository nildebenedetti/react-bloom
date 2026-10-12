import { Link } from "react-router";

/* Navigation between the private pages. The page passed as `current` is left
 * out, so the same component can sit on each of them: from the Dashboard it
 * offers the two feeds, from a feed it offers the Dashboard and the other one. */
const PERSONAL_PAGES = [
    { to: "/dashboard", label: "Go to Dashboard" },
    { to: "/my-records", label: "Go to My Records" },
    { to: "/emotion-prism", label: "Go to Emotion Prism" },
];

function PersonalNav({ current }) {
    return (
        <div className="personal-nav d-flex flex-wrap align-items-center gap-3">
            {PERSONAL_PAGES.filter((page) => page.to !== current).map((page) => (
                <Link key={page.to} to={page.to} className="btn-action">
                    {page.label}
                </Link>
            ))}
        </div>
    );
}

export default PersonalNav;
