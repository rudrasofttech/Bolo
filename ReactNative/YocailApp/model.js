/* eslint-disable no-unused-vars */
export class MessageModel {
    constructor(style = "", message = "", disappear = 2000) {
        this.style = style;
        this.message = message;
        this.disappear = disappear;
    }
}