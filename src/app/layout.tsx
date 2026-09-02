import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PD-Kan Padel Match',
  description: 'Padel match engine americano & mexicano',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#020617' }}>
        {children}
      </body>
    </html>
  );
}