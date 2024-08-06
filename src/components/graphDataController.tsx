import { FC, useEffect, PropsWithChildren, useState } from "react"; // React 훅과 타입을 가져옴
import { keyBy  } from "lodash"; // lodash 라이브러리에서 keyBy와 omit 함수를 가져옴
import { useSigma } from "@react-sigma/core"; // Sigma 인스턴스를 가져옴
import "@react-sigma/core/lib/react-sigma.min.css"; // Sigma의 기본 스타일을 가져옴
import { Dataset, Dataset_c, FiltersState, FiltersState_c } from "../types"; // 커스텀 타입 정의를 가져옴
import CRWON_SVG_ICON from "../icon/crown-svgrepo-com.svg";
import FIRST_SVG_ICON from "../icon/number-one.svg";
import SECOND_SVG_ICON from "../icon/number-two.svg";
import THIRD_SVG_ICON from "../icon/number-three.svg";
import FOURTH_SVG_ICON from "../icon/number-four.svg";
import FIFTH_SVG_ICON from "../icon/number-five.svg";

// 데이터 변환 함수
//// 작성 사유: NodeData의 "type" 컬럼으로 필터링을 하려는데, "type"이라는 변수명이 Sigma.js의 기본 속성 이름과 겹쳐서 에러가 겁나 남 -> 이름 변경(m_type)

interface GraphDataControllerProps {
  dataset: Dataset | Dataset_c;
  filters: FiltersState | FiltersState_c;
  isContributor: boolean;
  edgetype: string;
}



