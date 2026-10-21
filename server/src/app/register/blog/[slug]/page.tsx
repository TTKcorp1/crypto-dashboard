type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  return (
    <article>
      <h1>Blog post: {slug}</h1>
      <p>This is a placeholder blog post page.</p>
    </article>
  );
}