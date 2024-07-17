import React from "react";
import '../styles/Filters.css';

const Filters = () => {
    return (
        <aside className="filters-container">
            <img className='logo-img' src={`${process.env.PUBLIC_URL}/images/ANIMENET_LOGO.png`} alt='logo_img'/>
            
            <hr className="border-line"></hr>
    
            <h4 className="filter-header">Show graph as...</h4>
            <div className="button-group" style={{ marginBottom: '30px' }}>
                <button className='button-anime'>Animations</button>
                <button className='button-studio'>Studios</button>
                <button className='button-genre'>Genre</button>
            </div>

            <h3 className="filter-header">Filters</h3>
            <input type='text' className='search-input' placeholder='Search...'/>
            <h4 className="filter-header">Genre</h4>
            <hr className="border-line"></hr>

            <h4 className="filter-header">Episode</h4>
            <hr className="border-line"></hr>

            <h4 className="filter-header">Type</h4>
            <hr className="border-line"></hr>

            <h4 className="filter-header">Score</h4>
            <hr className="border-line"></hr>
        </aside>
    )
};

export default Filters;