import { NextRequest, NextResponse } from "next/server";
import { fetchTMDB } from "@/lib/tmdb";

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
        // fixed: use proper discover endpoint
        endpoint = `/discover/movie?with_genres=${genreId}`;
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
