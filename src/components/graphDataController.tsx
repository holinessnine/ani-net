import {
  FC,
  useEffect,
  useState,
  CSSProperties,
  PropsWithChildren,
} from "react";
import { MultiDirectedGraph } from "graphology";
import { keyBy, omit } from "lodash";
import {
  ControlsContainer,
  FullScreenControl,
  SigmaContainer,
  ZoomControl,
  useRegisterEvents,
  useSigma,
  useLoadGraph,
} from "@react-sigma/core";
import "@react-sigma/core/lib/react-sigma.min.css";
import { Dataset, FiltersState } from "../types";

const GraphDataController: FC<
  PropsWithChildren<{ dataset: Dataset; filters: FiltersState }>
> = ({ dataset, filters, children }) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();

  useEffect(() => {
    if (!graph || !dataset) {
      console.error("Graph or dataset not available");
      return;
    }

    try {
      graph.clear();
      // const type = keyBy(dataset.type, "key");
      const rating = keyBy(dataset.ratings, "key");

      dataset.nodes.forEach((node: any) => {
        graph.addNode(node.label, {
          size: node.score,
          label: node.label,
          color: "#6E58FF",
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
        graph.addEdge(edge.source, edge.dest, {
          size: edge.sim_score,
          color: "#D9D3FF",
        });
      });

      const scores = graph
        .nodes()
        .map((node) => graph.getNodeAttribute(node, "popularity"));
      const minDegree = Math.min(...scores);
      const maxDegree = Math.max(...scores);
      const MIN_NODE_SIZE = 3;
      const MAX_NODE_SIZE = 20;
      graph.forEachNode((node) =>
        graph.setNodeAttribute(
          node,
          "size",
          ((graph.getNodeAttribute(node, "popularity") - minDegree) /
            (maxDegree - minDegree)) *
            (MAX_NODE_SIZE - MIN_NODE_SIZE) +
            MIN_NODE_SIZE
        )
      );

      console.log("Graph data loaded successfully");
    } catch (error) {
      console.error("Error loading graph data:", error);
    }

    return () => graph.clear();
  }, [graph, dataset]);

  // useEffect(() => {
  //   const { clusters, tags, years, ratings } = filters;
  //   graph.forEachNode((node, { cluster, tag, year, rating }) =>
  //     graph.setNodeAttribute(
  //       node,
  //       "hidden",
  //       !clusters[cluster] || !tags[tag] || !years[year] || !ratings[rating]
  //     )
  //   );
  // }, [graph, filters]);

  return <>{children}</>;
};

export default GraphDataController;
