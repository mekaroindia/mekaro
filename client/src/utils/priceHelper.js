/**
 * Generates a consistent, massive fake original price based on the product ID.
 * This ensures the fake discount looks like 50-70% and remains identical on refresh.
 * 
 * @param {number|string} price - The actual current price of the product
 * @param {number|string} id - The unique identifier of the product
 * @returns {number} The fake, higher original price
 */
export const calculateFakeOriginalPrice = (price, id) => {
    const numPrice = Number(price) || 0;

    // Hash the ID slightly to get a pseudo-random decimal between 0.5 and 0.7
    // Using simple char codes or the numeric ID itself
    const numericId = typeof id === 'string'
        ? id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        : Number(id) || 1;

    // We want a discount percentage between 0.50 and 0.70
    // Math.sin generates identical results for identical inputs
    const randomFraction = Math.abs(Math.sin(numericId));
    const discountPercentage = 0.50 + (randomFraction * 0.20); // 0.50 to 0.70

    // If selling price is 40% of original (60% discount):
    // Original = Selling / (1 - Discount)
    const originalPrice = numPrice / (1 - discountPercentage);

    // Round to nearest 10 for a cleaner "retail" look (e.g. 1990 instead of 1993)
    return Math.round(originalPrice / 10) * 10;
};
