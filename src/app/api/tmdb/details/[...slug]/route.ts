import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

// This endpoint gets details for a specific movie or TV show.
// Example usage: /api/tmdb/details/movie/123
export async function GET(request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  // Now use the `slug` array in your codetry 
  try {
    const [category, id] = slug;

    if (!category || !id || (category !== 'movie' && category !== 'tv')) {
      return NextResponse.json({ error: "Invalid category or ID provided" }, { status: 400 });
    }

    // Append credits, videos, and recommendations to the API call
    const appendToResponse = "append_to_response=credits,videos,recommendations";
    const url = `${BASE_URL}/${category}/${id}?api_key=${API_KEY}&language=en-US&${appendToResponse}`;
    
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.status_message }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Error in TMDB details proxy:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}