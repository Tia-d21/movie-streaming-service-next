export type MediaItem = {
  id: string;
  title: string;
  overview: string;
  posterPath: string;
  backdropPath: string;
  releaseYear: string;
  rating: string;
  duration?: string;
  episodes?: number;
  seasons?: number;
  media_type?: "movie" | "tv" | "person";
  category: "movie" | "tv";
  genres: number[];
  cast: {
    name: string;
    character: string;
    profilePath: string;
  }[];
  similar: {
    id: string;
    title: string;
    posterPath: string;
    category: "movie" | "tv";
  }[];

  trailerKey?: string;
};

// Mock data for testing movie poster visibility
export const mockMovies: MediaItem[] = [
  {
    id: "1",
    title: "The Dark Knight",
    overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    posterPath: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/hqkIcbrOHL86UncnHIsHVcVmzue.jpg",
    releaseYear: "2008",
    rating: "PG-13",
    duration: "2h 32m",
    category: "movie",
    genres: [28, 80, 18],
    cast: [
      {
        name: "Christian Bale",
        character: "Bruce Wayne / Batman",
        profilePath: "https://image.tmdb.org/t/p/w185/3qx2QFUbG6t6IlzR0F9k3Z6Yhf7.jpg"
      }
    ],
    similar: [],
    trailerKey: "EXeTwQWrcwY"
  },
  {
    id: "2",
    title: "Inception",
    overview: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible.",
    posterPath: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
    releaseYear: "2010",
    rating: "PG-13",
    duration: "2h 28m",
    category: "movie",
    genres: [28, 878, 53],
    cast: [
      {
        name: "Leonardo DiCaprio",
        character: "Dom Cobb",
        profilePath: "https://image.tmdb.org/t/p/w185/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg"
      }
    ],
    similar: [],
    trailerKey: "YoHD9XEInc0"
  },
  {
    id: "3",
    title: "Interstellar",
    overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    posterPath: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
    releaseYear: "2014",
    rating: "PG-13",
    duration: "2h 49m",
    category: "movie",
    genres: [12, 18, 878],
    cast: [
      {
        name: "Matthew McConaughey",
        character: "Cooper",
        profilePath: "https://image.tmdb.org/t/p/w185/sY2mwpafcwqyYS1sOySu1MENDse.jpg"
      }
    ],
    similar: [],
    trailerKey: "zSWdZVtXT7E"
  },
  {
    id: "4",
    title: "The Matrix",
    overview: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
    posterPath: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg",
    releaseYear: "1999",
    rating: "R",
    duration: "2h 16m",
    category: "movie",
    genres: [28, 878],
    cast: [
      {
        name: "Keanu Reeves",
        character: "Neo",
        profilePath: "https://image.tmdb.org/t/p/w185/4D0PpNI0kmP58hgrwGC3wCjxhnm.jpg"
      }
    ],
    similar: [],
    trailerKey: "vKQi3bBA1y8"
  },
  {
    id: "5",
    title: "Pulp Fiction",
    overview: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    posterPath: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/4cDFJr4HnXN5AdPw4AKrmLlMWdO.jpg",

    releaseYear: "1994",
    rating: "R",
    duration: "2h 34m",
    category: "movie",
    genres: [80, 18],
    cast: [
      {
        name: "John Travolta",
        character: "Vincent Vega",
        profilePath: "https://image.tmdb.org/t/p/w185/fTGLhuOjlZQQfKyLcDVfWjWBBdG.jpg"
      }
    ],
    similar: [],
    trailerKey: "s7EdQ4FqbhY"
  }
];
