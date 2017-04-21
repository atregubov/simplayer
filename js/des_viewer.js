/**
 * Created by ZiyuCheng on 2/12/17.
 */
var debug = true;
var COLORS = d3.schemeCategory20;
/*
 *  Base Chart
 */
function Base_Chart(data, div_obj) {
    this.original_data = data;
    this.div_obj = div_obj;
    this.current_frame = -1;
    this.animation_duration = 0;
}
Base_Chart.prototype.initiate = function () {
    alert("initiate not implemented. initiate()");
    return false;
};
Base_Chart.prototype.setFrame = function (n) {
    alert("initiate not implemented. setFrame(" + n + ")");
    return false;
};
// Base_Chart.prototype.getFrame = function () {
//     return this.current_frame;
// };

/*
 *  Progress Chart
 */
function Progress_Chart(data, div_obj) {
    Base_Chart.call(this, data, div_obj);
    //custom data
    this.own_data = [];
    for (var i in data.frames) {
        var f = [];
        var frame = data.frames[i];
        for (var j in frame.work_items) {
            if (frame.work_items.hasOwnProperty(j)) {
                if (frame.work_items[j].type === "capability") {
                    var cur_wi = {
                        "id": frame.work_items[j].id,
                        "type": frame.work_items[j].type,
                        "name": frame.work_items[j].name,
                        "oc": frame.work_items[j].assigned_to,
                        "children": new Object(frame.work_items[j].children),
                        "completeness": frame.work_items[j].indicators["completeness"],
                        "value": frame.work_items[j].indicators["value"]
                    };
                    f.push(cur_wi);
                    for (var r in cur_wi.children) {
                        var cur_re = {
                            "id": frame.work_items[cur_wi.children[r]].id,
                            "type": frame.work_items[cur_wi.children[r]].type,
                            "name": frame.work_items[cur_wi.children[r]].name,
                            "oc": frame.work_items[cur_wi.children[r]].assigned_to,
                            "children": new Object(frame.work_items[cur_wi.children[r]].children),
                            "completeness": frame.work_items[cur_wi.children[r]].indicators["completeness"],
                            "value": frame.work_items[cur_wi.children[r]].indicators["value"]
                        };
                        f.push(cur_re);
                        for (var t in cur_re.children) {
                            var cur_ta = {
                                "id": frame.work_items[cur_re.children[t]].id,
                                "type": frame.work_items[cur_re.children[t]].type,
                                "name": frame.work_items[cur_re.children[t]].name,
                                "oc": frame.work_items[cur_re.children[t]].assigned_to,
                                "children": new Object(frame.work_items[cur_re.children[t]].children),
                                "completeness": frame.work_items[cur_re.children[t]].indicators["completeness"],
                                "value": frame.work_items[cur_re.children[t]].indicators["value"]
                            };
                            f.push(cur_ta);
                        }
                    }
                }
            } else {
                console.log("Progress_Chart instantiated failed, unexpected data format.");
            }
        }
        this.own_data.push(f);
    }
    if (debug) {
        console.log("Progress_Chart instantiated successfully.");
    }
}

Progress_Chart.prototype = new Base_Chart();

Progress_Chart.prototype.initiate = function () {
    this.setFrame(0);
    return true;
};

Progress_Chart.prototype.setFrame = function (n) {
    if (n >= this.own_data.length) return false;
    var frame_data = this.own_data[n];
    //noinspection JSUnresolvedFunction
    this.div_obj.selectAll("div").remove();
    //noinspection JSUnresolvedFunction
    var div = this.div_obj.selectAll("div").data(frame_data);

    var divEnter = div.enter().append("div").attr("id", function (d) {
        return d.id;
    }).attr("class", function (d) {
        if (d.type === "capability") return "progress capability";
        else if (d.type === "requirement") return "progress requirement";
        else if (d.type === "task") return "progress task";
        else {
            console.log("unexpected work item type.");
        }
    });

    var a = divEnter.append("div").attr("class", "progress-bar progress-bar-info progress-bar-striped active").style("width", function (d) {
        return d.completeness * 100 + "%";
    }).attr("roll", "progressbar").attr("aria-valuenow", "45").attr("aria-valuemin", "0").attr("aria-valuemax", "100");
    a.exit().remove();
    divEnter.append("span").attr("class", "progress-bar-name").text(function (d) {
        return d.name
    });

    divEnter.append("span").attr("class", "progress-bar-percent").text(function (d) {
        return (d.completeness * 100).toFixed(2) + "%";
    });

    divEnter.exit().remove();

    this.current_frame = n;
    return true;
};

/*
 *  OCA Chart
 */
function OCA_Chart(data, div_obj) {
    Base_Chart.call(this, data, div_obj);
    this.svg_obj = this.div_obj.select("svg");
    this.current_frame = 0;
    this.oc_list = [];
    this.oc_dict = {};
    this.records = [];
    // assuming each frame has complete organization components information
    for (var i in data.frames[0].organization_components) {
        var cur_oc = data.frames[0].organization_components[i];
        this.oc_list.push({
            "name": cur_oc.name,
            "id": cur_oc.id,
            "description": cur_oc.description,
            "index": this.oc_list.length
        });
        this.oc_dict[cur_oc.id] =
            {
                "name": cur_oc.name,
                "id": cur_oc.id,
                "description": cur_oc.description,
                "index": this.oc_list.length - 1
            };

    }

    for (i in data.frames) {
        var cur_frame = data.frames[i];
        var fra = [];
        for (var j in cur_frame.events) {
            var cur_eve = cur_frame.events[j];
            fra.push({
                "from": cur_eve.src_oc_id,
                "to": cur_eve.dst_oc_id,
                "type": cur_eve.type,
                "description": cur_eve.description
            });
        }
        this.records.push(fra);
    }

    this.names = this.oc_list.map(function (d) {
        return d.name;
    });

    if (debug) {
        console.log("OCA_Chart instantiated successfully.");
    }
}

OCA_Chart.prototype = new Base_Chart();

OCA_Chart.prototype.initiate = function () {
    this.margin = {top: 10, right: 10, bottom: 10, left: 10};
    this.width = parseInt(this.svg_obj.style("width"));
    this.height = parseInt(this.svg_obj.style("height"));
    this.outerRadius = Math.min(parseInt(this.width - this.margin.left - this.margin.right), parseInt(this.height - this.margin.top - this.margin.bottom)) / 2 - 20;
    this.innerRadius = this.outerRadius - 30;

    this.centered_g = this.svg_obj.append("g").attr("transform", "translate(" + (this.width / 2) + ", " + (this.height / 2) + ")");
    this.number_of_groups = this.names.length;
    this.current_frame = 0;

    this.chordFunc = customChord().padAngle(0.15).sortSubgroups(d3.ascending());
    this.ribbonFunc = customRibbon().radius(this.innerRadius * 0.98).arrowRatio(0.10);
    this.arcFunc = d3.arc()
        .innerRadius(this.innerRadius * 1.01)
        .outerRadius(this.outerRadius);

    // XXX: what if more than 20 groups?
    this.colors = d3.schemeCategory20.slice(0, this.number_of_groups);//generateRandomColors(n);
    this.colors = d3.scaleOrdinal().domain(d3.range(this.number_of_groups)).range(this.colors);
    this.opacityDefault = 0.8;

    this.g_groups = this.centered_g.append("g").attr("class", "groups");
    this.g_ribbons = this.centered_g.append("g").attr("class", "ribbons");

    this.setFrame(0);

    return true;
};

