import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { fetchData, ENDPOINTS } from "../utils/api.js"
import RecordDetailBody from "../components/records/RecordDetailBody.jsx";


function ShowRecord() {
    const [ record, setRecord ] = useState(null);
    const [ errorMsg, setErrorMsg ] = useState('');
    const [ isLoading, setIsLoading ] = useState(false);

    const { id } = useParams();

    console.log(id);

    useEffect( () => {

        const loadRecord = async () => {
        setIsLoading(true);
        setErrorMsg('');

        try {

            const response = await fetchData(`${ENDPOINTS.private.records}/${id}`);

            setRecord(response.data);

        } catch (error) {

            setErrorMsg(error.message);

            console.error("error while fetching record data", error);
        } finally {
            setIsLoading(false);
        }

    }

        loadRecord();


    }, [ id ]);

    return <>
        <div className="container pt-3 px-1 d-flex flex-column align-items-center">
            {isLoading && <h5>Loading...</h5>}

            {errorMsg && <h5>Something went wrong while fetching data from the database. <br/> Apologies for the inconvenience. <br/> {errorMsg}</h5>}

            {!isLoading && !errorMsg && record?.attributes && <RecordDetailBody record={record} />}
        </div>
    </>
}
export default ShowRecord