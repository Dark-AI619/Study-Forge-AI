"""Download the embedding model once. Runtime indexing stays offline."""
from sentence_transformers import SentenceTransformer
from app import config

if __name__ == '__main__':
    config.MODEL_CACHE.mkdir(parents=True, exist_ok=True)
    model = SentenceTransformer(config.MODEL, device='cpu', cache_folder=str(config.MODEL_CACHE))
    print(f'Model ready: {config.MODEL}; dimension {model.get_sentence_embedding_dimension()}')
