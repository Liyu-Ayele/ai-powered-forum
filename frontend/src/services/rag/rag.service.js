import { apiClient } from '../core/api.client';

export const listDocuments = async () => {
  try {
    const response = await apiClient.get('/api/rag/documents');
    const docs = response.data.data || [];
    return docs.map(doc => ({
      ...doc,
      id: doc.document_id || doc.id,
      file_name: doc.title || doc.file_name,
      // storage_path is the full Cloudinary HTTPS URL
      storage_path: doc.storage_path,
    }));
  } catch (error) {
    console.error('Error listing documents:', error);
    throw error;
  }
};

export const uploadPdf = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/api/rag/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw error;
  }
};

export const deleteDocument = async (documentId) => {
  try {
    const response = await apiClient.delete(`/api/rag/documents/${documentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

export const searchInDocument = async (documentId, query) => {
  try {
    const response = await apiClient.get(
      `/api/rag/documents/${documentId}/search?query=${encodeURIComponent(query)}`
    );
    // Backend returns { query, results: [...] }, we need just the results array
    const data = response.data.data;
    return data?.results || [];
  } catch (error) {
    console.error('Error searching document:', error);
    throw error;
  }
};

export const queryDocument = async (documentId, query) => {
  try {
    const response = await apiClient.post(
      `/api/rag/documents/${documentId}/query`,
      { query }
    );
    // Backend returns { answer, citations, chunksUsed }
    return response.data.data;
  } catch (error) {
    console.error('Error querying document:', error);
    throw error;
  }
};

export const fetchPdfObjectUrl = async (documentId) => {
  try {
    const response = await apiClient.get(`/api/rag/documents/${documentId}/file`, {
      responseType: 'blob',
    });
    // #region agent log
    fetch('http://127.0.0.1:7698/ingest/2f83031b-9ba6-42c9-b192-60411a447540',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ec5947'},body:JSON.stringify({sessionId:'ec5947',hypothesisId:'C',location:'rag.service.js:fetchPdfObjectUrl:success',message:'PDF blob fetched',data:{documentId,status:response.status,blobSize:response.data?.size??null,blobType:response.data?.type??null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    const blob = response.data instanceof Blob
      ? response.data
      : new Blob([response.data], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7698/ingest/2f83031b-9ba6-42c9-b192-60411a447540',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ec5947'},body:JSON.stringify({sessionId:'ec5947',hypothesisId:'C,E',location:'rag.service.js:fetchPdfObjectUrl:error',message:'PDF fetch failed',data:{documentId,status:error.response?.status??null,responseType:error.response?.headers?.['content-type']??null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    console.error('Error fetching PDF URL:', error);
    throw error;
  }
};