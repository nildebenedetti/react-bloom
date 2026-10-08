import { useMemo, useState } from 'react';
import styles from './MeadowCard.module.css';
import { mediaUrl } from '../../utils/api.js';
import { pickPlaceholder } from '../utils/images.js';
import { TIERS } from '../utils/tier.js';
import { Heart, HeartFill } from 'react-bootstrap-icons';

function MeadowCard({ record, onOpen }) {
    const [ love, setLove ] = useState(false);

    // KEPT FOR FUTURE IMPLEMENTATION
    // const heartClickHandler = () => {
    //     love === true ? setLove(false) : setLove(true);
    // }

    /* Shared with the detail view, so the icon a card shows and the name the
     * modal spells out cannot drift apart. */
    const tier = TIERS[record.attributes.tier?.id-1]; // as backend returns id and we are moving with array index, we need to sub 1 from received value (!!!)

    
     /*
     * Memoized: the fallback is random, so without this the placeholder would reshuffle the card on every
     * re-render of the parent grid. It only re-runs when `image_path` changes or
     * the card mounts. */
    const imageSrc = useMemo(
        () => mediaUrl(record.attributes.image_path) ?? pickPlaceholder(),
        [record.attributes.image_path],
    );

    return <>
        <div className={` ${styles.glassCard} card h-100 p-3`}
            onClick={() => onOpen(record)}
            data-bs-toggle="modal"
            data-bs-target="#record-modal">
            {/* flex-grow-1 on .card-top, absorbing slack */}
            <div className="card-top d-flex flex-column flex-grow-1">

                <div className="d-flex justify-content-between align-items-start pb-2">
                    <div>
                        <h3 className={styles.cardTitle}>{record.attributes.title}</h3>
                        <small className="author text-muted">by {record.relationships.user?.user_name}</small>
                    </div>

                    <div className="tier-icon">
                        {tier && <tier.Icon size={20} />}
                        {/* The icon alone is unreadable to anyone who does not
                            already know the scale; the name it stands for is
                            one hover/AT away without widening the card. */}
                        {tier && <span className="visually-hidden">{tier.label}</span>}
                    </div>
                </div>
                <div className="img-container mt-auto">
                    <img
                        src={imageSrc}
                        alt={record.attributes.image_alt ?? record.attributes.title}
                        className={`${styles.cardImg} w-100 object-fit-cover rounded`}
                    />
                </div>
            </div>
            <div className={`${styles.cardText} card-body d-flex flex-column justify-content-end`}>
                { record.attributes.emotions && <div className="emotions">
                    {record.attributes.emotions.map((emotion) => {
                        return <div key={emotion.id} className="badge rounded-pill me-2" style={{ backgroundColor: emotion.color }}>
                            {emotion.name}
                        </div>;
                    })}
                </div>}
                <div className={`${styles.description}`}>
                    {record.attributes.description}
                </div>
                <div className="btn-wrapper pt-3 d-flex justify-content-end align-items-end g-2">
                    {/*KEPT BUT LEFT FOR FUTURE IMPLEMENTATIONS--
                    <button type="button" className="btn-action-outline" onClick={heartClickHandler}>
                        { love ? < HeartFill size={20}/> : <Heart size={20} />}
                    </button> */}
                    {/* Opens the single feed-level modal, not a dialog owned by
                        this card. Bootstrap needs `record` in state before the
                        dialog opens, and the click is the only moment that
                        record is identified — so `onOpen` and the data-bs
                        attributes travel together. */}
                    <button
                        type="button"
                        className="btn-action-outline-sm"
                        data-bs-toggle="modal"
                        data-bs-target="#record-modal"
                        aria-haspopup="dialog"
                        onClick={() => onOpen(record)}
                    >See</button>
                </div>
            </div>
        </div>
    </>
}
export default MeadowCard;