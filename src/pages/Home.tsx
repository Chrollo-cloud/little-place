import { site } from "../data/content";

export function Home({ enter }: { enter: () => void }) {
  return (
    <main className="home">
      <div className="paper hero-card">
        <span className="tiny">for {site.herName}</span>
        <h1>halo sayang imut.</h1>
        <p>take a look.</p>
        <button className="pink-btn" onClick={enter}>enter →</button>
      </div>
    </main>
  );
}
