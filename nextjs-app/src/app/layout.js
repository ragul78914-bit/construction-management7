import './globals.css';
import './login-animations.css';

export const metadata = {
  title: 'Monex - Construction Management Platform',
  description: 'Premium construction site management with real-time tracking, worker management, and billing.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
