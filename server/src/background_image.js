const assert = require("assert");
const rp = require("request-promise");

let background_image_info = {
    data: null,
    update_time: 0
};

export async function get_background_image(req, resp) {
    try {
        if(Date.now() - background_image_info.update_time < 3600000) {
            resp.setHeader("Content-Type", "image/jpeg");
            return resp.send(background_image_info.data);
        }

        let result = await rp.get("http://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN");
        result = JSON.parse(result);

        let url = result.images[0].url;
        assert(typeof(url) == "string");

        let data = await rp.get("https://www.bing.com" + url, {
            encoding: null
        });
        assert(data instanceof Buffer);

        background_image_info = {
            data: data,
            update_time: Date.now()
        };
        resp.setHeader("Content-Type", "image/jpeg");
        return resp.send(background_image_info.data);
    } catch(e) {
        return resp.send("Error: " + e);
    }
}
