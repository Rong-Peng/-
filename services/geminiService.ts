
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export class GeminiService {
  /**
   * Remove watermarks from an image using Gemini-2.5-flash-image
   */
  async removeWatermark(base64Data: string, mimeType: string): Promise<string> {
    try {
      // Fix: Initialize GoogleGenAI right before use to ensure the correct API key is used.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      // Remove data URL prefix if present
      const base64Content = base64Data.split(',')[1] || base64Data;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Content,
                mimeType: mimeType,
              },
            },
            {
              text: "请识别并移除图像中所有的水印（通常在角落或边缘，例如'即梦'、'海螺'、'AI生成'等标识）。在移除水印的同时，请利用周围的纹理和背景进行完美填充，确保图像看起来自然、无痕迹。请直接输出修改后的图片数据，不要包含任何文字解释。",
            },
          ],
        },
      });

      // Search for the image part in the response
      let resultBase64 = '';
      if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            resultBase64 = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (!resultBase64) {
        throw new Error("模型未返回图像数据");
      }

      return resultBase64;
    } catch (error) {
      console.error("Gemini processing error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
