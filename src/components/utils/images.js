/* =============================================================================
 * BLOOM · RECORD IMAGE PLACEHOLDERS
 * -----------------------------------------------------------------------------
 * What to show when a record has no usable picture.
 *
 * `mediaUrl()` in ./api.js owns the other half of this problem — turning an
 * `image_path` into a URL, and returning `null` when there is nothing to point
 * at. This module owns the fallback for that `null`, so "a record with no image"
 * is answered in one place instead of in every component that draws a picture.
 *
 * Kept apart from api.js on purpose: a URL builder is a pure function of its
 * input and easy to test, whereas this list is presentation, and presentation
 * has no business inside the module that talks to the network.
 * ========================================================================== */

export const PLACEHOLDER_IMAGES = [
    '/images/placeholders/placeholder-1.png',
    '/images/placeholders/placeholder-2.png',
    '/images/placeholders/placeholder-3.png',
    '/images/placeholders/placeholder-4.png',
];

/* Random, deliberately: a feed of identical grey cards would read as a broken
 * page, and the seeder creates plenty of imageless records, so this path is
 * hit immediately (F38). Callers MUST memoise the result per record — see
 * RecordDetailBody — or the picture reshuffles on every re-render. */
export const pickPlaceholder = () =>
    PLACEHOLDER_IMAGES[Math.floor(Math.random() * PLACEHOLDER_IMAGES.length)];