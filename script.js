const resultsEl = document.getElementById("results-container");

const API = "1b1e0652";
const TITLE = "terminator";
const baseUrl = "https://www.omdbapi.com/";
const queryParams = `?apikey=${API}&s=${TITLE}`;
const url = baseUrl + queryParams;

async function fetchMovies() {
  const searchResponse = await fetch(url);
  const searchData = await searchResponse.json();

  console.log(searchData);
  let movies;
  // promise.allで複数のfetchを全て通るか判定
  try {
    movies = await Promise.all(
      searchData.Search.map(async (movie) => {
        const detailsUrl = `${baseUrl}?apikey=${API}&i=${movie.imdbID}`;
        const detailsResponse = await fetch(detailsUrl);
        if (!detailsResponse.ok) {
          throw new Error(
            `Failed to fetch ${movie.Title}. status: ${detailsResponse.status}`
          );
        }
        return await detailsResponse.json();
      })
    );
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return;
  }

  //   console.log(movies);
  //   if (!movies) return;
  console.log(movies);
  movies.forEach((movie, index) => {
    const { Title, Genre, Plot, imdbRating, Runtime } = movie;
    const Poster = searchData.Search[index].Poster;
    console.log(Title, Genre, Plot, imdbRating, Runtime);
    //数字だけfont-monoにするため分離
    const [num, unit] = Runtime.split(" ");
    resultsEl.innerHTML += `
      <li class="flex  p-4 border border-slate-300 rounded mb-4 overflow-hidden  md:flex-col ">
        <img src="${Poster}" alt="Poster of ${Title}" class="mb-4 min-w-40 h-auto object-contain aspect-[2/3] rounded md:w-full" />
        <div class="ml-4 ">
            
            <h2 class="text-xl font-bold mb-2">${Title}</h2>
            <p class="mb-1">★<span class="font-mono">${
              " " + imdbRating
            }</span></p>
            <p class="mb-1"><span class="font-mono">${num}</span>${
      unit ? " " + unit : ""
    }</p>
            <p class="mb-1">${Genre}</p>
            
            <p class="mb-1 line-clamp-5\">${Plot}</p>
        </div>
      </li>
    `;
  });
}

fetchMovies();

// fetch(url)
//   .then((res) => res.json())
//   .then((data) => {
//     console.log(data);
//     console.log(data.Search);
//   });
// //
