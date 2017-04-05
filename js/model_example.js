/**
 * Created by Ziyu Cheng on 1/24/17.
 */

var OrganizationComponent = {
    create: function (id, name, desc, skills, ext_q, acp_q, wrk_q, indicators) {
        var oc = {};
        oc.name = name;
        oc.description = desc;
        oc.id = id;
        oc.skills = skills.slice(0);
        oc.external_queue = ext_q.slice(0);
        oc.accepted_queue = acp_q.slice(0);
        oc.working_queue = wrk_q.slice(0);
        // oc.indicators = new Object(indicators);
        oc.indicators = JSON.parse(JSON.stringify(indicators));
        return oc;
    },
    clone: function (src) {
        // var copy = {};
        // copy.name = src.name;
        // copy.description = src.description;
        // copy.id = src.id;
        // copy.skills = src.skills.concat();
        // copy.accepted_queue = src.accepted_queue.concat();
        // copy.working_queue = src.working_queue.concat();
        // copy.indicators = new Object(src.indicators);
        // return copy;
        return JSON.parse(JSON.stringify(src));
    }

};

var Work_Item = {
    create: function (id, name, type, description, size, skills, assigned_to, indicators, children) {
        var wi = {};
        wi.id = id;
        wi.name = name;
        wi.type = type;
        wi.description = description;
        wi.size = size.concat();
        wi.skills = skills.concat();
        wi.assigned_to = assigned_to;
        wi.indicators = JSON.parse(JSON.stringify(indicators));
        wi.children = children;

        return wi;
    },
    clone: function (src) {
        // var copy = {};
        // copy.id = src.id;
        // copy.name = src.name;
        // copy.type = src.type;
        // copy.description = src.description;
        // copy.size = src.size.concat();
        // copy.skills = src.skills.concat();
        // copy.assigned_to = src.assigned_to;
        // copy.indicators = new Object(src.indicators);
        // copy.children = src.children.concat();
        // return copy;
        return JSON.parse(JSON.stringify(src));
    }
};

var Work_Event = {
    create: function (src_id, dst_id, wi_id, event_type, description, indicators) {
        var evt = {};
        evt.src_oc_id = src_id;
        evt.dst_oc_id = dst_id;
        evt.work_item_id = wi_id;
        evt.type = event_type;
        evt.description = description;
        evt.indicators = JSON.parse(JSON.stringify(indicators));
        return evt;
    },
    clone: function (src) {
        // var copy = {};
        // copy.src_oc_id = src.src_oc_id;
        // copy.dst_oc_id = src.dst_oc_id;
        // copy.work_item_id = src.work_item_id;
        // copy.type = src.type;
        // copy.description = src.description;
        // copy.indicators = new Object(src.indicators);
        // return copy;
        return (JSON.parse(JSON.stringify(src)));
    }
};

var oc_a = OrganizationComponent.create(1, "Tom", "Java Software Engineer",
    [{"name": "Java", "proficiency": 1.1}, {"name": "C++", "proficiency": 1.5}], [], [], [],
    {"wip": 15, "done": 3, "work load": 6});

var oc_b = OrganizationComponent.create(2, "Mobile Team", "This is Mobile Team",
    [{"name": "C#", "proficiency": 3.0}, {"name": "C", "proficiency": 2.0}], [], [], [],
    {"wip": 10, "done": 10, "work load": 10});

var oc_c = OrganizationComponent.create(3, "Server Team", "This is Mobile Team",
    [{"name": "Java", "proficiency": 2.0}], [], [], [], {"wip": 22, "done": 3, "work load": 4});


var capability_a = Work_Item.create("101", "Capability 1", "capability", "this is capability 1", [20, 5], ["Java", "C"], "", {
    "completeness": 0.0,
    "value": 5.0
}, ["151"]);
var capability_b = Work_Item.create("102", "Capability 2", "capability", "this is capability 2", [10, 3], ["C#"], "", {
    "completeness": 0.0,
    "value": 5.0
}, ["152", "153"]);

var requirement_a = Work_Item.create("151", "requirement 1", "requirement", "this is requirement 1", [10, 3], ["C#"], "", {
    "completeness": 0.0,
    "value": 10.0
}, ["201", "202"]);
var requirement_b = Work_Item.create("152", "requirement 2", "requirement", "this is requirement 2", [5, 1], ["C#"], "", {
    "completeness": 0.0,
    "value": 10.0
}, ["202", "203"]);
var requirement_c = Work_Item.create("153", "requirement 3", "requirement", "this is requirement 3", [10, 5], ["C#"], "", {
    "completeness": 0.1,
    "value": 15.0
}, ["202", "203", "204"]);


