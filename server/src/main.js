const ice = require("ice-node");
const path = require("path");
const webshot = require("webshot");
const rp = require("request-promise");
const template = require("./template.js");
const background_image = require("./background_image.js");
const status = require("./status.js");
const fs = require("fs");

const app = new ice.Ice();

let image_cache = null;
let image_cache_time = 0;

let listen_addr = process.argv[2];
let target = process.argv[3];

app.use("/static/", ice.static(path.join(__dirname, "../static/")));

app.add_template("index.html", fs.readFileSync(path.join(__dirname, "../templates/index.html"), "utf-8"));
app.get("/index", async req => {
    let r = JSON.parse(await rp.get(target));
    let requests = [];

    console.log(r);
    
    Object.keys(r.endpoint_hits).forEach(k => requests.push({
        path: k,
        count: r.endpoint_hits[k]
    }));

    requests = requests.sort((a, b) => b.count - a.count).slice(0, 10);

    return new ice.Response({
        template_name: "index.html",
        template_params: {
            server_addr: target,
            update_time: new Date().toLocaleString(),
            requests: requests
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

async function run() {
    app.listen(listen_addr);
}

run();
