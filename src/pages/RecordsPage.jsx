import { useState, useEffect } from "react";
import { Link } from "react-router";
import { fetchData, ENDPOINTS } from "../utils/api.js";
import { Search, SortNumericDown, SortNumericUp } from "react-bootstrap-icons";
import MeadowCard from "../components/cards/MeadowCard.jsx";
import RecordModal from "../components/records/RecordModal.jsx";
import { TIERS } from "../components/utils/tier.js";

function RecordsPage() {
    const  [ records, setRecords ] = useState([]);
    // record in modal
    const  [ openRecord, setOpenRecord ] = useState(null);
    const [ errorMsg, setErrorMsg ] = useState('');
    const [ isLoading, setIsLoading ] = useState(false);
    const [ page, setPage ] = useState(1);
    const [ hasMore, setHasMore ] = useState(true);
    const [ selectedCategories, setSelectedCategories ] = useState([]);
    const [ selectedTiers, setSelectedTiers ] = useState([]);
    /* Two states on purpose: what is typed, and what has been applied. The fetch
     * depends on the second, so typing does not refetch until submitted. */
    const [ searchInput, setSearchInput ] = useState('');
    const [ searchTerm, setSearchTerm ] = useState('');
    // sort 
    const [ sortOrder, setSortOrder ] = useState('desc');


    /* ==== categories & tiers ======================= */
   
    const CATEGORIES = [
        { id: 1, name: 'Career' },
        { id: 2, name: 'Studies' },
        { id: 3, name: 'Bonds' },
        { id: 4, name: 'Sports' },
        { id: 5, name: 'Cooking' },
        { id: 6, name: 'Crafting' },
        { id: 7, name: 'Wellness' },
        { id: 8, name: 'Travel' },
        { id: 9, name: 'Finance' },
        { id: 10, name: 'Languages' },
        { id: 11, name: 'Culture' },
        { id: 12, name: 'Promises' },
    ];

    /* Tiers are NOT duplicated here: they are derived from the shared map that
     * MeadowCard renders its icons from. */
    const TIER_CHIPS = Object.entries(TIERS).map(([ id, { label } ]) => ({
        id: Number(id),
        name: label,
    }));

    // ========= toggle Categories & Tiers =================

    /* A new selection invalidates every page already loaded, so the page is
     * reset in the same handler that changes the filter. */
    const toggleCategory = (id) => {
        setSelectedCategories(prev => {
            if (prev.length === 0) {
            return [id];
            }
            // if included, filter current array. and remove, else, add at the end of curr array values
            const next = prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]

            if (next.length === CATEGORIES.length) {
                return [];
            }

            return next;
    });
        setPage(1);
    };
    
    const toggleTier = (id) => {
        setSelectedTiers(prev => {
            // same shape as toggleCategory: remove if present, else append
            if (prev.length === 0) {
            return [id];
            }

            const next = prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]

            if (next.length === TIER_CHIPS.length) {
                return [];
                }

                return next;
        });
        setPage(1);
    };


    // ========= Reset Categories & Tiers =================
    const resetCategories = () => {

        setSelectedCategories([]);
        
    }

    const resetTiers = () => {

    setSelectedTiers([]);
    
    }
    /* ========= sort toggle ======================== */
    const handleSortToggle = () => {
        setSortOrder( prev => prev === 'desc' ? 'asc' : 'desc');
        setPage(1);
    }

    /* `cancelled` is set by the cleanup, so a response arriving after a newer request started is dropped instead of writing to state: a stale page cannot append onto a freshly filtered list. */
    useEffect( () => {
        let cancelled = false;

        const loadRecords = async () => {
            setIsLoading(true);
            setErrorMsg('');

            try {
                const response = await fetchData(ENDPOINTS.private.records, {
                    params: {
                        page,
                        /* An empty selection is sent as `undefined`, which
                         * fetchData drops entirely — so "nothing selected"
                         * produces a clean unfiltered URL rather than
                         * `category_id[]=`, which the server would have to
                         * special-case as an empty value. */
                        category_id: selectedCategories.length > 0 ? selectedCategories : undefined, // singular category_id[] to match backend
                        tier_id: selectedTiers.length > 0 ? selectedTiers : undefined,  // singular tier_id[] to match backend
                        search: searchTerm.length > 0 ? searchTerm : undefined,
                        /* Unlike the filters this one is always sent: the server
                         * sorts by `date` and falls back to `desc` for anything it
                         * does not recognise, so sending it explicitly is what
                         * actually makes the toggle do anything. */
                        order: sortOrder,
                    },
                });

                // drop this if cancelled.
                if (cancelled) return;

                // Page 1 REPLACES the list ( useEffect is triggered by any filter change)
                setRecords(prev => (page === 1 ? response.data : [...prev, ...response.data]));

                // check if we have more pages to load
                setHasMore(response.links.next !== null); // bool

            } catch (error) {

                if (cancelled) return;

                setErrorMsg(error.message);

                console.error("error while fetching records data", error);

            } finally {

                if (!cancelled) setIsLoading(false);
            }
        };

        loadRecords();

        // Runs on unmount too, so a request that resolves after the page is
        // gone cannot set state on a component that no longer exists.
        return () => { cancelled = true; };

    }, [page, selectedCategories, selectedTiers, searchTerm, sortOrder]);

    // show more btn clickHandler
    const handleShowMore = () => {
        // Advancing the page is the whole handler: the effect above sees the new
        // value and fetches, appending because page !== 1.
        setPage(prevPage => prevPage + 1);
    }

    /* Search is committed, not live
     * `preventDefault` is what stops the form doing a full page reload */
    const handleSearchSubmit = (event) => {
        event.preventDefault();

        // Trimmed, so a stray space is not searched for literally. 
        // Submitting an empty box clears the search.
        setSearchTerm(searchInput.trim());

        // A new query invalidates the pages already loaded.
        setPage(1);
    }

    const hasActiveFilters = selectedCategories.length > 0 || selectedTiers.length > 0;

    return <>
        <section className="feed feed-meadow-container flex-grow-1 w-100">
            <div className=" px-4 pb-5 pt-3">
                <section className="page-header-container d-flex justify-content-between mb-3">
                <div className="container-fluid py-3">
                    <h2 className="feed-title">Your Records</h2>
                    <p className="feed-subtitle">Here are your happy memories. <br/> Enjoy your stay!</p>
                </div>
                <div className="btn-wrapper flex-shrink-0 align-self-end">
                    <Link  to="/my-records/add-new" className="btn-action">Add New</Link>
                </div>
                </section>
                <div className="search-wrapper">
                {/* All categories chips */}
                <div className="categories-chips mb-3 d-flex flex-wrap gap-2">
                    <span className="feed-subtitle text-muted fw-bold w-100">Categories:</span>
                    <button
                        type="button"
                        onClick={resetCategories}
                        className={`glass-chip ${( selectedCategories.length === 0 ) ? 'btn-action-sm' : 'btn-action-outline-sm glass-bg'}`}
                        >All</button>
                    {CATEGORIES.map( (category) => {
                        const isSelected = selectedCategories.includes(category.id);

                        return <button
                                    key={category.id}
                                    type="button"
                                    /* Off = the frosted surface, on = the filled
                                     * action button. `glass-bg` instead of
                                     * `glass-bar`: glass-bar pins its background
                                     * with !important to beat .navbar, which on a
                                     * button also outranked :hover — so the label
                                     * went white while the fill stayed glass. */
                                    className={`glass-chip ${isSelected ? 'btn-action-sm' : 'btn-action-outline-sm glass-bg'}`}
                                    onClick={ () => toggleCategory(category.id) }
                        >
                            {category.name}
                        </button>
                    }
                    )}
                </div>
                {/* All tiers chips */}
                <div className="tiers-chips mb-3 d-flex flex-wrap gap-2">
                    <span className="feed-subtitle text-muted fw-bold w-100">Tiers:</span>
                        <button
                            type="button"
                            onClick={resetTiers}
                            className={`glass-chip ${( selectedTiers.length === 0 ) ? 'btn-action-sm' : 'btn-action-outline-sm glass-bg'}`}
                            >All</button>
                    {TIER_CHIPS.map( (tier) => {
                        const isSelected = selectedTiers.includes(tier.id+1); // tiers array is working on index, but we are looking for correspondance with index in db
                        return <button
                                    key={tier.id} // tiers array is working on index, but we are looking for correspondance with index in db
                                    type="button"
                                    /* Same off/on split as the category chips. */
                                    className={`glass-chip ${isSelected ? 'btn-action-sm' : 'btn-action-outline-sm glass-bg'}`}
                                    onClick={ () => toggleTier(tier.id+1) }
                        >
                            {tier.name}
                        </button>
                    }
                    )}
                </div>
                {/* searchbar & sort flex section */}
                <div className="advanced-filter-wrapper d-flex align-items-baseline justify-content-between">
                    {/* searchbar */}
                    <form className='d-flex py-4' onSubmit={handleSearchSubmit}>
                                <div>
                                    <input
                                        type="search"
                                        className="form-control rounded-pill mx-2"
                                        placeholder="Search..."
                                        value={searchInput}
                                        onChange={ e => setSearchInput(e.target.value) }
                                    />
                                </div>
                                <button
                                    className="btn-action-outline glass-bg ms-3 rounded-4"
                                    type="submit"
                                    disabled={isLoading}
                                >
                                < Search />
                                </button>
                            </form>
                    {/* order */}
                    <div>
                        <button
                                    type="button"
                                    className="btn-action-outline glass-bg rounded-pill px-3 py-2 d-flex mb-2 align-items-center gap-2"
                                    onClick={handleSortToggle}
                                >
                                    <span className="small fw-bold">
                                        {sortOrder === 'desc' ? 'Latest' : 'Oldest'}
                                    </span>
                                    {sortOrder === 'desc' ? <SortNumericDown /> : <SortNumericUp />}
                        </button>
                    </div>
                </div>
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 cards-container h-100 g-4">
                    {/* fetch error */}
                    { errorMsg && <h5>Something went wrong while fetching data from the database. <br/> Apologies for the inconvenience. <br/> {errorMsg}</h5>}
                    {/* Empty state */}
                    { !errorMsg && !isLoading && records.length === 0 &&
                        <h5 className="feed-subtitle">{ hasActiveFilters || searchTerm
                            ? 'No records match this search and these filters.'
                            : 'No records yet.' }</h5>
                    }
                    {/* cards */}
                    {records.map( (record) => {
                        return <div key={record.id} className="col">
                            <MeadowCard record={record} onOpen={ () => setOpenRecord(record) } />
                        </div>
                    })}
                </div>
                {/* show more cards */}
                { hasMore && records.length > 0 && <div className="d-flex justify-content-center btn-wrapper py-3">
                        <button type="button"
                                className="btn-action"
                                onClick={handleShowMore}
                                disabled={isLoading}
                        >{isLoading ? 'Loading...' : 'Show More'} </button>
                </div>}
            </div>
            </div>
        </section>

        {/* One modal for every card. It has to sit above the feed rather than
        inside a card, because Bootstrap resolves `data-bs-target` against
        the whole document — a modal nested in a single card would work, but
        only by being duplicated into every other card. */}
        <RecordModal record={openRecord} />

        {/* Create Modal */}
    </>;
}
export default RecordsPage;