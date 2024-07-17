import { FC } from "react";
import { BsInfoCircle } from "react-icons/bs";

import Panel from "./Panel";

const DescriptionPanel: FC = () => {
  return (
    <Panel initiallyDeployed title={<>Description</>}>
      <p>
        This map represents a <i>network</i> of anime shows derived from the
        <a
          target="_blank"
          rel="noreferrer"
          href="https://www.kaggle.com/datasets/stefanoleone992/anime-recommendations-database"
        >
          Kaggle Anime Dataset
        </a>
        . Each <i>node</i> represents an anime show, and each edge a{" "}
        <a
          target="_blank"
          rel="noreferrer"
          href="https://en.wikipedia.org/wiki/Similarity_measure"
        >
          similarity link
        </a>
        .
      </p>
      <p>
        The anime shows and their similarities were calculated based on user
        ratings and metadata, and the network was constructed and processed
        using various data science techniques. This makes the dataset creditable
        to the contributors of the Kaggle dataset and the anime community.
      </p>
      <p>
        This web application has been developed by{" "}
        <a
          target="_blank"
          rel="noreferrer"
          href="https://www.ouestware.com/en/"
        >
          OuestWare
        </a>
        , using{" "}
        <a target="_blank" rel="noreferrer" href="https://reactjs.org/">
          react
        </a>{" "}
        and{" "}
        <a target="_blank" rel="noreferrer" href="https://www.sigmajs.org">
          sigma.js
        </a>
        . You can read the source code{" "}
        <a
          target="_blank"
          rel="noreferrer"
          href="https://github.com/jacomyal/sigma.js/tree/main/packages/demo"
        >
          on GitHub
        </a>
        .
      </p>
      <p>
        Nodes sizes are related to their{" "}
        <a
          target="_blank"
          rel="noreferrer"
          href="https://en.wikipedia.org/wiki/Betweenness_centrality"
        >
          betweenness centrality
        </a>
        . More central nodes (i.e., bigger nodes) are important crossing points
        in the network. Finally, you can click a node to open the related
        information about the anime.
      </p>
    </Panel>
  );
};

export default DescriptionPanel;
