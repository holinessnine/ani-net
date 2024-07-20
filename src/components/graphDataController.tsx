import { FC, useEffect, PropsWithChildren } from "react"; // React 훅과 타입을 가져옴
import { MultiDirectedGraph } from "graphology"; // graphology의 MultiDirectedGraph를 가져옴
import { keyBy, omit } from "lodash"; // lodash 라이브러리에서 keyBy와 omit 함수를 가져옴
import { ControlsContainer, useSigma } from "@react-sigma/core"; // Sigma 인스턴스를 가져옴
import "@react-sigma/core/lib/react-sigma.min.css"; // Sigma의 기본 스타일을 가져옴
import { Dataset, Dataset_c, FiltersState, FiltersState_c } from "../types"; // 커스텀 타입 정의를 가져옴
import Sigma from "sigma";
import { Coordinates } from "sigma/types";

interface GraphDataControllerProps {
  dataset: Dataset | Dataset_c;
  filters: FiltersState | FiltersState_c;
  isContributor: boolean;
}



const GraphDataController: FC<PropsWithChildren<GraphDataControllerProps>> = ({ dataset, filters, isContributor, children }) => {
  const sigma = useSigma(); // Sigma 인스턴스를 가져옴
  const graph = sigma.getGraph(); // Sigma로부터 그래프를 가져옴
  useEffect(() => {
    if (!graph || !dataset) {
      // 그래프나 데이터셋이 없으면 오류 출력
      console.error("Graph or dataset not available");
      return;
    } else {
      if (isContributor === true) {
        console.log("Dataset is for Contributor")
      } else {
        console.log("Dataset is for Animations")
      }
    }

    try {
      graph.clear(); // 그래프 초기화

      if (!isContributor) {
        const rating = keyBy(dataset.ratings, "key"); // 데이터셋의 레이팅을 키별로 매핑

        dataset.nodes.forEach((node: any) => {
          // 각 노드를 그래프에 추가
          graph.addNode(node.label, {
            size: node.score,
            label: node.label,
            color: "#6E58FF",
            borderolor: "FFFFFF",
            cluster: node.cluster,
            tag: node.tag,
            URL: node.URL,
            studios: node.studios,
            year: node.year,
            popularity: node.popularity,
            rating: node.rating,
            x: node.x,
            y: node.y,
          });
        });

        dataset.edges.forEach((edge: any) => {
          // 각 엣지를 그래프에 추가
          if (edge.type === "title") //title, synopsis, contributor
            graph.addUndirectedEdge(edge.source, edge.dest, {
              size: edge.sim_score * 2,
              color: "#D9D3FF",
            });
        });

        const scores = graph // 그래프의 모든 노드에서 인기 점수를 가져옴
          .nodes()
          .map((node) => graph.getNodeAttribute(node, "popularity"));
        const minDegree = Math.min(...scores); // 최소 인기 점수 계산
        const maxDegree = Math.max(...scores); // 최대 인기 점수 계산
        const MIN_NODE_SIZE = 3; // 노드의 최소 크기 설정
        const MAX_NODE_SIZE = 20; // 노드의 최대 크기 설정
        const MID_NODE_SIZE = 12; // 중간 노드 크기 설정
        const SMALL_NODE_SIZE = 7; // 중간 노드 크기 설정

        graph.forEachNode((node) => {
          const popularity = graph.getNodeAttribute(node, "popularity");
          let size;
          if (popularity >= 1 && popularity <= 30) {
            size = MAX_NODE_SIZE; // 인기 점수가 1 ~ 10인 경우 노드 크기를 20으로 설정
          } else if (popularity >= 31 && popularity <= 100) {
            size = MID_NODE_SIZE; // 인기 점수가 11 ~ 100인 경우 노드 크기를 15로 설정
          } else if (popularity >= 100 && popularity <= 1000) {
            size = SMALL_NODE_SIZE; // 인기 점수가 101 ~ 1000인 경우 노드 크기를 7로 설정
          } else {
            // 나머지 경우는 크기를 계산
            size = MIN_NODE_SIZE;
          }
          graph.setNodeAttribute(node, "size", size);
        });

        console.log("Graph data loaded successfully"); // 그래프 데이터 로드 성공 메시지 출력
      } else {
        const rating = keyBy(dataset.ratings, "key"); // 데이터셋의 레이팅을 키별로 매핑
        const clusterPositions: { [key: string]: { x: number; y: number; count: number } } = {};

        dataset.nodes.forEach((node: any) => {
          // 각 노드를 그래프에 추가
          if (node.year === "Total") 
          graph.addNode(node.label, {
            label: node.label,
            color: node.color,
            borderolor: "FFFFFF",
            cluster: node.cluster,
            top_art: node.top_art,
            top_rank: node.top_rank,
            total_art: node.total_art,
            avg_favorites: node.avg_favorites,
            avg_score: node.avg_score,
            URL: node.URL,
            year: node.year,
            x: node.x,
            y: node.y,
          });

          if (node.year=== "Total") {
            const cluster = node.cluster;
            if (!clusterPositions[cluster]) {
              clusterPositions[cluster] = { x: 0, y: 0, count: 0 };
            }
            clusterPositions[cluster].x += node.x;
            clusterPositions[cluster].y += node.y;
            clusterPositions[cluster].count += 1;
          }
          
        });
        const clusterCentroids: { [key: string]: { x: number; y: number } } = {};
        for (const cluster in clusterPositions) {
          const position = clusterPositions[cluster];
          clusterCentroids[cluster] = {
            x: position.x / position.count,
            y: position.y / position.count,
          };
        }
        dataset.edges.forEach((edge: any) => {
          // 각 엣지를 그래프에 추가
          if ((edge.year === "Total") && (edge.type=== "cowork")) //title, synopsis, contributor
            graph.addUndirectedEdge(edge.source, edge.dest, {
              size: edge.sim_score / 10,
              color: "#E2E2E2",
            });
        });

        const scores = graph // 그래프의 모든 노드에서 인기 점수를 가져옴
          .nodes()
          .map((node) => graph.getNodeAttribute(node, "total_art"));
        const minDegree = Math.min(...scores); // 최소 인기 점수 계산
        const maxDegree = Math.max(...scores); // 최대 인기 점수 계산
        const MIN_NODE_SIZE = 5; // 노드의 최소 크기 설정
        const MAX_NODE_SIZE = 30; // 노드의 최대 크기 설정
        const MID_NODE_SIZE = 15; // 중간 노드 크기 설정
        const SMALL_NODE_SIZE = 10; // 중간 노드 크기 설정



        graph.forEachNode((node) => {
          const total_art = graph.getNodeAttribute(node, "total_art");
          let size;
          if (total_art >= 400) {
            size = MAX_NODE_SIZE; // 총 예술 작품 수가 100 이상인 경우 노드 크기를 15으로 설정
          } else if (total_art >= 200 && total_art < 400) {
            size = MID_NODE_SIZE; // 총 예술 작품 수가 50 ~ 99인 경우 노드 크기를 10으로 설정
          } else if (total_art >= 50 && total_art < 200) {
            size = SMALL_NODE_SIZE; // 총 예술 작품 수가 25 ~ 49인 경우 노드 크기를 5로 설정
          } else {
            // 나머지 경우는 크기를 계산
            size = MIN_NODE_SIZE;
          }
          graph.setNodeAttribute(node, "size", size);

        });

        // Create the clustersLabel layer
        const clustersLayer = document.createElement("div");
        clustersLayer.id = "clustersLayer";
        let clusterLabelsDoms = "";
        
        // Iterate over each cluster to create a label
        for (const label in dataset.clusters) {
          const cluster = dataset.clusters[label];
          const center = clusterCentroids[cluster.key];

          // Convert cluster position to viewport coordinates
          const viewportPos = sigma.graphToViewport({ x: center.x, y: center.y });
          // Create a div for the cluster label with appropriate styles
          clusterLabelsDoms +=`<div id='${cluster.clusterLabel}' class="clusterLabel" style="position: absolute; top:${viewportPos.y}px; left:${viewportPos.x}px; color:${cluster.color}">${cluster.clusterLabel}</div>`;
        }

        // Set the innerHTML of clustersLayer to the generated labels
        clustersLayer.innerHTML = clusterLabelsDoms;

        // Insert the clustersLayer underneath the sigma-hovers layer
        const container = document.getElementsByClassName("sigma-container")[0] as HTMLElement;
        const hoversLayer = document.getElementsByClassName("sigma-hovers")[0];
        container.insertBefore(clustersLayer, hoversLayer);

        // Update the position of cluster labels on each render
        sigma.on("afterRender", () => {
          for (const country in dataset.clusters) {
            const cluster = dataset.clusters[country];
            const center = clusterCentroids[cluster.key];
            const clusterLabel = document.getElementById(cluster.clusterLabel);
            if (clusterLabel) {
              // Update position from the viewport
              const viewportPos = sigma.graphToViewport({ x: center.x, y: center.y });
              clusterLabel.style.top = `${viewportPos.y}px`;
              clusterLabel.style.left = `${viewportPos.x}px`;
            }
          }
        });

        console.log("Graph data loaded successfully"); // 그래프 데이터 로드 성공 메시지 출력
      }

      
    } catch (error) {
      console.error("Error loading graph data:", error); // 그래프 데이터 로드 오류 메시지 출력
    }

    return () => graph.clear(); // 컴포넌트가 언마운트될 때 그래프 초기화
  }, [graph, dataset]); // 의존성 배열에 graph와 dataset 포함

  useEffect(() => {
    if (!isContributor) {
      // const typeFilter = filters as FiltersState;
      // const { clusters, tags, years, ratings } = typeFilter;
      // graph.forEachNode((node, attributes) =>
      //   graph.setNodeAttribute(
      //     node,
      //     "hidden",
      //     !clusters[attributes.cluster] || !tags[attributes.tag] || !years[attributes.year] || !ratings[attributes.rating]
      //   )
      // );
    } else {
      const typeFilter = filters as FiltersState_c;
      const { clusters, tags, years, ratings } = typeFilter;
      graph.forEachNode((node, attributes) =>
        graph.setNodeAttribute(
          node,
          "hidden",
          !clusters[attributes.cluster] ||!years[attributes.year] 
        )
      );
    }
  }, [graph, filters, dataset]); // 필터 상태가 변경될 때마다 노드 숨김 설정

  return <>{children}</>; // 자식 요소를 렌더링
};

export default GraphDataController; // GraphDataController 컴포넌트를 기본 내보내기로 설정