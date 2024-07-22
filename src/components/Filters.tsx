import React from "react";
import {useState} from "react";
import { FiltersState, FiltersState_c } from "../types";
import '../styles/Filters.css';
import { useNavigate } from "react-router-dom";

interface FiltersProps {
  filtersState: FiltersState;
  setFiltersState: React.Dispatch<React.SetStateAction<FiltersState>>;
  filtersState_c: FiltersState_c;
  setFiltersState_c: React.Dispatch<React.SetStateAction<FiltersState_c>>;
  onSearch: (filters: FiltersState | FiltersState_c) => void; // 상위 컴포넌트로 상태를 전달하는 함수
}

const Filters: React.FC<FiltersProps> = ({ filtersState, setFiltersState, filtersState_c, setFiltersState_c, onSearch }) => {
  const [selectedGraph, setSelectedGraph] = useState<'animations' | 'studios'>('animations');  
  const navigate = useNavigate(); // useNavigate 훅 사용
  
  const handleGraphToggle = (graph: 'animations' | 'studios') => {
    setSelectedGraph(graph);
    if (graph === 'animations') {
      window.location.assign('/'); // 페이지 새로고침하여 이동
    } else {
      navigate('/contributors');
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, category: keyof FiltersState | keyof FiltersState_c) => {
    const { checked, value } = e.target;
    if (selectedGraph === 'animations') {
      setFiltersState(prevState => ({
        ...prevState,
        [category]: {
          ...prevState[category],
          [value]: checked
        }
      }));
    } else {
      setFiltersState_c(prevState => ({
        ...prevState,
        [category]: {
          ...prevState[category],
          [value]: checked
        }
      }));
    }
  };

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'min' | 'max') => {
    const { value } = e.target;
    if (selectedGraph === 'animations') {
      setFiltersState(prevState => ({
        ...prevState,
        scores: {
          ...prevState.scores,
          [type]: value ? parseFloat(value) : null
        }
      }));
    } else {
      setFiltersState_c(prevState => ({
        ...prevState,
        scores: {
          ...prevState.scores,
          [type]: value ? parseFloat(value) : null
        }
      }));
    }
  };

  const handleSearchClick = () => {
    if (selectedGraph === 'animations') {
      onSearch(filtersState);
    } else {
      onSearch(filtersState_c);
    }
  };
    
    return (
        <aside className="filters-container">
            <img className='logo-img' src={`${process.env.PUBLIC_URL}/images/ANIMENET_LOGO.png`} alt='logo_img'/>
            
            <hr className="border-line"></hr>

            <h4 className="filter-header">Show graph as...</h4>
            <div className="button-group-container">
              <div className="button-group" style={{ marginBottom: '30px' }}>
                <button 
                  className={`button-anime ${selectedGraph === 'animations' ? 'selected' : ''}`} 
                  onClick={() => handleGraphToggle('animations')}>
                    Animations
                </button>
                <button 
                  className={`button-studio ${selectedGraph === 'studios' ? 'selected' : ''}`} 
                  onClick={() => handleGraphToggle('studios')}>
                    Studios
                </button>
              </div>
            </div>
            <hr className="border-line"></hr>
            <h3 className="filter-header">Filters</h3>
            {/* <input type='text' className='search-input' placeholder='Search...'/> */}
            
          {/* Genre 필터 */}
          {selectedGraph === 'animations' ? (
          <>
            <h4 className="filter-header">Genre</h4>
            <div className="checkbox-group">
                <label className="cb"><input type="checkbox" name="genre" value="Action"
                        checked={filtersState.tags['Action'] || false}
                        onChange={(e) => handleCheckboxChange(e, "tags")}/> Action
                </label>
                <label className="cb"><input type="checkbox" name="genre" value="Adventure"
                        checked={filtersState.tags['Adventure'] || false}
                        onChange={(e) => handleCheckboxChange(e, "tags")}/> Adventure
                </label>
                <label className="cb"><input type="checkbox" name="genre" value="Comedy"
                        checked={filtersState.tags['Comedy'] || false}
                        onChange={(e) => handleCheckboxChange(e, "tags")}/> Comedy
                </label>
                <label className="cb"><input type="checkbox" name="genre" value="Fantasy"
                        checked={filtersState.tags['Fantasy'] || false}
                        onChange={(e) => handleCheckboxChange(e, "tags")}/> Fantasy
                </label>
                <label className="cb"><input type="checkbox" name="genre" value="Horror"
                        checked={filtersState.tags['Horror'] || false}
                        onChange={(e) => handleCheckboxChange(e, "tags")}/> Horror
                </label>
                <label className="cb"><input type="checkbox" name="genre" value="Mystery"
                        checked={filtersState.tags['Mystery'] || false}
                        onChange={(e) => handleCheckboxChange(e, "tags")}/> Mystery
                </label>
                <label className="cb"><input type="checkbox" name="genre" value="Romance"
                        checked={filtersState.tags['Romance'] || false}
                        onChange={(e) => handleCheckboxChange(e, "tags")}/> Romance
                </label>
                <label className="cb"><input type="checkbox" name="genre" value="SF"
                        checked={filtersState.tags['SF'] || false}
                        onChange={(e) => handleCheckboxChange(e, "tags")}/> SF
                </label>
                <label className="cb"><input type="checkbox" name="genre" value="Sports"
                        checked={filtersState.tags['Sports'] || false}
                        onChange={(e) => handleCheckboxChange(e, "tags")}/> Sports
                </label>
                <label className="cb"><input type="checkbox" name="genre" value="Suspense"
                        checked={filtersState.tags['Suspense'] || false}
                        onChange={(e) => handleCheckboxChange(e, "tags")}/> Suspense
                </label>
            </div>
            <hr className="border-line"></hr>

          {/* Types 필터 */}
            <h4 className="filter-header">Type</h4>
            <div className="checkbox-group">
                {/* Add your type checkboxes here */}
                <label className="cb"><input type="checkbox" name="type" value="TV"
                        checked={filtersState.types['TV'] || false}
                        onChange={(e) => handleCheckboxChange(e, "types")}/> TV
                </label>
                <label className="cb"><input type="checkbox" name="type" value="OVA"
                        checked={filtersState.types['OVA'] || false}
                        onChange={(e) => handleCheckboxChange(e, "types")}/> OVA
                </label>
                <label className="cb"><input type="checkbox" name="type" value="Movie"
                        checked={filtersState.types['Movie'] || false}
                        onChange={(e) => handleCheckboxChange(e, "types")}/> MOVIE
                </label>
            </div>
            <hr className="border-line"></hr>

          {/* Ratings 필터 */}
            <h4 className="filter-header">Ratings</h4>
            <div className="checkbox-group">
                {/* Add your episode checkboxes here */}
                <label className="cb"><input type="checkbox" name="ratings" value="G - All Ages"
                        checked={filtersState.ratings['G - All Ages'] || false}
                        onChange={(e) => handleCheckboxChange(e, "ratings")}/> G (All ages)
                </label>
                <label className="cb"><input type="checkbox" name="ratings" value="PG - Children"
                        checked={filtersState.ratings['PG - Children'] || false}
                        onChange={(e) => handleCheckboxChange(e, "ratings")}/> PG (Children)
                </label>
                <label className="cb"><input type="checkbox" name="ratings" value="PG-13 - Teens 13 or older"
                        checked={filtersState.ratings['PG-13 - Teens 13 or older'] || false}
                        onChange={(e) => handleCheckboxChange(e, "ratings")}/> PG-13 (Parental Guidance)
                </label>
                <label className="cb"><input type="checkbox" name="ratings" value="R"
                        checked={filtersState.ratings['R'] || false}
                        onChange={(e) => handleCheckboxChange(e, "ratings")}/> R (Teens 13 or older)
                </label>
                <label className="cb"><input type="checkbox" name="ratings" value="R - 17+ (violence & profanity)"
                        checked={filtersState.ratings['R - 17+ (violence & profanity)'] || false}
                        onChange={(e) => handleCheckboxChange(e, "ratings")}/> R-17+ (Violence & Profanity)
                </label>
                <label className="cb"><input type="checkbox" name="ratings" value="R+ - Mild Nudity"
                        checked={filtersState.ratings['R+ - Mild Nudity'] || false}
                        onChange={(e) => handleCheckboxChange(e, "ratings")}/> R+ (Mild nudity)
                </label>
            </div>
            <hr className="border-line"></hr>

          {/* Scores 필터 */}
            <h4 className="filter-header">Score</h4>
            {/* Add your score range filter here */}
            <div className="score-input-container">
              <div className="score-input-group">
                  <label>
                      <input type="number" min="0" max="10" step="0.1" value={filtersState.scores.min || ''} onChange={(e) => handleScoreChange(e, 'min')} />
                  </label>
                  <label> ~ </label>
                  <label>
                      <input type="number" min="0" max="10" step="0.1" value={filtersState.scores.max || ''} onChange={(e) => handleScoreChange(e, 'max')} />
                  </label>
              </div>
            </div>
          </>
          ):(
          <div className="studio-components">
          {/* Clusters 필터 */} 
            <h4 className="filter-header">Clusters</h4>
            <div className="checkbox-group">
                {/* Add your type checkboxes here */}
                <label className="cb"><input type="checkbox" name="cluster" value="producer"
                        checked={filtersState.clusters['producer'] || false}
                        onChange={(e) => handleCheckboxChange(e, "clusters")}/> Producer
                </label>
                <label className="cb"><input type="checkbox" name="type" value="licensor"
                        checked={filtersState.clusters['licensor'] || false}
                        onChange={(e) => handleCheckboxChange(e, "types")}/> Licensor
                </label>
                <label className="cb"><input type="checkbox" name="type" value="studio"
                        checked={filtersState.clusters['studio'] || false}
                        onChange={(e) => handleCheckboxChange(e, "types")}/> Studio
                </label>
            </div>
            <hr className="border-line"></hr>
          
          {/* total arts 필터 */}
            <h4 className="filter-header">Number of Arts</h4>
            {/* Add your score range filter here */}
            <div className="score-input-container">
              <div className="score-input-group">
                  <label>
                      <input type="number" min="0" max="10000" step="1" value={filtersState_c.total_arts.min || ''} onChange={(e) => handleScoreChange(e, 'min')} />
                  </label>
                  <label> ~ </label>
                  <label>
                      <input type="number" min="0" max="10000" step="1" value={filtersState_c.total_arts.max || ''} onChange={(e) => handleScoreChange(e, 'max')} />
                  </label>
              </div>
            </div>
          
          {/* Avg favorites 필터 */}
            <h4 className="filter-header">Favorites</h4>
              {/* Add your score range filter here */}
              <div className="score-input-container">
                <div className="score-input-group">
                    <label>
                        <input type="number" min="0" max="10000" step="1" value={filtersState_c.favorites.min || ''} onChange={(e) => handleScoreChange(e, 'min')} />
                    </label>
                    <label> ~ </label>
                    <label>
                        <input type="number" min="0" max="10000" step="1" value={filtersState_c.favorites.max || ''} onChange={(e) => handleScoreChange(e, 'max')} />
                    </label>
                </div>
              </div>

          {/* Avg Scores 필터 */}
            <h4 className="filter-header">Score</h4>
              {/* Add your score range filter here */}
              <div className="score-input-container">
                <div className="score-input-group">
                    <label>
                        <input type="number" min="0" max="10" step="0.1" value={filtersState_c.scores.min || ''} onChange={(e) => handleScoreChange(e, 'min')} />
                    </label>
                    <label> ~ </label>
                    <label>
                        <input type="number" min="0" max="10" step="0.1" value={filtersState_c.scores.max || ''} onChange={(e) => handleScoreChange(e, 'max')} />
                    </label>
                </div>
              </div>
            
            </div>)}
          
          {/* 공통: 검색 버튼 */}
            <button className='search-button' onClick={handleSearchClick}>Search</button>
        </aside>
    )
};

export default Filters;
