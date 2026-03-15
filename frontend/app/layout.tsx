import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "REEL",
  description: "Optimized video for all major platforms.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          fontFamily: "'Inter', sans-serif",
          background: "#0B0E14",
          color: "#ffffff",
          margin: 0,
        }}
      >
        <div id="cursor-glow" />
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                var g=document.getElementById('cursor-glow');
                if(!g)return;
                document.addEventListener('mousemove',function(e){
                  g.style.left=e.clientX+'px';
                  g.style.top=e.clientY+'px';
                  g.style.opacity='1';
                });
                document.addEventListener('mouseleave',function(){
                  g.style.opacity='0';
                });
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