OCA_Chart.prototype.setFrame = function (n) {
    var length = this.names.length;
    var matrix = new Array(length);
    for (var i = 0; i < length; ++i) {
        matrix[i] = new Array(length);
        matrix[i].fill(0);
    }
    var events = this.records[n];
    for (i in events) {
        if (events[i].type === "WI Delegation") {
            var cur_eve = events[i];
            matrix[this.oc_dict[cur_eve.from].index][this.oc_dict[cur_eve.to].index] += 1;
        }
    }

    var names = this.names;
    var colorsFunc = this.colors;

    var chords = this.chordFunc(matrix);

    // TODO: add transition?
    // var tran = d3.transition().duration(750);

    var group = this.g_groups.selectAll("g").data(chords.groups);
    var groupEnter = group.enter().append("g");
    groupEnter.append("path")
        .attr("class", "group-arc")
        .style("fill", function (d) {
            return colorsFunc(d.index);
        })
        .style("stroke", function (d) {
            return d3.rgb(colorsFunc(d.index)).darker();
        }).style("opacity", 0.9)
        .attr("d", this.arcFunc)
        .attr("id", function (d) {
            return "oc" + d.index;
        });
    groupEnter.append("text")
        .attr("class", "group-title")
        .each(function (d) {
            d.angle = (d.startAngle + d.endAngle) / 2;
        }).attr("dx", 10)
        .attr("dy", -2)
        .append("textPath")
        .attr("class", "titles")
        .attr("startOffset", "19%")
        .style("text-anchor", "middle")
        .style("fill", function (d) {
            return colorsFunc(d.index);
        })
        .attr("xlink:href", function (d) {
            return "#oc" + d.index;
        }).text(function (d, i) {
        return names[i];
    });
    group.exit().remove();
    group.select("path").attr("d", this.arcFunc);

    var ribbon = this.g_ribbons.selectAll("path").data(chords);
    ribbon.exit().remove();
    ribbon.enter().append("path")
        .attr("d", this.ribbonFunc)
        .style("fill", function (d) {
            return colorsFunc(d.source.index);
        })
        .style("stroke", function (d) {
            return d3.rgb(colorsFunc(d.source.index)).darker();
        }).style("opacity", 0.4);

    ribbon.attr("d", this.ribbonFunc).style("fill", function (d) {
        return colorsFunc(d.source.index);
    })
        .style("stroke", function (d) {
            return d3.rgb(colorsFunc(d.source.index)).darker();
        });

    this.current_frame = n;
};


/*
 *  DSL Chart
 */
function DSL_Chart(data, div_obj) {
    Base_Chart.call(this, data, div_obj);
    this.current_frame = 0;
    this.own_data = [];
    for (var i in data.frames) {
        var fra = [];
        var cur = data.frames[i];
        for (var j in cur.events) {
            if (cur.events.hasOwnProperty(j)) {
                fra.push({
                    "description": cur.events[j].description,
                    "type": cur.events[j].type,
                    "src_oc": cur.organization_components[cur.events[j].src_oc_id],
                    "dst_oc": cur.organization_components[cur.events[j].dst_oc_id],
                    "work_item": cur.work_items[cur.events[j].work_item_id],
                    "indicators": cur.events[j].indicators
                });

            }
        }
        this.own_data.push(fra);
    }
    if (debug) {
        console.log("DSL_Chart instantiated successfully.");
    }
}

DSL_Chart.prototype = new Base_Chart();

DSL_Chart.prototype.initiate = function () {
    this.setFrame(0);
    return true;
};

DSL_Chart.prototype.setFrame = function (n) {
    if (n < 0 || n >= this.own_data.length) return false;
    var frame = this.own_data[n];
    this.div_obj.selectAll("p").remove();
    this.div_obj.selectAll("p").data(frame).enter().append("p").text(function (d) {
        return d.description + " : " + (d.src_oc ? d.src_oc.name : "") + " : " + (d.dst_oc ? d.dst_oc.name : "") + " : "
            + (d.work_item ? d.work_item.name : "");
    });
};

/*
 Aggregating Indicators Chart
 This chart works with 2 select and 1 svg section.
 */
function Aggregating_Indicators(data, div_obj, agg_select, svg_obj) {
    Base_Chart.call(this, data, div_obj);
    this.current_frame = 0;
    this.total_frames = data.frames.length;
    this.agg_select = agg_select;
    this.svg_obj = svg_obj;
    this.indicators = data.frame_dictionary.map(function (d, i) {
        d.index = i;
        return d;
    });
    this.current_indicator = this.indicators["0"].name;
    this.own_data = {};
    //noinspection JSDuplicatedDeclaration
    for (var key in this.indicators) {
        if (this.indicators.hasOwnProperty(key))
            this.own_data[this.indicators[key].name] = [];
    }
    for (var i in data.frames) {
        var curFrame = data.frames[i];
        //noinspection JSDuplicatedDeclaration
        for (var key in this.indicators) {
            if (this.indicators.hasOwnProperty(key))
                this.own_data[this.indicators[key].name].push([i, curFrame.aggregating_indicators[this.indicators[key].name]]);
        }
    }
    this.width = this.svg_obj.style("width");
    this.height = this.svg_obj.style("height");
    this.margin = {top: 15, right: 10, bottom: 20, left: 25};

    // XXX: only 20 colors?
    this.colors = d3.schemeCategory20;

    this.svg_obj.append("text").text("Aggregating Indicators Chart").attr("class", "title").attr("text-anchor", 'middle')
        .attr("transform", "translate(" + (parseInt(this.width) - this.margin.right ) / 2 + "," + (this.margin.top - 6) + ")");

    if (debug) {
        console.log("Aggregating_Indicators_Chart instantiated successfully.");
    }
}

Aggregating_Indicators.prototype = new Base_Chart();

