import { FC, useEffect, useState, CSSProperties } from "react";
import { MultiDirectedGraph } from "graphology";
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

function getRandomFloat(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

const GraphEvents: React.FC = () => {
  const registerEvents = useRegisterEvents();
  const sigma = useSigma();
  const [draggedNode, setDraggedNode] = useState<string | null>(null);

  useEffect(() => {
    // Register the events
    registerEvents({
      downNode: (e) => {
        setDraggedNode(e.node);
        sigma.getGraph().setNodeAttribute(e.node, "highlighted", true);
      },
      // On mouse move, if the drag mode is enabled, we change the position of the draggedNode
      mousemovebody: (e) => {
        if (!draggedNode) return;
        // Get new position of node
        const pos = sigma.viewportToGraph(e);
        sigma.getGraph().setNodeAttribute(draggedNode, "x", pos.x);
        sigma.getGraph().setNodeAttribute(draggedNode, "y", pos.y);

        // Prevent sigma to move camera:
        e.preventSigmaDefault();
        e.original.preventDefault();
        e.original.stopPropagation();
      },
      // On mouse up, we reset the autoscale and the dragging mode
      mouseup: () => {
        if (draggedNode) {
          setDraggedNode(null);
          sigma.getGraph().removeNodeAttribute(draggedNode, "highlighted");
        }
      },
      // Disable the autoscale at the first down interaction
      mousedown: () => {
        if (!sigma.getCustomBBox()) sigma.setCustomBBox(sigma.getBBox());
      },
    });
  }, [registerEvents, sigma, draggedNode]);

  return null;
};

const MyGraph: FC = () => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await fetch("data/graph_data.json");
        const data = await response.json();
        const { nodes, edges } = data;
        const newGraph = new MultiDirectedGraph();

        // Add nodes to the graph
        nodes.forEach((node: any) => {
          newGraph.addNode(node.label, {
            size: node.score,
            label: node.label,
            color: "#FA4F40",
          });
        });

        // Add edges to the graph
        edges.forEach((edge: any) => {
          newGraph.addEdge(edge.source, edge.dest, {
            size: edge.sim_score,
            color: "#dee2e6",
          });
        });

        // Position nodes in a random layout
        newGraph.forEachNode((node, attributes) => {
          newGraph.setNodeAttribute(node, "x", 100 * getRandomFloat(-2, 2));
          newGraph.setNodeAttribute(node, "y", 100 * getRandomFloat(-1, 1));
        });

        // Load graph into Sigma
        loadGraph(newGraph);
      } catch (error) {
        console.error("Error loading the graph data:", error);
      }
    };

    fetchGraphData();
  }, [loadGraph]);

  return null;
};

export const LoadGraphWithHook: FC<{ style?: CSSProperties }> = ({ style }) => {
  return (
    <SigmaContainer style={style} settings={{ allowInvalidContainer: true }}>
      <MyGraph />
      <GraphEvents />
      <ControlsContainer position={"bottom-right"}>
        <ZoomControl />
        <FullScreenControl />
      </ControlsContainer>
    </SigmaContainer>
  );
};
