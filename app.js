const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

//GET MOVIES API
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `SELECT
      *
    FROM
      movie;`;
  const moviesArray = await db.all(getMoviesQuery);
  //console.log(moviesArray);
  response.send(
    moviesArray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

//POST MOVIE API
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `
      INSERT INTO movie( director_id, movie_name, lead_actor)
      VALUES (
          ${directorId},
          ${movieName},
          ${leadActor}
      );`;
  await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

//GET MOVIE BASED ON MOVIEId API
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * 
    FROM movie 
    WHERE movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(movie);
});

//UPDATE MOVIE DETAILS API
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `UPDATE movie 
    SET 
      director_id = ${directorId},
      movie_name = ${movieName},
      lead_actor = ${leadActor}
    WHERE movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//DELETE MOVIE API
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE 
     FROM movie
     WHERE movie_id = ${movieId};
    `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `SELECT
      *
    FROM
      director;`;
  const directorsArray = await db.all(getDirectorsQuery);
  //console.log(moviesArray);
  response.send(directorsArray);
});

//GET DIRECTOR BASED ON DIRECTOR_id API
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorQuery = `SELECT * 
     FROM movie INNER JOIN director
      ON movie.director_id = director.director_id
     WHERE director_id = ${directorId};
    `;
  const movies = await db.run(getDirectorQuery);
  console.log(movies);
  response.send(movies);
});

module.exports = app;
