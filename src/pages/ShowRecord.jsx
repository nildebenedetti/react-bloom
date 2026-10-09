import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { Link } from "react-router";
import { fetchData, ENDPOINTS } from "../utils/api.js"
import RecordDetailBody from "../components/records/RecordDetailBody.jsx";


function ShowRecord() {
    const [ record, setRecord ] = useState(null);
    const [ errorMsg, setErrorMsg ] = useState('');
    const [ isLoading, setIsLoading ] = useState(false);

    const { id } = useParams();

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
        <div className="container pt-3 px-1 d-flex flex-column">
            {isLoading && <h5>Loading...</h5>}

            {errorMsg && <h5>Something went wrong while fetching data from the database. <br/> Apologies for the inconvenience. <br/> {errorMsg}</h5>}

            {!isLoading && !errorMsg && record?.attributes && <>
            
            <div className="card-wrapper px-3 pb-4">
                <div className="btn-wrapper d-flex justify-content-between pb-4 pt-2">
                    <div className="left-btn-section">
                        <Link to="/my-records" className="btn-action">Back To All Records</Link>
                    </div>
                    <div className="right-btn-section">
                        <Link to="/my-records/add-new" className="btn-action">Edit</Link>
                        <Link to="/delete" className="btn-action ms-2">Delete</Link>
                    </div>
                </div>
                <RecordDetailBody record={record} />
            </div>
            </>}
        </div>
    </>
}
export default ShowRecord