declare module '@google/generative-ai' {
  export interface GenerativeResponse {
    response: {
      text: () => string;
    };
  }

  export interface GenerativeModel {
    generateContent: (prompt: string) => Promise<GenerativeResponse>;
  }

  export interface GoogleGenerativeAIOptions {
    model?: string;
  }

  export class GoogleGenerativeAI {
    constructor(apiKey?: string);
    getGenerativeModel(opts: GoogleGenerativeAIOptions): GenerativeModel;
    listModels?: () => Promise<{ models: { name: string; supportedMethods?: string[] }[] }>;
  }

  export default GoogleGenerativeAI;
}
