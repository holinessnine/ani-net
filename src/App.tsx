import React, { useState } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Root from "./components/graphRoot";
import Filters from "./components/Filters";
import { FiltersState, FiltersState_c } from "./types";
import "./App.css";

const App: React.FC = () => {
  const [filtersState, setFiltersState] = useState<FiltersState>({
    clusters: {},
    tags: {},
    years: {},
    ratings: {},
  });

  const [filtersState_c, setFiltersState_c] = useState<FiltersState_c>({
    clusters: {},
    tags: {},
    years: {},
    ratings: {},
  });

  return (
    <Router>
      <div className="app-container">
        <div className="content-container">
          <Filters />
          <div className="graph-container">
            <Routes>
              <Route path="/" element={<Root filtersState={filtersState} setFiltersState={setFiltersState} isContributor={false} />} />
              <Route path="/contributors" element={<Root filtersState={filtersState_c} setFiltersState={setFiltersState_c} isContributor={true}/>} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;

ReactDOM.render(<App />, document.getElementById("root"));