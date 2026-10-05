import { useState, useEffect } from "react";
import { fetchData, ENDPOINTS } from "../utils/api.js";
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


    // ====== fetch function =========================
    const loadPagedRecords = async (pageToFetch) => {
        setIsLoading(true);

        try {
            // fetch records
            const response = await fetchData(ENDPOINTS.private.records,
                {
                    params: { page: pageToFetch }
                }
            );
            // if page to fetch is 1, get data, otherwise spread former data and add fresh fetched
            setRecords( prev => pageToFetch === 1 ? response.data : [...prev, ...response.data ]);

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

    useEffect( () => {

        loadPagedRecords(page);

    }, []);

    // clickHandler
    const handleShowMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadPagedRecords(nextPage);
    }


    return <>
        <section className="feed w-100">
            <div className="feed-meadow-container px-4 pb-5 pt-3">
                <div className="container-fluid py-3 mb-3">
                    <h2 className="feed-title">Your Records</h2>
                    <p className="feed-subtitle">Here are your happy memories. <br/> Enjoy your stay!</p>
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