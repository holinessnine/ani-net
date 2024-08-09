import React, { useState } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Root from "./components/graphRoot";
import Filters from "./components/Filters";
import YearFilter from "./components/yearFilter";
import { FiltersState, FiltersState_c } from "./types";
import "./App.css";

const App: React.FC = () => {
  const [filtersState, setFiltersState] = useState<FiltersState>({
    clusters: {},
    tags: {},
    years: {
      min: 'Total',
      max: '2024'
    },
    ratings: {},
    
    types: {}, // 필터용으로 추가
    scores: {
      min: 0.0,
      max: 10.0}, // 필터용으로 추가

    // 이원화하여 지울 것
    total_arts: {
      min: 0,
      max: 1053}, // 필터용으로 추가
    favorites: {
      min: 0,
      max: 100000}, // 필터용으로 추가
    /*
    ranks: {
      min: 1,
      max: 2000
    },
    awards: {
      min: 0,
      max: 10000,
    }
    */
  });
  const [edgetype, setEdgetype] = useState<string>('Title');
  const [filtersState_c, setFiltersState_c] = useState<FiltersState_c>({
    clusters: {},
    tags: {},
    years: {
      min: '0',
      max: '2024'
    },
    ratings: {},
    
    // 이원화하여 지울 것
    types: {}, // 필터용으로 추가
    
    total_arts: {
      min: 0,
      max: 1053}, // 필터용으로 추가
    favorites: {
      min: 0,
      max: 54615}, // 필터용으로 추가
    scores: {
      min: 0.0,
      max: 10.0}, // 필터용으로 추가
    
    /*
    ranks: {
      min: 1,
      max: 1899
    },
    awards: {
      min: 0,
      max: 10000,
    }
    */
  });
  const nodesData = [
    { year: '2010', label: 'Node1' },
    { year: '2011', label: 'Node2' },
    { year: '2012', label: 'Node3' },
    { year: '2011', label: 'Node4' },
    { year: '2014', label: 'Node5' },
    { year: '2011', label: 'Node6' },
    { year: '2011', label: 'Node7' },
    { year: '2012', label: 'Node8' },
    { year: '2013', label: 'Node9' },
    { year: '2014', label: 'Node10' },
  ]


  return (
    <Router>
      <div className="app-container">
        <div className="content-container">
         <Filters
            filtersState={filtersState}
            setFiltersState={setFiltersState}
            filtersState_c={filtersState_c}
            setFiltersState_c={setFiltersState_c}
            edgetype={edgetype}
            setEdgetype={setEdgetype}
          />
          <div className="graph-container">
            <Routes>
              <Route path="/" element={<Root filtersState={filtersState} setFiltersState={setFiltersState} isContributor={false} edgetype={edgetype} />} />
              <Route path="/contributors" element={<Root filtersState={filtersState_c} setFiltersState={setFiltersState_c} isContributor={true} edgetype={edgetype}/>} />
            </Routes>
          </div>
        </div>
      </div>
      {/*
      <YearFilter
        filtersState={ filtersState }
        setFiltersState={ setFiltersState }
        filtersState_c={ filtersState_c }
        setFiltersState_c={ setFiltersState_c }
        nodesData={ nodesData }
      />
      */}
      
    </Router>
  );
};

export default App;

ReactDOM.render(<App />, document.getElementById("root"));