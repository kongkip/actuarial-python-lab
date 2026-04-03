import axios from 'axios';
import { ModelMetadata, QuoteRequest, QuoteResponse } from '../types/actuarial';

// 1. Configuration: Base URL 
// In production, this would come from process.env.NEXT_PUBLIC_API_URL
const API_BASE_URL = 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetches the GLM coefficients and metadata from the Python backend.
 * This populates the charts and the base frequency in the UI.
 */
export const getModelMetadata = async (): Promise<ModelMetadata> => {
  try {
    const response = await apiClient.get<ModelMetadata>('/model-metadata');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch actuarial metadata:', error);
    throw new Error('Could not connect to the Pricing Engine.');
  }
};

/**
 * Sends policyholder features to the Poisson GLM for a live quote.
 * @param data - The driver age, exposure, and sum insured.
 */
export const postCalculateQuote = async (data: QuoteRequest): Promise<QuoteResponse> => {
  try {
    const response = await apiClient.post<QuoteResponse>('/calculate-quote', data);
    return response.data;
  } catch (error) {
    console.error('Inference Error:', error);
    throw new Error('Mathematical engine failed to compute premium.');
  }
};