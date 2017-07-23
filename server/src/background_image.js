const assert = require("assert");
const rp = require("request-promise");

let background_image_info = {
    data: null,
    update_time: 0
};
let background_data = null;

function sleep(ms) {
    return new Promise(cb => setTimeout(() => cb(), ms));
}

export async function worker() {
    while(true) {
        try {
            let result = await rp.get("http://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN");
            result = JSON.parse(result);

            let url = result.images[0].url;
            assert(typeof(url) == "string");

            let data = await rp.get("https://www.bing.com" + url, {
                encoding: null
            });
            assert(data instanceof Buffer);

            background_data = data;
        } catch(e) {
            console.log(e);
        }
        await sleep(3600000);
    }
}

export async function get_background_image(req) {
    return background_data;
}