var task_a = Work_Item.create("201", "task 1", "task", "this is task 1", [10, 3], ["Java"], "", {
    "completeness": 0.0,
    "value": 20.0
}, []);
var task_b = Work_Item.create("202", "task 2", "task", "this is task 2", [10, 3], ["JavaScript"], "", {
    "completeness": 0.0,
    "value": 20.0
}, []);
var task_c = Work_Item.create("203", "task 3", "task", "this is task 3", [10, 3], ["C#"], "", {
    "completeness": 0.0,
    "value": 20.0
}, []);
var task_d = Work_Item.create("204", "task 4", "task", "this is task 4", [10, 3], ["C#"], "", {
    "completeness": 0.0,
    "value": 10.0
}, []);


oc_a.accepted_queue.push(201);
oc_a.working_queue.push(202);
oc_b.accepted_queue.push(203);
oc_c.external_queue.push(204);

var event_1_2 = Work_Event.create("1", "2", "201", "WI Delegation", "first event.", {});
var event_2 = Work_Event.create("2", "", "201", "Work Started", "OC-2 started on WI-201", {});
var event_2_1 = Work_Event.create("2", "1", "202", "WI Delegation", "OC-2 delegated WI-202 to OC-1", {});
var event_1 = Work_Event.create("1", "", "201", "WI Completed", "OC-2 finished WI-201", {});
var event_3 = Work_Event.create("3", "", "201", "WI Completed", "OC-2 finished WI-201", {});
var event_1_3 = Work_Event.create("1", "3", "202", "WI Delegation", "OC-2 delegated WI-202 to OC-1", {});
var event_3_1 = Work_Event.create("3", "1", "202", "WI Delegation", "OC-2 delegated WI-202 to OC-1", {});
var event_2_3 = Work_Event.create("2", "3", "202", "WI Delegation", "OC-2 delegated WI-202 to OC-1", {});
var event_3_2 = Work_Event.create("3", "2", "202", "WI Delegation", "OC-2 delegated WI-202 to OC-1", {});


/************************ Frame 0 ************************/
oc_a.indicators = {"wip": 4, "done": 0, "work load": 4};
oc_b.indicators = {"wip": 3, "done": 0, "work load": 3};
oc_c.indicators = {"wip": 2, "done": 0, "work load": 2};

capability_a.indicators.completeness = 0.0;
capability_b.indicators.completeness = 0.0;
requirement_a.indicators.completeness = 0.0;
requirement_b.indicators.completeness = 0.0;
requirement_c.indicators.completeness = 0.0;
task_a.indicators.completeness = 0.0;
task_b.indicators.completeness = 0.0;
task_c.indicators.completeness = 0.0;
task_d.indicators.completeness = 0.0;

frames = [
    {
        "organization_components": {
            1: OrganizationComponent.clone(oc_a),
            2: OrganizationComponent.clone(oc_b),
            3: OrganizationComponent.clone(oc_c)
        },
        "work_items": {
            101: Work_Item.clone(capability_a),
            102: Work_Item.clone(capability_b),
            151: Work_Item.clone(requirement_a),
            152: Work_Item.clone(requirement_b),
            153: Work_Item.clone(requirement_c),
            201: Work_Item.clone(task_a),
            202: Work_Item.clone(task_b),
            203: Work_Item.clone(task_c),
            204: Work_Item.clone(task_d)
        },
        "events": [event_1_2, event_1_2, event_1_2, event_2_1, event_2, event_1],
        "aggregating_indicators": {"wip": 10, "done": 2}
    }
];

/************************ Frame 1 ************************/
oc_a.indicators = {"wip": 2, "done": 4, "work load": 2};
oc_b.indicators = {"wip": 2, "done": 3, "work load": 2};
oc_c.indicators = {"wip": 2, "done": 2, "work load": 2};

capability_a.indicators.completeness = 0.15;
capability_b.indicators.completeness = 0.12;
requirement_a.indicators.completeness = 0.25;
requirement_b.indicators.completeness = 0.20;
requirement_c.indicators.completeness = 0.15;
task_a.indicators.completeness = 0.4;
task_b.indicators.completeness = 0.5;
task_c.indicators.completeness = 0.2;
task_d.indicators.completeness = 0.2;

