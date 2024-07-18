import { FC, useEffect, PropsWithChildren } from "react"; // React 훅과 타입을 가져옴
import { MultiDirectedGraph } from "graphology"; // graphology의 MultiDirectedGraph를 가져옴
import { keyBy, omit } from "lodash"; // lodash 라이브러리에서 keyBy와 omit 함수를 가져옴
import { useSigma } from "@react-sigma/core"; // Sigma 인스턴스를 가져옴
import "@react-sigma/core/lib/react-sigma.min.css"; // Sigma의 기본 스타일을 가져옴
import { Dataset, FiltersState } from "../types"; // 커스텀 타입 정의를 가져옴

const GraphDataController: FC<
  PropsWithChildren<{ dataset: Dataset; filters: FiltersState }>
> = ({ dataset, filters, children }) => {
  // GraphDataController 컴포넌트 정의
  const sigma = useSigma(); // Sigma 인스턴스를 가져옴
  const graph = sigma.getGraph(); // Sigma로부터 그래프를 가져옴

  useEffect(() => {
    if (!graph || !dataset) {
      // 그래프나 데이터셋이 없으면 오류 출력
      console.error("Graph or dataset not available");
      return;
    }

    try {
      graph.clear(); // 그래프 초기화
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
        if (edge.type === 'title') //title, synopsis, contributor
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
        size = SMALL_NODE_SIZE; // 인기 점수가 11 ~ 100인 경우 노드 크기를 15로 설정
      } else {
        // 나머지 경우는 크기를 계산
        size =MIN_NODE_SIZE;
      }
      graph.setNodeAttribute(node, "size", size);
    });

      console.log("Graph data loaded successfully"); // 그래프 데이터 로드 성공 메시지 출력
    } catch (error) {
      console.error("Error loading graph data:", error); // 그래프 데이터 로드 오류 메시지 출력
    }

    return () => graph.clear(); // 컴포넌트가 언마운트될 때 그래프 초기화
  }, [graph, dataset]); // 의존성 배열에 graph와 dataset 포함

  // useEffect(() => {
  //   const { clusters, tags, years, ratings } = filters;
  //   graph.forEachNode((node, { cluster, tag, year, rating }) =>
  //     graph.setNodeAttribute(
  //       node,
  //       "hidden",
  //       !clusters[cluster] || !tags[tag] || !years[year] || !ratings[rating]
  //     )
  //   );
  // }, [graph, filters]); // 필터 상태가 변경될 때마다 노드 숨김 설정

  return <>{children}</>; // 자식 요소를 렌더링
};

export default GraphDataController; // GraphDataController 컴포넌트를 기본 내보내기로 설정