Aggregating_Indicators.prototype.initiate = function () {
    this.current_frame = 0;
    var target = this;

    // Set indicator selector
    var checkbox_div = this.agg_select.selectAll("li").data(this.indicators)
        .enter().append("li").append("div").attr("class", "checkbox");
    var label = checkbox_div.append("label");
    label.append("input").attr("type", "checkbox").attr("value", function (d) {
        return d.name;
    }).property("index", function (d) {
        return d.index;
    }).property("checked", true);
    label.append("text").text(function (d) {
        return d.name;
    });

    this.agg_select.on("change", function () {
        target.setFrame(target.current_frame);
    });

    var width  = parseInt(this.width) - this.margin.left - this.margin.right,
        height = parseInt(this.height) - this.margin.top - this.margin.bottom;

    // set the ranges
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    this.svg_obj.append("g")
        .attr("transform",
            "translate(" + this.margin.left + "," + this.margin.top + ")");

    var current_indicator = [];
    var yData = [];
    this.agg_select.selectAll("input").each(function () {
        if (this.checked) current_indicator.push(this.value)
    });
    for (var i in current_indicator) {
        yData = yData.concat(this.own_data[current_indicator[i]].map(function (d) {
            return d[1];
        }));
    }

    x.domain([0, this.total_frames - 1]);
    y.domain([0, d3.max(yData)]);

    // define the line
    this.valueLine = d3.line()
        .x(function (d) {
            return x(d[0]);
        }).y(function (d) {
            return y(d[1]);
        });

    this.valueArea = d3.area()
        .x(function (d) {
            return x(d[0]);
        }).y0(height)
        .y1(function (d) {
            return y(d[1]);
        });

    // Add the X Axis
    this.svg_obj.append("g")
        .attr("transform", "translate(" + this.margin.left + "," + (height + this.margin.top) + ")")
        .attr("class", "x axis")
        .call(d3.axisBottom(x).ticks(this.total_frames));

    // Add the Y Axis
    this.svg_obj.append("g").attr("transform", "translate(" + this.margin.left + ", " + this.margin.top + ")")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));

    for (i in current_indicator) {
        // Add path
        var indicator_name = current_indicator[i];
        this.svg_obj.append("path")
            .attr("class", "line " + indicator_name)
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
            .attr("d", this.valueLine(this.own_data[indicator_name].slice(0, this.current_frame + 1)))
            .attr("stroke", this.colors[this.indicators[i].index]);

        this.svg_obj.append("path")
            .attr("class", "area " + indicator_name)
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
            .attr("d", this.valueArea(this.own_data[indicator_name].slice(0, this.current_frame + 1)));

        this.svg_obj.selectAll("circle.point." + indicator_name).data(this.own_data[indicator_name].slice(0, this.current_frame + 1))
            .enter().append("circle").attr("r", "2.5").attr("cx", function (d) {
            return x(d[0]);
        }).attr("cy", function (d) {
            return y(d[1]);
        }).attr("transform", "translate(" + this.margin.left + ", " + this.margin.top + ")").attr("class", "point " + indicator_name)
            .style("fill", this.colors[this.indicators[i].index]);
    }

    this.x = x;
    this.y = y;
    return true;
};

Aggregating_Indicators.prototype.setFrame = function (n) {
    if (n < 0 || n >= this.own_data.length) return false;

    var current_indicator = {};
    this.agg_select.selectAll("input").each(function () {
        current_indicator[this.value] = [this.checked, this.index];
    });
    var yData = [];
    for (var i in current_indicator) {
        if (current_indicator[i])
            yData = yData.concat(this.own_data[i].map(function (d) {
                return d[1];
            }));
    }
    var svg = this.svg_obj.transition();

    this.y.domain([0, d3.max(yData)]);
    svg.select(".y.axis").duration(this.animation_duration).call(d3.axisLeft(this.y));

    var x = this.x;
    var y = this.y;

    for (var indicator_name in current_indicator) {
        var newData = current_indicator[indicator_name][0] ? this.own_data[indicator_name].slice(0, n + 1) : [];
        svg.select(".line." + indicator_name)
            .duration(this.animation_duration)
            .attr("d", this.valueLine(newData))
            .style("stroke", this.colors[this.indicators[current_indicator[indicator_name][1]].index]);

        svg.select(".area." + indicator_name)
            .duration(this.animation_duration)
            .attr("d", this.valueArea(newData))
            .style("fill", this.colors[this.indicators[current_indicator[indicator_name][1]].index]);

        var circles = this.svg_obj.selectAll("circle." + indicator_name).data(newData);
        circles.exit().remove();
        circles.enter().append("circle").attr("r", "2.5")
            .attr("cx", function (d) {
                return x(d[0]);
            })
            .attr("cy", function (d) {
                return y(d[1]);
            }).attr("transform", "translate(" + this.margin.left + ", " + this.margin.top + ")")
            .attr("class", "point " + indicator_name)
            .style("fill", this.colors[this.indicators[current_indicator[indicator_name][1]].index]);
    }

    this.current_frame = n;
    return true;
};

/*
 Organization Components Indicators Chart
 This chart works with 2 select and 1 svg section.
 */
function OC_Indicators_Chart(data, div_obj, oc_selector, indicator_selector, svg_obj) {
    Base_Chart.call(this, data, div_obj);
    this.current_frame = 0;
    this.total_frames = data.frames.length;
    this.oc_selector = oc_selector;
    this.indicator_selector = indicator_selector;
    this.svg_obj = svg_obj;
    this.indicators = data.oc_dictionary.map(function (d, i) {
        d.index = i;
        return d;
    });

    this.width = svg_obj.style("width");
    this.height = svg_obj.style("height");

    this.own_data = {};
    for (var i in data.frames) {
        var curFrame = data.frames[i];
        for (var j in curFrame.organization_components) {
            if (j in curFrame.organization_components) {
                var cur_oc = curFrame.organization_components[j];
                if (!(cur_oc.id in this.own_data)) {
                    this.own_data[cur_oc.id] = {"id": cur_oc.id, "name": cur_oc.name};
                }
                for (var idc in cur_oc.indicators) {
                    if (!(idc in this.own_data[cur_oc.id])) {
                        this.own_data[cur_oc.id][idc] = [];
                    }
                    this.own_data[cur_oc.id][idc].push(cur_oc.indicators[idc]);
                }
            }
        }
    }

    var color_index = 0;
    for (i in this.own_data) {
        this.own_data[i].color_index = color_index++;
    }

    // this.current_indicator = this.indicators[0].name;
    this.current_indicator = 0;
    this.current_oc = Object.keys(this.own_data)[0];

    // XXX: only 20 colors?
    this.colors = d3.schemeCategory20;

    this.margin = {top: 15, right: 10, bottom: 20, left: 25};
    this.svg_obj.append("text").text(this.indicators[this.current_indicator].title).attr("class", "title").attr("text-anchor", 'middle')
        .attr("transform", "translate(" + (parseInt(this.width) - this.margin.right ) / 2 + "," + (this.margin.top - 6) + ")");

    if (debug) {
        console.log("OC_Indicators_Chart instantiated successfully.");
    }
}

OC_Indicators_Chart.prototype = new Base_Chart();

