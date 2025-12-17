"use client";

import { useState, type FormEvent } from "react";

interface SearchResult {
  id: number;
  title: string;
  description: string;
  category: string;
}

const dummyIdeas: SearchResult[] = [
  {
    id: 1,
    title: "Sustainable Living Tips",
    description: "Content about eco-friendly lifestyle choices and practices",
    category: "Lifestyle",
  },
  {
    id: 2,
    title: "Remote Work Productivity",
    description: "Tips and tools for maximizing productivity while working from home",
    category: "Business",
  },
  {
    id: 3,
    title: "Plant-Based Cooking",
    description: "Delicious vegan and vegetarian recipes for everyday meals",
    category: "Food",
  },
  {
    id: 4,
    title: "Minimalist Home Design",
    description: "Ideas for creating a clean, organized living space",
    category: "Home",
  },
  {
    id: 5,
    title: "Digital Nomad Lifestyle",
    description: "Stories and advice for living and working while traveling",
    category: "Travel",
  },
];

export default function SearchForm() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    // Simple search: filter dummy ideas by title or description
    const filtered = dummyIdeas.filter(
      (idea) =>
        idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setResults(filtered);
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for niche ideas..."
            className="flex-1 px-6 py-4 rounded-lg border-2 border-yellow-300 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 text-gray-800 placeholder-gray-400"
          />
          <button
            type="submit"
            className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-pink-500 text-white font-semibold rounded-lg hover:from-yellow-500 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Search
          </button>
        </div>
      </form>

      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">
            Search Results ({results.length})
          </h3>
          {results.map((result) => (
            <div
              key={result.id}
              className="p-6 bg-gradient-to-r from-yellow-50 to-pink-50 rounded-lg border border-yellow-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">
                    {result.title}
                  </h4>
                  <p className="text-gray-600 mb-3">{result.description}</p>
                  <span className="inline-block px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm font-medium">
                    {result.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {searchQuery && results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            No results found for &quot;{searchQuery}&quot;
          </p>
        </div>
      )}

      {!searchQuery && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            Enter a search query to find niche ideas
          </p>
        </div>
      )}
    </div>
  );
}

