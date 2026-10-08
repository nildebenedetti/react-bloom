import styles from './RecordModal.module.css';
import RecordDetailBody from './RecordDetailBody.jsx';

/* =============================================================================
 * BLOOM · RECORD DETAIL MODAL
 * -----------------------------------------------------------------------------
 * The frame the record is shown in on the Meadow. This is the HOST, not the
 * detail view: it owns the dialog, the scroll behaviour and the dismissal, and
 * delegates every question about the record to RecordDetailBody.
 * ========================================================================== */

const MODAL_ID = 'record-modal';

function RecordModal({ record }) {
    return (
        <div
            className="modal fade"
            id={MODAL_ID}
            tabIndex="-1"
            aria-labelledby={`${MODAL_ID}-title`}
            aria-hidden="true"
        >
            <div className={`modal-dialog modal-dialog-centered modal-lg ${styles.dialog}`}>
                <div className={`modal-content ${styles.content}`}>
                    <div className={styles.header}>
                        <h2 className="visually-hidden" id={`${MODAL_ID}-title`}>
                            {record?.attributes.title}
                        </h2>

                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        ></button>
                    </div>

                    <div className={styles.body}>
                        {/* `key` forces a remount when the selected record
                            changes, which resets per-record state */}
                        {record && <RecordDetailBody key={record.id} record={record} />}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RecordModal;