import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';

export default function CommandPalette({ isOpen, onClose }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setResults([]);
            setSelectedIndex(-1);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        if (query.trim().length < 2) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
                const data = await res.json();
                const items = data.results || [];
                setResults(items);
                setSelectedIndex(items.length > 0 ? 0 : -1);
            } catch (err) {
                console.error('Search error', err);
            } finally {
                setLoading(false);
            }
        }, 200);

        return () => clearTimeout(timer);
    }, [query, isOpen]);

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (results.length > 0) {
                setSelectedIndex((prev) => (prev + 1) % results.length);
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (results.length > 0) {
                setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && results[selectedIndex]) {
                onClose();
                router.visit(results[selectedIndex].url);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="command-palette is-open" aria-hidden="false" role="dialog" aria-modal="true">
            <div className="command-palette__backdrop" onClick={onClose} />
            <div className="command-palette__modal">
                <div className="command-palette__head">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-text-muted)' }}>
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        className="command-palette__input"
                        placeholder="Search services, case studies, insights, updates..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button type="button" className="command-palette__esc" onClick={onClose}>ESC</button>
                </div>

                <div className="command-palette__results">
                    {query.trim().length < 2 && (
                        <div className="command-palette__hint">Type at least 2 characters to search across the entire platform...</div>
                    )}
                    {loading && (
                        <div className="command-palette__hint">Searching...</div>
                    )}
                    {!loading && query.trim().length >= 2 && results.length === 0 && (
                        <div className="command-palette__hint">No results found for "{query}".</div>
                    )}
                    {!loading && results.map((item, idx) => (
                        <a
                            key={idx}
                            href={item.url}
                            className={`command-palette__item ${idx === selectedIndex ? 'is-selected' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                onClose();
                                router.visit(item.url);
                            }}
                            onMouseEnter={() => setSelectedIndex(idx)}
                        >
                            <div>
                                <div className="command-palette__item-title">{item.title}</div>
                                {item.snippet && (
                                    <div className="command-palette__item-snippet">{item.snippet.slice(0, 90)}...</div>
                                )}
                            </div>
                            <span className="command-palette__item-badge">{item.type}</span>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
