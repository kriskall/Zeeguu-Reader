import $ from "jquery";
import config from "../config";
import UserActivityLogger from "../UserActivityLogger";
import ZeeguuRequests from "../zeeguuRequests";
import { POST_USER_ARTICLE } from "../zeeguuRequests";
import { get_article_id } from "./article_id.js";

const USER_EVENT_STAR_ARTICLE = "STAR ARTICLE";
const USER_EVENT_UNSTAR_ARTICLE = "UNSTAR ARTICLE";
const OFF = "off"; // Here's one of the issues: how does it connect to css?

const HTML_ID_BOOKMARKBUTTON = "#bookmark_button";

const HTML_BOOKMARK_DONE = "#bookmark_button>.bookmark_icon_done";
const HTML_BOOKMARK_UNDONE = "#toggle_star>.bookmark_icon_undone";

/**
 * Implements the functionality for starring an article, together with
 * notifying Zeeguu about the changes.
 */
export default class Bookmarker {
  /**
   * Initializes the state of the starer (default is false).
   */
  constructor(state = false) {
    this.setState(state);
  }

  /**
   * Sets the state of the starer and updates the UI
   * @param {boolean} state - Defines the state for the starer: true - 'on' or false - 'off'
   */
  setState(state) {
    this.on = state;
    if (this.on) {
      $(HTML_BOOKMARK_DONE).removeClass(OFF);
      $(HTML_BOOKMARK_UNDONE).addClass(OFF);
    } else {
      $(HTML_BOOKMARK_DONE).addClass(OFF);
      $(HTML_BOOKMARK_UNDONE).removeClass(OFF);
    }
  }

  /**
   * Toggles the star on/off based on its current state and notifies
   * Zeeguu accordingly.
   */
  toggle() {
    let title = $(config.HTML_ID_ARTICLE_TITLE).text();

    if (this.on) {
      // Launch Zeeguu request to notify about unstarring of article by user.
      let payload = { article_id: get_article_id(), starred: "False" };
      ZeeguuRequests.post(POST_USER_ARTICLE, payload);
      UserActivityLogger.log(
        USER_EVENT_UNSTAR_ARTICLE,
        "",
        {},
        get_article_id()
      );
    } else {
      // it's off
      // Launch Zeeguu request to notify about starring an article.
      ZeeguuRequests.post(POST_USER_ARTICLE, {
        article_id: get_article_id(),
        starred: "True"
      });
      UserActivityLogger.log(USER_EVENT_STAR_ARTICLE, "", {}, get_article_id());
    }
    this._toggleState();
    this._toggleIcon();
  }

  /**
   * Toggles the internal state of this class between true and false.
   */
  _toggleState() {
    this.on = this.on ? false : true;
  }

  /**
   * Toggles the icon of the star by adding or removing a class representing OFF.
   */
  _toggleIcon() {
    $(HTML_ID_BOOKMARKBUTTON)
      .children()
      .each(function () {
        $(this).toggleClass(OFF);
        // K: here is where I think it all fucks up -->
        // it's a material library call and we wanna do somthing like addClass
      });
  }
}
