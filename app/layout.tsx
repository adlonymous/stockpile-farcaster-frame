export const viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <meta property="fc:frame" content="vNext" />
      <body>{children}</body>
    </html>
  );
}
