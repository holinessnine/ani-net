import React from "react";
import ReactDOM from "react-dom";
import Root from "./components/graphRoot";
import Filters from "./components/Filters";
import "./App.css";

const App: React.FC = () => {
  return (
    <div className="app-container">
      <div className="content-container">
        <Filters />
        <div className="graph-container">
          <Root />
        </div>
      </div>
    </div>
  );
};

export default App;

ReactDOM.render(<App />, document.getElementById("root"));