OC_Indicators_Chart.prototype.initiate = function () {
    var target = this;

    // Setting Team Selector
    var checkbox_div = this.oc_selector.selectAll("li").data(Object.keys(this.own_data).map(function (key) {
        return target.own_data[key];
    })).enter().append("li").append("div").attr("class", "checkbox");
    var label = checkbox_div.append("label");
    label.append("input").attr("type", "checkbox").property("checked", true).attr("value", function (d) {
        return d.name
    }).property("index", function (d) {
        return d.id;
    });
    label.append("text").text(function (d) {
        return d.name;
    });

    this.oc_selector.on("change", function () {
        target.setFrame(target.current_frame);
    });

    // Setting Indicator Selector
    var radio_label = this.indicator_selector.selectAll("div").data(this.indicators)
        .enter().append("div").attr("class", "radio").append("label");
    radio_label.append("input").attr("name", "oc_indicator_selector").attr("type", "radio").attr("value", function (d, i) {
        return i;
    }).property("checked", function (d, i) {
        return target.current_indicator === i;
    });
    radio_label.append("text").text(function (d) {
        return d.name;
    });

    this.indicator_selector.on("change", function () {
        target.current_indicator = target.indicator_selector.select("input[name='oc_indicator_selector']:checked").node().value;
        target.setFrame(target.current_frame);
    });

    var width  = parseInt(this.width) - this.margin.left - this.margin.right,
        height = parseInt(this.height) - this.margin.top - this.margin.bottom;

    // set the ranges
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    // define the line
    this.valueLine = d3.line()
        .x(function (d, i) {
            return x(i);
        })
        .y(function (d) {
            return y(d);
        });

    this.valueArea = d3.area()
        .x(function (d, i) {
            return x(i);
        })
        .y0(height)
        .y1(function (d) {
            return y(d);
        });

    var yData = [];
    var cur_ocs = [];
    this.oc_selector.selectAll("input").each(function () {
        if (this.checked) cur_ocs.push(this.index);
    });
    for (var i in cur_ocs) {
        yData = yData.concat(this.own_data[cur_ocs[i]][this.indicators[this.current_indicator].name]);
    }
    x.domain([0, this.total_frames - 1]);
    y.domain([0, d3.max(yData)]);

    // Add the X Axis
    this.svg_obj.append("g")
        .attr("transform", "translate(" + this.margin.left + "," + (height + this.margin.top) + ")")
        .attr("class", "x axis")
        .call(d3.axisBottom(x).ticks(this.total_frames));

    // Add the Y Axis
    this.svg_obj.append("g").attr("transform", "translate(" + this.margin.left + ", " + this.margin.top + ")")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));

    for (i in cur_ocs) {
        var oc_name = this.own_data[cur_ocs[i]].name.replace(" ", "");
        var color_index = this.own_data[cur_ocs[i]].color_index;
        var oc_data = this.own_data[cur_ocs[i]][this.indicators[this.current_indicator].name].slice(0, this.current_frame + 1);
        // Add Line
        this.svg_obj.append("path")
            .attr("class", "line " + oc_name)
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
            .attr("d", this.valueLine(oc_data))
            .style("stroke", COLORS[color_index]);

        // Add Area
        this.svg_obj.append("path")
            .attr("class", "area " + oc_name)
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
            .attr("d", this.valueArea(oc_data))
            .style("fill", COLORS[color_index]);

        // Add Points
        this.svg_obj.selectAll(".point." + oc_name)
            .data(oc_data, function (d) {
                return d;
            })
            .enter().append("circle").attr("class", "point " + oc_name)
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
            .attr("r", "2.5")
            .attr("cx", function (d, i) {
                return x(i);
            }).attr("cy", function (d) {
            return y(d);
        }).style("fill", COLORS[color_index]);
    }
    this.x = x;
    this.y = y;

    return true;
};

OC_Indicators_Chart.prototype.setFrame = function (n) {
    if (n < 0 || n >= this.own_data[this.current_oc][this.indicators[this.current_indicator].name].length) return false;

    var yData = [];
    var cur_ocs = [];
    this.oc_selector.selectAll("input").each(function () {
        cur_ocs.push({index: this.index, checked: this.checked});
    });
    for (var i in cur_ocs) {
        yData = yData.concat(this.own_data[cur_ocs[i].index][this.indicators[this.current_indicator].name]);
    }
    this.y.domain([0, d3.max(yData)]);

    var svg = this.svg_obj.transition();
    svg.select(".title").text(this.indicators[this.current_indicator].title);
    svg.select(".y.axis").duration(this.animation_duration).call(d3.axisLeft(this.y));
    var x = this.x;
    var y = this.y;

    for (i in cur_ocs) {
        var ocs_name = this.own_data[cur_ocs[i].index].name.replace(" ", "");
        var color_index = this.own_data[cur_ocs[i].index].color_index;
        var newData = cur_ocs[i].checked ? this.own_data[cur_ocs[i].index][this.indicators[this.current_indicator].name].slice(0, n + 1) : [];

        // update line and area
        svg.select(".line." + ocs_name).duration(this.animation_duration)
            .attr("d", this.valueLine(newData))
            .style("stroke", COLORS[color_index]);
        svg.select(".area." + ocs_name).duration(this.animation_duration)
            .attr("d", this.valueArea(newData))
            .style("fill", COLORS[color_index]);

        // update points
        var circle = this.svg_obj.selectAll("circle.point." + ocs_name).data(newData);
        circle.exit().remove();

        circle.enter().append("circle").attr("r", "2.5").attr("cx", function (d, i) {
            return x(i);
        }).attr("cy", function (d) {
            return y(d);
        }).attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
            .attr("class", "point " + ocs_name)
            .style("fill", COLORS[color_index]);

        circle.attr("r", "2.5").attr("cx", function (d, i) {
            return x(i);
        }).attr("cy", function (d) {
            return y(d);
        }).attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
            .attr("class", "point " + ocs_name)
            .style("fill", COLORS[color_index]);
    }
    this.current_frame = n;
    return true;
};

/*
 Work Item Indicators Chart
 This chart works with 2 select and 1 svg section.
 */
function WI_Indicators_Chart(data, div_obj, wi_selector, indicator_selector, svg_obj) {
    Base_Chart.call(this, data, div_obj);
    this.current_frame = 0;
    this.total_frames = data.frames.length;
    this.wi_selector = wi_selector;
    this.indicator_selector = indicator_selector;
    this.svg_obj = svg_obj;
    this.indicators = data.work_item_dictionary;

    this.width = svg_obj.style("width");
    this.height = svg_obj.style("height");

    this.own_data = {};
    for (var i in data.frames) {
        var curFrame = data.frames[i];
        for (var j in curFrame.work_items) {
            if (j in curFrame.work_items) {
                var cur_wi = curFrame.work_items[j];
                if (!(cur_wi.id in this.own_data)) {
                    this.own_data[cur_wi.id] = {"id": cur_wi.id, "name": cur_wi.name};
                }
                for (var idc in cur_wi.indicators) {
                    if (!(idc in this.own_data[cur_wi.id])) {
                        this.own_data[cur_wi.id][idc] = [];
                    }
                    this.own_data[cur_wi.id][idc].push(cur_wi.indicators[idc]);
                }
            }
        }
    }

    var index = 0;
    for (i in this.own_data) {
        this.own_data[i].color_index = index++;
    }

    this.current_indicator = 0;

    this.margin = {top: 15, right: 10, bottom: 20, left: 25};

    this.svg_obj.append("text").text(this.indicators[this.current_indicator].title).attr("class", "title").attr("text-anchor", 'middle')
        .attr("transform", "translate(" + (parseInt(this.width) - this.margin.right ) / 2 + "," + (this.margin.top - 6) + ")");

    if (debug) {
        console.log("WI_Indicators_Chart instantiated successfully.");
    }
}

