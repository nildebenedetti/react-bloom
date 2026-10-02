import { LeafFill, AwardFill, TrophyFill, Stars } from 'react-bootstrap-icons';

/* Tier id → icon + name. Seeded ids, per PRD 2.1.
 *
 * Lookup with `TIERS[record.attributes.tier?.id]` — an unknown id is
 * `undefined`, which the callers already treat as "render nothing".
 *
 * `Icon` is the COMPONENT, not an element: the card draws it at 20px and the
 * detail view at 18px, and an element instance is fixed to the size it was
 * created with. */
export const TIERS = {
    1: { label: 'Small win', Icon: LeafFill },
    2: { label: 'Solid step', Icon: AwardFill },
    3: { label: 'Major milestone', Icon: TrophyFill },
    4: { label: 'Epic breakthrough', Icon: Stars },
};