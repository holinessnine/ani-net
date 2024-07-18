import React, { useState } from "react";
import ReactDOM from "react-dom";
import Root from "./components/graphRoot";
import Filters from "./components/Filters";
import { FiltersState } from "./types";
import "./App.css";

const App: React.FC = () => {
  const [filtersState, setFiltersState] = useState<FiltersState>({
    clusters: {},
    tags: {},
    years: {},
    ratings: {},
  });

  return (
    <div className="app-container">
      <div className="content-container">
        <Filters />
        <div className="graph-container">
        <Root filtersState={filtersState} setFiltersState={setFiltersState} />;
        </div>
      </div>
    </div>
  );
};

export default App;

ReactDOM.render(<App />, document.getElementById("root"));
