import { useSetSettings, useSigma } from "@react-sigma/core"; // Sigma 설정 및 인스턴스를 가져옴
import { Attributes } from "graphology-types"; // graphology 타입 정의를 가져옴
import { FC, PropsWithChildren, useEffect } from "react"; // React 훅과 타입을 가져옴

import { drawHover, drawLabel, drawHover_c, drawLabel_c } from "../canvas-utils"; // 커스텀 그리기 유틸리티를 가져옴
import useDebounce from "../use_debounce"; // 디바운스 훅을 가져옴

const NODE_FADE_COLOR = "#bbb"; // 노드 페이드 색상
const EDGE_FADE_COLOR = "#eee"; // 엣지 페이드 색상

interface GraphSettingsControllerProps {
  hoveredNode: string | null;
  isContributor: boolean;
}

const GraphSettingsController: FC<
  PropsWithChildren<GraphSettingsControllerProps>
> = ({ children, hoveredNode, isContributor }) => {
  // GraphSettingsController 컴포넌트 정의
  const sigma = useSigma(); // Sigma 인스턴스를 가져옴
  const setSettings = useSetSettings(); // Sigma 설정 함수를 가져옴
  const graph = sigma.getGraph(); // Sigma로부터 그래프를 가져옴

  // 마우스를 그래프 위에서 움직일 때 하이라이트 갱신을 너무 자주 하지 않도록 디바운스 처리
  const debouncedHoveredNode = useDebounce(hoveredNode, 20); // 디바운스된 hoveredNode를 설정

  /**
   * 그래프 및 Sigma 인스턴스를 알아야 하는 설정 초기화
   */
  useEffect(() => {
    const hoveredColor: string =
      (debouncedHoveredNode &&
        sigma.getNodeDisplayData(debouncedHoveredNode)?.color) ||
      ""; // 호버된 노드의 색상을 가져옴

    setSettings({
      defaultDrawNodeLabel: isContributor ? drawLabel_c : drawLabel, // 기본 노드 라벨 그리기 함수 설정
      defaultDrawNodeHover: isContributor ? drawHover_c : drawHover, // 기본 노드 호버 그리기 함수 설정
      nodeReducer: (node: string, data: Attributes) => {
        // 노드 리듀서 함수 설정
        if (debouncedHoveredNode && !isContributor) {
          const isHoveredNode = node === debouncedHoveredNode; // 현재 노드가 호버된 노드인지 확인
          const neighbors = Array.from(graph.neighbors(debouncedHoveredNode)).slice(0, 10); // 최대 10개의 이웃 노드를 가져옴
          const isNeighborNode = neighbors.includes(node); // 현재 노드가 이웃 노드인지 확인

          if (isHoveredNode || isNeighborNode) {
            return {
              ...data,
              zIndex: 1,
              label: data.label || node,
              highlighted: true,
            }; // 호버된 노드 또는 이웃 노드의 데이터 업데이트
          }

          return {
            ...data,
            zIndex: 0,
            label: "",
            color: NODE_FADE_COLOR,
            image: null,
            highlighted: false,
          }; // 나머지 노드의 데이터 업데이트
        }
        if (debouncedHoveredNode && isContributor) {
          const isHoveredNode = node === debouncedHoveredNode; // 현재 노드가 호버된 노드인지 확인
          let neighbors = Array.from(graph.neighbors(debouncedHoveredNode)); // 모든 이웃 노드를 가져옴

          // 이웃 노드를 total_art 속성 기준으로 내림차순 정렬하고 상위 10개 선택
          neighbors = neighbors
            .map((neighbor) => ({
              node: neighbor,
              total_art: graph.getNodeAttribute(neighbor, "total_art") || 0,
            }))
            .sort((a, b) => b.total_art - a.total_art)
            .slice(0, 10)
            .map((neighbor) => neighbor.node);

          const isNeighborNode = neighbors.includes(node); // 현재 노드가 이웃 노드인지 확인

          if (isHoveredNode || isNeighborNode) {
            return {
              ...data,
              zIndex: 1,
              label: data.label || node,
              highlighted: true,
            }; // 호버된 노드 또는 이웃 노드의 데이터 업데이트
          }

          return {
            ...data,
            zIndex: 0,
            label: "",
            color: NODE_FADE_COLOR,
            image: null,
            highlighted: false,
          }; // 나머지 노드의 데이터 업데이트
        }
        return data;
      },
      edgeReducer: (edge: string, data: Attributes) => {
        // 엣지 리듀서 함수 설정
        if (debouncedHoveredNode) {
          const isConnectedEdge = graph.hasExtremity(
            edge,
            debouncedHoveredNode
          ); // 현재 엣지가 호버된 노드에 연결되었는지 확인

          return isConnectedEdge
            ? { ...data, color: hoveredColor, size: 4 } // 연결된 엣지 데이터 업데이트, Hover된 노드 색상 따라가게 -> { ...data, color: hoveredColor, size: 4 }
            : { ...data, color: EDGE_FADE_COLOR, hidden: true }; // 연결되지 않은 엣지 데이터 업데이트
        }
        return data;
      },
    });
  }, [sigma, graph, debouncedHoveredNode, isContributor]); // 의존성 배열에 sigma, graph, debouncedHoveredNode, isContributor 포함

  /**
   * 노드가 호버될 때 노드 및 엣지 리듀서를 업데이트하여 이웃을 하이라이트
   */
  useEffect(() => {
    const hoveredColor: string =
      (debouncedHoveredNode &&
        sigma.getNodeDisplayData(debouncedHoveredNode)?.color) ||
      ""; // 호버된 노드의 색상을 가져옴

    sigma.setSetting(
      "nodeReducer",
      debouncedHoveredNode
        ? (node, data) => {
            const isHoveredNode = node === debouncedHoveredNode; // 현재 노드가 호버된 노드인지 확인
            const neighbors = Array.from(graph.neighbors(debouncedHoveredNode)).slice(0, 10); // 최대 10개의 이웃 노드를 가져옴
            const isNeighborNode = neighbors.includes(node); // 현재 노드가 이웃 노드인지 확인

            if (isHoveredNode || isNeighborNode) {
              return {
                ...data,
                zIndex: 1,
                label: data.label || node,
                highlighted: true,
              }; // 호버된 노드 또는 이웃 노드의 데이터 업데이트
            }

            return {
              ...data,
              zIndex: 0,
              label: "",
              color: NODE_FADE_COLOR,
              image: null,
              highlighted: false,
            }; // 나머지 노드의 데이터 업데이트
          }
        : null // 호버된 노드가 없으면 null 설정
    );
    sigma.setSetting(
      "edgeReducer",
      debouncedHoveredNode
        ? (edge, data) => {
            const isConnectedEdge = graph.hasExtremity(
              edge,
              debouncedHoveredNode
            ); // 현재 엣지가 호버된 노드에 연결되었는지 확인

            return isConnectedEdge
              ? { ...data, color: hoveredColor, size: 4 } // 연결된 엣지 데이터 업데이트
              : { ...data, color: EDGE_FADE_COLOR, hidden: true }; // 연결되지 않은 엣지 데이터 업데이트
          }
        : null // 호버된 노드가 없으면 null 설정
    );
  }, [debouncedHoveredNode, sigma, graph]); // 의존성 배열에 debouncedHoveredNode, sigma, graph 포함

  return <>{children}</>; // 자식 요소를 렌더링
};

