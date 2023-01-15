import express, {Request, Response} from 'express';
import path from 'path'
import fs from 'fs';
import moment, { Moment } from 'moment';

const app = express();

type RawActivity = {
    timestamp: Moment,
    activity: string
}

type Activity = string[]

// For future features :)
type TimelineActivity = {
    timestamp: Moment,
    activity: Activity
}

type ActivityBreakdown = {
    timeInSeconds: number,
    subActivities: { [k: string] : ActivityBreakdown }
}

function categorise_activity(activity: string) : Activity {

    let unknown = "unknown";

    function prefix_suffix(separator: string, input: string,
        if_suffixed: (pre: string, post: string) => Activity, 
        if_not_suffixed: (original: string) => Activity) 
    {
        let i = input.lastIndexOf(separator);
        if (i < 0) { return if_not_suffixed(input); }
        let prefix = input.substring(0, i);
        let postfix = input.substring(i + separator.length);
        return if_suffixed(prefix, postfix);
    }

    function expect_suffix(separator: string, expected_suffix: string, input: string,
        if_prefixed: (pre: string) => Activity,
        if_not_prefixed: () => Activity) {
        return prefix_suffix(separator, input,
            (pre, post) => { 
                if (post !== expected_suffix) { 
                    console.log("Expected suffix '" + expected_suffix + "' but got '" + post + "'");
                }
                return if_prefixed(pre);
            },
            (post) => {
                if (post !== expected_suffix) {
                    console.log("Expected suffix '" + expected_suffix + "' but got (alone) '" + post + "'");
                }
                return if_not_prefixed();
            }
        );
    }

    if (activity.endsWith("Microsoft Visual Studio")) {
        return expect_suffix(" - ", "Microsoft Visual Studio", activity,
            (project) => [project, "Visual Studio"],
            () => [unknown, "Visual Studio"]
        );
    }
    else if (activity.endsWith("Microsoft Visual Studio Debug Console")) {
        return ["Debug Console", "Visual Studio"];
    }

    else if (activity.endsWith("Visual Studio Code")) {
        return expect_suffix(" - ", "Visual Studio Code", activity,
            (project) => prefix_suffix(" - ", project,
                (_, project_name) => [project_name, "Visual Studio Code"],
                (project_name) => [project_name, "Visual Studio Code"]),
            () => [unknown, "Visual Studio Code"])
    }

    else if (activity.includes("20 Minute Guided Meditation for Focus")) {
        return ["Meditation"];
    }

    else if (activity.endsWith("Google Chrome")) {
        return expect_suffix(" - ", "Google Chrome", activity,
            (page) => {
                if (page.endsWith("YouTube")) {
                    return expect_suffix(" - ", "YouTube", page,
                        (video) => {
                            if (video.includes("#shorts")) {
                                return ["#shorts", "YouTube", "Google Chrome"];
                            }
                            return [video, "YouTube", "Google Chrome"];
                        },
                        () => [unknown, "YouTube", "Google Chrome"]);
                }

                else if (page.endsWith("Gmail")) {
                    return expect_suffix(" - ", "Gmail", page,
                        (inbox) => [inbox, "Gmail", "Google Chrome"],
                        () => [unknown, "Gmail", "Google Chrome"]);
                }
                
                else if (page.includes(" Watch cartoons online, ")) {
                    return prefix_suffix(" | ", page,
                        (cartoon, _) => [cartoon, "Wcostream", "Google Chrome"],
                        (_) => [unknown, "Wcostream", "Google Chrome"]);
                }

                else if (page.endsWith("pixiv") || page.includes("[pixiv]")) {
                    return ["pixiv", "Google Chrome"];
                }

                return [page, "Google Chrome"]
            },
            () => [unknown, "Google Chrome"])
    }

    else if (activity === "Azur Machine") {
        return ["Azur Lane"]
    }

    else if (activity.endsWith("Discord")) {
        return expect_suffix(" - ", "Discord", activity,
            (guild) => prefix_suffix(" | ", guild,
                (channel, guild) => [channel, guild, "Discord"],
                (page) => [page, "Discord"]),
            () => [unknown, "Discord"]);
    }

    else if (activity.endsWith("Notepad++")) {
        return expect_suffix(" - ", "Notepad++", activity,
            (file) => [file.replace('*', ''), "Notepad++"],
            () => [unknown, "Notepad++"]);
    }

    else if (activity.endsWith("SynergyDesk")) { return ["Work"]; }

    else if (activity.includes("Obsidian v1.")) {
        return prefix_suffix(" - ", activity,
            (obsidian, _) => prefix_suffix(" - ", obsidian,
                (page, vault) => [page, vault, "Obsidian"],
                (vault) => [unknown, vault, "Obsidian"]),
            (_) => [unknown, "Obsidian"])
    }

    else if (activity === "Cobalt") { return ["Cobalt", "Game"]; }
    else if (activity === "Phasmophobia") { return ["Phasmophobia", "Game"]; }
    else if (activity === "Interlude") { return ["Interlude", "Game"]; }
    else if (activity.startsWith("osu!")) { return ["osu!", "Game"]; }
    else if (activity.startsWith("Terraria")) { return ["Terraria", "Game"]; }
    else if (activity.startsWith("ELDEN RING")) { return ["ELDEN RING", "Game"]; }
    else if (activity.startsWith("Minecraft")) { return ["Minecraft", "Game"]; }

    else if (activity.trim() === "" || activity === "Windows Default Lock Screen" || activity === "Program Manager") {
        return ["Idle"];
    }

    return [unknown];
}

