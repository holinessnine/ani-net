import React from "react";
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
image: "/static/media/crown-svgrepo-com.5d2b3a28dbded0be6d0c7e7fe0a401b2.svg"
label: "Jujutsu Kaisen"
pictoColor: "#C0B5FF"
popularity: 17
rating: "R - 17+ (violence & profanity)"
size: 20
studios: "MAPPA"
synopsis: undefined
tag: undefined
x: 651.5541288300996
y: -811.3122645462174
year: "2020"
*/

const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({ node, onClose }) => {
  if (!node) return null;
  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(node.label)}`;

  return (
    <div className="node-detail-panel">
      <button className="close-btn" onClick={onClose}>X</button>
      <a href={googleSearchUrl} target="_blank" rel="noopener noreferrer">
        <img src={node.URL} alt={node.label} />
      </a>
      <h1>{node.label}</h1>
      {node.awarded === 1 && (
        <p className="awarded-message">
          <img src={node.image} alt="Awarded" style={{ width: "20px", verticalAlign: "middle" }} />
          <span style={{ marginLeft: "5px" }}>Awarded Animation</span>
        </p>
      )}
      <p><strong>Studio:</strong> {node.studios}</p>
      <p><strong>Year:</strong> {node.year}</p>
      <p><strong>Rating:</strong> {node.rating}</p>
    </div>
  );
};

export default NodeDetailPanel;

