export interface NodeData {
  key: string;
  label: string;
  year: number;
  quarter: number;
  rank: number;
  type: string;
  studios: string;
  rating: string;
  URL: string;
  source: string;
  popularity: number;
  score: number;
  x: number;
  y: number;
}

export interface EdgeData {
  source_year: number;
  source: string;
  dest_year: number;
  dest: string;
  sim_score: number;
}

export interface Cluster {
  key: string;
  color: string;
  clusterLabel: string;
}

export interface Year {
  key: number;
  clusterLabel: string;
}

export interface Rating {
  key: string;
  color: string;
}

export interface Tag {
  key: string;
  image: string;
}

export interface Dataset {
  nodes: NodeData[];
  edges: EdgeData[];
  clusters: Cluster[];
  tags: Tag[];
  years: Year[];
  ratings: Rating[];
}

export interface FiltersState {
  clusters: Record<string, boolean>;
  tags: Record<string, boolean>;
  years: Record<number, boolean>;
  ratings: Record<string, boolean>;
}
