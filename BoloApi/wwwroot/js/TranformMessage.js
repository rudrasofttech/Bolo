﻿function transformMessage(text, id) {
    try {
        const reglink = /([^\S]|^)(((https?\:\/\/)|(www\.))(\S+))/gi;
        let match;

        //while ((match = reglink.exec(text)) !== null) {
        //    console.log(`Found ${match[0]} start=${match.index} end=${reglink.lastIndex}.`);
        //    // expected output: "Found football start=6 end=14."
        //    // expected output: "Found foosball start=16 end=24."
        //}
        var links = [];
        //find all urls in the text
        //const matches = text.matchAll(reglink);
        //for (const match of matches) {
        while ((match = reglink.exec(text)) !== null) {
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
            var imgreg = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|jpeg)/g;
            if (imgreg.test(l)) {
                let img = "<a href='" + l + "' target='_blank'><img src='" + l + "' class='img-fluid d-block mt-1 mb-1 img-thumbnail' style='width:300px; '/></a>";
                text = text.replaceAllOccurence(l, img, true);
            } else {
                let anchor = "<a href='" + l + "' target='_blank'>" + l + "</a>";
                text = text.replaceAllOccurence(l, anchor, true);
            }
        }
    } catch (err) {
        console.log(err);
    }
    return text;
}
//helper function to replace all occurance of string in string
String.prototype.replaceAllOccurence = function (str1, str2, ignore) {
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), (ignore ? "gi" : "g")), (typeof (str2) == "string") ? str2.replace(/\$/g, "$$$$") : str2);
};