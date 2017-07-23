const ice = require("ice-node");
const path = require("path");
const webshot = require("webshot");
const rp = require("request-promise");
const background_image = require("./background_image.js");
//const status = require("./status.js");
const fs = require("fs");

const app = new ice.Ice();

let image_cache = null;
let image_cache_time = 0;
let server_stats = null;

let listen_addr = process.argv[2];
if(!listen_addr) throw new Error("Listen address required");

let target = process.argv[3];
if(!target) throw new Error("Target URL required");

app.use("/static/", ice.static(path.join(__dirname, "../static/")));

app.add_template("index.html", fs.readFileSync(path.join(__dirname, "../templates/index.html"), "utf-8"));
app.get("/index", req => {
    let r = server_stats;

    let requests = [];
    Object.keys(r.endpoint_hits).forEach(k => requests.push({
        path: k,
        count: r.endpoint_hits[k]
    }));
    requests = requests.sort((a, b) => b.count - a.count).slice(0, 10);

    let processing_times = [];
    Object.keys(r.endpoint_processing_times).forEach(k => processing_times.push({
        path: k,
        time: r.endpoint_processing_times[k]
    }));
    processing_times = processing_times.sort((a, b) => b.time - a.time).slice(0, 10);

    let custom = [];
    Object.keys(r.custom).forEach(k => custom.push({
        key: k,
        value: r.custom[k]
    }));

    return new ice.Response({
        template_name: "index.html",
        template_params: {
            server_addr: target,
            update_time: new Date().toLocaleString(),
            requests: requests,
            processing_times: processing_times,
            custom: custom
        }
    });
});

//background_image.worker();
app.get("/res/background_image", background_image.get_background_image);

app.get("/image", req => image_cache || "");

const image_update_interval = 100;

function update_image() {
    let schedule_update = () => setTimeout(update_image, image_update_interval);
    try {
        //const stream = webshot(template.must_render("index", status.info));
        const stream = webshot("http://127.0.0.1:" + listen_addr.split(":")[1] + "/index");
        let data = "";

        stream.on("error", e => {
            console.log(e);
            schedule_update();
        });
        stream.on("data", dt => data += dt.toString("binary"));
        stream.on("end", () => {
            image_cache = Buffer.from(data, "binary");
            image_cache_time = Date.now();
            schedule_update();
        });
    } catch(e) {
        console.log(e);
        schedule_update();
    }
}

update_image();

function sleep(ms) {
    return new Promise(cb => setTimeout(() => cb(), ms));
}

async function update_stats() {
    while(true) {
        try {
            let r = JSON.parse(await rp.get(target));
            server_stats = r;
        } catch(e) {
            console.log(e);
        }
        await sleep(6000);
    }
}

update_stats();

async function run() {
    app.listen(listen_addr);
}

run();
