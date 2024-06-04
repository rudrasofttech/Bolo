export class Utility {
    static EmptyID = '00000000-0000-0000-0000-000000000000';

    static GetAPIURL() {
        return "https://www.yocail.com";
    }

    static GetPhotoUrl(val) {
        let src = val;
        if (val.startsWith("photos/"))
            src = `https://www.yocail.com/${val}`;
        else if (val.startsWith("//"))
            src = `https:${val}`;
        return src;
    }
    
}