frames.push({
    "organization_components": {
        1: OrganizationComponent.clone(oc_a),
        2: OrganizationComponent.clone(oc_b),
        3: OrganizationComponent.clone(oc_c)
    },
    "work_items": {
        101: Work_Item.clone(capability_a),
        102: Work_Item.clone(capability_b),
        151: Work_Item.clone(requirement_a),
        152: Work_Item.clone(requirement_b),
        153: Work_Item.clone(requirement_c),
        201: Work_Item.clone(task_a),
        202: Work_Item.clone(task_b),
        203: Work_Item.clone(task_c),
        204: Work_Item.clone(task_d)
    },
    "events": [event_3_1, event_3_1, event_1_3, event_1_2, event_2_1],
    "aggregating_indicators": {"wip": 8, "done": 4}
});

/************************ Frame 2 ************************/
oc_a.indicators = {"wip": 7, "done": 6, "work load": 10};
oc_b.indicators = {"wip": 5, "done": 5, "work load": 22};
oc_c.indicators = {"wip": 1, "done": 4, "work load": 1};

capability_a.indicators.completeness = 0.25;
capability_b.indicators.completeness = 0.32;
requirement_a.indicators.completeness = 0.45;
requirement_b.indicators.completeness = 0.3;
requirement_c.indicators.completeness = 0.2;
task_a.indicators.completeness = 0.50;
task_b.indicators.completeness = 0.65;
task_c.indicators.completeness = 0.25;
task_d.indicators.completeness = 0.3;

frames.push({
    "organization_components": {
        1: OrganizationComponent.clone(oc_a),
        2: OrganizationComponent.clone(oc_b),
        3: OrganizationComponent.clone(oc_c)
    },
    "work_items": {
        101: Work_Item.clone(capability_a),
        102: Work_Item.clone(capability_b),
        151: Work_Item.clone(requirement_a),
        152: Work_Item.clone(requirement_b),
        153: Work_Item.clone(requirement_c),
        201: Work_Item.clone(task_a),
        202: Work_Item.clone(task_b),
        203: Work_Item.clone(task_c),
        204: Work_Item.clone(task_d)
    },
    "events": [event_2_1, event_2_1, event_2_1, event_2_1, event_2_1, event_2_1, event_3_1, event_3_1, event_3_1],
    "aggregating_indicators": {"wip": 4, "done": 4}
});

/************************ Frame 3 ************************/

oc_a.indicators = {"wip": 4, "done": 9, "work load": 5};
oc_b.indicators = {"wip": 1, "done": 10, "work load": 2};
oc_c.indicators = {"wip": 2, "done": 5, "work load": 3};

capability_a.indicators.completeness = 0.30;
capability_b.indicators.completeness = 0.45;
requirement_a.indicators.completeness = 0.65;
requirement_b.indicators.completeness = 0.5;
requirement_c.indicators.completeness = 0.4;
task_a.indicators.completeness = 0.60;
task_b.indicators.completeness = 0.65;
task_c.indicators.completeness = 0.35;
task_d.indicators.completeness = 0.35;

frames.push({
    "organization_components": {
        1: OrganizationComponent.clone(oc_a),
        2: OrganizationComponent.clone(oc_b),
        3: OrganizationComponent.clone(oc_c)
    },
    "work_items": {
        101: Work_Item.clone(capability_a),
        102: Work_Item.clone(capability_b),
        151: Work_Item.clone(requirement_a),
        152: Work_Item.clone(requirement_b),
        153: Work_Item.clone(requirement_c),
        201: Work_Item.clone(task_a),
        202: Work_Item.clone(task_b),
        203: Work_Item.clone(task_c),
        204: Work_Item.clone(task_d)
    },
    "events": [event_1],
    "aggregating_indicators": {"wip": 7, "done": 15}
});

/************************ Frame 4 ************************/
oc_a.indicators = {"wip": 4, "done": 9, "work load": 5};
oc_b.indicators = {"wip": 1, "done": 10, "work load": 2};
oc_c.indicators = {"wip": 2, "done": 5, "work load": 3};

capability_a.indicators.completeness = 0.45;
capability_b.indicators.completeness = 0.55;
requirement_a.indicators.completeness = 0.70;
requirement_b.indicators.completeness = 0.6;
requirement_c.indicators.completeness = 0.6;
task_a.indicators.completeness = 0.7;
task_b.indicators.completeness = 0.75;
task_c.indicators.completeness = 0.45;
task_d.indicators.completeness = 0.40;

