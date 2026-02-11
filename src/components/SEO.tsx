import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
}

const SEO: React.FC<SEOProps> = ({
    title = 'Memorialis - Plaques Mémorielles à QR Code',
    description = 'Créez un hommage éternel pour vos proches avec nos plaques funéraires QR code. Un mémorial numérique unique pour partager souvenirs, photos et vidéos.',
    keywords = 'plaque funéraire, qr code cimetière, mémorial numérique, souvenirs, tombe, hommage, memorialis',
    image = 'https://memorialis.shop/og-image.jpg',
    url,
    type = 'website'
}) => {
    const siteUrl = 'https://memorialis.shop';
    const fullUrl = url ? `${siteUrl}${url}` : siteUrl;

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{title}</title>
            <meta name='description' content={description} />
            <meta name='keywords' content={keywords} />

            {/* Facebook tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:image" content={image} />

            {/* Twitter tags */}
            <meta name="twitter:creator" content="Memorialis" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
        </Helmet>
    );
}

export default SEO;
