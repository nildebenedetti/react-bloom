import { useMemo, useState } from 'react';
import styles from './RecordDetailBody.module.css';
import { mediaUrl } from '../../utils/api.js';
import { pickPlaceholder } from '../utils/images.js';
import { formatRecordDate } from '../utils/date.js';
import { TIERS } from '../utils/tier.js';
import { TagFill } from 'react-bootstrap-icons';


function RecordDetailBody({ record }) {
    const { attributes, relationships } = record;

    const tier = TIERS[attributes.tier?.id];

    const date = useMemo(() => formatRecordDate(attributes.date), [attributes.date]);

    const category = attributes.category;

    const author = relationships?.user?.user_name;

    const emotions = Array.isArray(attributes.emotions) ? attributes.emotions : [];

        /*   no image_path  => NO placeholder
     *   image_path, loads  =>  the record's picture
     *   image_path, 404s   => placeholder. The path EXISTS but the file is not here
     */
    const imageUrl = useMemo(
        () => mediaUrl(attributes.image_path),
        [attributes.image_path],
    );
    const [imageBroken, setImageBroken] = useState(false);

    // chosen once and kept
    const [placeholder] = useState(pickPlaceholder);

    const showImage = Boolean(imageUrl) && !imageBroken;

    return (
        <div className={styles.detail}>
            {/* Building tier */}
            {tier && (
                <p className={`${styles.tier} mb-2`}>
                    <tier.Icon size={18} />
                    <span>{tier.label}</span>
                </p>
            )}

            <h2 className={`${styles.title} mb-2`}>{attributes.title}</h2>

            <div className={`${styles.meta} mb-3`}>
                {author && <span className={styles.metaItem}>by {author}</span>}
                {date && <span className={styles.metaItem}>{date}</span>}
            
                {category && (
                    <span className={styles.metaItem}>
                        <TagFill size={13} />
                        {category}
                    </span>
                )}
            </div>

            {showImage && (
                <div className={styles.figure}>
                    <img
                        src={imageBroken ? placeholder : imageUrl}
                        alt={imageBroken ? '' : attributes.image_alt ?? attributes.title}
                        className={`${styles.image} w-100 object-fit-cover rounded`}
                        // set placeholder
                        onError={() => setImageBroken(true)}
                    />
                </div>
            )}

            {emotions.length > 0 && (
                <ul className={`${styles.emotions} list-unstyled mb-3`}>
                    {emotions.map((emotion) => (
                        <li key={emotion.id}>
                            {/* The hex is DATA of each emotion */}
                            <span
                                className="badge rounded-pill"
                                style={{ backgroundColor: emotion.color }}
                            >
                                {emotion.name}
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            {attributes.description && (
                <div className={styles.description}>{attributes.description}</div>
            )}
        </div>
    );
}

export default RecordDetailBody;