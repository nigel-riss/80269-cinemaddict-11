export default class CommentsModel {
  constructor() {
    this._comments = [];

    this._dataChangeHandlers = [];
  }

  getComments() {
    return this._comments.sort((a, b) => a.date - b.date);
  }

  setComments(comments) {
    this._comments = Array.from(comments);
  }

  removeComment(id) {
    const index = this._comments.findIndex((comment) => comment.id === id);
    if (index === -1) {
      return false;
    }

    this._comments = [].concat(
        this._comments.slice(0, index),
        this._comments.slice(index + 1)
    );

    this._callHandlers(this._dataChangeHandlers);

    return true;
  }

  setDataChangeHandler(handler) {
    this._dataChangeHandlers.push(handler);
  }

  _callHandlers(handlers) {
    handlers.forEach((handler) => handler());
  }
}
