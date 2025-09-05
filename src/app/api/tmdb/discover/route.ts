import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mediaType = searchParams.get("mediaType");
    const year = searchParams.get("year");
    const page = searchParams.get("page") || "1";

    // --- [FIX] Look for both singular 'genreId' and plural 'genreIds' ---
    const genreId = searchParams.get("genreId"); // Sent by BrowsePage carousels
    const genreIds = searchParams.get("genreIds"); // Sent by SearchPage filters

    // Use whichever genre parameter is provided.
    const genresToFetch = genreId || genreIds;

    if (mediaType !== "movie" && mediaType !== "tv") {
      return NextResponse.json(
        { error: "A valid mediaType ('movie' or 'tv') is required" },
        { status: 400 }
      );
    }

    const url = new URL(`${BASE_URL}/discover/${mediaType}`);
    url.searchParams.append("api_key", API_KEY!);
    url.searchParams.append("language", "en-US");
    url.searchParams.append("page", page);

    if (year) {
      const yearParam =
        mediaType === "movie" ? "primary_release_year" : "first_air_date_year";
      url.searchParams.append(yearParam, year);
    }

    // --- [FIX] Use the corrected genresToFetch variable ---
    if (genresToFetch) {
      url.searchParams.append("with_genres", genresToFetch);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.status_message },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in TMDB discover proxy:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
