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
    const handleSHowMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadPagedRecords(nextPage);
    }


    return <>
    
    </>
}
export default RecordsPage;