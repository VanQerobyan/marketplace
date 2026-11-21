import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

type IconName = "bag" | "search" | "arrow" | "heart" | "electronics" | "fashion" | "home" | "beauty" | "sports" | "vehicles" | "more" | "leaf" | "close";

const iconPaths: Record<IconName, ReactNode> = {
    bag: <><path d="M5 8h14l1 12H4L5 8Z" /><path d="M8 8V6a4 4 0 0 1 8 0v2m-7 4c0 3 6 3 6 0" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></>,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />,
    electronics: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8m-4-4v4" /></>,
    fashion: <path d="m8 3-5 4 3 5 2-1v10h8V11l2 1 3-5-5-4a4 4 0 0 1-8 0Z" />,
    home: <><path d="m3 10 9-7 9 7m-16-1v12h14V9" /><path d="M9 21v-8h6v8" /></>,
    beauty: <><rect x="6" y="10" width="12" height="11" rx="3" /><path d="M9 10V6h6v4m-3-4V3h5m-5 11v3" /></>,
    sports: <><path d="m6 7 11 11M3 8l5-5m8 18 5-5M4 12l8-8m0 16 8-8M2 6l4-4m12 20 4-4" /></>,
    vehicles: <><path d="m5 7 2-4h10l2 4 2 3v8H3v-8l2-3Zm0 0h14M3 13h18M7 18v3m10-3v3M6 10h1m10 0h1" /></>,
    more: <><circle cx="5" cy="5" r="2" /><circle cx="19" cy="5" r="2" /><circle cx="5" cy="19" r="2" /><circle cx="19" cy="19" r="2" /></>,
    leaf: <><path d="M20 3C9 2 3 6 5 13c2 7 15 8 15-10Z" /><path d="M3 21 15 9" /></>,
    close: <path d="m6 6 12 12M6 18 18 6" />,
};

const Icon = ({ name }: { name: IconName }) => (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{iconPaths[name]}</svg>
);

const categories: { name: string; icon: IconName }[] = [
    { name: "Electronics", icon: "electronics" },
    { name: "Fashion", icon: "fashion" },
    { name: "Home & Living", icon: "home" },
    { name: "Beauty", icon: "beauty" },
    { name: "Sports", icon: "sports" },
    { name: "Vehicles", icon: "vehicles" },
    { name: "More", icon: "more" },
];

// Illustrative products for the welcome page, separate from members' listings.
const previewProducts = [
    { name: "Graphite smartphone", category: "Electronics", price: "$499", position: "0% 0%", condition: "Like new" },
    { name: "Everyday laptop", category: "Electronics", price: "$799", position: "50% 0%", condition: "Great condition" },
    { name: "Retro sneakers", category: "Fashion", price: "$85", position: "100% 0%", condition: "Like new" },
    { name: "Wireless earbuds", category: "Electronics", price: "$120", position: "0% 100%", condition: "Great condition" },
    { name: "Mountain bike", category: "Vehicles", price: "$250", position: "50% 100%", condition: "Ready to ride" },
    { name: "Sculptural vase", category: "Home & Living", price: "$35", position: "100% 100%", condition: "A little character" },
];

