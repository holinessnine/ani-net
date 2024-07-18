import { FC } from "react"; // FC 타입을 가져옴
import { BsInfoCircle } from "react-icons/bs"; // 정보 아이콘을 가져옴

import Panel from "./Panel"; // Panel 컴포넌트를 가져옴

/**
 * DescriptionPanel 컴포넌트는 설명을 포함하는 패널을 렌더링합니다.
 */
const DescriptionPanel: FC = () => {
  return (
    <Panel initiallyDeployed title={<>Description</>}>
      <p>
        This map represents a <i>network</i> of anime shows derived from the{" "}
        {/* Kaggle Anime Dataset에 대한 링크 */}
        <a
          target="_blank"
          rel="noreferrer"
          href="https://www.kaggle.com/datasets/dbdmobile/myanimelist-dataset"
        >
          Kaggle Anime Dataset
        </a>
        . Each <i>node</i> represents an anime show, and each edge a{" "}
        {/* 유사성 링크에 대한 설명과 링크 */}
        <a
          target="_blank"
          rel="noreferrer"
          href="https://en.wikipedia.org/wiki/Similarity_measure"
        >
          similarity link
        </a>
        .
      </p>
    </Panel>
  );
};

export default DescriptionPanel; // DescriptionPanel 컴포넌트를 기본 내보내기로 설정
