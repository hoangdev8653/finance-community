import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { JsonLd } from '@/components/seo/JsonLd';
import type { SchemaOrgEntity } from '@/types/seo';

describe('JsonLd Component', () => {
  it('renders a script element with type application/ld+json and sanitized content', () => {
    const data: SchemaOrgEntity = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Safe <script> Headline',
    };

    const { container } = render(<JsonLd data={data} />);

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();

    const content = script?.innerHTML || '';
    expect(content).toContain('\\u003cscript\\u003e');
    expect(content).not.toContain('<script>');

    const parsed = JSON.parse(content);
    expect(parsed).toEqual(data);
  });

  it('renders multiple schema objects when provided as array', () => {
    const data: SchemaOrgEntity[] = [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'MorningView',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'MorningView Organization',
      },
    ];

    const { container } = render(<JsonLd data={data} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();

    const parsed = JSON.parse(script?.innerHTML || '[]');
    expect(parsed).toHaveLength(2);
    expect(parsed[0]['@type']).toBe('WebSite');
    expect(parsed[1]['@type']).toBe('Organization');
  });

  it('has no visual DOM wrappers', () => {
    const data: SchemaOrgEntity = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Test Page',
    };

    const { container } = render(<JsonLd data={data} />);
    expect(container.children.length).toBe(1);
    expect(container.children[0].tagName.toLowerCase()).toBe('script');
  });
});
