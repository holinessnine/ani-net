import React, { useState } from "react";
import { FiltersState, FiltersState_c } from "../types";
import Filters from "./Filters";
import Graph from "graphology";
import { useSigma } from "@react-sigma/core";

interface YearFilterProps {
    filtersState: FiltersState;
    setFiltersState: React.Dispatch<React.SetStateAction<FiltersState>>;
    filtersState_c: FiltersState_c;
    setFiltersState_c: React.Dispatch<React.SetStateAction<FiltersState_c>>;
}

const YearFilter: React.FC<YearFilterProps> = ({ filtersState, setFiltersState, filtersState_c, setFiltersState_c }) => {

    const [yearData, setYearData] = useState<{ year: string, count: number }[]>([]);

    return (
        <div className="year-filter-container">
          <h2>
            This is a section for year-filter
          </h2>
        </div>
      );
};

export default YearFilter;