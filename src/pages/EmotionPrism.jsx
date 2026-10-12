import { useState, useEffect } from "react";
import { Link } from "react-router";
import { fetchData, ENDPOINTS } from "../utils/api";
import { useAuthContext } from "../contexts/AuthContext.jsx";
import PrismCard from "../components/cards/PrismCard.jsx";


function EmotionPrism() {

    const [ records, setRecords ] = useState([]);
    const [ isLoading, setIsLoading ] = useState(false);
    const [ errorMsg, setErrorMsg ] = useState(''); 
    const [ page, setPage ] = useState(1);
    const [ hasMore, setHasMore ] = useState(true);

    const { token } = useAuthContext();

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
        {records?.map( (record) => <div key={record.id} className="card-container">
    <PrismCard record={record} />
    </div> )}
    </>



}
export default EmotionPrism;