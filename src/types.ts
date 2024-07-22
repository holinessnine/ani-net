import { types } from "util";

export interface NodeData {
  key: string;
  label: string;
  year: string;
  quarter: number;
  rank: number;
  type: string;
  studios: string;
  rating: string;
  URL: string;
  cluster: number;
  popularity: number;
  favorites: number;
  awarded: number,
  genre_action: number,
  genre_adventure:number,
  genre_comedy: number,
  genre_drama: number,
  genre_fantasy: number,
  genre_horror: number,
  genre_mystery: number,
  genre_romance: number,
  genre_sf: number,
  genre_sports: number,
  genre_suspense: number,
  source: string,
  duration: string,
  episodes: string,
  synopsis: string,
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
  type: string;
}


export interface Cluster {
  key: string;
  color: string;
  clusterLabel: string;
}

export interface Year {
  key: string;
  clusterLabel: string;
}

export interface Rating {
  key: string;
  clusterLabel: string;
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

  types: NodeData['type']; // 필터용으로 추가
}

export interface FiltersState {
  clusters: Record<string, boolean>;
  tags: Record<string, boolean>;
  years: Record<number, boolean>;
  ratings: Record<string, boolean>;
  
  types: Record<string, boolean>; // 필터용으로 추가
  scores: {
    min: number | null;
    max: number | null;
  }; // 필터용으로 추가

  // 이원화하여 지울 것
  favorites: {
    min: number | null;
    max: number | null;
  }; // 필터용으로 추가
  total_arts: {
    min: number | null;
    max: number | null;
  }; // 필터용으로 추가
  
}


export interface NodeData_c {
  key: string;
  label: string;
  year: string;
  type: string;
  top_art: string;
  top_rank: number;
  total_art: number;
  avg_favorites: number;
  avg_score: number;
  URL: string;
  cluster: string;
  color: string;
  x: number;
  y: number;
}

export interface EdgeData_c {
  year: string;
  source: string;
  dest: string;
  sim_score: number;
  type: string;
}


export interface Cluster_c {
  key: string;
  color: string;
  clusterLabel: string;
  x: number;
  y: number;
}

export interface Year_c {
  key: string;
  clusterLabel: string;
}


export interface Dataset_c {
  nodes: NodeData_c[];
  edges: EdgeData_c[];
  clusters: Cluster_c[];
  tags: Tag[];
  years: Year_c[];
  ratings: Rating[];
  
  types: Record<string, boolean>; // 필터용으로 추가 - 이원화하여 지울 것
}

export interface FiltersState_c {
  clusters: Record<string, boolean>;
  tags: Record<string, boolean>;
  years: Record<string, boolean>;
  ratings: Record<string, boolean>;

  types: Record<string, boolean>; // 필터용으로 추가 - 이원화하여 지울 것
  
  total_arts: {
    min: number | null;
    max: number | null;
  }
  favorites: {
    min: number | null;
    max: number | null;
  }
  scores: {
    min: number | null;
    max: number | null;
  }; // 필터용으로 추가
}
