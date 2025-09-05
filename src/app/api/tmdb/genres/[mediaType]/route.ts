import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export async function GET(request: Request, { params }: { params: Promise<{ mediaType: string }> }) {
  const { mediaType } = await params;
  // Now use the `mediaType` variable in your code 
  try {
    //const { mediaType } = params;

    if (!API_KEY) {
      console.error("TMDB_API_KEY is not set in .env.local");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    if (mediaType !== 'movie' && mediaType !== 'tv') {
      return NextResponse.json({ error: "Invalid media type specified" }, { status: 400 });
    }

    const url = `${BASE_URL}/genre/${mediaType}/list?api_key=${API_KEY}&language=en-US`;
    const response = await fetch(url);

    if (!response.ok) {
      // Provide a more detailed error log on the server
      const errorData = await response.json();
      console.error("TMDB API Error:", errorData);
      return NextResponse.json({ error: errorData.status_message || "Failed to fetch from TMDB" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Error in TMDB genres proxy:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}