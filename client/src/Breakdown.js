import React from "react";

function Activity(props) {
    return (
        <div>
            <h3>{props.title} - {props.activity.timeInSeconds}s</h3>
            <ul>
                {Object.keys(props.activity.subActivities)
                    .map(name => 
                        <li>
                            <Activity title={name} activity={props.activity.subActivities[name]} />
                        </li>
                    )
                }
            </ul>
        </div>
    );
}

function Breakdown() {
    const [data, setData] = React.useState(null);

    React.useEffect(() => {
        fetch("/api/day_stats")
            .then(res => res.json())
            .then(data => { console.log(data); setData(data) });
    }, []);

    return (
        <div className="Breakdown">
            {!data
                ? <p>Loading..</p>
                : <Activity title="Today's Breakdown" activity={data.breakdown} />
            }
        </div>
    );
}

export default Breakdown;