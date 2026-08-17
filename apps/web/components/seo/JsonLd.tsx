import React from 'react';
import { safeJsonLdReplacer } from '@/lib/seo/json-ld-sanitizer';
import type { SchemaOrgEntity } from '@/types/seo';

interface JsonLdProps {
  /**
   * One or more Schema.org structured data entities to serialize.
   */
  data: SchemaOrgEntity | SchemaOrgEntity[];
}

/**
 * Declarative, XSS-safe component for rendering Schema.org JSON-LD structured data.
 *
 * Sanitizes all input using `safeJsonLdReplacer` to escape dangerous HTML/script
 * tags and unicode line separators before injecting into the DOM.
 */
export function JsonLd({ data }: JsonLdProps) {
  const sanitizedJson = safeJsonLdReplacer(data);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: sanitizedJson }}
    />
  );
}