const GraphDataController: FC<PropsWithChildren<GraphDataControllerProps>> = ({ dataset, filters, isContributor, edgetype, children }) => {
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
      console.log("선택한 edgetype: ", edgetype)
      console.log("받은 필터 정보: ", filters)
      if (!isContributor) {
        
        const rating = keyBy(dataset.ratings, "key"); // 데이터셋의 레이팅을 키별로 매핑

        dataset.nodes.forEach((node: any) => {
          // 각 노드를 그래프에 추가
          graph.addNode(node.label, {
            size: node.score,
            label: node.label,
            color: "#6E58FF",
            borderColor: "FFFFFF",
            pictoColor: "FFFFFF",
            cluster: node.cluster,
            cluster_n: node.cluster_n,
            m_type: node.m_type,
            tag: node.tag,
            URL: node.URL,
            rank: node.rank,
            studios: node.studios,
            year: node.year,
            popularity: node.popularity,
            favorite: node.favorites,
            rating: node.rating,
            source: node.source,
            duration: node.duration,
            episodes: node.episodes,
            awarded: node.awarded,
            genre_action: node.genre_action,
            genre_adventure: node.genre_adventure,
            genre_comedy: node.genre_comedy,
            genre_drama: node.genre_drama,
            genre_fantasy: node.genre_drama,
            genre_horror: node.genre_horror,
            genre_mystery: node.genre_mystery,
            genre_romance: node.genre_romance,
            genre_sf: node.genre_sf,
            genre_sports: node.genre_sports,
            genre_suspense: node.genre_suspense,
            synopsis: node.synopsis, /* NO SYNOPSIS IN DATA :( */
            synop_keys: node.synop_key,
            x: node.x,
            y: node.y,
            score: node.score
          });
        });

        

        (dataset.edges as any[])
          // 각 엣지를 그래프에 추가
          .filter((edge: any) => {
            const edgeType = typeof edge.type === "string" ? edge.type : edge.type.baseVal;
            return edgeType.toLowerCase() === edgetype.toLowerCase();
          })
          .forEach((edge: any) => {
            graph.addUndirectedEdge(edge.source, edge.dest, {
              size: edge.sim_score * 2,
              color: "#D9D3FF",
            });
        });



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
          if (graph.getNodeAttribute(node, "awarded") === 1) {
            graph.setNodeAttribute(node, "pictoColor", "#C0B5FF");
            graph.setNodeAttribute(node, "image", CRWON_SVG_ICON);
          }
          if (graph.getNodeAttribute(node, "label") === "Fullmetal Alchemist: Brotherhood") {
            graph.setNodeAttribute(node, "pictoColor", "#C0B5FF");
            graph.setNodeAttribute(node, "image", FIRST_SVG_ICON);
            graph.setNodeAttribute(node, "size", 30);
          } else if (graph.getNodeAttribute(node, "label") === "Bleach: Sennen Kessen-hen") {
            graph.setNodeAttribute(node, "pictoColor", "#C0B5FF");
            graph.setNodeAttribute(node, "image", SECOND_SVG_ICON);
            graph.setNodeAttribute(node, "size", 20);
          } else if (graph.getNodeAttribute(node, "label") === "Steins;Gate") {
            graph.setNodeAttribute(node, "pictoColor", "#C0B5FF");
            graph.setNodeAttribute(node, "image", THIRD_SVG_ICON);
            graph.setNodeAttribute(node, "size", 20);
          } else if (graph.getNodeAttribute(node, "label") === "Gintama°") {
            graph.setNodeAttribute(node, "pictoColor", "#C0B5FF");
            graph.setNodeAttribute(node, "image", FOURTH_SVG_ICON);
            graph.setNodeAttribute(node, "size", 20);
          } else if (graph.getNodeAttribute(node, "label") === "Kaguya-sama wa Kokurasetai: Ultra Romantic") {
            graph.setNodeAttribute(node, "pictoColor", "#C0B5FF");
            graph.setNodeAttribute(node, "image", FIFTH_SVG_ICON);
            graph.setNodeAttribute(node, "size", 20);
          }

          // Assuming graph is an instance of Sigma's graph and node is the node ID
          if (graph.getNodeAttribute(node, "cluster_n") > 6) {
            graph.setNodeAttribute(node, "color", "#513CFF");
          } else if (graph.getNodeAttribute(node, "cluster_n") > 1) {
            graph.setNodeAttribute(node, "color", "#644EFF");
          }

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
            pictoColor: "FFFFFF",
            cluster: node.cluster,
            top_art: node.top_art,
            top_rank: node.top_rank,
            total_art: node.total_art,
            total_producer: node.total_producer,
            total_licensor: node.total_licensor,
            total_studio: node.total_studio,
            awarded: node.awarded,
            genre_action: node.genre_action,
            genre_adventure: node.genre_adventure,
            genre_comedy: node.genre_comedy,
            genre_drama: node.genre_drama,
            genre_fantasy: node.genre_fantasy,
            genre_horror: node.genre_horror,
            genre_mystery: node.genre_mystery,
            genre_romance: node.genre_romance,
            genre_sf: node.genre_sf,
            genre_sports: node.genre_sports,
            genre_suspense: node.genre_suspense,
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
        (dataset.edges as any[])
          // 각 엣지를 그래프에 추가
          .filter((edge: any) => {
            const edgeType = typeof edge.type === "string" ? edge.type : edge.type.baseVal;
            return (edge.year === "Total") && (edgeType.toLowerCase() === edgetype.toLowerCase());
          })
          .forEach((edge: any) => {
            graph.addUndirectedEdge(edge.source, edge.dest, {
              size: edge.sim_score / 10,
              color: "#E2E2E2",
            });
        });


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

      //   // clustersLayer가 이미 존재하는지 확인
      //   let clustersLayer = document.getElementById("clustersLayer");

      //   if (!clustersLayer) {
      //   // Create the clustersLabel layer
      //   const clustersLayer = document.createElement("div");
      //   clustersLayer.id = "clustersLayer";
      //   let clusterLabelsDoms = "";
        
      //   // Iterate over each cluster to create a label
      //   for (const label in dataset.clusters) {
      //     const cluster = dataset.clusters[label];
      //     const center = clusterCentroids[cluster.key];

      //     // Convert cluster position to viewport coordinates
      //     const viewportPos = sigma.graphToViewport({ x: center.x, y: center.y });
      //     // Create a div for the cluster label with appropriate styles
      //     clusterLabelsDoms +=`<div id='${cluster.clusterLabel}' class="clusterLabel" style="position: absolute; top:${viewportPos.y}px; left:${viewportPos.x}px; color:${cluster.color}">${cluster.clusterLabel}</div>`;
      //   }

      //   // Set the innerHTML of clustersLayer to the generated labels
      //   clustersLayer.innerHTML = clusterLabelsDoms;

      //   // Insert the clustersLayer underneath the sigma-hovers layer
      //   const container = document.getElementsByClassName("sigma-container")[0] as HTMLElement;
      //   const hoversLayer = document.getElementsByClassName("sigma-hovers")[0];
      //   container.insertBefore(clustersLayer, hoversLayer);
      // }
      //   // Update the position of cluster labels on each render
      //   sigma.on("afterRender", () => {
      //     for (const clust in dataset.clusters) {
      //       const cluster = dataset.clusters[clust];
      //       const center = clusterCentroids[cluster.key];
      //       const clusterLabel = document.getElementById(cluster.clusterLabel);
      //       if (clusterLabel) {
      //         // Update position from the viewport
      //         const viewportPos = sigma.graphToViewport({ x: center.x, y: center.y });
      //         clusterLabel.style.top = `${viewportPos.y}px`;
      //         clusterLabel.style.left = `${viewportPos.x}px`;
      //       }
      //     }
      //   });

        console.log("Graph data loaded successfully"); // 그래프 데이터 로드 성공 메시지 출력
      }

      
    } catch (error) {
      console.error("Error loading graph data:", error); // 그래프 데이터 로드 오류 메시지 출력
    }

    return () => graph.clear(); // 컴포넌트가 언마운트될 때 그래프 초기화
  }, [graph, dataset, edgetype, isContributor, sigma]); // 의존성 배열에 graph와 dataset 포함

  useEffect(() => {
    const filterNodes = () => {
      if (!isContributor) {
        const typeFilter = filters as FiltersState;
        const { tags, years, types, ratings, scores, favorites } = typeFilter; // ranks
        console.log("######## 애니메이션 #######")
        console.log("태그(장르) 필터: ", tags)
        console.log("점수 필터: ", scores)
        console.log("타입 필터: ", types)
        console.log("등급 필터: ", ratings)
        // console.log("순위 필터: ", ranks)
        console.log("좋아요 필터: ", favorites)

        graph.forEachNode((node, attributes) => {
          // 로그
          //console.log("타입", attributes)
          
          // [필터 작업]
            //// 1. 점수
          const scoreCount = attributes.score;
          const isScoreInRange = 
            scoreCount >= scores.min && scoreCount <= scores.max
            //// 2. 장르
          const isTagVisible = Object.keys(tags).some(tag => tags[tag] && attributes[tag] === 1);
          
          /*
            //// 3. 순위
          const rankCount = attributes.rank;
            const isRankInRange = 
            rankCount >= ranks.min && rankCount <= ranks.max
            //// 4. 좋아요
          const favoriteCount = attributes.favorites;
          const isFavInRange = 
            favoriteCount >= favorites.min && favoriteCount <= favorites.max
          */

          // [그래프 필터링 적용]
          graph.setNodeAttribute(
            node,
            "hidden",
            !years[attributes.year] || // 연도
            !ratings[attributes.rating] || // 등급
            !types[attributes.m_type] || // 타입
            !isTagVisible || // 장르
            !isScoreInRange // 점수
            
            // !isRankInRange || // 순위
            // !isFavInRange // 좋아요
          )
          
          // [EventController에서 다루기 위해 별도 Hidden 정의]
          graph.setNodeAttribute(
            node,
            "filter_hidden",
            !years[attributes.year] || // 연도
            !ratings[attributes.rating] || // 등급
            !types[attributes.m_type] || // 타입
            !isTagVisible || // 장르
            !isScoreInRange // 점수
            
            // !isRankInRange || // 순위
            // !isFavInRange // 좋아요
          )
        });
      } else {
        const typeFilter = filters as FiltersState_c;
        const { clusters, years, scores, favorites, total_arts } = typeFilter; // ranks, awards
        console.log("######## 스튜디오 #######")
        console.log("클러스터 필터: ", clusters)
        console.log("점수 필터: ", scores)
        console.log("좋아요 필터: ", favorites)
        console.log("작품수 필터: ", total_arts)
        // console.log("순위 필터: ", ranks)
        // console.log("수상 필터: ", awards)

        graph.forEachNode((node, attributes) => {
          // 로그
          console.log("att 전체: ", attributes)
          
          // [필터 작업]
            //// 1. 점수
          const scoreCount = attributes.avg_score;
          const isScoreInRange = 
          scoreCount >= scores.min && scoreCount <= scores.max
            //// 2. 좋아요
          const favoriteCount = attributes.avg_favorites; 
          const isFavInRange = 
          favoriteCount >= favorites.min && favoriteCount <= favorites.max
            //// 3. 작품 수
          const totArtsCount = attributes.total_art; 
          const isTotInRange = 
          totArtsCount >= total_arts.min && totArtsCount <= total_arts.max
          /*
            //// 4. 순위
          const rankCount = attributes.top_rank; 
          const isRankInRange = 
            rankCount >= ranks.min && rankCount <= ranks.max
          
            //// 5. 수상
          const awardCount = attributes.awarded; 
          const isAwardInRange = 
            awardCount >= awards.min && awardCount <= awards.max
          */

          // [필터 적용]
          graph.setNodeAttribute(
            node,
            "hidden",
            !years[attributes.year] || // 연도
            !clusters[attributes.cluster] || // 클러스터
            !isScoreInRange ||  // 점수
            !isFavInRange || // 좋아요
            !isTotInRange // 작품 수
            
            // !isAwardInRange || // 수상
            // !isRankInRange // 순위
          )
          // [EventController에서 다루기 위해 별도 Hidden 정의]
          graph.setNodeAttribute(
            node,
            "filter_hidden",
            !years[attributes.year] || // 연도
            !clusters[attributes.cluster] || // 클러스터
            !isScoreInRange ||  // 점수
            !isFavInRange || // 좋아요
            !isTotInRange // 작품 수
            // !isRankInRange || // 순위
            // !isFavInRange // 좋아요
          )
        });
      }
    }
    filterNodes();
  }, [graph, filters, dataset, isContributor]); // 필터 상태가 변경될 때마다 노드 숨김 설정

  return <>{children}</>; // 자식 요소를 렌더링
};

export default GraphDataController; // GraphDataController 컴포넌트를 기본 내보내기로 설정