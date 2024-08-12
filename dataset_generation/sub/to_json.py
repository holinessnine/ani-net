import pandas as pd
import json
import numpy as np


class Anime_Json :
    def __init__(self, path) :
        self.path = path

        self.nodes_df = pd.read_csv(path + "nodes_anime_sample.csv")
        self.nodes_df['Aired_Year'] = self.nodes_df['Aired_Year'].astype(str)

        self.edges_df = pd.read_csv(path + "edges_anime_sample.csv")

    def to_json(self) :
        # Nodes 데이터 변환
        nodes = []
        for index, row in self.nodes_df.iterrows():
            node = {
                "key": row['Name'],
                "label": row['Name'],
                "eng_name": row['English name'],
                "other_name": row['Other name'],
                "year": row['Aired_Year'],
                "quarter": row['Aired_Quarter'],
                "type": 'Else' if (row['Type'] != "TV" and row['Type'] != "Movie" and row['Type'] != "OVA") else row['Type'],
                "rank": row['Rank'],
                "studios": row['Studios'],
                "rating": row['Rating'],
                "scored_by": row['Scored By'],
                #"tag": row['tag'],
                "URL": row['Image URL'],
                "popularity": row['Popularity'],
                "favorites": row['Favorites'],
                "cluster": row['Title_Com'],
                "cluster_n": row['Partition_Count'],
                "awarded": row['genre_Award Winning'],
                "genre_action": row['genre_Action'],
                "genre_adventure": row['genre_Adventure'],
                "genre_comedy": row['genre_Comedy'],
                "genre_drama": row['genre_Drama'],
                "genre_fantasy": row['genre_Fantasy'],
                "genre_horror": row['genre_Horror'],
                "genre_mystery": row['genre_Mystery'],
                "genre_romance": row['genre_Romance'],
                "genre_sf": row['genre_Sci-Fi'],
                "genre_sports": row['genre_Sports'],
                "genre_suspense": row['genre_Suspense'],
                "source": row['Source'],
                "duration": row['Duration'],
                "episodes": row['Episodes'],
                "synopsis": row['Synopsis'],
                "synop_key": row['synop_keyword'],
                "x": row['x'],
                "y": row['y'],
                "score": row['Score']
            }
            nodes.append(node)

        # Edges 데이터 변환
        edges = []
        for index, row in self.edges_df.iterrows():
            edge = {
                'source_year': row['source_year'],
                'source': row['source'],
                'dest_year': row['dest_year'],
                'dest': row['dest'],
                'sim_score': row['sim_score'],
                'type': row['type']
            }
            edges.append(edge)

        types = []
        types.append({"key": "TV", "clusterLabel": "TV"})
        types.append({"key": "Movie", "clusterLabel": "Movie"})
        types.append({"key": "OVA", "clusterLabel": "OVA"})
        types.append({"key": "Else", "clusterLabel": "Else"})

        year_list = list(self.nodes_df.Aired_Year.unique())
        year_list.sort()

        years = []
        for y in year_list:
            year = {
                "key": y,
                "clusterLabel": y
            }
            years.append(year)

        rating_list = list(self.nodes_df.Rating.unique())
        rating_list.sort()
        ratings = []
        for r in rating_list:
            rating = {
                "key": r,
                "clusterLabel": r
            }
            ratings.append(rating)


        # JSON 데이터 생성
        graph_data = {
            "nodes": nodes,
            "edges": edges,
            "types": types,
            "years": years,
            "ratings": ratings
        }

        with open(self.path+'graph_data_anime.json', 'w') as json_file:
            json.dump(graph_data, json_file, indent=4)

        print(f"***Anime Dataset {self.path}/graph_data_anime.json Finally Created")



class Contri_Json :
    def __init__(self, path) :
        self.path = path

        self.nodes_df = pd.read_csv(path+"contri_nodes_sample.csv")
        self.edges_df = pd.read_csv(path+"contri_edges_sample.csv")

    def to_json(self) :
        # Nodes 데이터 변환
        centers = [
            (-0.75, 0),
            (0.75, 0),
            (0, np.sqrt(3 * 0.55))
        ]


        nodes = []
        for index, row in self.nodes_df.iterrows():
            cluster_idx = ['producer', 'licensor', 'studio'].index(row['Top_Role'])
            cx, cy = centers[cluster_idx]
            angle = np.random.uniform(0, 2 * np.pi)
            radius = np.random.uniform(0, 0.5)
            x = cx + np.sqrt(radius) * np.cos(angle)
            y = cy + np.sqrt(radius) * np.sin(angle)
            
            node = {
                "key": row['contributor'],
                "label": row['contributor'],
                "year": row['year'],
                "type": row['Top_Role'],
                "top_art": row['Top_Name'] if not pd.isna(row['Top_Name']) else "None",
                "top_rank": row['Top_Rank'],
                "total_art": row['total'],
                "total_producer": row['producer'],
                "total_licensor": row['licensor'],
                "total_studio": row['studio'],
                "awarded": row['genre_Award Winning'],
                "genre_action": row['genre_Action'],
                "genre_adventure": row['genre_Adventure'],
                "genre_comedy": row['genre_Comedy'],
                "genre_drama": row['genre_Drama'],
                "genre_fantasy": row['genre_Fantasy'],
                "genre_horror": row['genre_Horror'],
                "genre_mystery": row['genre_Mystery'],
                "genre_romance": row['genre_Romance'],
                "genre_sf": row['genre_Sci-Fi'],
                "genre_sports": row['genre_Sports'],
                "genre_suspense": row['genre_Suspense'],
                "avg_favorites": row['Avg_Favorites'],
                "avg_score": row['Avg_Score'],
                "URL": row['Top_url'] if not pd.isna(row['Top_url']) else "",
                "cluster": row['Top_Role'],
                "color": "#D81159" if row['Top_Role']=="licensor" else ("#FFBC42" if row['Top_Role'] == "producer" else "#0496FF"),
                "x": x * 1000,  # Scaling to fit in the plot
                "y": y * 1000,  # Scaling to fit in the plot
            }
            nodes.append(node)

        # Edges 데이터 변환
        edges = []
        for index, row in self.edges_df.iterrows():
            if not pd.isna(row['year']):
                edge = {
                    'year': row['year'],
                    'source': row['source'],
                    'dest': row['dest'],
                    'sim_score': row['sim_score'],
                    'type': row['type']
                }
                edges.append(edge)

        clusters = []
        clusters.append({"key": "licensor", "color": "#D81159", "clusterLabel": "Licensor", "x": -750, "y": 0})
        clusters.append({"key": "producer", "color": "#FFBC42", "clusterLabel": "Producer", "x": 750, "y": 0})
        clusters.append({"key": "studio", "color": "#0496FF", "clusterLabel": "Studio", "x": 0, "y": np.sqrt(3 * 0.55)*1000})


        year_list = list(self.nodes_df.year.unique())
        year_list.sort()


        years = []
        for y in year_list:
            year = {
                "key": y,
                "clusterLabel": y
            }
            years.append(year)

        # JSON 데이터 생성
        graph_data = {
            "nodes": nodes,
            "edges": edges,
            "clusters": clusters,
            "years": years
        }

        with open(self.path+'graph_data_contri.json', 'w') as json_file:
            json.dump(graph_data, json_file, indent=4)

        print(f"***Contri Dataset {self.path}/graph_data_contri.json Finally Created")