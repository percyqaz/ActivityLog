import React from "react";

function format_time(timeInSeconds) {
    let hours = Math.floor(timeInSeconds / 3600);
    let minutes = Math.floor((timeInSeconds % 3600) / 60);
    let seconds = timeInSeconds % 60;

    return (hours ? (hours + "h") : "") 
         + (minutes ? (minutes + "m") : "")
         + (seconds ? (seconds + "s") : "");
}

function Activity(props) {

    const [open, setOpen] = React.useState(false);

    return (
        <div className="Breakdown">
            { Object.keys(props.activity.subActivities).length > 0
                ?   <p className="Breakdown-text" onClick={() => setOpen(o => !o)}>
                        {props.title} ({format_time(props.activity.timeInSeconds)})
                        {
                            open
                                ? <button className="Breakdown-collapse">{"v"}</button>
                                : <button className="Breakdown-collapse">{">"}</button>
                        }
                    </p>
                : <p className="Breakdown-text">{props.title} ({format_time(props.activity.timeInSeconds)})</p>
            }
            {
                open &&
                <div class="Breakdown-container">
                    {Object.keys(props.activity.subActivities)
                        .map(title => { return { title: title, activity: props.activity.subActivities[title] } })
                        .filter(({_, activity}) => activity.timeInSeconds > 10)
                        .sort((a, b) => b.activity.timeInSeconds - a.activity.timeInSeconds)
                        .map(({title, activity}) => 
                            <Activity title={title} activity={activity} />
                        )
                    }
                </div>
            }
        </div>
    );
}

function Breakdown({ date }) {
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        setLoading(true);
        fetch(date ? "/api/day_stats?date=" + date : "api/day_stats")
            .then(res => res.json())
            .then(data => { setData(data); setLoading(false); });
    }, [date]);

    return (
        <div className="Breakdown">
            {loading
                ? <p>Loading..</p>
                : <Activity title={date ? "Breakdown for " + date : "Today's Breakdown"} activity={data.breakdown} />
            }
        </div>
    );
}

export default Breakdown;