WI_Indicators_Chart.prototype = new Base_Chart();

WI_Indicators_Chart.prototype.initiate = function () {
    var target = this;

    // Set WI Selector
    var checkbox_div = this.wi_selector.selectAll("li").data(Object.keys(this.own_data).map(function (key) {
        return target.own_data[key];
    })).enter().append("li").append("div").attr("class", "checkbox");
    var label = checkbox_div.append("label");
    label.append("input").attr("type", "checkbox").attr("value", function (d) {
        return d.id;
    }).property("checked", true);
    label.append("text").text(function (d) {
        return d.name;
    });

    this.wi_selector.on("change", function () {
        target.setFrame(target.current_frame);
    });

    // Set Indicator Selector
    var labels_enter = this.indicator_selector.selectAll("div").data(this.indicators).enter()
        .append("div").attr("class", "radio").append("label");
    labels_enter.append("input").attr("type", "radio").attr("name", "wi_indicator_selector")
        .attr("value", function (d, i) {
            return i;
        }).property("checked", function (d, i) {
        return target.current_indicator === i;
    });
    labels_enter.append("text").text(function (d) {
        return d.name;
    });

    this.indicator_selector.on("change", function () {
        target.current_indicator = target.indicator_selector.select("input[name='wi_indicator_selector']:checked").node().value;
        target.setFrame(target.current_frame);
    });

    var width  = parseInt(this.width) - this.margin.left - this.margin.right,
        height = parseInt(this.height) - this.margin.top - this.margin.bottom;

    // set the ranges
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    // define the line
    this.valueLine = d3.line()
        .x(function (d, i) {
            return x(i);
        })
        .y(function (d) {
            return y(d);
        });

    this.valueArea = d3.area()
        .x(function (d, i) {
            return x(i);
        })
        .y0(height)
        .y1(function (d) {
            return y(d);
        });

    var cur_indicator = this.indicators[this.current_indicator].name;
    var yData = [].concat.apply([], Object.keys(this.own_data).map(function (key) {
        return target.own_data[key][cur_indicator];
    }));
    var cur_wis = this.wi_selector.selectAll("input").nodes().map(function (d) {
        return d.value;
    });


    x.domain([0, this.total_frames - 1]);
    y.domain([0, d3.max(yData)]);
    // Add the X Axis
    this.svg_obj.append("g")
        .attr("transform", "translate(" + this.margin.left + "," + (height + this.margin.top) + ")")
        .attr("class", "x axis")
        .call(d3.axisBottom(x).ticks(this.total_frames));

    // Add the Y Axis
    this.svg_obj.append("g").attr("transform", "translate(" + this.margin.left + ", " + this.margin.top + ")")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));

    for (var i in cur_wis) {
        var wi_name = this.own_data[cur_wis[i]].name.replace(" ", "");
        var color_index = this.own_data[cur_wis[i]].color_index;
        var cur_data = this.own_data[cur_wis[i]][cur_indicator].slice(0, this.current_frame + 1);
        this.svg_obj.append("path")
            .attr("class", "line " + wi_name)
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
            .attr("d", this.valueLine(cur_data))
            .style("stroke", COLORS[color_index]);

        this.svg_obj.append("path")
            .attr("class", "area " + wi_name)
            .attr("transform", "translate (" + this.margin.left + "," + this.margin.top + ")")
            .attr("d", this.valueArea(cur_data))
            .style("fill", COLORS[color_index]);

        this.svg_obj.selectAll(".point." + wi_name)
            .data(cur_data, function (d) {
                return d;
            })
            .enter().append("circle").attr("class", "point " + wi_name)
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
            .attr("r", "2.5")
            .attr("cx", function (d, i) {
                return x(i);
            }).attr("cy", function (d) {
            return y(d);
        }).style("fill", function (d) {
            return COLORS[d.color_index];
        });

    }
    this.x = x;
    this.y = y;

    return true;
};

WI_Indicators_Chart.prototype.setFrame = function (n) {
    var target = this;
    if (n < 0 || n >= Object.keys(this.own_data).map(function (key) {
            return target.own_data[key];
        })[0][this.indicators[this.current_indicator].name].length) return false;

    var cur_wis = this.wi_selector.selectAll("input").nodes().map(function (d) {
        return {id: d.value, checked: d.checked};
    });
    var yData = [];
    for (var i in cur_wis) {
        yData = yData.concat(this.own_data[cur_wis[i].id][this.indicators[this.current_indicator].name]);
    }

    this.y.domain([0, d3.max(yData)]);

    var svg_trans = this.svg_obj.transition();
    svg_trans.select(".title").text(this.indicators[this.current_indicator].title);
    svg_trans.select(".y.axis").duration(this.animation_duration).call(d3.axisLeft(this.y));

    var x = this.x;
    var y = this.y;

    for (i in cur_wis) {
        var wi_name = this.own_data[cur_wis[i].id].name.replace(" ", "");
        var color_index = this.own_data[cur_wis[i].id].color_index;
        var newData = cur_wis[i].checked ? this.own_data[cur_wis[i].id][this.indicators[this.current_indicator].name].slice(0, n + 1) : [];
        svg_trans.select(".line." + wi_name)
            .duration(this.animation_duration)
            .attr("d", this.valueLine(newData))
            .style("stroke", COLORS[color_index]);
        svg_trans.select(".area." + wi_name)
            .duration(this.animation_duration)
            .attr("d", this.valueArea(newData))
            .style("fill", COLORS[color_index]);

        var circles = this.svg_obj.selectAll("circle.point." + wi_name).data(newData);
        circles.exit().remove();
        circles.enter().append("circle").merge(circles).attr("r", "2.5")
            .attr("cx", function (d, i) {
                return x(i);
            }).attr("cy", function (d) {
            return y(d);
        }).attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")").attr("class", "point " + wi_name)
            .style("fill", COLORS[color_index]);
    }
    this.current_frame = n;
    return true;
};

function OrganizationRelationChart(data, div_obj, svg_obj) {
    Base_Chart.call(this, data, div_obj);
    this.svg_obj = svg_obj;
    this.own_data = this.original_data.oc_model;
}

OrganizationRelationChart.prototype = new Base_Chart();

