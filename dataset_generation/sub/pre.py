import pandas as pd
import numpy as np
from sklearn.preprocessing import MultiLabelBinarizer
import re
import json



class Pre_:
    def __init__(self, path) :
        self.path = path
        self.data = pd.read_csv(self.path + "anime-dataset-2023.csv")

    #########달과 월 분리하는 함수
    def extract_month(self, date):
        match = re.search(r'(\b\w{3}\b)', date)
        if match:
            return match.group(1)
        return None

    # 연도 분리 함수 정의
    def extract_year(self, date):
        match = re.search(r'(\b\d{4}\b)', date)
        if match:
            return match.group(1)
        return None


    def get_quarter(self, month):
        if month in ['Jan', 'Feb', 'Mar']:
            return 1
        elif month in ['Apr', 'May', 'Jun']:
            return 2
        elif month in ['Jul', 'Aug', 'Sep']:
            return 3
        elif month in ['Oct', 'Nov', 'Dec']:
            return 4
        else:
            return 0

    def create_anime_data(self) :

        ########## Genre 관련 전처리 ##########
        #### ', '으로 구분되어있는 Genre 컬럼 분리
        self.data['Genres'] = self.data['Genres'].apply(lambda x: x.split(', '))
        mlb = MultiLabelBinarizer()
        #### genre_ + 장르명 컬럼 생성
        genre_df = pd.DataFrame(mlb.fit_transform(self.data['Genres']), columns="genre_"+mlb.classes_, index=self.data.index)
        self.data = self.data.drop('Genres', axis=1)
        self.data = pd.concat([self.data, genre_df], axis=1)
        #### 음란성과 관련된 장르의 애니메이션들은 제거 -> 약 2,000개
        self.data = self.data.loc[(self.data['genre_Boys Love']==0) & (self.data['genre_Ecchi']==0) & (self.data['genre_Erotica']==0) & (self.data['genre_Girls Love']==0) & (self.data['genre_Hentai']==0) ]
        self.data = self.data.drop(['genre_Boys Love', 'genre_Ecchi', 'genre_Erotica', 'genre_Girls Love', 'genre_Hentai'], axis=1)


        ########## Type 관련 전처리 ##########
        #### Music은 Music Video라서 제외, UNKNOWN은 약 70개만 있고 나머지 컬럼들도 값이 없는 경우가 많아 제외 -> 약 2,000개
        self.data = self.data.loc[(self.data['Type'] != 'Music') & (self.data['Type'] != 'UNKNOWN')]


        ########## 방영일 관련 전처리 ###########
        #### Premiered는 전체 중 약 70%가 'UNKNOWN' 이라서, Aired 기준으로 날짜 처리
        self.data['Aired_new'] = self.data['Aired'].apply(lambda x: x.split(' to')[0])



        # 월 열 추가
        self.data['Aired_Month'] = self.data['Aired_new'].apply(self.extract_month)
        self.data['Aired_Quarter'] = self.data['Aired_Month'].apply(self.get_quarter)

        # 연도 열 추가
        self.data['Aired_Year'] = self.data['Aired_new'].apply(self.extract_year)

        self.data= self.data.drop(['Aired', 'Aired_new', 'Premiered'], axis=1)
        self.data= self.data[['anime_id', 'Name', 'English name', 'Other name', 'Aired_Year', 'Aired_Month', 'Aired_Quarter', 'Score', 'Synopsis',
            'Type', 'Episodes', 'Status', 'Producers', 'Licensors', 'Studios',
            'Source', 'Duration', 'Rating', 'Rank', 'Popularity', 'Favorites',
            'Scored By', 'Members', 'genre_Action', 'genre_Adventure',
            'genre_Avant Garde', 'genre_Award Winning', 'genre_Comedy',
            'genre_Drama', 'genre_Fantasy', 'genre_Gourmet', 'genre_Horror',
            'genre_Mystery', 'genre_Romance', 'genre_Sci-Fi', 'genre_Slice of Life',
            'genre_Sports', 'genre_Supernatural', 'genre_Suspense', 'genre_UNKNOWN', 'Image URL'
            ]]

        self.data.to_csv(self.path + "anime_nodes.csv", index=False)
        print("***Animation Nodes Created")


    def create_contri_data(self) :
        data_prods = self.data[['Producers', 'Licensors', 'Studios', 'anime_id', 'Name', 'English name', 'Other name', 'Aired_Year', 'Aired_Month', 'Aired_Quarter', 'Score', 'Synopsis',
       'Type', 'Episodes', 
       'Source', 'Duration', 'Rating', 'Rank', 'Popularity', 'Favorites',
       'Scored By', 'Members', 'genre_Action', 'genre_Adventure',
       'genre_Avant Garde', 'genre_Award Winning', 'genre_Comedy',
       'genre_Drama', 'genre_Fantasy', 'genre_Gourmet', 'genre_Horror',
       'genre_Mystery', 'genre_Romance', 'genre_Sci-Fi', 'genre_Slice of Life',
       'genre_Sports', 'genre_Supernatural', 'genre_Suspense', 'genre_UNKNOWN', 'Image URL'
       ]].copy()

        data_prods.loc[:, 'Producers'] = data_prods['Producers'].apply(lambda x: x.split(', '))
        data_prods.loc[:, 'Licensors'] = data_prods['Licensors'].apply(lambda x: x.split(', '))
        data_prods.loc[:, 'Studios'] = data_prods['Studios'].apply(lambda x: x.split(', '))

        ########## Producer, Licensors, Studios를 한번에 묶어서 Contributors로 명명하고 데이터 생성.

        ### Contributor Data 생성할 Dictionary
        contributor_dict = {}

        ### Edge 생성을 위한 장바구니 분석 위해서 연도별 장바구니 생성
        aprior = {'Total': []}

        ### 전처리한 기존 Anime Dataset 돌며 데이터 생성
        for index, row in data_prods.iterrows() :
            ### Producer, Licensor, Studio에 중복 등장하는 경우를 위해 current 리스트 생성
            current = []

            ### Producer, Licensor, Studio 각각에 대하여, 몇 개의 작품을 했는지 / 작품들의 평균적인 평가 / 스튜디오 연도별 대표작 / 매체별 숫자 / 장르별 숫자 매핑 
            for producer in row['Producers'] :
                if producer == 'UNKNOWN' :
                    continue
            
                if producer not in contributor_dict :
                    contributor_dict[producer] = {'Total': {}}
                    contributor_dict[producer]['Total'] = {'producer': 0,'licensor': 0, 'studio': 0, 'total': 0, 'Avg_Score': 0
                                                                    , 'Avg_Favorites': 0, 'Top_Rank' : 20000, 'Top_Name' : '', 'Top_url' : ''
                                                                    , 'TV': 0, 'Movie': 0, 'OVA': 0, 'Special': 0, 'ONA': 0, 
                                                                        'genre_Action': 0,	'genre_Adventure': 0,	'genre_Avant Garde': 0,	'genre_Award Winning': 0,
                                                                        'genre_Comedy': 0,	'genre_Drama': 0,	'genre_Fantasy': 0,
                                                                        'genre_Gourmet': 0,	'genre_Horror': 0,	'genre_Mystery': 0,	'genre_Romance': 0,
                                                                        'genre_Sci-Fi': 0,	'genre_Slice of Life': 0,	'genre_Sports': 0,
                                                                        'genre_Supernatural': 0,	'genre_Suspense': 0,}
                if row['Aired_Year'] not in contributor_dict[producer] :
                    contributor_dict[producer][row['Aired_Year']] = {'producer': 0,'licensor': 0, 'studio': 0, 'total': 0, 'Avg_Score': 0
                                                                    , 'Avg_Favorites': 0, 'Top_Rank' : 20000, 'Top_Name' : '', 'Top_url' : ''
                                                                    , 'TV': 0, 'Movie': 0, 'OVA': 0, 'Special': 0, 'ONA': 0, 
                                                                        'genre_Action': 0,	'genre_Adventure': 0,	'genre_Avant Garde': 0,	'genre_Award Winning': 0,
                                                                        'genre_Comedy': 0,	'genre_Drama': 0,	'genre_Fantasy': 0,
                                                                        'genre_Gourmet': 0,	'genre_Horror': 0,	'genre_Mystery': 0,	'genre_Romance': 0,
                                                                        'genre_Sci-Fi': 0,	'genre_Slice of Life': 0,	'genre_Sports': 0,
                                                                        'genre_Supernatural': 0,	'genre_Suspense': 0,}
            
                contributor_dict[producer][row['Aired_Year']]['producer'] += 1
                contributor_dict[producer][row['Aired_Year']]['total'] += 1

                contributor_dict[producer]['Total']['producer'] += 1
                contributor_dict[producer]['Total']['total'] += 1
                if row['Score'] != 'UNKNOWN' :
                    contributor_dict[producer]['Total']['Avg_Score'] += float(row['Score'])
                    contributor_dict[producer][row['Aired_Year']]['Avg_Score'] += float(row['Score'])
                if row['Favorites'] != 'UNKNOWN' :
                    contributor_dict[producer]['Total']['Avg_Favorites'] += float(row['Favorites'])
                    contributor_dict[producer][row['Aired_Year']]['Avg_Favorites'] += float(row['Favorites'])

                if row['Rank'] != 'UNKNOWN' and contributor_dict[producer][row['Aired_Year']]['Top_Rank'] > float(row['Rank']) :
                    contributor_dict[producer][row['Aired_Year']]['Top_Rank'] = float(row['Rank'])
                    contributor_dict[producer][row['Aired_Year']]['Top_Name'] = row['Name']
                    contributor_dict[producer][row['Aired_Year']]['Top_url'] = row['Image URL']
                    if contributor_dict[producer]['Total']['Top_Rank'] > float(row['Rank']) :
                            contributor_dict[producer]['Total']['Top_Rank'] = float(row['Rank'])
                            contributor_dict[producer]['Total']['Top_Name'] = row['Name']
                            contributor_dict[producer]['Total']['Top_url'] = row['Image URL']

                if row['Type'] == 'TV' :
                    contributor_dict[producer]['Total']['TV'] += 1
                    contributor_dict[producer][row['Aired_Year']]['TV'] += 1
                elif row['Type'] == 'Movie':
                    contributor_dict[producer]['Total']['Movie'] += 1
                    contributor_dict[producer][row['Aired_Year']]['Movie'] += 1
                elif row['Type'] == 'OVA' :
                    contributor_dict[producer]['Total']['OVA'] += 1
                    contributor_dict[producer][row['Aired_Year']]['OVA'] += 1
                elif row['Type'] == 'Special' :
                    contributor_dict[producer]['Total']['Special'] += 1
                    contributor_dict[producer][row['Aired_Year']]['Special'] += 1
                elif row['Type'] == 'ONA' :
                    contributor_dict[producer]['Total']['ONA'] += 1
                    contributor_dict[producer][row['Aired_Year']]['ONA'] += 1


                contributor_dict[producer][row['Aired_Year']]['genre_Action'] += row['genre_Action']
                contributor_dict[producer][row['Aired_Year']]['genre_Adventure'] += row['genre_Adventure']
                contributor_dict[producer][row['Aired_Year']]['genre_Avant Garde'] += row['genre_Avant Garde']
                contributor_dict[producer][row['Aired_Year']]['genre_Award Winning'] += row['genre_Award Winning']
                contributor_dict[producer][row['Aired_Year']]['genre_Comedy'] += row['genre_Comedy']
                contributor_dict[producer][row['Aired_Year']]['genre_Drama'] += row['genre_Drama']
                contributor_dict[producer][row['Aired_Year']]['genre_Fantasy'] += row['genre_Fantasy']
                contributor_dict[producer][row['Aired_Year']]['genre_Gourmet'] += row['genre_Gourmet']
                contributor_dict[producer][row['Aired_Year']]['genre_Horror'] += row['genre_Horror']
                contributor_dict[producer][row['Aired_Year']]['genre_Mystery'] += row['genre_Mystery']
                contributor_dict[producer][row['Aired_Year']]['genre_Romance'] += row['genre_Romance']
                contributor_dict[producer][row['Aired_Year']]['genre_Sci-Fi'] += row['genre_Sci-Fi']
                contributor_dict[producer][row['Aired_Year']]['genre_Slice of Life'] += row['genre_Slice of Life']
                contributor_dict[producer][row['Aired_Year']]['genre_Sports'] += row['genre_Sports']
                contributor_dict[producer][row['Aired_Year']]['genre_Supernatural'] += row['genre_Supernatural']
                contributor_dict[producer][row['Aired_Year']]['genre_Suspense'] += row['genre_Suspense']


                contributor_dict[producer]['Total']['genre_Action'] += row['genre_Action']
                contributor_dict[producer]['Total']['genre_Adventure'] += row['genre_Adventure']
                contributor_dict[producer]['Total']['genre_Avant Garde'] += row['genre_Avant Garde']
                contributor_dict[producer]['Total']['genre_Award Winning'] += row['genre_Award Winning']
                contributor_dict[producer]['Total']['genre_Comedy'] += row['genre_Comedy']
                contributor_dict[producer]['Total']['genre_Drama'] += row['genre_Drama']
                contributor_dict[producer]['Total']['genre_Fantasy'] += row['genre_Fantasy']
                contributor_dict[producer]['Total']['genre_Gourmet'] += row['genre_Gourmet']
                contributor_dict[producer]['Total']['genre_Horror'] += row['genre_Horror']
                contributor_dict[producer]['Total']['genre_Mystery'] += row['genre_Mystery']
                contributor_dict[producer]['Total']['genre_Romance'] += row['genre_Romance']
                contributor_dict[producer]['Total']['genre_Sci-Fi'] += row['genre_Sci-Fi']
                contributor_dict[producer]['Total']['genre_Slice of Life'] += row['genre_Slice of Life']
                contributor_dict[producer]['Total']['genre_Sports'] += row['genre_Sports']
                contributor_dict[producer]['Total']['genre_Supernatural'] += row['genre_Supernatural']
                contributor_dict[producer]['Total']['genre_Suspense'] += row['genre_Suspense']
                current.append(producer)

            for licensor in row['Licensors'] :
                if licensor == 'UNKNOWN' :
                    continue

                if licensor not in contributor_dict :
                    contributor_dict[licensor] = {'Total': {}}
                    contributor_dict[licensor]['Total'] = {'producer': 0,'licensor': 0, 'studio': 0, 'total': 0, 'Avg_Score': 0
                                                                    , 'Avg_Favorites': 0, 'Top_Rank' : 20000, 'Top_Name' : '', 'Top_url' : ''
                                                                    , 'TV': 0, 'Movie': 0, 'OVA': 0, 'Special': 0, 'ONA': 0, 
                                                                        'genre_Action': 0,	'genre_Adventure': 0,	'genre_Avant Garde': 0,	'genre_Award Winning': 0,
                                                                        'genre_Comedy': 0,	'genre_Drama': 0,	'genre_Fantasy': 0,
                                                                        'genre_Gourmet': 0,	'genre_Horror': 0,	'genre_Mystery': 0,	'genre_Romance': 0,
                                                                        'genre_Sci-Fi': 0,	'genre_Slice of Life': 0,	'genre_Sports': 0,
                                                                        'genre_Supernatural': 0,	'genre_Suspense': 0,}
                if row['Aired_Year'] not in contributor_dict[licensor] :
                    contributor_dict[licensor][row['Aired_Year']] = {'producer': 0,'licensor': 0, 'studio': 0, 'total': 0, 'Avg_Score': 0
                                                                    , 'Avg_Favorites': 0, 'Top_Rank' : 20000, 'Top_Name' : '', 'Top_url' : ''
                                                                    , 'TV': 0, 'Movie': 0, 'OVA': 0, 'Special': 0, 'ONA': 0, 
                                                                        'genre_Action': 0,	'genre_Adventure': 0,	'genre_Avant Garde': 0,	'genre_Award Winning': 0,
                                                                        'genre_Comedy': 0,	'genre_Drama': 0,	'genre_Fantasy': 0,
                                                                        'genre_Gourmet': 0,	'genre_Horror': 0,	'genre_Mystery': 0,	'genre_Romance': 0,
                                                                        'genre_Sci-Fi': 0,	'genre_Slice of Life': 0,	'genre_Sports': 0,
                                                                        'genre_Supernatural': 0,	'genre_Suspense': 0,}
                    
                contributor_dict[licensor][row['Aired_Year']]['licensor'] += 1
                contributor_dict[licensor]['Total']['licensor'] += 1

                if licensor not in current :
                    contributor_dict[licensor][row['Aired_Year']]['total'] += 1
                    contributor_dict[licensor]['Total']['total'] += 1
                    if row['Score'] != 'UNKNOWN' :
                            contributor_dict[licensor]['Total']['Avg_Score'] += float(row['Score'])
                            contributor_dict[licensor][row['Aired_Year']]['Avg_Score'] += float(row['Score'])
                    if row['Favorites'] != 'UNKNOWN' :
                            contributor_dict[licensor]['Total']['Avg_Favorites'] += float(row['Favorites'])
                            contributor_dict[licensor][row['Aired_Year']]['Avg_Favorites'] += float(row['Favorites'])

                    if row['Rank'] != 'UNKNOWN' and contributor_dict[licensor][row['Aired_Year']]['Top_Rank'] > float(row['Rank']) :
                            contributor_dict[licensor][row['Aired_Year']]['Top_Rank'] = float(row['Rank'])
                            contributor_dict[licensor][row['Aired_Year']]['Top_Name'] = row['Name']
                            contributor_dict[licensor][row['Aired_Year']]['Top_url'] = row['Image URL']
                            if contributor_dict[licensor]['Total']['Top_Rank'] > float(row['Rank']) :
                                contributor_dict[licensor]['Total']['Top_Rank'] = float(row['Rank'])
                                contributor_dict[licensor]['Total']['Top_Name'] = row['Name']
                                contributor_dict[licensor]['Total']['Top_url'] = row['Image URL']

                    if row['Type'] == 'TV' :
                            contributor_dict[licensor]['Total']['TV'] += 1
                            contributor_dict[licensor][row['Aired_Year']]['TV'] += 1
                    elif row['Type'] == 'Movie':
                            contributor_dict[licensor]['Total']['Movie'] += 1
                            contributor_dict[licensor][row['Aired_Year']]['Movie'] += 1
                    elif row['Type'] == 'OVA' :
                            contributor_dict[licensor]['Total']['OVA'] += 1
                            contributor_dict[licensor][row['Aired_Year']]['OVA'] += 1
                    elif row['Type'] == 'Special' :
                            contributor_dict[licensor]['Total']['Special'] += 1
                            contributor_dict[licensor][row['Aired_Year']]['Special'] += 1
                    elif row['Type'] == 'ONA' :
                            contributor_dict[licensor]['Total']['ONA'] += 1
                            contributor_dict[licensor][row['Aired_Year']]['ONA'] += 1


                    contributor_dict[licensor][row['Aired_Year']]['genre_Action'] += row['genre_Action']
                    contributor_dict[licensor][row['Aired_Year']]['genre_Adventure'] += row['genre_Adventure']
                    contributor_dict[licensor][row['Aired_Year']]['genre_Avant Garde'] += row['genre_Avant Garde']
                    contributor_dict[licensor][row['Aired_Year']]['genre_Award Winning'] += row['genre_Award Winning']
                    contributor_dict[licensor][row['Aired_Year']]['genre_Comedy'] += row['genre_Comedy']
                    contributor_dict[licensor][row['Aired_Year']]['genre_Drama'] += row['genre_Drama']
                    contributor_dict[licensor][row['Aired_Year']]['genre_Fantasy'] += row['genre_Fantasy']
                    contributor_dict[licensor][row['Aired_Year']]['genre_Gourmet'] += row['genre_Gourmet']
                    contributor_dict[licensor][row['Aired_Year']]['genre_Horror'] += row['genre_Horror']
                    contributor_dict[licensor][row['Aired_Year']]['genre_Mystery'] += row['genre_Mystery']
                    contributor_dict[licensor][row['Aired_Year']]['genre_Romance'] += row['genre_Romance']
                    contributor_dict[licensor][row['Aired_Year']]['genre_Sci-Fi'] += row['genre_Sci-Fi']
                    contributor_dict[licensor][row['Aired_Year']]['genre_Slice of Life'] += row['genre_Slice of Life']
                    contributor_dict[licensor][row['Aired_Year']]['genre_Sports'] += row['genre_Sports']
                    contributor_dict[licensor][row['Aired_Year']]['genre_Supernatural'] += row['genre_Supernatural']
                    contributor_dict[licensor][row['Aired_Year']]['genre_Suspense'] += row['genre_Suspense']


                    contributor_dict[licensor]['Total']['genre_Action'] += row['genre_Action']
                    contributor_dict[licensor]['Total']['genre_Adventure'] += row['genre_Adventure']
                    contributor_dict[licensor]['Total']['genre_Avant Garde'] += row['genre_Avant Garde']
                    contributor_dict[licensor]['Total']['genre_Award Winning'] += row['genre_Award Winning']
                    contributor_dict[licensor]['Total']['genre_Comedy'] += row['genre_Comedy']
                    contributor_dict[licensor]['Total']['genre_Drama'] += row['genre_Drama']
                    contributor_dict[licensor]['Total']['genre_Fantasy'] += row['genre_Fantasy']
                    contributor_dict[licensor]['Total']['genre_Gourmet'] += row['genre_Gourmet']
                    contributor_dict[licensor]['Total']['genre_Horror'] += row['genre_Horror']
                    contributor_dict[licensor]['Total']['genre_Mystery'] += row['genre_Mystery']
                    contributor_dict[licensor]['Total']['genre_Romance'] += row['genre_Romance']
                    contributor_dict[licensor]['Total']['genre_Sci-Fi'] += row['genre_Sci-Fi']
                    contributor_dict[licensor]['Total']['genre_Slice of Life'] += row['genre_Slice of Life']
                    contributor_dict[licensor]['Total']['genre_Sports'] += row['genre_Sports']
                    contributor_dict[licensor]['Total']['genre_Supernatural'] += row['genre_Supernatural']
                    contributor_dict[licensor]['Total']['genre_Suspense'] += row['genre_Suspense']

                    current.append(licensor)

            for studio in row['Studios'] :
                if studio == 'UNKNOWN' :
                    continue

                if studio not in contributor_dict :
                    contributor_dict[studio] = {'Total': {}}
                    contributor_dict[studio]['Total'] = {'producer': 0,'licensor': 0, 'studio': 0, 'total': 0, 'Avg_Score': 0
                                                                    , 'Avg_Favorites': 0, 'Top_Rank' : 20000, 'Top_Name' : '', 'Top_url' : ''
                                                                    , 'TV': 0, 'Movie': 0, 'OVA': 0, 'Special': 0, 'ONA': 0, 
                                                                        'genre_Action': 0,	'genre_Adventure': 0,	'genre_Avant Garde': 0,	'genre_Award Winning': 0,
                                                                        'genre_Comedy': 0,	'genre_Drama': 0,	'genre_Fantasy': 0,
                                                                        'genre_Gourmet': 0,	'genre_Horror': 0,	'genre_Mystery': 0,	'genre_Romance': 0,
                                                                        'genre_Sci-Fi': 0,	'genre_Slice of Life': 0,	'genre_Sports': 0,
                                                                        'genre_Supernatural': 0,	'genre_Suspense': 0,}
                if row['Aired_Year'] not in contributor_dict[studio] :
                    contributor_dict[studio][row['Aired_Year']] = {'producer': 0,'licensor': 0, 'studio': 0, 'total': 0, 'Avg_Score': 0
                                                                    , 'Avg_Favorites': 0, 'Top_Rank' : 20000, 'Top_Name' : '', 'Top_url' : ''
                                                                    , 'TV': 0, 'Movie': 0, 'OVA': 0, 'Special': 0, 'ONA': 0, 
                                                                        'genre_Action': 0,	'genre_Adventure': 0,	'genre_Avant Garde': 0,	'genre_Award Winning': 0,
                                                                        'genre_Comedy': 0,	'genre_Drama': 0,	'genre_Fantasy': 0,
                                                                        'genre_Gourmet': 0,	'genre_Horror': 0,	'genre_Mystery': 0,	'genre_Romance': 0,
                                                                        'genre_Sci-Fi': 0,	'genre_Slice of Life': 0,	'genre_Sports': 0,
                                                                        'genre_Supernatural': 0,	'genre_Suspense': 0,}
                    
                contributor_dict[studio][row['Aired_Year']]['studio'] += 1
                contributor_dict[studio]['Total']['studio'] += 1

                if studio not in current :
                    contributor_dict[studio][row['Aired_Year']]['total'] += 1
                    contributor_dict[studio]['Total']['total'] += 1
                    if row['Score'] != 'UNKNOWN' :
                            contributor_dict[studio]['Total']['Avg_Score'] += float(row['Score'])
                            contributor_dict[studio][row['Aired_Year']]['Avg_Score'] += float(row['Score'])
                    if row['Favorites'] != 'UNKNOWN' :
                            contributor_dict[studio]['Total']['Avg_Favorites'] += float(row['Favorites'])
                            contributor_dict[studio][row['Aired_Year']]['Avg_Favorites'] += float(row['Favorites'])

                    if row['Rank'] != 'UNKNOWN' and contributor_dict[studio][row['Aired_Year']]['Top_Rank'] > float(row['Rank']) :
                            contributor_dict[studio][row['Aired_Year']]['Top_Rank'] = float(row['Rank'])
                            contributor_dict[studio][row['Aired_Year']]['Top_Name'] = row['Name']
                            contributor_dict[studio][row['Aired_Year']]['Top_url'] = row['Image URL']
                            if contributor_dict[studio]['Total']['Top_Rank'] > float(row['Rank']) :
                                contributor_dict[studio]['Total']['Top_Rank'] = float(row['Rank'])
                                contributor_dict[studio]['Total']['Top_Name'] = row['Name']
                                contributor_dict[studio]['Total']['Top_url'] = row['Image URL']

                    if row['Type'] == 'TV' :
                            contributor_dict[studio]['Total']['TV'] += 1
                            contributor_dict[studio][row['Aired_Year']]['TV'] += 1
                    elif row['Type'] == 'Movie':
                            contributor_dict[studio]['Total']['Movie'] += 1
                            contributor_dict[studio][row['Aired_Year']]['Movie'] += 1
                    elif row['Type'] == 'OVA' :
                            contributor_dict[studio]['Total']['OVA'] += 1
                            contributor_dict[studio][row['Aired_Year']]['OVA'] += 1
                    elif row['Type'] == 'Special' :
                            contributor_dict[studio]['Total']['Special'] += 1
                            contributor_dict[studio][row['Aired_Year']]['Special'] += 1
                    elif row['Type'] == 'ONA' :
                            contributor_dict[studio]['Total']['ONA'] += 1
                            contributor_dict[studio][row['Aired_Year']]['ONA'] += 1


                    contributor_dict[studio][row['Aired_Year']]['genre_Action'] += row['genre_Action']
                    contributor_dict[studio][row['Aired_Year']]['genre_Adventure'] += row['genre_Adventure']
                    contributor_dict[studio][row['Aired_Year']]['genre_Avant Garde'] += row['genre_Avant Garde']
                    contributor_dict[studio][row['Aired_Year']]['genre_Award Winning'] += row['genre_Award Winning']
                    contributor_dict[studio][row['Aired_Year']]['genre_Comedy'] += row['genre_Comedy']
                    contributor_dict[studio][row['Aired_Year']]['genre_Drama'] += row['genre_Drama']
                    contributor_dict[studio][row['Aired_Year']]['genre_Fantasy'] += row['genre_Fantasy']
                    contributor_dict[studio][row['Aired_Year']]['genre_Gourmet'] += row['genre_Gourmet']
                    contributor_dict[studio][row['Aired_Year']]['genre_Horror'] += row['genre_Horror']
                    contributor_dict[studio][row['Aired_Year']]['genre_Mystery'] += row['genre_Mystery']
                    contributor_dict[studio][row['Aired_Year']]['genre_Romance'] += row['genre_Romance']
                    contributor_dict[studio][row['Aired_Year']]['genre_Sci-Fi'] += row['genre_Sci-Fi']
                    contributor_dict[studio][row['Aired_Year']]['genre_Slice of Life'] += row['genre_Slice of Life']
                    contributor_dict[studio][row['Aired_Year']]['genre_Sports'] += row['genre_Sports']
                    contributor_dict[studio][row['Aired_Year']]['genre_Supernatural'] += row['genre_Supernatural']
                    contributor_dict[studio][row['Aired_Year']]['genre_Suspense'] += row['genre_Suspense']


                    contributor_dict[studio]['Total']['genre_Action'] += row['genre_Action']
                    contributor_dict[studio]['Total']['genre_Adventure'] += row['genre_Adventure']
                    contributor_dict[studio]['Total']['genre_Avant Garde'] += row['genre_Avant Garde']
                    contributor_dict[studio]['Total']['genre_Award Winning'] += row['genre_Award Winning']
                    contributor_dict[studio]['Total']['genre_Comedy'] += row['genre_Comedy']
                    contributor_dict[studio]['Total']['genre_Drama'] += row['genre_Drama']
                    contributor_dict[studio]['Total']['genre_Fantasy'] += row['genre_Fantasy']
                    contributor_dict[studio]['Total']['genre_Gourmet'] += row['genre_Gourmet']
                    contributor_dict[studio]['Total']['genre_Horror'] += row['genre_Horror']
                    contributor_dict[studio]['Total']['genre_Mystery'] += row['genre_Mystery']
                    contributor_dict[studio]['Total']['genre_Romance'] += row['genre_Romance']
                    contributor_dict[studio]['Total']['genre_Sci-Fi'] += row['genre_Sci-Fi']
                    contributor_dict[studio]['Total']['genre_Slice of Life'] += row['genre_Slice of Life']
                    contributor_dict[studio]['Total']['genre_Sports'] += row['genre_Sports']
                    contributor_dict[studio]['Total']['genre_Supernatural'] += row['genre_Supernatural']
                    contributor_dict[studio]['Total']['genre_Suspense'] += row['genre_Suspense']

                    current.append(studio)

            ### 장바구니 분석에 활용할 데이터 매핑
            if row['Aired_Year'] not in aprior :
                aprior[row['Aired_Year']] = []

            if current != [] :
                aprior[row['Aired_Year']].append(current)
                aprior['Total'].append(current)

        for cont in contributor_dict :
            for y in contributor_dict[cont] :
                contributor_dict[cont][y]['Avg_Score'] = contributor_dict[cont][y]['Avg_Score'] / contributor_dict[cont][y]['total']
                contributor_dict[cont][y]['Avg_Favorites'] = contributor_dict[cont][y]['Avg_Favorites'] / contributor_dict[cont][y]['total']


        contributor_df = pd.DataFrame()
        for cont in contributor_dict :
            temp_df = pd.DataFrame.from_dict(contributor_dict[cont], orient='index')
            temp_df.reset_index(inplace=True)
            temp_df.rename(columns={'index': 'year'}, inplace=True) 
            temp_df.insert(0, 'contributor', cont)
            contributor_df = pd.concat([contributor_df, temp_df], ignore_index=True)

        contributor_df.to_csv(self.path + "contributor_nodes.csv", index=False)


        json_path = self.path + 'contributors_apriori.json'
        with open(json_path, 'w') as json_file:
            json.dump(aprior, json_file)

        print("***Contributors Nodes Created")