frames.push({
    "organization_components": {
        1: OrganizationComponent.clone(oc_a),
        2: OrganizationComponent.clone(oc_b),
        3: OrganizationComponent.clone(oc_c)
    },
    "work_items": {
        101: Work_Item.clone(capability_a),
        102: Work_Item.clone(capability_b),
        151: Work_Item.clone(requirement_a),
        152: Work_Item.clone(requirement_b),
        153: Work_Item.clone(requirement_c),
        201: Work_Item.clone(task_a),
        202: Work_Item.clone(task_b),
        203: Work_Item.clone(task_c),
        204: Work_Item.clone(task_d)
    },
    "events": [event_1],
    "aggregating_indicators": {"wip": 7, "done": 15}
});

/************************ Frame 5 ************************/
oc_a.indicators = {"wip": 4, "done": 9, "work load": 5};
oc_b.indicators = {"wip": 1, "done": 10, "work load": 2};
oc_c.indicators = {"wip": 2, "done": 5, "work load": 3};

capability_a.indicators.completeness = 0.45;
capability_b.indicators.completeness = 0.55;
requirement_a.indicators.completeness = 0.70;
requirement_b.indicators.completeness = 0.6;
requirement_c.indicators.completeness = 0.6;
task_a.indicators.completeness = 0.7;
task_b.indicators.completeness = 0.75;
task_c.indicators.completeness = 0.45;
task_d.indicators.completeness = 0.40;

frames.push({
    "organization_components": {
        1: OrganizationComponent.clone(oc_a),
        2: OrganizationComponent.clone(oc_b),
        3: OrganizationComponent.clone(oc_c)
    },
    "work_items": {
        101: Work_Item.clone(capability_a),
        102: Work_Item.clone(capability_b),
        151: Work_Item.clone(requirement_a),
        152: Work_Item.clone(requirement_b),
        153: Work_Item.clone(requirement_c),
        201: Work_Item.clone(task_a),
        202: Work_Item.clone(task_b),
        203: Work_Item.clone(task_c),
        204: Work_Item.clone(task_d)
    },
    "events": [event_1, event_1_2, event_1_3, event_1_2, event_1_3],
    "aggregating_indicators": {"wip": 7, "done": 15}
});

/************************ Frame 6 ************************/
oc_a.indicators = {"wip": 4, "done": 9, "work load": 5};
oc_b.indicators = {"wip": 1, "done": 10, "work load": 2};
oc_c.indicators = {"wip": 2, "done": 5, "work load": 3};

capability_a.indicators.completeness = 0.65;
capability_b.indicators.completeness = 0.70;
requirement_a.indicators.completeness = 0.80;
requirement_b.indicators.completeness = 0.75;
requirement_c.indicators.completeness = 0.7;
task_a.indicators.completeness = 0.8;
task_b.indicators.completeness = 0.85;
task_c.indicators.completeness = 0.60;
task_d.indicators.completeness = 0.65;

frames.push({
    "organization_components": {
        1: OrganizationComponent.clone(oc_a),
        2: OrganizationComponent.clone(oc_b),
        3: OrganizationComponent.clone(oc_c)
    },
    "work_items": {
        101: Work_Item.clone(capability_a),
        102: Work_Item.clone(capability_b),
        151: Work_Item.clone(requirement_a),
        152: Work_Item.clone(requirement_b),
        153: Work_Item.clone(requirement_c),
        201: Work_Item.clone(task_a),
        202: Work_Item.clone(task_b),
        203: Work_Item.clone(task_c),
        204: Work_Item.clone(task_d)
    },
    "events": [event_1, event_2_1, event_2_1, event_2_1, event_1_2, event_1_2],
    "aggregating_indicators": {"wip": 7, "done": 15}
});

/************************ Frame 7 ************************/
oc_a.indicators = {"wip": 4, "done": 9, "work load": 5};
oc_b.indicators = {"wip": 1, "done": 10, "work load": 2};
oc_c.indicators = {"wip": 2, "done": 5, "work load": 3};

capability_a.indicators.completeness = 0.95;
capability_b.indicators.completeness = 0.90;
requirement_a.indicators.completeness = 0.95;
requirement_b.indicators.completeness = 0.9;
requirement_c.indicators.completeness = 0.9;
task_a.indicators.completeness = 0.8;
task_b.indicators.completeness = 0.95;
task_c.indicators.completeness = 0.80;
task_d.indicators.completeness = 0.75;

