import type { Metadata } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { Toaster } from '@/components/ui/toaster';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Virasya',
  description: 'Where Heritage Craft Meets AI. Supporting artisans and preserving cultural authenticity.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;500;600;700&family=PT+Sans:wght@400;700&family=Inter:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-primary/20">
        <FirebaseClientProvider>
          {children}
          <Toaster />
        </FirebaseClientProvider>

        {/* Fix Google Translate removeChild / insertBefore NotFoundError DOM mutation crash */}
        <Script id="google-translate-dom-patch" strategy="beforeInteractive">
          {`
            if (typeof Node === 'function' && Node.prototype) {
              var origRemoveChild = Node.prototype.removeChild;
              Node.prototype.removeChild = function(child) {
                if (child.parentNode !== this) {
                  return child;
                }
                return origRemoveChild.apply(this, arguments);
              };

              var origInsertBefore = Node.prototype.insertBefore;
              Node.prototype.insertBefore = function(newNode, referenceNode) {
                if (referenceNode && referenceNode.parentNode !== this) {
                  return newNode;
                }
                return origInsertBefore.apply(this, arguments);
              };
            }
          `}
        </Script>

        {/* Google Translate Hidden Element */}
        <div id="google_translate_element" style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', zIndex: -100 }}></div>

        {/* Google Translate Initialization Script */}
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'en,hi,ta,bn,mr,gu,te,kn,ml,pa',
                autoDisplay: false
              }, 'google_translate_element');
            }
          `}
        </Script>
        <Script
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
