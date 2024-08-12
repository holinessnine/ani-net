import argparse
from sub.pre import Pre_
from sub.node_edge import Anime_, Contributor_
from sub.to_json import Anime_Json, Contri_Json


### Please Download Dataset from Kaggle: https://www.kaggle.com/datasets/dbdmobile/myanimelist-dataset
##### We are using anime-dataset-2023.csv only.


# Argument Parser Setup
parser = argparse.ArgumentParser(description="Process anime dataset from a specified path.")
parser.add_argument('--path', type=str, default='./data/', help="Path to the dataset directory (default: ./data/)")

args = parser.parse_args()
path = args.path

print("***********Raw Data Preprocessing Begin...")
preprocess_instance = Pre_(path)
preprocess_instance.create_anime_data()
preprocess_instance.create_contri_data()

print("***********Raw Data Preprocessing Complete!!!")

print("***********Node and Edge Data Generation Begin...")
anime_instance = Anime_(path)
anime_instance.data_to_csv()

contri_instance = Contributor_(path)
contri_instance.data_to_csv()

print("***********Node and Edge Data Generation Complete!!!")

print("***********To Json Begin...")
anime_json = Anime_Json(path)
anime_json.to_json()

contri_json = Contri_Json(path)
contri_json.to_json()

print("***********To Json Complete!!!")

print("***********Data Processing Ended!!!")