/**
 * Renders a JSON-LD <script type="application/ld+json"> block.
 *
 * Server component — no client JS. Pass one schema object or an array.
 * Used wherever structured data is needed but the <Breadcrumbs> inline
 * schema doesn't already cover it.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
