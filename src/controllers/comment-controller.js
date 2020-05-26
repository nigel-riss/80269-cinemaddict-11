import CommentComponent from '../components/comment-component';
import {render, replace, remove} from '../utils/dom';


export default class CommentController {
  constructor(container, onCommentDataChange) {
    this._container = container.querySelector(`.film-details__comments-list`);
    this._onCommentDataChange = onCommentDataChange;
    this._commentComponent = null;
  }

  render(comment) {
    const oldCommentComponent = this._commentComponent;
    this._commentComponent = new CommentComponent(comment);

    this._commentComponent.setDeleteButtonClickHandler((evt) => {
      evt.preventDefault();
      this._onCommentDataChange(comment, null);
    });

    if (oldCommentComponent) {
      replace(this._commentComponent, oldCommentComponent);
    } else {
      render(this._container, this._commentComponent);
    }
  }

  destroy() {
    remove(this._commentComponent);
  }
}
