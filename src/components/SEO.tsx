import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  noindex?: boolean;
}

const defaultDescription = "Transform your LinkedIn networking with LiEnrich. Get powerful data enrichment, lead generation, and analytics tools to maximize your professional connections and business opportunities.";
const defaultKeywords = "LinkedIn enrichment, data enrichment tool, lead generation, LinkedIn analytics, professional networking, business leads, LinkedIn insights, social selling, B2B leads, LinkedIn automation";
const defaultOgImage = "https://wttwdqxijxvzylavmsrw.supabase.co/storage/v1/object/public/assets/lienrich-og-image.png";

export const SEO: React.FC<SEOProps> = ({
  title,
  description = defaultDescription,
  keywords = defaultKeywords,
  canonicalUrl = "https://lienrich.com",
  ogImage = defaultOgImage,
  noindex = false,
}) => {
  const fullTitle = title 
    ? `${title} | LiEnrich - LinkedIn Data Enrichment Tool`
    : "LiEnrich - LinkedIn Data Enrichment Tool | Enhance Your LinkedIn Insights";

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default SEO;
