import pandas as pd
import numpy as np
import json
from sklearn.metrics.pairwise import cosine_similarity
import torch
from sentence_transformers import SentenceTransformer, util
import seaborn as sns
import matplotlib.pyplot as plt
import json
from mlxtend.preprocessing import TransactionEncoder
from mlxtend.frequent_patterns import apriori, association_rules
from transformers import pipeline
from keybert import KeyBERT
import networkx as nx
from community import community_louvain

class Anime_:
    def __init__(self, path) :
        self.path = path

        self.anime_df = pd.read_csv(self.path + 'anime_nodes.csv')
        self.preprocess()

        self.kw_model = KeyBERT(model='all-mpnet-base-v2')
        self.extract_keywords()

        self.anime_names = self.anime_df[['Name', 'Aired_Year', 'Rank', 'Studios']].to_numpy()


        self.model = SentenceTransformer('all-mpnet-base-v2')
        self.title_cosine_sim, self.syn_cosine_sim, self.conts_cosine_sim, self.genre_cosine_sim = self.get_sim_anime()
        self.get_edges_title_anime()

        self.fetch_pos_anime()

        self.edge_formation()
    


    def preprocess(self) :
        self.anime_df['Aired_Year'] = self.anime_df['Aired_Year'].fillna(0).astype(int)

        self.anime_df['Rank'] = pd.to_numeric(self.anime_df['Rank'], errors='coerce')
        self.anime_df['Rank'].fillna(np.inf, inplace=True)
        self.anime_df['Rank'].replace(0, np.inf, inplace=True)
        self.anime_df['Origin'] = self.anime_df['Name'].apply(lambda x: x.split(':')[0])
        self.anime_df['Origin'] = self.anime_df['Origin'].apply(lambda x: x.split('Movie')[0])
        self.anime_df['Origin'] = self.anime_df['Origin'].apply(lambda x: x.split('Film')[0])
        self.anime_df['Origin'] = self.anime_df['Origin'].apply(lambda x: x.split('Season')[0])
        # 양쪽 공백 제거
        self.anime_df['Origin'] = self.anime_df['Origin'].str.strip()
        self.anime_df = self.anime_df.loc[self.anime_df['Aired_Year'] > 1960]
        self.anime_df = self.anime_df.sort_values('Rank', ascending=True).head(2000).reset_index(drop=True)


    def _extract_keywords(self, text):
        keywords = self.kw_model.extract_keywords(text, keyphrase_ngram_range=(1, 1), use_mmr=True, diversity=0.5, top_n=5)
        return ', '.join([kw[0].capitalize() for kw in keywords])


    def extract_keywords(self):
        self.anime_df['synop_keyword'] = self.anime_df['Synopsis'].apply(self._extract_keywords)


    def get_sim_anime(self) :
        # 문장들을 인코딩하여 임베딩 생성
        embeddings = self.model.encode(self.anime_df['Origin'], convert_to_tensor=True)
        # 유사도 행렬 계산
        title_cosine_sim = util.pytorch_cos_sim(embeddings, embeddings).cpu().numpy()


        ####### Synopsis Similarity
        embeddings = self.model.encode(self.anime_df['Synopsis'], convert_to_tensor=True)

        # 유사도 행렬 계산
        syn_cosine_sim = util.pytorch_cos_sim(embeddings, embeddings).cpu().numpy()


        ####### Contributor Similarity

        def sort_contributors(row):
            contributors_list = row.split(', ')
            contributors_list.sort()
            return ', '.join(contributors_list)

        contributors = self.anime_df[['Producers', 'Licensors', 'Studios']].copy()
        contributors['Contributors'] = contributors[['Producers', 'Licensors', 'Studios']].agg(', '.join, axis=1)


        # Apply the function to sort the contributors alphabetically
        contributors['Studios'] = contributors['Studios'].apply(sort_contributors)

        # 문장들을 인코딩하여 임베딩 생성
        embeddings = self.model.encode(contributors['Studios'], convert_to_tensor=True)

        # 유사도 행렬 계산
        conts_cosine_sim = util.pytorch_cos_sim(embeddings, embeddings).cpu().numpy()



        ####### Genre Similarity

        genre_df = self.anime_df.iloc[:, list(range(23, 40))]
        genres = genre_df.iloc[:, :].to_numpy()

        # 코사인 유사도 계산
        genre_cosine_sim = cosine_similarity(genres)

        return title_cosine_sim, syn_cosine_sim, conts_cosine_sim, genre_cosine_sim


    def get_edges_title_anime(self) :
        data = []

        for i in range(len(self.anime_names)):
            indices = np.where(self.title_cosine_sim[i] >= 0.7)[0]
            indices = indices[indices > i]  # j 이상의 인덱스만 유지
            names= self.anime_names[indices, 0]
            years= self.anime_names[indices, 1]
            studios= self.anime_names[indices, 3]
            sim_scores = self.title_cosine_sim[i][indices]

                # 루프를 돌며 data 리스트에 데이터 추가
            for name, year, score, studio in zip(names, years, sim_scores, studios):
                if score < 0.75 :
                    if studio == self.anime_names[i, 3] :         
                        data.append([self.anime_names[i, 1], self.anime_names[i, 0], year, name, score, 'title'])
                else :
                    data.append([self.anime_names[i, 1], self.anime_names[i, 0], year, name, score, 'title'])

        self.edge_df = pd.DataFrame(data, columns=["source_year","source", "dest_year","dest", "sim_score", "type"])


    def fetch_pos_anime(self) :
        # 네트워크 그래프 생성
        G = nx.Graph()

        # 간선 추가
        for _, row in self.anime_df.iterrows():
            G.add_node(row['Name'])

        for _, row in self.edge_df.iterrows():
            G.add_edge(row['source'], row['dest'], weight=row['sim_score'])

        # Louvain 커뮤니티 감지
        partition = community_louvain.best_partition(G, weight='weight')
        self.anime_df['Title_Com'] = self.anime_df['Name'].map(partition)


        # Count the number of rows per partition
        partition_counts = self.anime_df['Title_Com'].value_counts().reset_index()
        partition_counts.columns = ['Title_Com', 'Partition_Count']

        # Merge the counts back into the anime_df DataFrame
        self.anime_df = self.anime_df.merge(partition_counts, on='Title_Com', how='left')

        self.anime_df = self.anime_df.sort_values("Title_Com")

        # Parameters
        num_points = len(self.anime_df)
        center_density = 0.1
        outer_density = 0.1

        # Generate random points
        angles = np.random.uniform(0, 2 * np.pi, num_points)
        radii = np.random.uniform(0, 1, num_points) ** 0.5  # to create more points towards the center

        # Convert polar coordinates to Cartesian coordinates
        x = radii * np.cos(angles) * 3000
        y = radii * np.sin(angles) * 2000

        # Combine x and y into a single array of points
        points = np.vstack((x, y)).T

        # Start at the center
        current_point = np.array([0, 0])
        visited = np.zeros(num_points, dtype=bool)
        sorted_points = []

        # Find the nearest neighbor iteratively
        for _ in range(num_points):
            distances = np.linalg.norm(points - current_point, axis=1)
            distances[visited] = np.inf  # Ignore already visited points
            nearest_index = np.argmin(distances)
            sorted_points.append(points[nearest_index])
            visited[nearest_index] = True
            current_point = points[nearest_index]

        # Convert the sorted points back to x and y arrays
        sorted_points = np.array(sorted_points)
        x_sorted = sorted_points[:, 0]
        y_sorted = sorted_points[:, 1]
        self.anime_df['x'] = x_sorted
        self.anime_df['y'] = y_sorted

        print("***Anime Nodes Calculation Complete!!!")

    def edge_formation(self) :
        data = []

        for i in range(len(self.anime_names)):
            indices = np.where(self.conts_cosine_sim[i] >= 0.85)[0]
            indices = indices[indices > i]  # j 이상의 인덱스만 유지
            names= self.anime_names[indices, 0]
            years= self.anime_names[indices, 1]
            sim_scores = self.conts_cosine_sim[i][indices]

                # 루프를 돌며 data 리스트에 데이터 추가
            for name, year, score in zip(names, years, sim_scores):
                data.append([self.anime_names[i, 1], self.anime_names[i, 0], year, name, score, 'contributor'])


        for i in range(len(self.anime_names)):
            indices = np.where((self.syn_cosine_sim[i] >= 0.65) & (self.syn_cosine_sim[i] <= 0.99))[0]
            indices = indices[indices > i]  # j 이상의 인덱스만 유지
            names= self.anime_names[indices, 0]
            years= self.anime_names[indices, 1]
            sim_scores = self.syn_cosine_sim[i][indices]

                # 루프를 돌며 data 리스트에 데이터 추가
            for name, year, score in zip(names, years, sim_scores):
                data.append([self.anime_names[i, 1], self.anime_names[i, 0], year, name, score, 'synopsis'])


        for i in range(len(self.anime_names)):
            indices = np.where((self.genre_cosine_sim[i] >= 0.99))[0]
            indices = indices[indices > i]  # j 이상의 인덱스만 유지
            names= self.anime_names[indices, 0]
            years= self.anime_names[indices, 1]
            sim_scores = self.genre_cosine_sim[i][indices]

                # 루프를 돌며 data 리스트에 데이터 추가
            for name, year, score in zip(names, years, sim_scores):
                data.append([self.anime_names[i, 1], self.anime_names[i, 0], year, name, score, 'genre'])
                

        df2 = pd.DataFrame(data, columns=["source_year","source", "dest_year","dest", "sim_score", "type"])

        self.edge_tt_df = pd.concat([self.edge_df, df2], ignore_index=True)
        print("***Anime Edge Calculation Complete!!!")

    def data_to_csv(self) :
        self.anime_df.to_csv(self.path + "nodes_anime_sample.csv", index=False)
        print(self.path + "nodes_anime_sample.csv created.")
        self.edge_tt_df.to_csv(self.path + "edges_anime_sample.csv", index=False)
        print(self.path + "edges_anime_sample.csv created.")


