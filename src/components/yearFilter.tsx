import React, { useEffect, useState } from 'react';
import { FiltersState, FiltersState_c } from '../types';
import '../styles/yearFilter.css';

interface YearFilterProps {
    filtersState: FiltersState;
    setFiltersState: React.Dispatch<React.SetStateAction<FiltersState>>;
    filtersState_c: FiltersState_c;
    setFiltersState_c: React.Dispatch<React.SetStateAction<FiltersState_c>>;
    nodesData: any[];
}

const YearFilter: React.FC<YearFilterProps> = ({ filtersState, setFiltersState, filtersState_c, setFiltersState_c, nodesData }) => {
    const [yearData, setYearData] = useState<{ year: string, count: number }[]>([]);

    useEffect(() => {
        const yearCounts = nodesData.reduce((acc, node) => {
        acc[node.year] = (acc[node.year] || 0) + 1;
        return acc;
        }, {} as Record<string, number>);

        const formattedYearData = Object.keys(yearCounts).map(year => ({
        year,
        count: yearCounts[year],
        }));

        setYearData(formattedYearData);
    }, [nodesData]);

    const handleBarClick = (year: string) => {
        console.log("선택한 연도: ", year);
        
        
        setFiltersState(prevState => ({
        ...prevState,
        years: {
            ...prevState.years,
            [year]: !prevState.years[year as keyof typeof prevState.years],
        }
        }));
        console.log("필터 연도 값 변경?: ", filtersState);
    };

    const maxCount = Math.max(...yearData.map(data => data.count));
    return (
        <div className="year-filter-container">
        {yearData.map((data) => (
        <div 
          key={data.year} 
          className="histobar-wrapper"
        >
          <div 
            className="histobar" 
            style={{ height: `${(data.count / maxCount) * 100}%` }}  // count에 따라 상대적인 높이를 설정
            onClick={() => handleBarClick(data.year)}
          ></div>
          <span className="histobar-label">{data.year}</span>
        </div>
      ))}
    </div>
  );
};

export default YearFilter;
