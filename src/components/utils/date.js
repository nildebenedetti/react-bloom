// No locale passed: the date follows the visitor's own browser. The UI copy
// stays in English — only the reader's own dates are localised.
//
// Numeric in every language, so `12/02/2005` is genuinely ambiguous in it-IT.
// Spelled out ("12 febbraio 2005") would read better but month:'long' makes
// Intl drop the long format entirely, so the choice is that or nothing.

const DATE_FORMAT = { year: 'numeric', month: 'numeric', day: 'numeric' };

export const formatRecordDate = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString(DATE_FORMAT);
};