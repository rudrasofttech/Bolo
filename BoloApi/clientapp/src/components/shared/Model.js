/* eslint-disable no-unused-vars */
export class MessageModel {
    constructor(style = "", message = "", disappear = 0) {
        this.style = style;
        this.message = message;
        this.disappear = disappear;
    }
}