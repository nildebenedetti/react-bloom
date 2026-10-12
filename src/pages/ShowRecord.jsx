import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useParams } from "react-router";
import { Link } from "react-router";
import { fetchData, ENDPOINTS } from "../utils/api.js"
import RecordDetailBody from "../components/records/RecordDetailBody.jsx";

/* The delete confirmation is a Bootstrap modal rather than `window.confirm`, so
 * the prompt is styled and dismissable like the rest of the app. */
const DELETE_MODAL_ID = 'delete-record-modal';

const closeDeleteModal = () => {
    const modalElement = document.getElementById(DELETE_MODAL_ID);

    if (modalElement && window.bootstrap) {
        window.bootstrap.Modal.getInstance(modalElement)?.hide();
    }
};


function ShowRecord() {
    const [ record, setRecord ] = useState(null);
    const [ errorMsg, setErrorMsg ] = useState('');
    const [ deleteErrorMsg, setDeleteErrorMsg ] = useState('');
    const [ isLoading, setIsLoading ] = useState(false);
    /* Kept apart from `isLoading`: the fetch state hides the whole record while
     * it is true, which would unmount the confirmation modal mid-delete. */
    const [ isDeleting, setIsDeleting ] = useState(false);

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
        setIsDeleting(true);
        setDeleteErrorMsg('');

        try {

            await fetchData(`${ENDPOINTS.private.records}/${id}`, {
                method: 'DELETE',
            });

            /* The modal is dismissed by hand before leaving: Bootstrap's
             * backdrop survives a client-side navigation, so removing it here
             * is what keeps it from sticking to the next page. */
            closeDeleteModal();
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            document.querySelector('.modal-backdrop')?.remove();

            navigate('/my-records', {
                state: {message: 'Record successfully deleted!'}
            });

        } catch (error) {

            /* The modal stays open so the message is read in context: the
             * buttons below still show it once the dialog is dismissed. */
            setDeleteErrorMsg(error.message);

        } finally {
            setIsDeleting(false);
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
                        <button
                            type="button"
                            className="btn-action ms-2"
                            data-bs-toggle="modal"
                            data-bs-target={`#${DELETE_MODAL_ID}`}
                        >Delete</button>
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

        {/* Confirmation for the destructive action. Rendered outside the
            `isLoading` block so it stays mounted while the request runs. */}
        { record?.attributes && (
        <div
            className="modal fade"
            id={DELETE_MODAL_ID}
            tabIndex="-1"
            aria-labelledby={`${DELETE_MODAL_ID}-title`}
            aria-hidden="true"
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id={`${DELETE_MODAL_ID}-title`}>
                            Delete Record
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        ></button>
                    </div>
                    <div className="modal-body">
                        <p className="mb-0">
                            Are you sure you want to delete this Record? You will not be
                            able to get it back later.
                        </p>
                        {deleteErrorMsg && (
                            <p className="text-danger mt-2 mb-0">
                                {deleteErrorMsg}
                            </p>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn-action-outline"
                            data-bs-dismiss="modal"
                        >Cancel</button>
                        <button
                            type="button"
                            className="btn-action"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >{isDeleting ? 'Deleting...' : 'Delete'}</button>
                    </div>
                </div>
            </div>
        </div>
        )}
    </>
}
export default ShowRecord