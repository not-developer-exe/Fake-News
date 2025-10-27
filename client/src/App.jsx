import React, { useState } from 'react';

// Main App Component
export default function App() {
    // === State ===
    const [claim, setClaim] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState("");
    const [sources, setSources] = useState([]);
    const [error, setError] = useState("");

    // === API Configuration ===
    // This now points to your new backend server!
    const backendApiUrl = "http://localhost:5001/api/check-claim";
    
    /**
     * Main function to handle the "Analyze Claim" button click
     */
    const handleCheckNews = async () => {
        if (!claim.trim()) {
            setError("Please enter a news claim to analyze.");
            return;
        }

        // --- UI: Show loading state ---
        setIsLoading(true);
        setError("");
        setAnalysis("");
        setSources([]);

        try {
            // --- NEW API Call to our Backend ---
            const response = await fetch(backendApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ claim: claim }) // Send the claim in the body
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || `API request failed with status ${response.status}`);
            }

            const result = await response.json();
            
            // --- Process the response from *our* backend ---
            if (result.analysis) {
                setAnalysis(result.analysis);
                setSources(result.sources || []);
            } else {
                console.error("Unexpected API response structure:", result);
                setError("Could not get a valid analysis from the backend.");
            }

        } catch (error) {
            console.error("Error checking news:", error);
            setError(`An error occurred: ${error.message}. Please try again.`);
        } finally {
            // --- UI: Hide loading state ---
            setIsLoading(false);
        }
    };

    // === Render JSX ===
    return (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4 font-sans">
            <div className="bg-white w-full max-w-2xl p-6 md:p-8 rounded-2xl shadow-lg">
                
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Real-Time Fact-Checker</h1>
                    <p className="text-gray-600 mt-2">Enter a news claim or snippet below to analyze it.</p>
                </div>

                {/* Input Area */}
                <div className="mb-4">
                    <label htmlFor="news-claim" className="block text-sm font-medium text-gray-700 mb-2">News Claim:</label>
                    <textarea 
                        id="news-claim" 
                        rows="6" 
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow" 
                        placeholder="Paste the news claim here (e.g., 'Scientists discover dragons living on Mars...')."
                        value={claim}
                        onChange={(e) => setClaim(e.target.value)}
                        disabled={isLoading}
                    />
                </div>

                {/* Button */}
                <button 
                    id="check-button" 
                    className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center justify-center space-x-2 disabled:opacity-75 disabled:cursor-not-allowed"
                    onClick={handleCheckNews}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            <span>Analyzing...</span>
                        </>
                    ) : (
                        <span>Analyze Claim</span>
                    )}
                </button>

                {/* Error Message Area */}
                {error && (
                    <div className="mt-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Results Section */}
                {analysis && (
                    <div id="results-container" className="mt-8 border-t border-gray-200 pt-6">
                        {/* Analysis Result */}
                        <div 
                            id="result" 
                            className="prose prose-blue max-w-none text-gray-700 bg-gray-50 p-4 rounded-lg"
                            // Using dangerouslySetInnerHTML because the API is instructed to return HTML
                            dangerouslySetInnerHTML={{ __html: analysis }}
                        >
                        </div>

                        {/* Sources */}
                        <div id="sources-container" className="mt-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Sources Found:</h3>
                            <ul id="sources-list" className="space-y-2">
                                {sources.length > 0 ? (
                                    sources.map((source, index) => (
                                        <li key={index} className="truncate">
                                            <a 
                                                href={source.uri} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="text-blue-600 hover:underline hover:text-blue-800"
                                            >
                                                {source.title || source.uri}
                                            </a>
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-gray-500">No specific sources were cited for this analysis.</li>
                                )}
                            </ul>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