OrganizationRelationChart.prototype.initiate = function () {
    this.height = parseInt(this.svg_obj.style("height"));
    this.width = parseInt(this.svg_obj.style("width"));
    this.margin = {top: 25, right: 5, bottom: 25, left: 5};

    var dict = {};
    var head_id = {};
    for (var o in this.own_data) {
        dict[this.own_data[o].oc_id] = this.own_data[o];
        head_id[this.own_data[o].oc_id] = true;
    }

    for (o in dict) {
        for (var c in dict[o].children_ids) {
            delete head_id[dict[o].children_ids[c]];
        }
    }

    var layout = TreeLayout(this.height - this.margin.top - this.margin.bottom, this.width - this.margin.left - this.margin.right, this.own_data);

    g = this.svg_obj.append("g")
        .attr("transform",
            "translate(" + this.margin.left + "," + this.margin.top + ")");

    // adds the links between the nodes
    var link = g.selectAll(".link")
    // .data(nodes.descendants().slice(1))
        .data(layout.links)
        .enter().append("path")
        .attr("class", "link")
        // .attr("d", function (d) {
        //     return "M" + d.x + "," + d.y
        //         + "C" + d.x + "," + (d.y + d.parent.y) / 2
        //         + " " + d.parent.x + "," + (d.y + d.parent.y) / 2
        //         + " " + d.parent.x + "," + d.parent.y;
        // });
        .attr("d", function (d) {
            return "M" + d.target.x + "," + d.target.y
                + "C" + d.target.x + "," + (d.target.y + d.source.y) / 2
                + " " + d.source.x + "," + (d.target.y + d.source.y) / 2
                + " " + d.source.x + "," + d.source.y;
        });
    // adds each node as a group
    var node = g.selectAll(".node")
    // .data(nodes.descendants())
        .data(layout.nodes)
        .enter().append("g")
        .attr("class", function (d) {
            return "node" +
                (d.children_ids ? " node--internal" : " node--leaf");
        })
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

    // adds the circle to the node
    node.append("circle")
        .attr("r", 10);

    // adds the text to the node
    node.append("text")
        .attr("dy", ".35em")
        .attr("y", function (d) {
            return d.children_ids && d.children_ids.length >= 0 ? -20 : 20;
        })
        .style("text-anchor", "middle")
        .text(function (d) {
            return d.name;
        });

    return true;
};

OrganizationRelationChart.prototype.setFrame = function (n) {
    this.current_frame = n;
    return true;
};

function TreeLayout(height, width, nodes) {
    var levels = [];
    var dict = {};
    for (var i in nodes) {
        if (!levels[nodes[i].level])
            levels[nodes[i].level] = [];
        levels[nodes[i].level].push(nodes[i]);
        dict[nodes[i].oc_id] = nodes[i];
    }
    var dy = height / (levels.length - 1);
    var y = -dy;
    for (var l in levels) {
        y += dy;
        var dx = width / (levels[l].length + 1);
        var x = 0;
        for (var n in levels[l]) {
            levels[l][n].x = (x += dx);
            levels[l][n].y = y;
        }
    }

    var links = [];
    for (n in nodes) {
        for (l in nodes[n].children_ids) {
            links.push({
                source: {x: nodes[n].x, y: nodes[n].y},
                target: {x: dict[nodes[n].children_ids[l]].x, y: dict[nodes[n].children_ids[l]].y}
            });
        }
    }

    return {nodes: nodes, links: links};
}

/*********** Util ***********/

var customChord = function () {
    var padAngle      = 0,
        sortGroups    = null,
        sortSubgroups = null,
        sortChords    = null;

    function customChord(matrix) {
        var n             = matrix.length,
            groupSums     = [],
            groupIndex    = sequence(n),
            subgroupIndex = [],
            chords        = [],
            groups        = chords.groups = new Array(n),
            subgroups = new Array(n * n),
            k,
            x,
            x0,
            dx,
            i,
            j;

        var numSeq;

        // Compute the sum.
        k = 0, i = -1;
        while (++i < n) {
            x = 0, j = -1;
            numSeq = [];
            while (++j < n) {
                // x += matrix[i][j];
                if (i !== j) x += matrix[j][i] + matrix[i][j];
            }
            if (x === 0) x = 1;
            groupSums.push(x);
            for (var m = 0; m < n; m++) {
                numSeq[m] = (n + (i - 1) - m) % n;
            }
            subgroupIndex.push(numSeq);
            k += x;
        }//while

        dx = n > 1 && padAngle ? padAngle : Math.PI * 2 / n;
        k = Math.max(0, Math.PI * 2 - padAngle * n) / n;
        x = 0, i = -1;
        while (++i < n) {
            x0 = x, j = -1;
            var sub_k = k / groupSums[i];
            while (++j < n) {
                var di = groupIndex[i], dj = subgroupIndex[di][j];
                var a0 = x, a1 = x += (matrix[i][dj] > 0 ? 1 : 0) * sub_k;
                subgroups[i + "-" + dj + "out0"] = {
                    index: di,
                    subindex: dj,
                    startAngle: a0,
                    endAngle: a1,
                    value: matrix[i][dj] > 0 ? 1 : 0
                };
                var count = 0;
                while (++count < matrix[i][dj]) {
                    a0 = a1, a1 = x += sub_k;
                    subgroups[i + "-" + dj + "out" + count] = {
                        index: di,
                        subindex: dj,
                        startAngle: a0,
                        endAngle: a1,
                        value: 1
                    };
                }

                a0 = a1, a1 = x += (matrix[dj][i] > 0 ? 1 : 0) * sub_k;
                subgroups[i + "-" + dj + "in" + (matrix[dj][i] > 1 ? matrix[dj][i] - 1 : 0)] = {
                    index: di,
                    subindex: dj,
                    startAngle: a0,
                    endAngle: a1,
                    value: matrix[dj][i] > 0 ? 1 : 0
                };
                count = matrix[dj][i];
                while (--count > 0) {
                    a0 = a1, a1 = x += sub_k;
                    subgroups[i + "-" + dj + "in" + (count - 1)] = {
                        index: di,
                        subindex: dj,
                        startAngle: a0,
                        endAngle: a1,
                        value: 1
                    }
                }
            }
            groups[i] = {index: i, startAngle: x0, endAngle: x0 += k, value: k};
            x = x0 + dx;
        }

        // Generate chords for each (non-empty) subgroup-subgroup link.
        i = -1;
        while (++i < n) {
            j = -1;
            while (++j < n) {
                if (i === j) continue;//skip self to self
                k = 0;
                while (k < matrix[i][j]) {
                    var source = subgroups[i + "-" + j + "out" + k],
                        target = subgroups[j + "-" + i + "in" + k];
                    if (source.value && target.value) {
                        chords.push({source: source, target: target});
                    }
                    k++;
                }

            }
        }

        return sortChords ? chords.sort(sortChords) : chords;
    }

    customChord.padAngle = function (_) {
        return arguments.length ? (padAngle = Math.max(0, _), customChord) : padAngle;
    };

    customChord.sortGroups = function (_) {
        return arguments.length ? (sortGroups = _, customChord) : sortGroups;
    };

    customChord.sortSubgroups = function (_) {
        return arguments.length ? (sortSubgroups = _, customChord) : sortSubgroups;
    };

    customChord.sortChords = function (_) {
        return arguments.length ? (_ === null ? sortChords = null : (sortChords = compareValue(_))._ = _, customChord) : sortChords && sortChords._;
    };

    return customChord;
};


