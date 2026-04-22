import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Grez - Restaurant Insurance Forum',
  description:
    'A forum, listing, and rating platform for restaurants that provide insurance for their employees.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-border">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
            <a href="/" className="text-xl font-bold text-primary">
              Grez
            </a>
            <nav className="flex items-center gap-6 text-sm">
              <a href="/restaurants" className="text-muted-foreground hover:text-foreground">
                Restaurants
              </a>
              <a href="/forum" className="text-muted-foreground hover:text-foreground">
                Forum
              </a>
              <a
                href="/login"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Sign In
              </a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
