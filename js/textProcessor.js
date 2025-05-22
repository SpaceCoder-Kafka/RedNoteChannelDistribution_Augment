/**
 * 文本处理工具 - 使用Gemini API实现基于NLP的文本分析，提取核心内容
 */
class TextProcessor {
    constructor() {
        // 初始化Gemini服务
        this.geminiService = new GeminiService();
    }

    /**
     * 处理文本，提取核心内容
     * @param {string} text 输入的长文本
     * @returns {object} 处理后的结构化内容
     */
    async processText(text) {
        try {
            // 清理文本
            const cleanedText = this.cleanText(text);
            
            // 使用Gemini API分析文本
            const result = await this.geminiService.analyzeText(cleanedText);
            
            return result;
        } catch (error) {
            console.error('文本处理失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 清理文本
     * @param {string} text 原始文本
     * @returns {string} 清理后的文本
     */
    cleanText(text) {
        // 移除多余空白
        let cleaned = text.trim().replace(/\s+/g, ' ');
        
        // 移除特殊字符
        cleaned = cleaned.replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, '');
        
        return cleaned;
    }

    /**
     * 将文本分割成段落
     * @param {string} text 清理后的文本
     * @returns {string[]} 段落数组
     */
    splitIntoParagraphs(text) {
        // 按照段落分隔符分割文本
        return text.split(/\n+/).filter(p => p.trim().length > 0);
    }
}

// 导出文本处理器
window.TextProcessor = TextProcessor;
