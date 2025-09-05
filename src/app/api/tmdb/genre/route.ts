import { NextRequest, NextResponse } from "next/server";
import { fetchTMDB } from "lib/tmdb";

// Map frontend-friendly genre names to TMDB IDs
const GENRE_MAP: Record<string, number> = {
  action: 28,
  adventure: 12,
  comedy: 35,
  drama: 18,
  horror: 27,
  romance: 10749,
  "sci-fi": 878,
  fantasy: 14,
  thriller: 53,
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const genre = searchParams.get("genre");
    const category = searchParams.get("category") || "movie"; // default to "movie"
    const id = searchParams.get("id");
    const query = searchParams.get("query");

    let endpoint = "";

    switch (type) {
      case "trending":
        endpoint = "/trending/all/week";
        break;

      case "popular":
        endpoint = "/movie/popular";
        break;

      case "top-rated":
        endpoint = "/movie/top_rated";
        break;

      case "upcoming":
        endpoint = "/movie/upcoming";
        break;

      case "genre":
        if (!genre || !(genre.toLowerCase() in GENRE_MAP)) {
          return NextResponse.json({ error: "Invalid genre" }, { status: 400 });
        }
        const genreId = GENRE_MAP[genre.toLowerCase()];
        endpoint = `/discover/movie?with_genres=${genreId}`;
        break;

      case "details":
        if (!id) {
          return NextResponse.json({ error: "Missing id" }, { status: 400 });
        }
        endpoint = `/${category}/${id}?append_to_response=credits,videos,recommendations`;
        break;

      case "genres":
        endpoint = `/genre/${category}/list`;
        break;

      case "discover":
        // Pass through all params except "type"
        const extraParams = Array.from(searchParams.entries())
          .filter(([key]) => key !== "type")
          .map(([key, value]) => `${key}=${value}`)
          .join("&");
        endpoint = `/discover/${category}?${extraParams}`;
        break;

      case "search-movie":
        if (!query) {
          return NextResponse.json({ error: "Missing query" }, { status: 400 });
        }
        endpoint = `/search/movie?query=${encodeURIComponent(query)}`;
        break;

      case "search-tv":
        if (!query) {
          return NextResponse.json({ error: "Missing query" }, { status: 400 });
        }
        endpoint = `/search/tv?query=${encodeURIComponent(query)}`;
        break;

      case "search-multi":
        if (!query) {
          return NextResponse.json({ error: "Missing query" }, { status: 400 });
        }
        endpoint = `/search/multi?query=${encodeURIComponent(query)}`;
        break;

      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const data = await fetchTMDB(endpoint);
    return NextResponse.json(data);
  } catch (error) {
    console.error("TMDB API error:", error);
    return NextResponse.json({ error: "Failed to fetch TMDB data" }, { status: 500 });
  }
}
