function transformMessage(text) {
    const reglink = /([^\S]|^)(((https?\:\/\/)|(www\.))(\S+))/gi;
    var links = [];
    //find all urls in the text
    const matches = text.matchAll(reglink);
    for (const match of matches) {
        isthere = false;
        for (link of links) {
            if (link === match[0].trim()) {
                isthere = true;
                break;
            }
        }
        //store only unique urls in links to replace
        if (!isthere) {
            links.push(match[0].trim());
        }
    }
    //finally replace url with appropriate tags
    for (l of links) {
        var imgreg = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/g;
        if (imgreg.test(l)) {
            let img = "<a href='" + l + "' target='_blank'><img src='" + l + "' class='img-fluid d-block mt-1 mb-1 img-thumbnail' style='width:300px; '/></a>";
            text = text.replaceAllOccurence(l, img, true);
        } else {
            let anchor = "<a href='" + l + "' target='_blank'>" + l + "</a>";
            text = text.replaceAllOccurence(l, anchor, true);
        }
    }
    
    return text;
}
//helper function to replace all occurance of string in string
String.prototype.replaceAllOccurence = function (str1, str2, ignore) {
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), (ignore ? "gi" : "g")), (typeof (str2) == "string") ? str2.replace(/\$/g, "$$$$") : str2);
};