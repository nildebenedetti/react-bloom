import styles from "./AboutPage.module.css";

function AboutPage() {
    return (
        <article className={styles.about}>
            {/* Hero */}
            <header className={styles.hero}>
                <img
                    className={styles.logo}
                    src="/logos/bloom-logo.svg"
                    alt="Bloom logo"
                />
                <h1 className={styles.tagline}>
                    A place to remember how far you&rsquo;ve bloomed.
                </h1>
                <p className={`${styles.abstract} fs-5 fst-italic`}>
                    Bloom is your safe space to slow the pace, take a seat on
                    the grass and contemplate your growth.
                </p>
            </header>

            {/* pillars */}
            <ul className={`${styles.principles} d-flex flex-column flex-md-row gap-4 gap-md-5`}>
                <li className={`${styles.principle} flex-fill`}>
                    <h2 className={`${styles.principleTerm} fs-3`}>Pause</h2>
                    <p className={`${styles.principleBody} fs-6`}>
                        Take a moment to feel grounded, where you are now.
                    </p>
                </li>
                <li className={`${styles.principle} flex-fill`}>
                    <h2 className={`${styles.principleTerm} fs-3`}>Validate</h2>
                    <p className={`${styles.principleBody} fs-6`}>
                        Honour your growth and take credit for all you&rsquo;ve
                        accomplished.
                    </p>
                </li>
                <li className={`${styles.principle} flex-fill`}>
                    <h2 className={`${styles.principleTerm} fs-3`}>Rest</h2>
                    <p className={`${styles.principleBody} fs-6`}>
                        Find warmth in all that has grown.
                    </p>
                </li>
            </ul>

            <p className={`${styles.note} fs-4`}>
                Stay as long as you feel the need.
            </p>

            {/* Behind Bloom — the idea */}
            <section className={styles.idea}>
                <h2 className={styles.sectionTitle}>Behind Bloom - the idea</h2>

                <p className={styles.body}>
                    Our minds have a curious way of holding on to certain
                    things.
                </p>
                <p className={styles.body}>
                    Difficult moments can leave a lasting impression, while the
                    good ones, sometimes, seem to slip quietly out of reach.
                </p>
                <p className={styles.body}>
                    The small discoveries. The things we learned without even
                    realising it. The moments we wish we could hold on to a
                    little longer.
                </p>
                <p className={styles.body}>What a pity to let them fade.</p>
                <p className={styles.body}>
                    Research suggests that reflecting on positive experiences,
                    including through writing, can support our sense of
                    well-being. Putting memories into words gives us a way to
                    return to them, to sit with them for a while, and to see
                    them in a different light.
                </p>
                <p className={styles.body}>
                    Because life moves quickly. Days fill up, one after another,
                    and it&rsquo;s easy to move on to the next thing without
                    ever looking back.
                </p>
                <p className={styles.body}>
                    And somewhere along the way, we might lose sight of how much
                    has already happened, how much we&rsquo;ve learned, how far
                    we&rsquo;ve come.
                </p>
                <p className={styles.body}>
                    Bloom is a little space for all of that.
                </p>
                <p className={styles.body}>
                    For all the times life feels demanding and you feel the
                    weight of keeping up with modern times&rsquo; fast pace and
                    severe standards, here is your corner of peace.
                </p>
                <p className={styles.body}>
                    A place to sit for a while, among the things that made you
                    who you are.
                </p>
            </section>

            <p className={styles.closing}>May your Bloom cherish your Soul.</p>
        </article>
    );
}

export default AboutPage;
