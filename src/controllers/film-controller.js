import FilmCardComponent from '../components/film-card-component';
import FilmPopupComponent from '../components/film-popup-component';
import CommentsModel from '../models/comments-model';
import CommentController from './comment-controller';
import FilmModel from '../models/film-model';
import {render, remove, replace} from '../utils/dom';
import {getRandomFullName} from '../utils/random';
import {encode} from 'he';


const SHAKE_ANIMATION_TIMEOUT = 600;

const Mode = {
  DEFAULT: `default`,
  POPUP: `popup`,
};


export default class FilmController {
  constructor(container, onDataChange, onViewChange, filmsModel) {
    this._container = container;
    this._onDataChange = onDataChange;
    this._onViewChange = onViewChange;
    this._filmsModel = filmsModel;
    this._filmData = null;
    this._mode = Mode.DEFAULT;

    this._filmCardComponent = null;
    this._filmPopupComponent = null;

    this._commentsModel = new CommentsModel();
    this._commentControllers = [];

    this._escKeyHandler = this._escKeyHandler.bind(this);
    this._ctrlEnterKeyHandler = this._ctrlEnterKeyHandler.bind(this);
    this._onCommentsDataChange = this._onCommentsDataChange.bind(this);
  }

  render(film) {
    this._filmData = FilmModel.clone(film);
    this._commentsModel.setComments(film.comments);

    const oldFilmCardComponent = this._filmCardComponent;
    this._filmCardComponent = new FilmCardComponent(this._filmData);


    this._filmCardComponent.setClickHandler(() => {
      this._renderFilmPopup();
    });

    this._filmCardComponent.setAddToWatchlistClickHandler((evt) => {
      evt.preventDefault();
      const newData = FilmModel.clone(this._filmData);
      newData.isAddedToWatchlist = !newData.isAddedToWatchlist;
      this._onDataChange(this, this._filmData, newData);
    });

    this._filmCardComponent.setMarkAsWatchedClickHandler((evt) => {
      evt.preventDefault();
      const newData = FilmModel.clone(this._filmData);
      newData.isMarkedAsWatched = !newData.isMarkedAsWatched;
      this._onDataChange(this, this._filmData, newData);
    });

    this._filmCardComponent.setFavoriteClickHandler((evt) => {
      evt.preventDefault();
      const newData = FilmModel.clone(this._filmData);
      newData.isFavorite = !newData.isFavorite;
      this._onDataChange(this, this._filmData, newData);
    });

    if (oldFilmCardComponent) {
      replace(this._filmCardComponent, oldFilmCardComponent);
    } else {
      render(this._container, this._filmCardComponent);
    }
  }

  setDefaultView() {
    if (this._mode !== Mode.DEFAULT) {
      this._removeFilmPopup();
    }
  }

  destroy() {
    remove(this._filmCardComponent);
    this._removeFilmPopup();
  }

  shake() {
    this._filmCardComponent
      .getElement().classList.add(`shake`);

    setTimeout(() => {
      this._filmCardComponent
        .getElement().classList.remove(`shake`);
    }, SHAKE_ANIMATION_TIMEOUT);
  }

  _renderComments(comments) {
    const commentsControllers = comments.map((comment) => {
      const commentController = new CommentController(
          this._filmPopupComponent.getElement(),
          this._onCommentsDataChange
      );
      commentController.render(comment);
      return commentController;
    });

    this._commentControllers = commentsControllers;
  }

  _updateComments() {
    this._commentControllers.forEach((commentController) =>
      commentController.destroy());
    this._commentControllers = [];
    this._renderComments(this._commentsModel.getComments());
  }

  _onCommentsDataChange(oldComment, newComment) {
    if (newComment === null) {
      const isCommentRemoved = this._commentsModel.removeComment(oldComment.id);
      if (isCommentRemoved) {
        this._updateComments();
        this._onDataChange(
            this,
            this._filmData,
            Object.assign(
                {},
                this._filmData,
                {comments: this._commentsModel.getComments()}
            )
        );
      }
    } else {
      const isCommentAdded = this._commentsModel.addComment(newComment);
      if (isCommentAdded) {
        this._updateComments();
        this._onDataChange(
            this,
            this._filmData,
            Object.assign(
                {},
                this._filmData,
                {comments: this._commentsModel.getComments()}
            )
        );
      }
    }

    this._filmPopupComponent.update({
      commentsCount: this._commentsModel.getComments().length
    });
  }

  _renderFilmPopup() {
    this._onViewChange();

    this._filmPopupComponent = new FilmPopupComponent(this._filmData);

    this._filmPopupComponent.setAddToWatchlistClickHandler(() => {
      this._filmData.isAddedToWatchlist = !this._filmData.isAddedToWatchlist;
    });

    this._filmPopupComponent.setMarkAsWatchedClickHandler(() => {
      this._filmData.isMarkedAsWatched = !this._filmData.isMarkedAsWatched;
      this._filmData.watchingDate = new Date(Date.now());
    });

    this._filmPopupComponent.setFavoriteClickHandler(() => {
      this._filmData.isFavorite = !this._filmData.isFavorite;
    });

    this._filmPopupComponent.setCloseButtonClickHandler(() => {
      this._removeFilmPopup();
    });

    document.body.classList.add(`hide-overflow`);
    render(document.querySelector(`.footer`), this._filmPopupComponent, `afterend`);

    this._renderComments(this._commentsModel.getComments());
    document.addEventListener(`keydown`, this._escKeyHandler);
    document.addEventListener(`keydown`, this._ctrlEnterKeyHandler);
    this._mode = Mode.POPUP;
  }

  _removeFilmPopup() {
    if (this._mode === Mode.POPUP) {
      const newData = FilmModel.clone(this._filmData);
      this._onDataChange(
          this,
          this._filmData,
          newData
      );
      remove(this._filmPopupComponent);
      document.body.classList.remove(`hide-overflow`);
      document.removeEventListener(`keydown`, this._escKeyHandler);
      document.removeEventListener(`keydown`, this._ctrlEnterKeyHandler);
      this._mode = Mode.DEFAULT;
    }
  }

  _escKeyHandler(evt) {
    if (evt.key === `Escape` || evt.key === `Ecs`) {
      this._removeFilmPopup();
    }
  }

  _ctrlEnterKeyHandler(evt) {
    if ((evt.ctrlKey || evt.metaKey) && (evt.key === `Enter`)) {
      const message = encode(this._filmPopupComponent.getCurrentCommentText());
      const emotion = this._filmPopupComponent.getCurrentCommentEmoji();

      if (message && emotion) {
        const newComment = {
          id: String(new Date() + Math.random()),
          author: getRandomFullName(),
          date: new Date(Date.now()),
          emotion,
          message,
        };

        this._onCommentsDataChange(null, newComment);
      }
    }
  }
}