frames.push({
    "organization_components": {
        1: OrganizationComponent.clone(oc_a),
        2: OrganizationComponent.clone(oc_b),
        3: OrganizationComponent.clone(oc_c)
    },
    "work_items": {
        101: Work_Item.clone(capability_a),
        102: Work_Item.clone(capability_b),
        151: Work_Item.clone(requirement_a),
        152: Work_Item.clone(requirement_b),
        153: Work_Item.clone(requirement_c),
        201: Work_Item.clone(task_a),
        202: Work_Item.clone(task_b),
        203: Work_Item.clone(task_c),
        204: Work_Item.clone(task_d)
    },
    "events": [event_1, event_2, event_3, event_1_2, event_1_3, event_2_1, event_2_3, event_3_2, event_3_1],
    "aggregating_indicators": {"wip": 7, "done": 15}
});

/************************ Frame 8 ************************/
oc_a.indicators = {"wip": 4, "done": 9, "work load": 5};
oc_b.indicators = {"wip": 1, "done": 10, "work load": 2};
oc_c.indicators = {"wip": 2, "done": 5, "work load": 3};

capability_a.indicators.completeness = 1;
capability_b.indicators.completeness = 1;
requirement_a.indicators.completeness = 1;
requirement_b.indicators.completeness = 1;
requirement_c.indicators.completeness = 1;
task_a.indicators.completeness = 1;
task_b.indicators.completeness = 1;
task_c.indicators.completeness = 1;
task_d.indicators.completeness = 1;

frames.push({
    "organization_components": {
        1: OrganizationComponent.clone(oc_a),
        2: OrganizationComponent.clone(oc_b),
        3: OrganizationComponent.clone(oc_c)
    },
    "work_items": {
        101: Work_Item.clone(capability_a),
        102: Work_Item.clone(capability_b),
        151: Work_Item.clone(requirement_a),
        152: Work_Item.clone(requirement_b),
        153: Work_Item.clone(requirement_c),
        201: Work_Item.clone(task_a),
        202: Work_Item.clone(task_b),
        203: Work_Item.clone(task_c),
        204: Work_Item.clone(task_d)
    },
    "events": [event_1],
    "aggregating_indicators": {"wip": 7, "done": 15}
});

/************************ Frame Setting Over ************************/

var basic_info = {
    "exp_name": "Test Exp Name"
};

oc_dictionary = [
    {"name": "wip", "x": "Time", "y": "#", "title": "Work Item In Progress"},
    {"name": "done", "x": "Time", "y": "#", "title": "Completed Work Items"},
    {"name": "work load", "x": "Time", "y": "Load", "title": "Work Load"}
];

oc_model = [
    {
        "oc_id": 101,
        "name": "SE Team",
        "children_ids": [
            111,
            112
        ]
    },
    {
        "oc_id": 102,
        "name": "Security Team",
        "children_ids": [
            113,
            114
        ]
    },
    {
        "oc_id": 111,
        "name": "Team-111",
        "children_ids": [
            121
        ]
    },
    {
        "oc_id": 112,
        "name": "Team-112",
        "children_ids": [
            121, 122
        ]
    },
    {
        "oc_id": 113,
        "name": "Team-113",
        "children_ids": [
            122
        ]
    },
    {
        "oc_id": 114,
        "name": "Team-114",
        "children_ids": [
            122
        ]
    },
    {
        "oc_id": 121,
        "name": "Team-121",
        "children_ids": [
            131
        ]
    },
    {
        "oc_id": 122,
        "name": "Team-122",
        "children_ids": [
            131
        ]
    },
    {
        "oc_id": 131,
        "name": "Team-131",
        "children_ids": [
            141
        ]
    },
    {
        "oc_id": 141,
        "name": "Team-141",
        "children_ids": []
    }
];

work_item_dictionary = [
    {"name": "completeness", "x": "Time", "y": "%", "title": "Completeness"},
    {"name": "value", "x": "Time", "y": "Value", "title": "Value"}
];

event_dictionary = [];

frame_dictionary = [
    {"name": "wip", "x": "Time", "y": "#", "title": "Total # of Work Item in Progress"},
    {"name": "done", "x": "Time", "y": "#", "title": "Total # of Completed Work Items"}
];

data = {
    "basic_info": basic_info,
    "oc_dictionary": oc_dictionary,
    "oc_model": oc_model,
    "work_item_dictionary": work_item_dictionary,
    "event_dictionary": event_dictionary,
    "frame_dictionary": frame_dictionary,
    "frames": frames
};
jstr = JSON.stringify(data);
console.log(jstr);
