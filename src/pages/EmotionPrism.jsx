import { useState, useEffect } from "react";
import { Link } from "react-router";
import { fetchData, ENDPOINTS } from "../utils/api";
import { useAuthContext } from "../contexts/AuthContext.jsx";
import PrismCard from "../components/cards/PrismCard.jsx";


function EmotionPrism() {

    const [ records, setRecords ] = useState([]);
    const [ openRecord, setOpenRecord ] = useState(null);
    const [ isLoading, setIsLoading ] = useState(false);
    const [ errorMsg, setErrorMsg ] = useState(''); 
    const [ page, setPage ] = useState(1);
    const [ hasMore, setHasMore ] = useState(true);

    const { token, user } = useAuthContext();

    const loadPagedRecords = async (pageToFetch) => {
        setIsLoading(true);

        try {

            const response = await fetchData(ENDPOINTS.private.prism, {
                params: { page: pageToFetch }
            }

        );

            // if pageToFetch is 1 get data, otherwise spread former data + fresh fetch
            setRecords(prev => pageToFetch === 1 ? response.data : [...prev, ...response.data ]);
            
            // check if we have more pages to load
            setHasMore(response.links.next !== null);        

        } catch (error) {
        
            setErrorMsg(error.message);

            console.error("error while fetching records data", error);

        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
    
        loadPagedRecords(page);

    }, []);

          // onClick fot show more btn
    const handleShowMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadPagedRecords(nextPage);
    }

    return <>
    <div className="flex-grow-1 w-100  px-4 feed-meadow-container">
            {/* Welcome section with cockpit
     */}
        <section className="welcome-section d-flex justify-content-start align-items-start">
            <div className="welcome-par">
                <h2 className="feed-title">Emotion Prism</h2>
                <h5 className="feed-subtitle">
                    Wander through the moments that made you who you are. <br /> Let a feeling lead the way.
                </h5>
            </div>
        </section>

        <div className="filters d-flex justify-content-between">
            {/* filters */}
            <div className="emotion-chips">

            </div>
            {/* filters */}
            <div className="order-toggle">

            </div>
        </div>
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 gap-1">
        {records?.map( (record) => <div key={record.id} className="card-container col">
                <PrismCard record={record} />
            </div> )}
        </div>

    {/* show more cards */}
        { hasMore &&  
        <div className="d-flex justify-content-center btn-wrapper py-3">
            <button type="button"
                className="btn-action"
                onClick={handleShowMore}
                disabled={isLoading}
            >{isLoading ? 'Loading...' : 'Show More'} </button>
        </div>}
    </div>
    </>



}

export default EmotionPrism;