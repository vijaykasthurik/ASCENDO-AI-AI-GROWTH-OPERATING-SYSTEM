import logging
import uuid
from typing import Any

import chromadb
from chromadb.api.models.Collection import Collection

from app.config import get_settings

logger = logging.getLogger(__name__)

_client: chromadb.ClientAPI | None = None
_collection: Collection | None = None

COLLECTION_NAME = "business_knowledge"


def connect() -> None:
    global _client, _collection
    settings = get_settings()
    _client = chromadb.PersistentClient(path=settings.chroma_persist_dir)
    _collection = _client.get_or_create_collection(name=COLLECTION_NAME)
    logger.info("ChromaDB ready at %s (collection=%s)", settings.chroma_persist_dir, COLLECTION_NAME)


def get_collection() -> Collection:
    if _collection is None:
        raise RuntimeError("ChromaDB has not been initialized. Call connect() first.")
    return _collection


def add_documents(
    project_id: str,
    doc_type: str,
    texts: list[str],
    extra_metadata: dict[str, Any] | None = None,
) -> None:
    """Embed and store one or more text chunks for a project (README chunks,
    agent outputs, final report sections, etc.) so the copilot can retrieve them.
    """
    if not texts:
        return
    collection = get_collection()
    ids = [f"{project_id}-{doc_type}-{uuid.uuid4().hex[:8]}-{i}" for i in range(len(texts))]
    metadatas = [
        {"project_id": project_id, "doc_type": doc_type, **(extra_metadata or {})} for _ in texts
    ]
    collection.add(ids=ids, documents=texts, metadatas=metadatas)


def query(project_id: str, query_text: str, n_results: int = 6) -> list[dict[str, Any]]:
    collection = get_collection()
    results = collection.query(
        query_texts=[query_text],
        n_results=n_results,
        where={"project_id": project_id},
    )
    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]
    return [
        {"document": doc, "metadata": meta, "distance": dist}
        for doc, meta, dist in zip(documents, metadatas, distances)
    ]


def delete_project_documents(project_id: str) -> None:
    collection = get_collection()
    collection.delete(where={"project_id": project_id})

