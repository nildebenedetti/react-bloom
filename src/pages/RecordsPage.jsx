import { useState, useEffect } from "react";
import { fetchData, ENDPOINTS } from "../utils/api.js";
import { Search } from "react-bootstrap-icons";
import MeadowCard from "../components/cards/MeadowCard.jsx";
import RecordModal from "../components/records/RecordModal.jsx";

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

    // ==== categories & tiers =======================

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

    const TIERS = [
        { id: 1, name: 'small win' },
        { id: 2, name: 'solid step' },
        { id: 3, name: 'major milestone' },
        { id: 4, name: 'epic breakthrough' },
    ];

    // ========= toggle Cateories & Tiers =================

    const toggleCategory = (id) => {
        setSelectedCategories(prev =>
            // if included, filter current array. and remove, else, add at the end of curr array values
            prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
        );
    };

    const toggleTier = (id) => {
        setSelectedTiers(prev =>
            prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
        );
    };

    // ====== main fetch function =========================
    // param resetList needed to reset page in case of query after show more btn has been used
    const loadPagedRecords = async (pageToFetch, resetList = false) => {
        setIsLoading(true);

        try {
            // fetch records
            const response = await fetchData(ENDPOINTS.private.records,
                {
                    params: { page: pageToFetch },
                    categories: selectedCategories.length > 0 ? selectedCategories : undefined, // undefined is handled in fetch data
                    tiers: selectedTiers.length > 0 ? selectedTiers : undefined,
                }
            );
            // if page to fetch is 1 or search filters have been activated, get data, otherwise spread former data and add fresh fetched
            setRecords( prev => ( pageToFetch === 1 || resetList ) ? response.data : [...prev, ...response.data ]);

            // check if we have more pages to load
            setHasMore(response.links.next !== null); // bool

        } catch (error) {

            setErrorMsg(error.message);

            console.error("error while fetching records data", error);

        } finally {
            setIsLoading(false);
        }
    }
    // ================================================

    // is launched when mounting and each filter toggle
    useEffect( () => {

        setPage(1); // as it is handled by filter toggle
        loadPagedRecords(page, true); // overriding second parameter resetList

    }, [selectedCategories, selectedTiers]);

    // show more btn clickHandler
    const handleShowMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadPagedRecords(nextPage); // resetList is left as default === false and does not 

    }


    return <>
        <section className="feed w-100">
            <div className="feed-meadow-container px-4 pb-5 pt-3">
                <div className="container-fluid py-3 mb-3">
                    <h2 className="feed-title">Your Records</h2>
                    <p className="feed-subtitle">Here are your happy memories. <br/> Enjoy your stay!</p>
                </div>
                <div className="search-wrapper">
                {/* All categories chips */}
                <div className="categories-chips mb-3 d-flex flex-wrap gap-2">
                    <span className="feed-subtitle text-muted fw-bold w-100">Categories:</span>
                    {CATEGORIES.map( (category) => {
                        const isSelected = selectedCategories.includes(category.id);

                        return <button
                                    key={category.id}
                                    type="button"
                                    className={`glass-chip ${isSelected ? 'btn-action-sm' : 'btn-action-outline-sm glass-bar'}`}
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
                    {TIERS.map( (tier) => {
                        const isSelected = selectedTiers.includes(tier.id);

                        return <button
                                    key={tier.id}
                                    type="button"
                                    className={`glass-chip ${isSelected ? 'btn-action-sm' : 'btn-action-outline-sm glass-bar'}`}
                                    onClick={ () => toggleTier(tier.id) }
                        >
                            {tier.name}
                        </button>
                    }
                    )}
                </div>

                {/* searchbar */}
                <div className='d-flex py-4'>
                            
                            <div>
                                <input
                                    type="text"
                                    className="form-control rounded-pill mx-2"
                                    placeholder="Search..."
                                />
                            
                            </div>
                            <button
                                className="btn-action-outline ms-3 rounded-4"
                                type="button"
                                // onClick={}
                            >
                            < Search />
                            </button>
                        </div>

                </div>
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 cards-container h-100 g-4">
                    {/* fetch error */}
                    { errorMsg && <h5>Something went wrong while fetching data from the database. <br/> Apologies for the inconvenience. <br/> {errorMsg}</h5>}
                    {/* cards */}
                    {records.map( (record) => {
                        return <div key={record.id} className="col">
                            <MeadowCard record={record} onOpen={ () => setOpenRecord(record) } />
                        </div>
                    })}
                </div>
                {/* show more cards */}
                { hasMore && <div className="d-flex justify-content-center btn-wrapper py-3">
                        <button type="button"
                                className="btn-action"
                                onClick={handleShowMore}
                                disabled={isLoading}
                        >{isLoading ? 'Loading...' : 'Show More'} </button>
                </div>}
            </div>
        </section>

        {/* One modal for every card. It has to sit above the feed rather than
        inside a card, because Bootstrap resolves `data-bs-target` against
        the whole document — a modal nested in a single card would work, but
        only by being duplicated into every other card. */}
        <RecordModal record={openRecord} />
    </>;
}
export default RecordsPage;