export const Home = () => {
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("All");
    const filteredProducts = previewProducts.filter((product) => (
        (category === "All" || product.category === category || (category === "Sports" && product.name === "Mountain bike")) &&
        `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase())
    ));

    const showAll = () => {
        setCategory("All");
        setSearch("");
        setQuery("");
    };

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setQuery(search.trim());
        document.getElementById("featured-finds")?.scrollIntoView({ block: "nearest" });
    };

    return (
        <div className="marketplace-home" lang="en">
            <div className="marketplace-shell">
                <header className="marketplace-header dark:bg-[#17191c]/95">
                    <Link to="/" className="marketplace-brand" aria-label="Swaply home"><span className="marketplace-brand-icon"><Icon name="bag" /></span><span>Swaply<span className="marketplace-brand-dot"></span></span></Link>
                    <nav aria-label="Main navigation" className="marketplace-navigation">
                        <a href="#popular-categories">Categories</a>
                        <a href="#featured-finds">Discover</a>
                        <Link to="/signUp">Start selling <Icon name="arrow" /></Link>
                    </nav>
                    <nav aria-label="Sign in or create an account" className="marketplace-auth">
                        <Link to="/signIn" className="marketplace-signin">Sign in</Link>
                        <Link to="/signUp" className="marketplace-signup">Sign up <Icon name="arrow" /></Link>
                    </nav>
                </header>

                <main>
                    <section className="marketplace-hero" aria-labelledby="welcome-heading">
                        <div className="marketplace-hero-image"><img src="/images/marketplace-hero.png" alt="Headphones, a smartphone, a sneaker and a watch on warm sand-colored display stands" fetchPriority="high" /></div>
                        <div className="marketplace-hero-copy">
                            <p className="marketplace-eyebrow"><span /> BUY. SELL. FIND.</p>
                            <h1 id="welcome-heading">Find just<br />what you <em>need.</em></h1>
                            <p className="marketplace-hero-description">Everyday favorites. Unexpected treasures.<br className="marketplace-desktop-break" /> Great finds from people around you.</p>
                        </div>
                        <span className="marketplace-hero-note"><Icon name="leaf" /> A new home for good things</span>
                        <form className="marketplace-search" onSubmit={handleSearch} role="search" aria-label="Search preview collection">
                            <Icon name="search" />
                            <label className="marketplace-sr-only" htmlFor="marketplace-search-input">Search the preview collection</label>
                            <input id="marketplace-search-input" type="search" placeholder="Search for products, styles, or categories..." value={search} onChange={(event) => setSearch(event.target.value)} />
                            <button type="submit" aria-label="Search preview collection"><Icon name="search" /><span>Search</span></button>
                        </form>
                    </section>

                    <section id="popular-categories" className="marketplace-categories" aria-labelledby="categories-heading">
                        <div className="marketplace-section-heading"><h2 id="categories-heading">Popular categories</h2><a href="#featured-finds" className="marketplace-text-link" onClick={showAll}>Explore all <Icon name="arrow" /></a></div>
                        <div className="marketplace-category-grid">
                            {categories.map((item) => (
                                <button key={item.name} type="button" className={`marketplace-category${category === item.name ? " is-active" : ""}`} aria-pressed={item.name === "More" ? undefined : category === item.name} onClick={() => item.name === "More" ? showAll() : setCategory(item.name)}>
                                    <span className="marketplace-category-icon"><Icon name={item.icon} /></span><span>{item.name}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section id="featured-finds" className="marketplace-featured" aria-labelledby="featured-heading">
                        <div className="marketplace-section-heading marketplace-featured-heading">
                            <div><div className="marketplace-featured-title"><h2 id="featured-heading">{category === "All" ? "Featured finds" : category}</h2><span className="marketplace-preview-label">Preview collection</span></div><p>A little inspiration for your next great find.</p></div>
                            <button type="button" className="marketplace-text-link" onClick={showAll}>See all <Icon name="arrow" /></button>
                        </div>
                        <div className="marketplace-sr-only" role="status" aria-live="polite">{filteredProducts.length} preview items{query ? ` matching ${query}` : ""}{category !== "All" ? ` in ${category}` : ""}.</div>
                        {(query || category !== "All") && <div className="marketplace-active-filter"><span>{query ? `Results for “${query}”` : `Exploring ${category}`}</span><button type="button" onClick={showAll}>Clear filters <Icon name="close" /></button></div>}
                        {filteredProducts.length > 0 ? (
                            <div className="marketplace-product-grid">
                                {filteredProducts.map((product) => (
                                    <article className="marketplace-product" key={product.name}>
                                        <div className="marketplace-product-photo">
                                            <Link to="/signIn" className="marketplace-product-image-link" aria-label={`Sign in to explore ${product.name.toLowerCase()}`}><span className="marketplace-product-image" role="img" aria-label={product.name} style={{ backgroundPosition: product.position }} /></Link>
                                            <Link to="/signIn" className="marketplace-favorite" aria-label={`Sign in to save ${product.name.toLowerCase()}`}><Icon name="heart" /></Link>
                                        </div>
                                        <p className="marketplace-product-condition">{product.condition}</p>
                                        <h3><Link to="/signIn">{product.name}</Link></h3>
                                        <p className="marketplace-product-price">{product.price}</p>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="marketplace-empty"><Icon name="search" /><h3>No preview items found</h3><p>Try another search or explore the full preview collection.</p><button type="button" onClick={showAll}>Explore all finds <Icon name="arrow" /></button></div>
                        )}
                    </section>

                    <section className="marketplace-join" aria-label="Join the marketplace"><span className="marketplace-join-icon"><Icon name="bag" /></span><div><h2>Your next great find starts here.</h2><p>Make a little room. Find a little joy. Join Swaply.</p></div><Link to="/signUp">Create an account <Icon name="arrow" /></Link></section>
                </main>

                <footer className="marketplace-footer"><span>© {new Date().getFullYear()} Swaply.</span><span>Good finds. New beginnings.</span><span className="marketplace-footer-note">Made for a second chance <Icon name="leaf" /></span></footer>
            </div>
        </div>
    );
};