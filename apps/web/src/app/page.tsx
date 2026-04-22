export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-4xl font-bold tracking-tight">
        Restaurants that care about their people
      </h1>
      <p className="mt-4 max-w-xl text-center text-lg text-muted-foreground">
        Discover, rate, and discuss restaurants that provide insurance for their employees. Sign in
        with your AT Protocol identity to get started.
      </p>
      <div className="mt-8 flex gap-4">
        <a
          href="/restaurants"
          className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Browse Restaurants
        </a>
        <a
          href="/forum"
          className="rounded-md border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-secondary"
        >
          Join the Forum
        </a>
      </div>
    </div>
  );
}
