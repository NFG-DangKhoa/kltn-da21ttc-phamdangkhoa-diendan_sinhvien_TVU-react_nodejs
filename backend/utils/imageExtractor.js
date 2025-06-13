/**
 * Utility functions for extracting images from HTML content
 */

/**
 * Extract the first image URL from HTML content
 * @param {string} htmlContent - HTML content of the post
 * @returns {string|null} - First image URL or null if no image found
 */
const extractFirstImageFromContent = (htmlContent) => {
    if (!htmlContent || typeof htmlContent !== 'string') {
        return null;
    }

    // Regular expression to match img tags and extract src attribute
    const imgRegex = /<img[^>]+src\s*=\s*["']([^"']+)["'][^>]*>/gi;
    const match = imgRegex.exec(htmlContent);

    if (match && match[1]) {
        let imageUrl = match[1];

        // If it's a relative URL (starts with /upload), make it absolute
        if (imageUrl.startsWith('/upload/')) {
            return imageUrl; // Keep as relative path for consistency
        }

        // If it's already an absolute URL, return as is
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }

        // If it's a relative path without /upload, add /upload prefix
        if (!imageUrl.startsWith('/')) {
            imageUrl = '/upload/' + imageUrl;
        }

        return imageUrl;
    }

    return null;
};

/**
 * Extract all image URLs from HTML content
 * @param {string} htmlContent - HTML content of the post
 * @returns {Array<string>} - Array of image URLs
 */
const extractAllImagesFromContent = (htmlContent) => {
    if (!htmlContent || typeof htmlContent !== 'string') {
        return [];
    }

    const images = [];
    const imgRegex = /<img[^>]+src\s*=\s*["']([^"']+)["'][^>]*>/gi;
    let match;

    while ((match = imgRegex.exec(htmlContent)) !== null) {
        if (match[1]) {
            let imageUrl = match[1];

            // Process URL similar to extractFirstImageFromContent
            if (imageUrl.startsWith('/upload/')) {
                images.push(imageUrl);
            } else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                images.push(imageUrl);
            } else if (!imageUrl.startsWith('/')) {
                images.push('/upload/' + imageUrl);
            } else {
                images.push(imageUrl);
            }
        }
    }

    return images;
};

/**
 * Get thumbnail image for a post
 * Priority: ONLY first image from content (real images uploaded by users)
 * @param {Object} post - Post object with content
 * @returns {string|null} - Image URL for thumbnail or null if no image
 */
const getPostThumbnail = (post) => {
    if (!post) {
        return null;
    }

    // ONLY get from content (real images uploaded by users)
    // Do NOT use images array as it contains mock/placeholder images
    const firstImage = extractFirstImageFromContent(post.content);
    if (firstImage) {
        return firstImage;
    }

    // No image found in content - return null
    // Frontend will handle showing "no image" placeholder
    return null;
};

/**
 * Update post with extracted images
 * @param {Object} post - Post object to update
 * @returns {Object} - Updated post object
 */
const updatePostWithExtractedImages = (post) => {
    if (!post || !post.content) {
        return post;
    }

    const extractedImages = extractAllImagesFromContent(post.content);

    // Update the post object
    const updatedPost = {
        ...post,
        extractedImages: extractedImages,
        thumbnailImage: extractedImages.length > 0 ? extractedImages[0] : null
    };

    return updatedPost;
};

/**
 * Clean and validate image URL
 * @param {string} imageUrl - Image URL to clean
 * @returns {string|null} - Cleaned URL or null if invalid
 */
const cleanImageUrl = (imageUrl) => {
    if (!imageUrl || typeof imageUrl !== 'string') {
        return null;
    }

    // Remove any extra whitespace
    imageUrl = imageUrl.trim();

    // Check if it's a valid URL format
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('/upload/')) {
        return imageUrl;
    }

    return null;
};

/**
 * Generate full URL for image
 * @param {string} imageUrl - Relative or absolute image URL
 * @param {string} baseUrl - Base URL for the application
 * @returns {string} - Full image URL
 */
const getFullImageUrl = (imageUrl, baseUrl = 'http://localhost:5000') => {
    if (!imageUrl) {
        return null;
    }

    // If already absolute URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }

    // If relative URL, prepend base URL
    if (imageUrl.startsWith('/')) {
        return baseUrl + imageUrl;
    }

    // If no leading slash, add it
    return baseUrl + '/' + imageUrl;
};

module.exports = {
    extractFirstImageFromContent,
    extractAllImagesFromContent,
    getPostThumbnail,
    updatePostWithExtractedImages,
    cleanImageUrl,
    getFullImageUrl
};
