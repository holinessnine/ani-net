import React, { useState, useEffect } from "react";
import { Attributes } from "graphology-types";


interface NodeDetailPanelProps {
  node: Attributes | null;
  onClose: () => void;
  isContributor: boolean;
}

const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({ node, onClose, isContributor }) => {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setFlipped(false);
  }, [node]);

  if (!node) return null;

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  // Extract and format synop_keys
  const formattedSynopKeys = node.synop_keys
    ? node.synop_keys.split(", ").map((key: string) => `#${key}`)
    : [];

  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(node.label)}`;

  let genreString = "";

  if (!isContributor) {
    const genres = [
      { key: "genre_action", name: "Action" },
      { key: "genre_adventure", name: "Adventure" },
      { key: "genre_comedy", name: "Comedy" },
      { key: "genre_drama", name: "Drama" },
      { key: "genre_fantasy", name: "Fantasy" },
      { key: "genre_horror", name: "Horror" },
      { key: "genre_mystery", name: "Mystery" },
      { key: "genre_romance", name: "Romance" },
      { key: "genre_sf", name: "SF" },
      { key: "genre_sports", name: "Sports" },
      { key: "genre_suspense", name: "Suspense" },
    ];

    genreString = genres
      .filter((genre) => node[genre.key] === 1)
      .map((genre) => genre.name)
      .join(", ");
  }

  let maxVal = 0;
  let maxGenreVal = 0;

  if (isContributor) {
    maxVal = Math.max(node.total_producer, node.total_licensor, node.total_studio);
    maxGenreVal = Math.max(
      node.genre_action,
      node.genre_adventure,
      node.genre_comedy,
      node.genre_drama,
      node.genre_fantasy,
      node.genre_horror,
      node.genre_mystery,
      node.genre_romance,
      node.genre_sf,
      node.genre_sports,
      node.genre_suspense
    );
  }

  const contributorStats = [
    { key: "total_producer", label: "Total Number of Arts as a Producer", color: "#FFBC42" },
    { key: "total_licensor", label: "Total Number of Arts as a Licensor", color: "#D81159" },
    { key: "total_studio", label: "Total Number of Arts as a Studio", color: "#0496FF" },
  ];

  const genreStats = [
    { key: "genre_action", label: "Total Number of Action Arts" },
    { key: "genre_adventure", label: "Total Number of Adventure Arts" },
    { key: "genre_comedy", label: "Total Number of Comedy Arts" },
    { key: "genre_drama", label: "Total Number of Drama Arts" },
    { key: "genre_fantasy", label: "Total Number of Fantasy Arts" },
    { key: "genre_horror", label: "Total Number of Horror Arts" },
    { key: "genre_mystery", label: "Total Number of Mystery Arts" },
    { key: "genre_romance", label: "Total Number of Romance Arts" },
    { key: "genre_sf", label: "Total Number of SF Arts" },
    { key: "genre_sports", label: "Total Number of Sports Arts" },
    { key: "genre_suspense", label: "Total Number of Suspense Arts" },
  ];

  return (
    <div className="node-detail-panel">
      <button className="close-btn" onClick={onClose}>X</button>
      <div
        className={`card ${flipped ? "flipped" : ""}`}
        onClick={handleFlip}
      >
        <div className="card-inner">
          <div className="card-front">
            <img src={node.URL} alt={node.label} />
          </div>
          <div className="card-back">
            {isContributor ? (
              <>
                <p><strong>Top Anime:</strong> {node.top_art}  (Rank: {node.top_rank})</p>
              </>
            ) : (
              <>
                <p className="synopsis"><strong>Synopsis:</strong></p>
                <p className="synopsis">{node.synopsis}</p>
              </>
            )}
          </div>
        </div>
      </div>
      <h1 className="title-container">
        <a href={googleSearchUrl} target="_blank" rel="noopener noreferrer" className="title-link">
          <div className="highlight"></div>
          <span>{node.label}</span>
        </a>
      </h1>
      {isContributor ? (
        <>
          <p>{typeof node.cluster === "string" ? node.cluster.toUpperCase() : ""}</p><br/>
          <p><strong>Total Number of Arts:</strong> {node.total_art}</p>
          <p><strong>Total Number of Awarded Arts:</strong> {node.awarded}</p>
          <hr />
          {contributorStats.map((stat) => (
            <p key={stat.key} style={{ color: node[stat.key] === maxVal ? stat.color : "inherit" }}>
              <strong>{stat.label}:</strong> {node[stat.key]}
            </p>
          ))}
          <hr />
          {genreStats.map((genre) => (
            <p key={genre.key} style={{ color: node[genre.key] === maxGenreVal ? "#644EFF" : "inherit" }}>
              <strong>{genre.label}:</strong> {node[genre.key]}
            </p>
          ))}
        </>
      ) : (
        <>
          {node.awarded === 1 && (
            <p className="awarded-message">
              <img src={node.image} alt="Awarded" style={{ width: "20px", verticalAlign: "middle" }} />
              <span style={{ marginLeft: "5px" }}>Awarded Animation</span>
            </p>
          )}
          <p><strong>Studio:</strong> {node.studios}</p>
          <p><strong>Year:</strong> {node.year}</p>
          <p><strong>Genre:</strong> {genreString}</p>
          <p><strong>Rating:</strong> {node.rating}</p>
          <p><strong>Episodes:</strong> {Math.round(node.episodes)} ({node.duration})</p>
          <hr />
          {formattedSynopKeys.length > 0 && (
            <div className="synop-keys">
              {formattedSynopKeys.map((key: string, index: number) => (
                <span key={index} className="synop-key">{key}</span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NodeDetailPanel;