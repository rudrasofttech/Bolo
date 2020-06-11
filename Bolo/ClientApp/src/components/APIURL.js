export class API {
    static GetURL() {
        if (window.location.href !== null) {
            if (window.location.href.toLowerCase().startsWith("https://localhost:")) {
                return "https://localhost:44383/";
            } else {
                return "https://waarta.com/";
            }
        }
    }
}