var customRibbon = function () {
    var source     = function (d) {
            return d.source;
        },
        target     = function (d) {
            return d.target;
        },
        radius     = function (d) {
            return d.radius;
        },
        startAngle = function (d) {
            return d.startAngle;
        },
        endAngle   = function (d) {
            return d.endAngle;
        },
        arrowRatio = function (d) {
            return d.arrowRatio;
        },
        context    = null;

    function customRibbon() {
        var buffer,
            argv = Array.prototype.slice.call(arguments),
            s    = source.apply(this, argv),
            t    = target.apply(this, argv),
            sr   = +radius.apply(this, (argv[0] = s, argv)),
            sa0 = startAngle.apply(this, argv) - Math.PI / 2,
            sa1 = endAngle.apply(this, argv) - Math.PI / 2,
            sx0 = sr * Math.cos(sa0),
            sy0 = sr * Math.sin(sa0),
            tr  = +radius.apply(this, (argv[0] = t, argv)),
            ta0   = startAngle.apply(this, argv) - Math.PI / 2,
            ta1   = endAngle.apply(this, argv) - Math.PI / 2,
            ratio = 1.0 - arrowRatio.apply(this, argv);

        if (!context) context = buffer = d3.path();

        context.moveTo(sx0, sy0);//tail
        context.arc(0, 0, sr, sa0, sa1);
        // context.lineTo(sr * Math.cos((sa0 + sa1) / 2) * ratio, sr * Math.sin((sa0 + sa1) / 2) * ratio);
        // context.lineTo(sr * Math.cos(sa1), sr * Math.sin(sa1));
        if (sa0 !== ta0 || sa1 !== ta1) { // TODO sr !== tr?
            context.quadraticCurveTo(0, 0, tr * Math.cos((8 * ta0 + ta1) / 9) * ratio, tr * Math.sin((8 * ta0 + ta1) / 9) * ratio);
            context.lineTo(tr * Math.cos(ta0) * ratio, tr * Math.sin(ta0) * ratio);
            context.lineTo(tr * Math.cos((ta0 + ta1) / 2), tr * Math.sin((ta0 + ta1) / 2));
            context.lineTo(tr * Math.cos(ta1) * ratio, tr * Math.sin(ta1) * ratio);
            context.lineTo(tr * Math.cos((8 * ta1 + ta0) / 9) * ratio, tr * Math.sin((8 * ta1 + ta0) / 9) * ratio);
            // context.arc(0, 0, tr * ratio, ta0, ta1);
        }
        context.quadraticCurveTo(0, 0, sx0, sy0);
        context.closePath();

        if (buffer) return context = null, buffer + "" || null;
    }

    constant$5 = function (x) {
        return function () {
            return x;
        };
    };

    customRibbon.radius = function (_) {
        return arguments.length ? (radius = typeof _ === "function" ? _ : constant$5(+_), customRibbon) : radius;
    };

    customRibbon.startAngle = function (_) {
        return arguments.length ? (startAngle = typeof _ === "function" ? _ : constant$5(+_), customRibbon) : startAngle;
    };

    customRibbon.endAngle = function (_) {
        return arguments.length ? (endAngle = typeof _ === "function" ? _ : constant$5(+_), customRibbon) : endAngle;
    };

    customRibbon.source = function (_) {
        return arguments.length ? (source = _ , customRibbon) : source;
    };

    customRibbon.target = function (_) {
        return arguments.length ? (target = _ , customRibbon) : target;
    };

    customRibbon.context = function (_) {
        return arguments.length ? ((context = _ === null ? null : _), customRibbon) : context;
    };

    customRibbon.arrowRatio = function (_) {
        return arguments.length ? (arrowRatio = typeof _ === "function" ? _ : constant$5(+_), customRibbon) : arrowRatio;
    };

    return customRibbon;
};

var sequence = function (start, stop, step) {
    start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;

    var i     = -1,
        n     = Math.max(0, Math.ceil((stop - start) / step)) | 0,
        range = new Array(n);

    while (++i < n) {
        range[i] = start + i * step;
    }

    return range;
};