export default GraphSettingsController; // GraphSettingsController 컴포넌트를 기본 내보내기로 설정

// import { useSetSettings, useSigma } from "@react-sigma/core";
// import { Attributes } from "graphology-types";
// import { FC, PropsWithChildren, useEffect } from "react";

// import { drawHover, drawLabel } from "../canvas-utils";
// import useDebounce from "../use_debounce";

// const NODE_FADE_COLOR = "#bbb";
// const EDGE_FADE_COLOR = "#eee";

// const GraphSettingsController: FC<
//   PropsWithChildren<{ hoveredNode: string | null }>
// > = ({ children, hoveredNode }) => {
//   const sigma = useSigma();
//   const setSettings = useSetSettings();
//   const graph = sigma.getGraph();

//   // Here we debounce the value to avoid having too much highlights refresh when
//   // moving the mouse over the graph:
//   const debouncedHoveredNode = useDebounce(hoveredNode, 20);

//   /**
//    * Initialize here settings that require to know the graph and/or the sigma
//    * instance:
//    */
//   useEffect(() => {
//     const hoveredColor: string =
//       (debouncedHoveredNode &&
//         sigma.getNodeDisplayData(debouncedHoveredNode)?.color) ||
//       "";

//     setSettings({
//       defaultDrawNodeLabel: drawLabel,
//       defaultDrawNodeHover: drawHover,
//       nodeReducer: (node: string, data: Attributes) => {
//         if (debouncedHoveredNode) {
//           return node === debouncedHoveredNode ||
//             graph.hasEdge(node, debouncedHoveredNode) ||
//             graph.hasEdge(debouncedHoveredNode, node)
//             ? { ...data, zIndex: 1 }
//             : {
//                 ...data,
//                 zIndex: 0,
//                 label: "",
//                 color: NODE_FADE_COLOR,
//                 image: null,
//                 highlighted: false,
//               };
//         }
//         return data;
//       },
//       edgeReducer: (edge: string, data: Attributes) => {
//         if (debouncedHoveredNode) {
//           return graph.hasExtremity(edge, debouncedHoveredNode)
//             ? { ...data, color: hoveredColor, size: 4 }
//             : { ...data, color: EDGE_FADE_COLOR, hidden: true };
//         }
//         return data;
//       },
//     });
//   }, [sigma, graph, debouncedHoveredNode]);

//   /**
//    * Update node and edge reducers when a node is hovered, to highlight its
//    * neighborhood:
//    */
//   useEffect(() => {
//     const hoveredColor: string =
//       (debouncedHoveredNode &&
//         sigma.getNodeDisplayData(debouncedHoveredNode)?.color) ||
//       "";

//     sigma.setSetting(
//       "nodeReducer",
//       debouncedHoveredNode
//         ? (node, data) =>
//             node === debouncedHoveredNode ||
//             graph.hasEdge(node, debouncedHoveredNode) ||
//             graph.hasEdge(debouncedHoveredNode, node)
//               ? { ...data, zIndex: 1 }
//               : {
//                   ...data,
//                   zIndex: 0,
//                   label: "",
//                   color: NODE_FADE_COLOR,
//                   image: null,
//                   highlighted: false,
//                 }
//         : null
//     );
//     sigma.setSetting(
//       "edgeReducer",
//       debouncedHoveredNode
//         ? (edge, data) =>
//             graph.hasExtremity(edge, debouncedHoveredNode)
//               ? { ...data, color: hoveredColor, size: 4 }
//               : { ...data, color: EDGE_FADE_COLOR, hidden: true }
//         : null
//     );
//   }, [debouncedHoveredNode]);

//   return <>{children}</>;
// };

// export default GraphSettingsController;
