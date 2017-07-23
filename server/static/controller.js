var draw_colors = [
    "rgb(233, 30, 99)",
    "rgb(33, 150, 243)"
];

function show_percent(cvs, pct) {
    var ctx = cvs.getContext("2d");

    var width = cvs.width;
    var height = cvs.height;

    var pct_width = width * pct;

    ctx.fillStyle = draw_colors[0];
    ctx.fillRect(0, 0, pct_width, height);

    ctx.fillStyle = draw_colors[1];
    ctx.fillRect(pct_width, 0, width - pct_width, height);
}

function show_mem_usage() {
    show_percent(document.getElementById("mem-usage"), (info.total_mem - info.free_mem) / info.total_mem);
}

function init() {
    //show_mem_usage();
}

init();
