import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

// This endpoint will act as a proxy for fetching lists of movies.
// Example usage: /api/tmdb/movies?type=trending or /api/tmdb/movies?type=popular
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "popular"; // Default to popular
    const page = searchParams.get("page") || "1";

    let tmdbEndpoint = "";
    switch (type) {
      case "trending":
        tmdbEndpoint = "/trending/movie/week";
        break;
      case "popular-tv":
        tmdbEndpoint = "/tv/popular";
        break;
      case "upcoming":
        tmdbEndpoint = "/movie/upcoming";
        break;
      case "popular":
      default:
        tmdbEndpoint = "/movie/popular";
        break;
    }

    const url = `${BASE_URL}${tmdbEndpoint}?api_key=${API_KEY}&language=en-US&page=${page}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.status_message }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Error in TMDB movies proxy:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}