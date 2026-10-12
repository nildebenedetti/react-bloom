import styles from './PrismCard.module.css';
import { mediaUrl } from '../../utils/api.js';


function PrismCard({record}) {
    const imgPath = mediaUrl(record?.attributes?.image_path);
    const imgAlt = record?.attributes?.image_alt;
    const title = record?.attributes?.title;
    const date = record?.attributes?.date;

    return <>
    <div className={`card ${styles.cardContainer}`}>
        {imgPath && (<img src={imgPath} alt={ imgAlt || title } className={styles.bgImage} />) }
        <div className={styles.overlay}></div>
        <div className={`card-body ${styles.cardContent}`}>
            <h4 className={styles.cardTitle}>{title}</h4>
            <p>{date}</p>
        </div>
    </div>
    </>
}
export default PrismCard