import type { Metadata } from "next";
import { ThemeProvider } from "../components/ThemeProvider";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import "./globals.css";

export const metadata: Metadata = {
  title: "The AI Entrepreneur",
  description: "Your central hub for everything AI related.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <Navbar />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