class Contributor_:
    def __init__(self, path) :
        self.path = path
        self.contri_df = pd.read_csv(path + 'contributor_nodes.csv')

        with open(path + 'contributors_apriori.json', 'r') as json_file:
            self.contri_apri = json.load(json_file)

        self.contri_node()
        self.contri_edge()


    def contri_node(self) :
        role_columns = self.contri_df.columns[2:5]
        top_role = self.contri_df[role_columns].apply(lambda x: x.nlargest(1).index.tolist(), axis=1)


        role_contri_df = self.contri_df.copy()
        role_contri_df['Top_Role'] = top_role.apply(lambda x: x[0])


        self.contri_names = role_contri_df[['contributor', 'year', 'total' , 'Top_Role']].to_numpy()

        role_contri_df_tt = role_contri_df.loc[(role_contri_df['year'] == "Total")]
        role_contri_df_yy = role_contri_df.loc[(role_contri_df['year'] != "Total") &(role_contri_df['year'].notna()) ]
        role_contri_df_yy = role_contri_df_yy[(role_contri_df_yy['year'].str.isdigit()) & (role_contri_df_yy['year'].astype(int) > 1961)]

        self.role_contri_df = pd.concat([role_contri_df_tt, role_contri_df_yy])
        print("***Contributors Nodes Calculation Complete!!!")

    def contri_edge(self) :
        genre_columns = self.role_contri_df.columns[self.role_contri_df.columns.str.startswith('genre_')]

        # Finding the top 2 genres for each row
        top_genres = self.role_contri_df[genre_columns].apply(lambda x: x.nlargest(3).index.tolist(), axis=1)

        genre_contri_df = self.role_contri_df.copy()
        # Creating new columns for the top 2 genres
        genre_contri_df['Top_Genre_1'] = top_genres.apply(lambda x: x[0][6:])
        genre_contri_df['Top_Genre_2'] = top_genres.apply(lambda x: x[1][6:])
        genre_contri_df['Top_Genre_3'] = top_genres.apply(lambda x: x[2][6:])


        self.contri_genre_names = genre_contri_df[['contributor', 'year', 'total' ,'Top_Genre_1', 'Top_Genre_2', 'Top_Genre_3']].to_numpy()

        genre_df = self.role_contri_df.iloc[:, list(range(16, 32))]
        genres = genre_df.iloc[:, :].to_numpy()

        # 코사인 유사도 계산
        self.genre_cosine_sim = cosine_similarity(genres)
        data = []

        for i in range(len(self.contri_genre_names)):
            if self.contri_genre_names[i, 1] == 'Total' :
                indices = np.where(self.genre_cosine_sim[i] > 0.9)[0]
            else :
                indices = np.where(self.genre_cosine_sim[i] > 0.8)[0]

            indices = indices[indices > i]  # j 이상의 인덱스만 유지
            names= self.contri_genre_names[indices, 0]
            years= self.contri_genre_names[indices, 1]
            sim_scores = self.genre_cosine_sim[i][indices]

                # 루프를 돌며 data 리스트에 데이터 추가
            for name, year, score in zip(names, years, sim_scores):
                if self.contri_genre_names[i, 1] == year and (year == 'Total' or int(year) > 1960):
                    data.append([year, self.contri_genre_names[i, 0], name, score])

        df = pd.DataFrame(data, columns=["year","source","dest", "sim_score"])
        df['type'] = 'genre'
        def create_edge_list(data_dict):
            edges = []
            for year, data in data_dict.items():
                all_elements = list(set([element for sublist in data for element in sublist]))
                interaction_matrix = pd.DataFrame(np.zeros((len(all_elements), len(all_elements))), index=all_elements, columns=all_elements)
                for sublist in data:
                    for i in range(len(sublist)):
                        for j in range(i + 1, len(sublist)):
                            interaction_matrix.loc[sublist[i], sublist[j]] += 1
                            interaction_matrix.loc[sublist[j], sublist[i]] += 1
                for i in range(len(all_elements)):
                    for j in range(i + 1, len(all_elements)):
                        if interaction_matrix.iloc[i, j] > 0:
                            edges.append([year, all_elements[i], all_elements[j], int(interaction_matrix.iloc[i, j])])
            return pd.DataFrame(edges, columns=["year", "source", "dest", "sim_score"])

        edges = create_edge_list(self.contri_apri)
        edges['type'] = 'cowork'

        self.edges_df = pd.concat([df, edges])
        print("***Contributors Edge Calculation Complete!!!")

    def data_to_csv(self) :
        self.role_contri_df.to_csv(self.path + "contri_nodes_sample.csv", index=False)
        print(self.path + "contri_nodes_sample.csv created")
        self.edges_df.to_csv(self.path + "contri_edges_sample.csv", index=False)
        print(self.path + "contri_edges_sample.csv created")