var generateRandomColors = function (number) {
    /*
     This generates colors using the following algorithm:
     Each time you create a color:
     Create a random, but attractive, color{
     Red, Green, and Blue are set to random luminosity.
     One random value is reduced significantly to prevent grayscale.
     Another is increased by a random amount up to 100%.
     They are mapped to a random total luminosity in a medium-high range (bright but not white).
     }
     Check for similarity to other colors{
     Check if the colors are very close together in value.
     Check if the colors are of similar hue and saturation.
     Check if the colors are of similar luminosity.
     If the random color is too similar to another,
     and there is still a good opportunity to change it:
     Change the hue of the random color and try again.
     }
     Output array of all colors generated
     */
    //if we've passed preloaded colors and they're in hex format
    if (typeof(arguments[1]) !== 'undefined' && arguments[1].constructor === Array && arguments[1][0] && arguments[1][0].constructor !== Array) {
        for (var i = 0; i < arguments[1].length; i++) { //for all the passed colors
            var vals = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(arguments[1][i]); //get RGB values
            arguments[1][i] = [parseInt(vals[1], 16), parseInt(vals[2], 16), parseInt(vals[3], 16)]; //and convert them to base 10
        }
    }
    var loadedColors            = typeof(arguments[1]) === 'undefined' ? [] : arguments[1],//predefine colors in the set
        number                  = number + loadedColors.length,//reset number to include the colors already passed
        lastLoadedReduction     = Math.floor(Math.random() * 3),//set a random value to be the first to decrease
        rgbToHSL                = function (rgb) {//converts [r,g,b] into [h,s,l]
            var r = rgb[0], g = rgb[1], b = rgb[2], cMax = Math.max(r, g, b), cMin = Math.min(r, g, b),
                delta                                                              = cMax - cMin, l                                             = (cMax + cMin) / 2, h = 0, s               = 0;
            if (delta === 0) h = 0; else if (cMax === r) h = 60 * ((g - b) / delta % 6); else if (cMax === g) h = 60 * ((b - r) / delta + 2); else h = 60 * ((r - g) / delta + 4);
            if (delta === 0) s = 0; else s = delta / (1 - Math.abs(2 * l - 1));
            return [h, s, l]
        }, hslToRGB             = function (hsl) {//converts [h,s,l] into [r,g,b]
            var h = hsl[0], s = hsl[1], l = hsl[2], c = (1 - Math.abs(2 * l - 1)) * s,
                x                                     = c * (1 - Math.abs(h / 60 % 2 - 1));//, m = l - c / 2, r, g, b;
            if (h < 60) {
                r = c;
                g = x;
                b = 0
            } else if (h < 120) {
                r = x;
                g = c;
                b = 0
            } else if (h < 180) {
                r = 0;
                g = c;
                b = x
            } else if (h < 240) {
                r = 0;
                g = x;
                b = c
            } else if (h < 300) {
                r = x;
                g = 0;
                b = c
            } else {
                r = c;
                g = 0;
                b = x
            }
            return [r, g, b]
        }, shiftHue             = function (rgb, degree) {//shifts [r,g,b] by a number of degrees
            var hsl = rgbToHSL(rgb); //convert to hue/saturation/luminosity to modify hue
            hsl[0] += degree; //increment the hue
            if (hsl[0] > 360) { //if it's too high
                hsl[0] -= 360 //decrease it mod 360
            } else if (hsl[0] < 0) { //if it's too low
                hsl[0] += 360 //increase it mod 360
            }
            return hslToRGB(hsl); //convert back to rgb
        }, differenceRecursions = {//stores recursion data, so if all else fails we can use one of the hues already generated
            differences: [],//used to calculate the most distant hue
            values: []//used to store the actual colors
        }, fixDifference        = function (color) {//recursively asserts that the current color is distinctive
            if (differenceRecursions.values.length > 23) {//first, check if this is the 25th recursion or higher. (can we try any more unique hues?)
                //if so, get the biggest value in differences that we have and its corresponding value
                var ret = differenceRecursions.values[differenceRecursions.differences.indexOf(Math.max.apply(null, differenceRecursions.differences))];
                differenceRecursions = {differences: [], values: []}; //then reset the recursions array, because we're done now
                return ret; //and then return up the recursion chain
            } //okay, so we still have some hues to try.
            var differences = []; //an array of the "difference" numbers we're going to generate.
            for (var i = 0; i < loadedColors.length; i++) { //for all the colors we've generated so far
                var difference             = loadedColors[i].map(function (value, index) { //for each value (red,green,blue)
                        return Math.abs(value - color[index]) //replace it with the difference in that value between the two colors
                    }), sumFunction        = function (sum, value) { //function for adding up arrays
                        return sum + value
                    }, sumDifference       = difference.reduce(sumFunction), //add up the difference array
                    loadedColorLuminosity  = loadedColors[i].reduce(sumFunction), //get the total luminosity of the already generated color
                    currentColorLuminosity = color.reduce(sumFunction), //get the total luminosity of the current color
                    lumDifference          = Math.abs(loadedColorLuminosity - currentColorLuminosity), //get the difference in luminosity between the two
                    //how close are these two colors to being the same luminosity and saturation?
                    differenceRange        = Math.max.apply(null, difference) - Math.min.apply(null, difference),
                    luminosityFactor       = 50, //how much difference in luminosity the human eye should be able to detect easily
                    rangeFactor            = 75; //how much difference in luminosity and saturation the human eye should be able to dect easily
                if (luminosityFactor / (lumDifference + 1) * rangeFactor / (differenceRange + 1) > 1) { //if there's a problem with range or luminosity
                    //set the biggest difference for these colors to be whatever is most significant
                    differences.push(Math.min(differenceRange + lumDifference, sumDifference));
                }
                differences.push(sumDifference); //otherwise output the raw difference in RGB values
            }
            var breakdownAt          = 64, //if you're generating this many colors or more, don't try so hard to make unique hues, because you might fail.
                breakdownFactor      = 25, //how much should additional colors decrease the acceptable difference
                shiftByDegrees       = 15, //how many degrees of hue should we iterate through if this fails
                acceptableDifference = 250, //how much difference is unacceptable between colors
                breakVal             = loadedColors.length / number * (number - breakdownAt), //break down progressively (if it's the second color, you can still make it a unique hue)
                totalDifference      = Math.min.apply(null, differences); //get the color closest to the current color
            if (totalDifference > acceptableDifference - (breakVal < 0 ? 0 : breakVal) * breakdownFactor) { //if the current color is acceptable
                differenceRecursions = {differences: [], values: []};//reset the recursions object, because we're done
                return color; //and return that color
            } //otherwise the current color is too much like another
            //start by adding this recursion's data into the recursions object
            differenceRecursions.differences.push(totalDifference);
            differenceRecursions.values.push(color);
            color = shiftHue(color, shiftByDegrees); //then increment the color's hue
            return fixDifference(color); //and try again
        }, color                = function () { //generate a random color
            var scale           = function (x) { //maps [0,1] to [300,510]
                    return x * 210 + 300 //(no brighter than #ff0 or #0ff or #f0f, but still pretty bright)
                }, randVal      = function () { //random value between 300 and 510
                    return Math.floor(scale(Math.random()))
                }, luminosity   = randVal(), //random luminosity
                red             = randVal(), //random color values
                green           = randVal(), //these could be any random integer but we'll use the same function as for luminosity
                blue            = randVal(),
                rescale, //we'll define this later
                thisColor       = [red, green, blue], //an array of the random values
                /*
                 #ff0 and #9e0 are not the same colors, but they are on the same range of the spectrum, namely without blue.
                 Try to choose colors such that consecutive colors are on different ranges of the spectrum.
                 This shouldn't always happen, but it should happen more often then not.
                 Using a factor of 2.3, we'll only get the same range of spectrum 15% of the time.
                 */
                valueToReduce   = Math.floor(lastLoadedReduction + 1 + Math.random() * 2.3) % 3, //which value to reduce
                /*
                 Because 300 and 510 are fairly close in reference to zero,
                 increase one of the remaining values by some arbitrary percent between 0% and 100%,
                 so that our remaining two values can be somewhat different.
                 */
                valueToIncrease = Math.floor(valueToIncrease + 1 + Math.random() * 2) % 3, //which value to increase (not the one we reduced)
                increaseBy      = Math.random() + 1; //how much to increase it by
            lastLoadedReduction = valueToReduce; //next time we make a color, try not to reduce the same one
            thisColor[valueToReduce] = Math.floor(thisColor[valueToReduce] / 16); //reduce one of the values
            thisColor[valueToIncrease] = Math.ceil(thisColor[valueToIncrease] * increaseBy); //increase one of the values
            rescale = function (x) { //now, rescale the random numbers so that our output color has the luminosity we want
                return x * luminosity / thisColor.reduce(function (a, b) {
                        return a + b
                    }) //sum red, green, and blue to get the total luminosity
            };
            thisColor = fixDifference(thisColor.map(function (a) {
                return rescale(a)
            })); //fix the hue so that our color is recognizable
            if (Math.max.apply(null, thisColor) > 255) { //if any values are too large
                rescale = function (x) { //rescale the numbers to legitimate hex values
                    return x * 255 / Math.max.apply(null, thisColor)
                };
                thisColor = thisColor.map(function (a) {
                    return rescale(a)
                });
            }
            return thisColor;
        };
    for (i = loadedColors.length; i < number; i++) { //Start with our predefined colors or 0, and generate the correct number of colors.
        loadedColors.push(color().map(function (value) { //for each new color
            return Math.round(value) //round RGB values to integers
        }));
    }
    //then, after you've made all your colors, convert them to hex codes and return them.
    return loadedColors.map(function (color) {
        var hx = function (c) { //for each value
            var h = c.toString(16);//then convert it to a hex code
            return h.length < 2 ? '0' + h : h//and assert that it's two digits
        };
        return "#" + hx(color[0]) + hx(color[1]) + hx(color[2]); //then return the hex code
    });
};


window.onmousedown = function (e) {
    var el = e.target;
    if (el.tagName.toLowerCase() === 'option' && el.parentNode.hasAttribute('multiple')) {
        e.preventDefault();

        // toggle selection
        if (el.hasAttribute('selected')) el.removeAttribute('selected');
        else el.setAttribute('selected', '');

        // hack to correct buggy behavior
        var select = el.parentNode.cloneNode(true);
        el.parentNode.parentNode.replaceChild(select, el.parentNode);
    }
};