const OxygenMark = require("oxygenmark");
const path = require("path");

let templates = {
    index: "templates/index.omt"
};

for(let k in templates) {
    if(typeof(templates[k]) == "string") {
        let ctx = new OxygenMark();
        ctx.loadFile(path.join(__dirname, "../" + templates[k]));
        templates[k] = ctx.prepare();
        if(!templates[k]) throw new Error("Unable to prepare template: " + k);
        ctx.destroy();
    }
}

export function try_render(name, params) {
    if(!templates[name]) return null;
    return templates[name](params);
}

export function must_render(name, params) {
    const ret = try_render(name, params);
    if(!ret) throw new Error("Unable to render template: " + name);
    return ret;
}

export function express_handler(name, params) {
    return (req, resp) => {
        try {
            return resp.send("<!DOCTYPE html>" + must_render(name, params));
        } catch(e) {
            return resp.send("Error: " + e);
        }
    }
}
