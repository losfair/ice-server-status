const os = require("os");

export let info = {
    update_time: "Never",
    load_avg: "Unknown",
    free_mem: "0",
    total_mem: "0",
    hostname: "Unknown",
    arch: "Unknown",
    cpu_model: "Unknown",
    uptime: "Unknown"
};

function get_uptime_str() {
    let t = os.uptime(); // in seconds
    let d = Math.floor(t / 86400);
    let h = Math.floor((t % 86400) / 3600);
    let m = Math.floor((t % 3600) / 60);
    let s = t % 60;
    return `${d} d ${h} h ${m} m ${s} s`;
}

function update_status() {
    info.update_time = new Date().toLocaleString();
    info.load_avg = os.loadavg()[0].toFixed(2);
    info.free_mem = os.freemem().toString();
    info.total_mem = os.totalmem().toString();
    info.hostname = os.hostname();
    info.arch = os.arch();
    info.cpu_model = os.cpus()[0].model;
    info.uptime = get_uptime_str();
}

update_status();
setInterval(update_status, 500);
