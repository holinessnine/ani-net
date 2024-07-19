import React, { useState } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
    <Router>
      <div className="app-container">
        <div className="content-container">
          <Filters />
          <div className="graph-container">
            <Routes>
              <Route path="/" element={<Root filtersState={filtersState} setFiltersState={setFiltersState} isContributor={false} />} />
              <Route path="/contributors" element={<Root filtersState={filtersState} setFiltersState={setFiltersState} isContributor={true}/>} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;

ReactDOM.render(<App />, document.getElementById("root"));