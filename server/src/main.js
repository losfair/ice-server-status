const express = require("express");
const path = require("path");
const webshot = require("webshot");
const template = require("./template.js");
const background_image = require("./background_image.js");
const status = require("./status.js");
const app = express();

function wrap(f) {
    return async function(req, resp) {
        try {
            await f(req, resp);
        } catch(e) {
            return resp.json({
                err: -1,
                msg: "" + e
            });
        }
    }
}

let image_cache = null;
let image_cache_time = 0;

app.use("/static/", express.static(path.join(__dirname, "../static/")));
app.get("/index", template.express_handler("index", status.info));
app.get("/res/background_image", background_image.get_background_image);
app.get("/image", (req, resp) => {
    const t = Date.now();
    if(t - image_cache_time < 5000) {
        resp.setHeader("Content-Type", "image/png");
        return resp.send(image_cache);
    }
    try {
        //const stream = webshot(template.must_render("index", status.info));
        const stream = webshot("http://127.0.0.1:1423/index");
        let data = "";

        stream.on("error", e => resp.send("" + e));
        stream.on("data", dt => data += dt.toString("binary"));
        stream.on("end", () => {
            resp.setHeader("Content-Type", "image/png");
            image_cache = Buffer.from(data, "binary");
            image_cache_time = Date.now();
            resp.send(image_cache);
        });
    } catch(e) {
        resp.send("" + e);
    }
});

async function run() {
    app.listen(1423);
}

run();
