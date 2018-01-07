export default (queryString?:string) => {
    try {
        return queryString.split('&').reduce((red, item) => {
            let itemParts = item.split('=');
            if (itemParts.length > 1) {
                red[itemParts[0]] = decodeURIComponent(itemParts[1]);
            }
            return red;
        }, {});
    } catch (e) {
        return null;
    }
};
