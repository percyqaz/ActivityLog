import './App.css';
import React from "react";
import Breakdown from "./Breakdown"

function make_datestamp(date) {
  let stringDate = "" + date;
  let year = stringDate.substring(2, 4);
  let month = stringDate.substring(5, 7);
  let day = stringDate.substring(8, 10);
  return day + "-" + month + "-" + year;
}

function App() {

  const [date, setDate] = React.useState(null);
  const dateInputRef = React.useRef(null);

  return (
    <div className="App">
      <input 
        type="date" 
        onChange={(d) => setDate(make_datestamp(d.target.value))}
        ref={dateInputRef}
      />
      <Breakdown date={date}/>
    </div>
  );
}

export default App;
