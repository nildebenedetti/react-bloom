import { useMemo, useState } from 'react';
import styles from './MeadowCard.module.css';
import { mediaUrl } from '../../utils/api.js';
import { LeafFill, AwardFill, TrophyFill, Stars, Heart, HeartFill } from 'react-bootstrap-icons';

// placeholders
const PLACEHOLDER_IMAGES = [
    '/images/placeholders/placeholder-1.png',
    '/images/placeholders/placeholder-2.png',
    '/images/placeholders/placeholder-3.png',
    '/images/placeholders/placeholder-4.png',
];

// Tier iconography. `size` is passed explicitly because the SVG no longer sizes
// itself from an inherited font-size the way a `bi` glyph did — 28px is what
// `fs-3` used to give it.
const tiers = {
    'small win' : <LeafFill size={20} /> ,
    'solid step' : <AwardFill size={20} />,
    'major milestone' : <TrophyFill size={20} />,
    'epic breakthrough' : <Stars size={20} />
};

// picker function
const pickPlaceholder = () =>
    PLACEHOLDER_IMAGES[Math.floor(Math.random() * PLACEHOLDER_IMAGES.length)];

function MeadowCard({ record }) {
    const [ love, setLove ] = useState(false);

    const heartClickHandler = () => {
        love === true ? setLove(false) : setLove(true);
    }

     /*
     * Memoized: the fallback is random, so without this the placeholder would reshuffle the card on every
     * re-render of the parent grid. It only re-runs when `image_path` changes or
     * the card mounts. */
    const imageSrc = useMemo(
        () => mediaUrl(record.attributes.image_path) ?? pickPlaceholder(),
        [record.attributes.image_path],
    );

    return <>
        <div className={` ${styles.glassCard} card h-100 p-3`}>
            {/* flex-grow-1 on .card-top, absorbing slack */}
            <div className="card-top d-flex flex-column flex-grow-1">

                <div className="d-flex justify-content-between align-items-start pb-2">
                    <div>
                        <h3 className={styles.cardTitle}>{record.attributes.title}</h3>
                        <small className="author text-muted">by {record.relationships.user?.user_name}</small>
                    </div>
                    
                    <div className="tier-icon">
                        {tiers[record.attributes.tier?.name]}
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
                <div className="emotions">
                    {record.attributes.emotions.map((emotion) => {
                        return <div key={emotion.id} className="badge rounded-pill me-2" style={{ backgroundColor: emotion.color }}>
                            {emotion.name}
                        </div>;
                    })}
                </div>
                <div className={`${styles.description}`}>
                    {record.attributes.description}
                </div>
                <div className="btn-wrapper pt-3 d-flex justify-content-end align-items-end g-2">
                    <button type="button" className="btn-action-outline" onClick={heartClickHandler}>
                       { love ? < HeartFill size={20}/> : <Heart size={20} />}
                    </button>
                </div>
                
            </div>
            
        </div>
    </>
}
export default MeadowCard;
