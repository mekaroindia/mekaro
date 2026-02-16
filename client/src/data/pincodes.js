
const ALLOWED_PINCODES_SINGLE = [
    600049, 600050, 600053, 600054, 600055, 600058,
    600020,
    600040, 600044, 600045, 600090,
    600062, 600064, 600069, 600075,
    600116, 600118, 600120, 600123
];

const ALLOWED_RANGES = [
    { start: 600001, end: 600014 },
    { start: 600029, end: 600037 }
];

export const isPincodeAllowed = (pincodeInput) => {
    if (!pincodeInput) return false;

    const pin = parseInt(pincodeInput, 10);
    if (isNaN(pin)) return false;

    // Check single values
    if (ALLOWED_PINCODES_SINGLE.includes(pin)) return true;

    // Check ranges
    for (const range of ALLOWED_RANGES) {
        if (pin >= range.start && pin <= range.end) {
            return true;
        }
    }

    return false;
};
