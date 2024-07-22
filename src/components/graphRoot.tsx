import {
  SigmaContainer,
  ControlsContainer,
  FullScreenControl,
  ZoomControl,
  useSigma,
} from "@react-sigma/core";
import { NodePictogramProgram } from "@sigma/node-image";
import { createNodeBorderProgram, NodeBorderProgram } from "@sigma/node-border";
import { createNodeImageProgram } from "@sigma/node-image";
import { createNodeCompoundProgram } from "sigma/rendering";
import { UndirectedGraph } from "graphology";
import { constant, keyBy, mapValues, omit } from "lodash";
import { FC, useEffect, useMemo, useState } from "react";
import { BiBookContent, BiRadioCircleMarked } from "react-icons/bi";
import {
  BsArrowsFullscreen,
  BsFullscreenExit,
  BsZoomIn,
  BsZoomOut,
} from "react-icons/bs";
import { GrClose } from "react-icons/gr";
import { Settings } from "sigma/settings";
import { drawHover, drawLabel } from "../canvas-utils";
import { Dataset, Dataset_c, FiltersState, FiltersState_c } from "../types";
import DescriptionPanel from "./descPanel";
import GraphDataController from "./graphDataController";
import GraphEventsController from "./graphEventController";
import GraphSettingsController from "./graphSettingsController";
import GraphTitle from "./graphTitle";
import SearchField from "./searchField";
import forceAtlas2 from "graphology-layout-forceatlas2";
import FA2Layout from "graphology-layout-forceatlas2/worker";

interface RootProps {
  filtersState: FiltersState | FiltersState_c;
  setFiltersState: React.Dispatch<React.SetStateAction<FiltersState>> | React.Dispatch<React.SetStateAction<FiltersState_c>>;
  isContributor: boolean;
}

const NodeBorderCustomProgram = createNodeBorderProgram({
  borders: [
    { size: { value: 0.1 }, color: { attribute: "borderColor" } },
    { size: { fill: true }, color: { attribute: "color" } },
  ],
});

const NodePictogramCustomProgram = createNodeImageProgram({
  padding: 0.3,
  size: { mode: "force", value: 256 },
  drawingMode: "color",
  colorAttribute: "pictoColor",
});

const NodeProgram = createNodeCompoundProgram([NodeBorderCustomProgram, NodePictogramCustomProgram]);

const Root: FC<RootProps> = ({ filtersState, setFiltersState, isContributor = false }) => {
  const [showContents, setShowContents] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [dataset, setDataset] = useState<Dataset | Dataset_c | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null); 
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가


  const sigmaSettings: Partial<Settings> = useMemo(
    () => ({
      // nodeProgramClasses: {
      //   image: createNodeImageProgram({
      //     size: { mode: "force", value: 256 },
      //   }),
      // },
      defaultDrawNodeLabel: drawLabel,
      defaultDrawNodeHover: drawHover,
      defaultNodeType: "pictogram",
      nodeProgramClasses: {
        pictogram: NodeProgram,
      },
      // defaultEdgeType: "arrow",
      labelDensity: 0.07,
      labelGridCellSize: 60,
      labelRenderedSizeThreshold: 15,
      labelFont: "Lato, sans-serif",
      zIndex: true,
      allowInvalidContainer: true,
    }),
    []
  );


  // Load data on mount:
  useEffect(() => {
    const dataFile = isContributor ? "data/graph_data_contri.json" : "data/graph_data_anime.json";
    fetch(dataFile)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch data from ${dataFile}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((dataset) => {
        if (isContributor) {
          const typedDataset = dataset as Dataset_c;
          setDataset(typedDataset);
          setFiltersState({
            clusters: mapValues(keyBy(typedDataset.clusters, "key"), constant(true)),
            tags: mapValues(keyBy(typedDataset.tags, "key"), constant(true)),
            years: mapValues(keyBy(typedDataset.years, "key"), constant(true)),
            ratings: mapValues(keyBy(typedDataset.ratings, "key"), constant(false)),
            types: mapValues(keyBy(typedDataset.types, "key"), constant(false)),
            favorites: {min: null, max: null},
            total_arts: {min: null, max: null},
            scores: {min: null, max: null}
          });
          // 첫 번째 행 출력
          console.log("First row of the dataset:", typedDataset.nodes[0]);
        } else {
          const typedDataset = dataset as Dataset;
          setDataset(typedDataset);
          setFiltersState({
            clusters: mapValues(keyBy(typedDataset.clusters, "key"), constant(true)),
            tags: mapValues(keyBy(typedDataset.tags, "key"), constant(true)),
            years: mapValues(keyBy(typedDataset.years, "key"), constant(true)),
            ratings: mapValues(keyBy(typedDataset.ratings, "key"), constant(false)),
            types: mapValues(keyBy(typedDataset.types, "key"), constant(false)),
            favorites: {min: null, max: null},
            total_arts: {min: null, max: null},
            scores: {min: null, max: null}
          });
          // 첫 번째 행 출력
          console.log("First row of the dataset:", typedDataset.nodes[0]);
        }

        requestAnimationFrame(() => {
          setDataReady(true);
          setIsLoading(false); // 로딩 완료 상태로 설정
        });
      })
      .catch((error) => {
        console.error("Error fetching dataset:", error);
        setIsLoading(false); // 오류 발생 시 로딩 상태 해제
      });
  }, [isContributor, setFiltersState]);

  if (isLoading) {
    return <div>Loading...</div>; // 로딩 중일 때 표시할 내용
  }

  if (!dataset) return null;


  return (
    <div id="app-root" className={showContents ? "show-contents" : ""}>
      <SigmaContainer
        style={{ width: "100%", height: "90%" }}
        graph={UndirectedGraph}
        settings={sigmaSettings}
        className="react-sigma"
      >
        <GraphSettingsController hoveredNode={hoveredNode} isContributor={isContributor} />
        <GraphEventsController setHoveredNode={setHoveredNode} />
        <GraphDataController dataset={dataset} filters={filtersState} isContributor={isContributor}  />

        {dataReady && (
          <>
            <div className="controls">
              <div className="react-sigma-control ico">
                <button
                  type="button"
                  className="show-contents"
                  onClick={() => setShowContents(true)}
                  title="Show caption and description"
                >
                  <BiBookContent />
                </button>
              </div>
              <FullScreenControl className="ico">
                <BsArrowsFullscreen />
                <BsFullscreenExit />
              </FullScreenControl>

              <ZoomControl className="ico">
                <BsZoomIn />
                <BsZoomOut />
                <BiRadioCircleMarked />
              </ZoomControl>
            </div>
            <div className="contents">
              <div className="ico">
                <button
                  type="button"
                  className="ico hide-contents"
                  onClick={() => setShowContents(false)}
                  title="Show caption and description"
                >
                  <GrClose />
                </button>
              </div>
              <GraphTitle filters={filtersState} isContributor={isContributor} />
              <div className="panels">
                <SearchField filters={filtersState} />
                {/* <DescriptionPanel /> */}
              </div>
            </div>
          </>
        )}
      </SigmaContainer>
    </div>
  );
};

export default Root;