function get_lines_matching_date(begin: Moment, end: Moment) : RawActivity[] {
    let lines = fs.readFileSync("C:/users/percy/desktop/ahk/activity_log.txt", "utf-8").split("\r\n");

    const output : RawActivity[] = []

    for (var i = 0; i < lines.length; i++) {
        let line = lines[i];
        let [datetime, activity] = line.split("\t", 2);
        let parsed_ts = moment(datetime, "DD-MM-YY HH:mm", true);

        if (parsed_ts.isBetween(begin, end, "minute", "[]")) {
            output[output.length] = { timestamp: parsed_ts, activity: activity };
        }

    }

    return output;
}

app.get('/api/day_stats', (req: Request, res: Response) => {

    // Date parsing
    let date : string;
    if (req.query.hasOwnProperty("date")) {
        if (typeof req.query.date !== "string") {
            res.status(400).send("Please provide date as a string");
            return;
        }
        if (!moment(req.query.date, "DD-MM-YY", true).isValid()) {
            res.status(400).send("Please provide a valid date string");
            return;
        }
        date = req.query.date;
    }
    else {
        date = moment().startOf("day").format("DD-MM-YY");
    }

    // Line finding
    const activities = get_lines_matching_date(
        moment(date, "DD-MM-YY", true).startOf("day"),
        moment(date, "DD-MM-YY", true).endOf("day")
        );

    // Build breakdown
    const breakdown : ActivityBreakdown = { timeInSeconds: 0, subActivities: {} };

    function add_to_breakdown(root: ActivityBreakdown, activity: Activity) {
        root.timeInSeconds += 10;

        if (activity.length === 0) { return; }

        let category = activity[activity.length - 1];

        if (!root.subActivities.hasOwnProperty(category)) {
            root.subActivities[category] = { timeInSeconds: 0, subActivities: {} };
        }

        add_to_breakdown(root.subActivities[category], activity.slice(0, activity.length - 1));
    }

    activities.forEach( a => {
        let categorised = categorise_activity(a.activity);
        add_to_breakdown(breakdown, categorised);
    })

    res.json({date: date, breakdown: breakdown});
})

app.use(express.static(path.resolve(__dirname, "../../client/build")));
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../client/build', 'index.html'));
  });

const port = process.env.PORT || 8080;
app.listen(port, () => { 
    console.log("Server running");
});