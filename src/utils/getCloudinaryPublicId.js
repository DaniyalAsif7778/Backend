export function getCloudinaryPublicId(url) {
    if (!url || typeof url !== 'string') return '';

    // 1. Get the very last part of the URL after the last slash
    const lastSegment = url.split('/').pop();

    // 2. Strip off any file extensions (.jpg, .png, etc.)
    const publicId = lastSegment.split('.')[0];

    return publicId;
}