import React, { useState, useRef, useEffect } from "react";
import { Attributes } from "graphology-types";

interface NodeDetailPanelProps {
  node: Attributes | null;
  onClose: () => void;
}

/*
e.g. nodeAttributes of Jujutsu Kaisen
URL: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg"
awarded: 1
borderColor: "FFFFFF"
cluster: 42
color: "#6E58FF"
duration: "23 min per ep"
episodes: "24.0"
hidden: false
highlighted: false
image: "/static/media/crown-svgrepo-com.5d2b3a28dbded0be6d0c7e7fe0a401b2.svg"
label: "Jujutsu Kaisen"
pictoColor: "#C0B5FF"
popularity: 17
rating: "R - 17+ (violence & profanity)"
size: 20
source: "Manga"
studios: "MAPPA"
synopsis: "Idly indulging in baseless paranormal activities with the Occult Club, high schooler Yuuji Itadori spends his days at either the clubroom or the hospital, where he visits his bedridden grandfather. However, this leisurely lifestyle soon takes a turn for the strange when he unknowingly encounters a cursed item. Triggering a chain of supernatural occurrences, Yuuji finds himself suddenly thrust into the world of Curses—dreadful beings formed from human malice and negativity—after swallowing the said item, revealed to be a finger belonging to the demon Sukuna Ryoumen, the \"King of Curses.\"\n\nYuuji experiences first-hand the threat these Curses pose to society as he discovers his own newfound powers. Introduced to the Tokyo Metropolitan Jujutsu Technical High School, he begins to walk down a path from which he cannot return—the path of a Jujutsu sorcerer."
tag: undefined
x: 1076.1196298986056
y: -1723.4877675663856
year: "2020"
*/

const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({ node, onClose }) => {
  const [flipped, setFlipped] = useState(false);

  if (!node) return null;

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(node.label)}`;

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
            <p className="synopsis"><strong>Synopsis:</strong></p>
            <p className="synopsis">{node.synopsis}</p>
          </div>
        </div>
      </div>
      <h1 className="title-container">
        <a href={googleSearchUrl} target="_blank" rel="noopener noreferrer" className="title-link">
          <div className="highlight"></div>
          <span>{node.label}</span>
        </a>
      </h1>
      {node.awarded === 1 && (
        <p className="awarded-message">
          <img src={node.image} alt="Awarded" style={{ width: "20px", verticalAlign: "middle" }} />
          <span style={{ marginLeft: "5px" }}>Awarded Animation</span>
        </p>
      )}
      <p><strong>Studio:</strong> {node.studios}</p>
      <p><strong>Year:</strong> {node.year}</p>
      <p><strong>Rating:</strong> {node.rating}</p>
      <p><strong>Episodes:</strong> {Math.round(node.episodes)} ({node.duration})</p>
    </div>
  );
};

export default NodeDetailPanel;