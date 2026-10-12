import { useState, useEffect } from "react";
import { Link } from "react-router";
import { fetchData, ENDPOINTS } from "../utils/api";
import { useAuthContext } from "../contexts/AuthContext.jsx";
import { EMOTIONS } from "../components/utils/emotions.js";
import { SortNumericDown, SortNumericUp } from "react-bootstrap-icons";
import PrismCard from "../components/cards/PrismCard.jsx";

function EmotionPrism() {
    const [records, setRecords] = useState([]);
    const [selectedEmotions, setSelectedEmotions] = useState([]);
    const [sortOrder, setSortOrder] = useState("desc");
    const [openRecord, setOpenRecord] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const { token, user } = useAuthContext();

    const loadPagedRecords = async (pageToFetch) => {
        setIsLoading(true);

        try {
        const response = await fetchData(ENDPOINTS.private.prism, {
            params: {
            page: pageToFetch,
            emotions: selectedEmotions.length > 0 ? selectedEmotions : undefined,
            order: sortOrder,
            },
        });

        // if pageToFetch is 1 get data, otherwise spread former data + fresh fetch
        setRecords((prev) =>
            pageToFetch === 1 ? response.data : [...prev, ...response.data],
        );

        // check if we have more pages to load
        setHasMore(response.links.next !== null);
        } catch (error) {
        setErrorMsg(error.message);

        console.error("error while fetching records data", error);
        } finally {
        setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPagedRecords(page);
    }, [page, selectedEmotions, sortOrder]);

    // onClick fot show more btn
    const handleShowMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadPagedRecords(nextPage);
    };

    // ========= toggle EMOTIONS =================

    /* A new selection invalidates every page already loaded, so the page is
    * reset in the same handler that changes the filter. */
    const toggleEmotion = (id) => {
        setSelectedEmotions((prev) => {
        if (prev.length === 0) {
            return [id];
        }

        // if included, filter current array. and remove, else, add at the end of curr array values
        const next = prev.includes(id)
            ? prev.filter((cId) => cId !== id)
            : [...prev, id];

        if (next.length === EMOTIONS.length) {
            return [];
        }

        return next;
        });

        setPage(1);
    };

    /*==== reset EMOTIONS ======*/

    const resetEmotions = () => {
        setSelectedEmotions([]);
    };

    /* ========= sort toggle ======================== */
    const handleSortToggle = () => {
        setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
        setPage(1);
    };

    const hasActiveFilters = selectedEmotions.length > 0;

    return (
        <>
        <div className="flex-grow-1 w-100  px-4 feed-meadow-container">
            <section className="welcome-section d-flex justify-content-start align-items-start">
            <div className="welcome-par">
                <h2 className="feed-title">Emotion Prism</h2>
                <h5 className="feed-subtitle">
                Wander through the moments that made you who you are. <br /> Let a
                feeling lead the way.
                </h5>
            </div>
            </section>

            <div className="filters d-flex justify-content-between">
            {/* filters - emotions chips */}
            <div className="categories-chips mb-3 d-flex flex-wrap gap-2">
                <span className="feed-subtitle text-muted fw-bold w-100">
                Select one or more Emotions:
                </span>
                <button
                type="button"
                onClick={resetEmotions}
                className={`glass-chip ${selectedEmotions.length === 0 ? "btn-action-sm" : "btn-action-outline-sm glass-bg"}`}
                >
                All
                </button>
                {EMOTIONS.map((emotion) => {
                const isSelected = selectedEmotions.includes(emotion.id);
                return (
                    <button
                    key={emotion.id}
                    type="button"
                    /* Off = the frosted surface, on = the filled
                    * action button. `glass-bg` instead of
                    * `glass-bar`: glass-bar pins its background
                    * with !important to beat .navbar, which on a
                    * button also outranked :hover — so the label
                    * went white while the fill stayed glass. */
                    className={`glass-chip ${isSelected ? "btn-action-sm" : "btn-action-outline-sm glass-bg"}`}
                    onClick={() => toggleEmotion(emotion.id)}
                    >
                    {emotion.label}
                    </button>
                );
                })}
            </div>
            {/* sort */}
            <div>
                <button
                type="button"
                className="btn-action-outline glass-bg rounded-pill px-3 py-2 d-flex mb-2 align-items-center gap-2"
                onClick={handleSortToggle}
                >
                <span className="small fw-bold">
                    {sortOrder === "desc" ? "Latest" : "Oldest"}
                </span>
                {sortOrder === "desc" ? <SortNumericDown /> : <SortNumericUp />}
                </button>
            </div>
            </div>
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 gap-1">
            {/* fetch error */}
            {errorMsg && (
                <h5>
                Something went wrong while fetching data from the database. <br />{" "}
                Apologies for the inconvenience. <br /> {errorMsg}
                </h5>
            )}
            {/* Empty state */}
            {!errorMsg && !isLoading && records.length === 0 && (
                <h5 className="feed-subtitle">
                {hasActiveFilters
                    ? "No records match these filters."
                    : "No records yet."}
                </h5>
            )}
            {/* cards */}
            {records?.map((record) => (
                <div key={record.id} className="card-container col">
                <PrismCard record={record} />
                </div>
            ))}
            </div>

            {/* show more cards */}
            {hasMore && records.length > 0 && (
            <div className="d-flex justify-content-center btn-wrapper py-3">
                <button
                type="button"
                className="btn-action"
                onClick={handleShowMore}
                disabled={isLoading}
                >
                {isLoading ? "Loading..." : "Show More"}{" "}
                </button>
            </div>
            )}
        </div>
        </>
    );
}

export default EmotionPrism;
