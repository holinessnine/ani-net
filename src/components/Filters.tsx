import React, { useEffect, useState } from "react";
import { FiltersState as FiltersStateType, FiltersState_c as FiltersState_cType } from "../types";
import '../styles/Filters.css';
import { useNavigate } from "react-router-dom";

interface FiltersProps {
  filtersState: FiltersStateType;
  setFiltersState: React.Dispatch<React.SetStateAction<FiltersStateType>>;
  filtersState_c: FiltersState_cType;
  setFiltersState_c: React.Dispatch<React.SetStateAction<FiltersState_cType>>;
  onSearch: (filters: FiltersStateType | FiltersState_cType) => void;
  edgetype: string;
  setEdgetype: React.Dispatch<React.SetStateAction<string>>;
}

const Filters: React.FC<FiltersProps> = ({ filtersState, setFiltersState, filtersState_c, setFiltersState_c, onSearch, edgetype, setEdgetype }) => {
  const [selectedGraph, setSelectedGraph] = useState<'animations' | 'studios'>('animations');
  const navigate = useNavigate();
  const [selectedAnimationButton, setSelectedAnimationButton] = useState<string>('Title');
  const [selectedStudioButton, setSelectedStudioButton] = useState<string>('Genre');

  useEffect(() => {
    if (selectedGraph === 'animations') {
      setSelectedAnimationButton('Title');
      setEdgetype('Title');
      setFiltersState({
        tags: {
          genre_action: true,
          genre_adventure: true,
          genre_comedy: true,
          genre_drama: true,
          genre_fantasy: true,
          genre_horror: true,
          genre_mystery: true,
          genre_romance: true,
          genre_sf: true,
          genre_sports: true,
          genre_suspense: true,
        },
        types: {
          TV: true,
          OVA: true,
          Movie: true,
        },
        ratings: {
          'G - All Ages': true,
          'PG - Children': true,
          'PG-13 - Teens 13 or older': true,
          R: true,
          'R - 17+ (violence & profanity)': true,
          'R+ - Mild Nudity': true,
        },
        scores: {
          min: null,
          max: null,
        },
        clusters: {},
        years: {},
        favorites: { min: null, max: null },
        total_arts: { min: null, max: null },
      });
      console.log("필터 초기화된 세팅: ", filtersState)
    } else {
      setSelectedStudioButton('Genre');
      setEdgetype('Genre');
      setFiltersState_c({
        clusters: {
          producer: true,
          licensor: true,
          studio: true,
        },
        total_arts: {
          min: null,
          max: null,
        },
        favorites: {
          min: null,
          max: null,
        },
        scores: {
          min: null,
          max: null,
        },
        tags: {},
        types: {},
        ratings: {},
        years: {},
      });
      console.log("필터 초기화된 세팅: ", filtersState_c)
    }
  }, [selectedGraph, setFiltersState, setFiltersState_c, setEdgetype]);

  const handleGraphToggle = (graph: 'animations' | 'studios') => {
    setSelectedGraph(graph);
    if (graph === 'animations') {
      window.location.assign('/'); // 페이지 새로고침하여 이동
    } else {
      navigate('/contributors');
    }
  };

  const handleAnimationButtonClick = (button: string) => {
    setSelectedAnimationButton(button);
    setEdgetype(button);
  };

  const handleStudioButtonClick = (button: string) => {
    setSelectedStudioButton(button);
    setEdgetype(button);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, category: keyof FiltersStateType | keyof FiltersState_cType) => {
    const { checked, value } = e.target;
    if (selectedGraph === 'animations') {
      setFiltersState(prevState => ({
        ...prevState,
        [category]: {
          ...prevState[category],
          [value]: checked,
        }
      }));
    } else {
      setFiltersState_c(prevState => ({
        ...prevState,
        [category]: {
          ...prevState[category],
          [value]: checked,
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
          [type]: value ? parseFloat(value) : null,
        }
      }));
    } else {
      setFiltersState_c(prevState => ({
        ...prevState,
        scores: {
          ...prevState.scores,
          [type]: value ? parseFloat(value) : null,
        }
      }));
    }
  };

  const handleSearchClick = () => {
    if (selectedGraph === 'animations') {
      const updatedTags = { ...filtersState.tags };
      const allFalseTags = Object.keys(updatedTags).every(key => !updatedTags[key]);
      if (allFalseTags) {
        Object.keys(updatedTags).forEach(key => {
          updatedTags[key] = true;
        });
      }
      onSearch({ ...filtersState, tags: updatedTags });
    } else {
      onSearch(filtersState_c);
    }
  };

  return (
    <aside className="filters-container">
      <img className='logo-img' src={`${process.env.PUBLIC_URL}/images/MOE_LOGO.png`} alt='logo_img'/>
      
      <hr className="border-line"></hr>

      <h4 className="filter-header" style={{ marginBottom: '10px' }}>Show graph as...</h4>
      <div className="button-group-container">
        <div className="button-group" style={{ marginBottom: '20px' }}>
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
      <h4 className="filter-header" style={{ marginBottom: '10px' }}>Select edge type</h4>
      <div className="button-group-container" style={{ marginBottom: '20px' }}>
        {selectedGraph === 'animations' ? (
          <>
            <div className="button-row">
              <button 
                className={`button-toggle ${selectedAnimationButton === 'Title' ? 'selected-toggle' : ''}`} 
                onClick={() => handleAnimationButtonClick('Title')}>
                  Title
              </button>
              <button 
                className={`button-toggle ${selectedAnimationButton === 'Synopsis' ? 'selected-toggle' : ''}`} 
                onClick={() => handleAnimationButtonClick('Synopsis')}>
                  Synopsis
              </button>
            </div>
            <div className="button-row">
              <button 
                className={`button-toggle ${selectedAnimationButton === 'Contributor' ? 'selected-toggle' : ''}`} 
                onClick={() => handleAnimationButtonClick('Contributor')}>
                  Contributor
              </button>
              <button 
                className={`button-toggle ${selectedAnimationButton === 'Genre' ? 'selected-toggle' : ''}`} 
                onClick={() => handleAnimationButtonClick('Genre')}>
                  Genre
              </button>
            </div>
          </>
        ) : (
          <div className="button-row">
            <button 
              className={`button-toggle ${selectedStudioButton === 'Genre' ? 'selected-toggle' : ''}`} 
              onClick={() => handleStudioButtonClick('Genre')}>
                Genre
            </button>
            <button 
              className={`button-toggle ${selectedStudioButton === 'Cowork' ? 'selected-toggle' : ''}`} 
              onClick={() => handleStudioButtonClick('Cowork')}>
                Cowork
            </button>
          </div>
        )}
      </div>
      <hr className="border-line"></hr>
      <h3 className="filter-header">Filters</h3>
      
      {selectedGraph === 'animations' ? (
        <>
          <h4 className="filter-header">Genre</h4>
          <div className="checkbox-group">
              <label className="cb"><input type="checkbox" name="genre" value="genre_action"
                      checked={filtersState.tags['genre_action']}
                      onChange={(e) => handleCheckboxChange(e, "tags")}/> Action
              </label>
              <label className="cb"><input type="checkbox" name="genre" value="genre_adventure"
                      checked={filtersState.tags['genre_adventure']}
                      onChange={(e) => handleCheckboxChange(e, "tags")}/> Adventure
              </label>
              <label className="cb"><input type="checkbox" name="genre" value="genre_comedy"
                      checked={filtersState.tags['genre_comedy']}
                      onChange={(e) => handleCheckboxChange(e, "tags")}/> Comedy
              </label>
              <label className="cb"><input type="checkbox" name="genre" value="genre_drama"
                      checked={filtersState.tags['genre_drama']}
                      onChange={(e) => handleCheckboxChange(e, "tags")}/> Drama
              </label>
              <label className="cb"><input type="checkbox" name="genre" value="genre_fantasy"
                      checked={filtersState.tags['genre_fantasy']}
                      onChange={(e) => handleCheckboxChange(e, "tags")}/> Fantasy
              </label>
              <label className="cb"><input type="checkbox" name="genre" value="genre_horror"
                      checked={filtersState.tags['genre_horror']}
                      onChange={(e) => handleCheckboxChange(e, "tags")}/> Horror
              </label>
              <label className="cb"><input type="checkbox" name="genre" value="genre_mystery"
                      checked={filtersState.tags['genre_mystery']}
                      onChange={(e) => handleCheckboxChange(e, "tags")}/> Mystery
              </label>
              <label className="cb"><input type="checkbox" name="genre" value="genre_romance"
                      checked={filtersState.tags['genre_romance']}
                      onChange={(e) => handleCheckboxChange(e, "tags")}/> Romance
              </label>
              <label className="cb"><input type="checkbox" name="genre" value="genre_sf"
                      checked={filtersState.tags['genre_sf']}
                      onChange={(e) => handleCheckboxChange(e, "tags")}/> SF
              </label>
              <label className="cb"><input type="checkbox" name="genre" value="genre_sports"
                      checked={filtersState.tags['genre_sports']}
                      onChange={(e) => handleCheckboxChange(e, "tags")}/> Sports
              </label>
              <label className="cb"><input type="checkbox" name="genre" value="genre_suspense"
                      checked={filtersState.tags['genre_suspense']}
                      onChange={(e) => handleCheckboxChange(e, "tags")}/> Suspense
              </label>
          </div>
          <hr className="border-line"></hr>

          <h4 className="filter-header">Type</h4>
          <div className="checkbox-group">
              <label className="cb"><input type="checkbox" name="type" value="TV"
                      checked={filtersState.types['TV']}
                      onChange={(e) => handleCheckboxChange(e, "types")}/> TV
              </label>
              <label className="cb"><input type="checkbox" name="type" value="OVA"
                      checked={filtersState.types['OVA']}
                      onChange={(e) => handleCheckboxChange(e, "types")}/> OVA
              </label>
              <label className="cb"><input type="checkbox" name="type" value="Movie"
                      checked={filtersState.types['Movie']}
                      onChange={(e) => handleCheckboxChange(e, "types")}/> MOVIE
              </label>
          </div>
          <hr className="border-line"></hr>

          <h4 className="filter-header">Ratings</h4>
          <div className="checkbox-group">
              <label className="cb"><input type="checkbox" name="ratings" value="G - All Ages"
                      checked={filtersState.ratings['G - All Ages']}
                      onChange={(e) => handleCheckboxChange(e, "ratings")}/> G (All ages)
              </label>
              <label className="cb"><input type="checkbox" name="ratings" value="PG - Children"
                      checked={filtersState.ratings['PG - Children']}
                      onChange={(e) => handleCheckboxChange(e, "ratings")}/> PG (Children)
              </label>
              <label className="cb"><input type="checkbox" name="ratings" value="PG-13 - Teens 13 or older"
                      checked={filtersState.ratings['PG-13 - Teens 13 or older']}
                      onChange={(e) => handleCheckboxChange(e, "ratings")}/> PG-13 (Parental Guidance)
              </label>
              <label className="cb"><input type="checkbox" name="ratings" value="R"
                      checked={filtersState.ratings['R']}
                      onChange={(e) => handleCheckboxChange(e, "ratings")}/> R (Teens 13 or older)
              </label>
              <label className="cb"><input type="checkbox" name="ratings" value="R - 17+ (violence & profanity)"
                      checked={filtersState.ratings['R - 17+ (violence & profanity)']}
                      onChange={(e) => handleCheckboxChange(e, "ratings")}/> R-17+ (Violence & Profanity)
              </label>
              <label className="cb"><input type="checkbox" name="ratings" value="R+ - Mild Nudity"
                      checked={filtersState.ratings['R+ - Mild Nudity']}
                      onChange={(e) => handleCheckboxChange(e, "ratings")}/> R+ (Mild nudity)
              </label>
          </div>
          <hr className="border-line"></hr>

          <h4 className="filter-header">Score</h4>
          <div className="score-input-container">
            <div className="score-input-group">
                <label>
                    <input type="number" min="0" max="10" step="0.1" value={filtersState.scores.min ?? ''} onChange={(e) => handleScoreChange(e, 'min')} />
                </label>
                <label> ~ </label>
                <label>
                    <input type="number" min="0" max="10" step="0.1" value={filtersState.scores.max ?? ''} onChange={(e) => handleScoreChange(e, 'max')} />
                </label>
            </div>
          </div>
        </>
      ) : (
        <div className="studio-components">
          <h4 className="filter-header">Clusters</h4>
          <div className="checkbox-group">
              <label className="cb"><input type="checkbox" name="cluster" value="producer"
                      checked={filtersState_c.clusters['producer']}
                      onChange={(e) => handleCheckboxChange(e, "clusters")}/> Producer
              </label>
              <label className="cb"><input type="checkbox" name="type" value="licensor"
                      checked={filtersState_c.clusters['licensor']}
                      onChange={(e) => handleCheckboxChange(e, "clusters")}/> Licensor
              </label>
              <label className="cb"><input type="checkbox" name="type" value="studio"
                      checked={filtersState_c.clusters['studio']}
                      onChange={(e) => handleCheckboxChange(e, "clusters")}/> Studio
              </label>
          </div>
          <hr className="border-line"></hr>
        
          <h4 className="filter-header">Number of Arts</h4>
          <div className="score-input-container">
            <div className="score-input-group">
                <label>
                    <input type="number" min="0" max="10000" step="1" value={filtersState_c.total_arts.min ?? ''} onChange={(e) => handleScoreChange(e, 'min')} />
                </label>
                <label> ~ </label>
                <label>
                    <input type="number" min="0" max="10000" step="1" value={filtersState_c.total_arts.max ?? ''} onChange={(e) => handleScoreChange(e, 'max')} />
                </label>
            </div>
          </div>
        
          <h4 className="filter-header">Favorites</h4>
            <div className="score-input-container">
              <div className="score-input-group">
                  <label>
                      <input type="number" min="0" max="10000" step="1" value={filtersState_c.favorites.min ?? ''} onChange={(e) => handleScoreChange(e, 'min')} />
                  </label>
                  <label> ~ </label>
                  <label>
                      <input type="number" min="0" max="10000" step="1" value={filtersState_c.favorites.max ?? ''} onChange={(e) => handleScoreChange(e, 'max')} />
                  </label>
              </div>
            </div>

          <h4 className="filter-header">Score</h4>
            <div className="score-input-container">
              <div className="score-input-group">
                  <label>
                      <input type="number" min="0" max="10" step="0.1" value={filtersState_c.scores.min ?? ''} onChange={(e) => handleScoreChange(e, 'min')} />
                  </label>
                  <label> ~ </label>
                  <label>
                      <input type="number" min="0" max="10" step="0.1" value={filtersState_c.scores.max ?? ''} onChange={(e) => handleScoreChange(e, 'max')} />
                  </label>
              </div>
            </div>
        </div>
      )}
    
      <button className='search-button' onClick={handleSearchClick}>Search</button>
    </aside>
  );
};

export default Filters;
