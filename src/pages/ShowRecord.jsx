import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useParams } from "react-router";
import { Link } from "react-router";
import { fetchData, ENDPOINTS } from "../utils/api.js"
import RecordDetailBody from "../components/records/RecordDetailBody.jsx";


function ShowRecord() {
    const [ record, setRecord ] = useState(null);
    const [ errorMsg, setErrorMsg ] = useState('');
    const [ deleteErrorMsg, setDeleteErrorMsg ] = useState('');
    const [ isLoading, setIsLoading ] = useState(false);

    const { id } = useParams();
    const navigate = useNavigate();

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


    }, [ id ]); // in this app is not blocking yet better put it for future implementations

    const handleDelete = async () => {
        const confirmed = window.confirm("are you sure you want to delete this Record? You will not be able to get it back later.")

        if (!confirmed) return;

        setIsLoading(true);
        setDeleteErrorMsg('');

        try {

            await fetchData(`${ENDPOINTS.private.records}/${id}`, {
                method: 'DELETE',
            });

            navigate('/my-records', {
                state: {message: 'Rercord successfully deleted!'}
            });

        } catch (error) {

            setDeleteErrorMsg(error.message);

        } finally {
            setIsLoading(false);
        }
    }

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
                        <Link to={`/my-records/${record.id}/edit`} className="btn-action">Edit</Link>
                        <button type="button" onClick={handleDelete} className="btn-action ms-2">Delete</button>
                    </div>
                </div>
                {/* delete error msg */}
                { deleteErrorMsg && (
                <div className="alert alert-danger">
                    <p className="mb-2">
                        Something went wrong while deleting your Record: {deleteErrorMsg}.
                        <br/> Please try again later.
                    </p>                    
                </div>
            )}
                <RecordDetailBody record={record} />
            </div>
            </>}
        </div>
    </>
}
export default ShowRecord