export class Utility {
    static EmptyID = '00000000-0000-0000-0000-000000000000';

    static GetAPIURL() {
        if(window.location.host.toLowerCase() === "localhost:3000")
        return `https://localhost:44389`;
    else
        return `//${window.location.host}`;
    }
}