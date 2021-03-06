import AbstractComponent from './abstract-component';
import {formatRuntime} from '../utils/time';


const getFilmCardMarkup = ({
  comments,
  description,
  genres,
  name,
  poster,
  rating,
  releaseDate,
  runtime,
  isAddedToWatchlist,
  isMarkedAsWatched,
  isFavorite,
}) => {
  const formatedDescription = description.length > 140
    ? `${description.slice(0, 138)}…`
    : description;

  return (
    `<article class="film-card">
      <h3 class="film-card__title">${name}</h3>
      <p class="film-card__rating">${rating.toFixed(1)}</p>
      <p class="film-card__info">
        <span class="film-card__year">${releaseDate.getFullYear()}</span>
        <span class="film-card__duration">${formatRuntime(runtime)}</span>
        <span class="film-card__genre">${genres[0]}</span>
      </p>
      <img src="${poster}" alt="${name}" class="film-card__poster">
      <p class="film-card__description">${formatedDescription}</p>
      <a class="film-card__comments">
        ${comments.length} ${comments.length === 1 ? `comment` : `comments`}
      </a>
      <form class="film-card__controls">
        <button class="film-card__controls-item 
          ${isAddedToWatchlist ? `film-card__controls-item--active` : ``}
          button film-card__controls-item--add-to-watchlist">Add to watchlist
        </button>
        <button class="film-card__controls-item 
          ${isMarkedAsWatched ? `film-card__controls-item--active` : ``}
          button film-card__controls-item--mark-as-watched">Mark as watched
        </button>
        <button class="film-card__controls-item 
          ${isFavorite ? `film-card__controls-item--active` : ``}
          button film-card__controls-item--favorite">Mark as favorite
        </button>
      </form>
    </article>`
  );
};


export default class FilmCardComponent extends AbstractComponent {
  constructor(film) {
    super();
    this._film = film;
  }

  getTemplate() {
    return getFilmCardMarkup(this._film);
  }

  setClickHandler(handler) {
    const posterImage = this.getElement().querySelector(`.film-card__poster`);
    const titleHeading = this.getElement().querySelector(`.film-card__title`);
    const commentsLink = this.getElement().querySelector(`.film-card__comments`);

    posterImage.addEventListener(`click`, handler);
    titleHeading.addEventListener(`click`, handler);
    commentsLink.addEventListener(`click`, handler);
  }

  setAddToWatchlistClickHandler(handler) {
    this.getElement()
      .querySelector(`.film-card__controls-item--add-to-watchlist`)
      .addEventListener(`click`, handler);
  }

  setMarkAsWatchedClickHandler(handler) {
    this.getElement()
      .querySelector(`.film-card__controls-item--mark-as-watched`)
      .addEventListener(`click`, handler);
  }

  setFavoriteClickHandler(handler) {
    this.getElement()
      .querySelector(`.film-card__controls-item--favorite`)
      .addEventListener(`click`, handler);
  }
}
