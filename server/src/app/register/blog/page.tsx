'use client';

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = (await searchParams).filters;

  return (
    <div>
      <h1>Blog</h1>
      <p>This is a placeholder blog page.</p>
      <p>Filters: {typeof filters === 'string' ? filters : 'none'}</p>
    </div>
  );
}