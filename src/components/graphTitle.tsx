import { useSigma } from "@react-sigma/core"; // useSigma 훅을 가져옴, Sigma 인스턴스를 사용하기 위해
import { FC, PropsWithChildren, useEffect, useState } from "react"; // React 훅과 타입을 가져옴

import { FiltersState, FiltersState_c } from "../types"; // FiltersState 타입을 가져옴

interface GraphDataControllerProps {
  filters: FiltersState | FiltersState_c;
  isContributor: boolean;
}

function prettyPercentage(val: number): string {
  // 백분율 형식의 문자열을 반환하는 함수
  return (val * 100).toFixed(1) + "%"; // 값에 100을 곱하고 소수점 1자리까지 표시한 후 %를 붙임
}

const GraphTitle: FC<PropsWithChildren<GraphDataControllerProps>> = ({ filters, isContributor }) => {
  // GraphTitle 컴포넌트 정의
  const sigma = useSigma(); // Sigma 인스턴스를 가져옴
  const graph = sigma.getGraph(); // Sigma 인스턴스로부터 그래프를 가져옴

  const [visibleItems, setVisibleItems] = useState<{
    // visibleItems 상태를 선언, 노드와 엣지의 개수를 포함
    nodes: number;
  }>({ nodes: 0 });

  useEffect(() => {
    // filters 상태가 변경될 때마다 실행
    requestAnimationFrame(() => {
      // 다음 프레임에서 실행
      const index = { nodes: 0 }; // 노드의 개수를 초기화
      graph.forEachNode((_, { hidden }) => !hidden && index.nodes++); // 숨겨지지 않은 노드의 개수를 셈
      setVisibleItems(index); // visibleItems 상태를 업데이트
    });
  }, [filters, graph]); // filters와 graph가 변경될 때마다 useEffect 실행

  return (
    <div className="graph-title">
      <h1>{isContributor ? "Contributor Network" : "Animation Network"}</h1> {/* 제목 */}
      <h2>
        <i>
          {graph.order} node{graph.order > 1 ? "s" : ""} {/* 노드의 총 개수 */}
          {visibleItems.nodes !== graph.order
            ? ` (only ${prettyPercentage(
                visibleItems.nodes / graph.order
              )} visible)` // 전체 노드 중 보이는 노드의 백분율
            : ""}
        </i>
      </h2>
    </div>
  );
};

export default GraphTitle; // GraphTitle 컴포넌트를 기본 내보내기로 설정