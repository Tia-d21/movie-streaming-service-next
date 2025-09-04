import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

// This endpoint proxies search requests to TMDB.
// Example: /api/tmdb/search?query=inception&mediaType=movie
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const mediaType = searchParams.get("mediaType") || "multi"; // 'multi' searches movies and tv

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
    }

    const endpoint = `/search/${mediaType}`;
    const url = `${BASE_URL}${endpoint}?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`;
    
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.status_message }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Error in TMDB search proxy:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}