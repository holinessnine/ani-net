import React from 'react';
import Accordion from './Accordian';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  isContributor: boolean;
};

const Tooltips: React.FC<ModalProps> = ({ isOpen, onClose, isContributor }) => {
  if (!isOpen) return null;

  const title = "System Description";

  const content_anime = (
    <>
      <Accordion title="Nodes - Animations">
        <p>
          <strong>Initial Node Placement</strong><br />
          First, generate points randomly to fill an ellipse with a 3:2 ratio. For the network connecting nodes based on title similarity, perform community detection using <a href="https://en.wikipedia.org/wiki/Louvain_method">Louvain algorithm</a>. For each community, set the animation with the highest *rank as the representative value. Starting with the highest-ranked community, place the nodes sequentially from the center to the periphery.<br /><br />
          <strong>Node Size</strong><br /> The nodes are sized based on their popularity, segmented into the top 30, 100, 1000, and the remaining nodes, from a total of 2000 nodes. <br /><br />
          <strong>Synopsis Keyword</strong><br /> Utilizing the pre-trained Bert Base language model, 5 keywords were extracted from the synopsis for each animation. <br /><br />
          *Rank: Calculated by comprehensively considering Favorites, Views, Popularity, and Score from the Anime Dataset.
        </p>
      </Accordion>
      <Accordion title="Edges - Animations">
        <p>
          <strong>Title (Default) </strong><br />
          The first part of each animation’s title, split based on the colon, was embedded using a pretrained language model. Cosine similarity was calculated between the embeddings; nodes with high similarity were connected, while those with relatively lower similarity were connected only if they were produced by the same studio. Connections were not made if the cosine similarity was below 0.7. This approach illustrates the connections between animations within the same series.<br /><br />
          <strong>Synopsis</strong><br />
          Pretrained sentence embedding is applied, and nodes are connected if the cosine similarity is 0.65 or higher.<br /><br />
          <strong>Contributors</strong><br />
          Sentence embedding is applied to the studio names, connecting nodes with a cosine similarity of 0.85 or higher.<br /><br />
          <strong>Genre</strong><br />
          Genres are one-hot encoded, and nodes are connected if they have identical genre vectors.<br /><br />
        </p>
      </Accordion>
    </>
  );

  const content_contri = (
    <>
      <Accordion title="Nodes - Studios">
        <p>
          <strong>Initial Node Placement</strong><br />
          - Three central points are defined based on the role (Licensor, Producer, Studio).<br />
          - Nodes are arranged around these central points with equal radii.<br /><br />
        </p>
        <p>
          <strong>Node Size</strong><br />
          The size of the nodes is based on the number of works produced, segmented into those with more than 400, more than 200, more than 50, and the remaining nodes.<br /><br />
        </p>
        <p>
          <strong>Node Color</strong><br />
          - Licensor with the most works: <span style={{ color: "#D81159" }}>#D81159</span> (red)<br />
          - Producer with the most works: <span style={{ color: "#FFBC42" }}>#FFBC42</span> (yellow)<br />
          - Studio with the most works: <span style={{ color: "#0496FF" }}>#0496FF</span> (blue)<br /><br />
        </p>
      </Accordion>
      <Accordion title="Edges - Studios">
        <p>
          <strong>Cowork</strong><br /> Nodes are connected if they worked together in the same year.<br /><br />
          <strong>Genre</strong><br /> Nodes are connected if the cosine similarity between the number of works in each genre is higher than 0.8.<br /><br />
        </p>
      </Accordion>
    </>
  );

  const systemInfo = (
    <p>
      We developed an interactive visualization system using Sigma.js and React to represent anime networks based on a dataset from <a href="https://www.kaggle.com/datasets/dbdmobile/myanimelist-dataset">Kaggle Anime Dataset 2023</a>. This filtered dataset includes animations and production companies from 1961 to 2023, allowing us to visualize relationships between different animations or production companies.
      <br /><br />
      We applied various Machine Learning and Deep Learning algorithms to the Node and Edge Attributes of the data. This approach provides additional insights that are not immediately apparent from the dataset alone, enabling a deeper understanding of the connections and patterns within the anime industry.
      <br /><br />
      The "Animation" network represents the relationships between different animations, while the "Studios" network illustrates the connections between studios, licensors, and producers. This distinction allows users to explore specific aspects of the anime industry in more detail.
    </p>
  );

  const content = isContributor ? content_contri : content_anime;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-content">
          {systemInfo}
          {content}
        </div>
      </div>
    </div>
  );
};

export default Tooltips;