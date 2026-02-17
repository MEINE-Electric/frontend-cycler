import { Geist, Orbitron } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

export const metadata = {
  title: "Cycler",
  description: "Cycler UI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${orbitron.variable} antialiased bg-background overflow-hidden no-scrollbar`}
      >
        {children}
        <div id="portal-root" className="no-scrollbar overflow-hidden"></div>
      </body>
    </html>
  );
}
