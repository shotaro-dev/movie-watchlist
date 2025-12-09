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
    const { Title, Actors, Plot, imdbRating, Runtime } = movie;
    const Poster = searchData.Search[index].Poster;
    console.log(Title, Actors, Plot, imdbRating, Runtime);
    resultsEl.innerHTML += `
      <li class="movie-card p-4 border border-gray-300 rounded mb-4">
        <img src="${Poster}" alt="Poster of ${Title}" class="mb-4 w-32" />
        <h2 class="text-xl font-bold mb-2">${Title}</h2>
        <p class="mb-1"><strong>Actors:</strong> ${Actors}</p>
        <p class="mb-1"><strong>Plot:</strong> ${Plot}</p>
        <p class="mb-1"><strong>IMDB Rating:</strong> ${imdbRating}</p>
        <p class="mb-1"><strong>Runtime:</strong> ${Runtime}</p>
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
