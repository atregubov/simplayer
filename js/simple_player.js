/**
 * Created by ZiyuCheng on 2/12/17.
 */

String.prototype.format = function() {
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{'+i+'\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};

function Simple_Player(data, duration, tick_tag) {
    this.charts = [];
    this.current_frame = 0;
    this.max_frame = data.frames.length;
    this.duration = duration * 1000;
    this.play_status = "stop";
    this.tick_obj = d3.select(tick_tag);
    this.tick_fmt = String('Tick: {0} (1 tick = {1})');
    this.tick_unit = '1 day';
}

Simple_Player.prototype.initiate = function () {
    for (var i in this.charts) {
        if (!this.charts[i].initiate()) {
            console.log(this.charts[i] + " initiate failed.")
        }
    }

    this.tick_obj.text(this.tick_fmt.format(this.current_frame, this.tick_unit));
    return true;
};

Simple_Player.prototype.setFrame = function (n) {
    if (n < this.max_frame && n >= 0) {
        for (var i in this.charts) {
            this.charts[i].setFrame(n);
        }
        this.current_frame = n;
        this.tick_obj.text(this.tick_fmt.format(this.current_frame, this.tick_unit));
        return true;
    }
    console.log(n + " out of range(0 - " + this.max_frame + ")");
    return false;
};

Simple_Player.prototype.addChart = function (chart) {
    this.charts.push(chart);
};

Simple_Player.prototype.play = function () {
    if (this.play_status == "playing") {
        console.log("player is already playing.");
        return false;
    } else {
        if (this.play_status == "finished" && this.current_frame + 1 == this.max_frame) {
            this.setFrame(0);
        } else {
            this.setFrame(this.current_frame + 1);
        }
        this.play_status = "playing";

        setTimeout(this.play_routine, this.duration, this);
        return true;
    }
};

Simple_Player.prototype.play_routine = function (player) {
    if (player.play_status == "playing") {
        if (player.current_frame < player.max_frame - 1) {
            player.setFrame(player.current_frame + 1);
            setTimeout(player.play_routine, player.duration, player);
        } else {
            player.setFrame(player.current_frame + 1);
            player.play_status = "finished";
        }
    }
};

Simple_Player.prototype.pause = function () {
    this.play_status = "pause";
};

Simple_Player.prototype.stop = function () {
    this.setFrame(0);
    this.play_status = "stop";
};

var sim_player;

var data = d3.json("js/data-example.json", function (error, data) {

    d3.select("#exp_name").text(data.basic_info.exp_name);

    this.sim_player = new Simple_Player(data, 1, "#time_display");

    // add charts and register below.

    // progress chart
    var progress_chart = new Progress_Chart(data, d3.select("#progresses"));
    sim_player.addChart(progress_chart);


    // DSL chart
    var dsl_chart = new DSL_Chart(data, d3.select("#dsl_content"));
    sim_player.addChart(dsl_chart);

    // aggregating indicators chart
    var agg_chart = new Aggregating_Indicators(data, d3.select("#div_agg_indicators"), d3.select("#agg_select"), d3.select("#agg_chart"));
    sim_player.addChart(agg_chart);

    // oc indicator chart
    var oc_indicator_chart = new OC_Indicators_Chart(data, d3.select("#div_oc_indicators_chart"), d3.select("#oc_select"), d3.select("#oc_indicator_select"), d3.select("#oc_indicator_chart"));
    sim_player.addChart(oc_indicator_chart);

    var wi_indicator_chart = new WI_Indicators_Chart(data, d3.select("#div_wi_indicators_chart"), d3.select("#wi_select"), d3.select("#wi_indicator_select"), d3.select("#wi_indicator_chart"));
    sim_player.addChart((wi_indicator_chart));

    // OCA chart
    var oca_chart = new OCA_Chart(data, d3.select("#oca_div"));
    sim_player.addChart(oca_chart);

    // OC Organizational Relation Chart
    var orc_chart = new OrganizationRelationChart(data, d3.select("#oc_graph"), d3.select("#oc_relation_svg"));
    sim_player.addChart(orc_chart);

    // initiate all charts
    sim_player.initiate();

});



