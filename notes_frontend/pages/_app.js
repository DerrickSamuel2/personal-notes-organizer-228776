import "../styles/globals.css";

/**
 * Next.js custom App.
 * Kept minimal: global styles and page rendering.
 */
export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
