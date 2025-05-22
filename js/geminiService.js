/**
 * Gemini API服务 - 提供与Google Gemini API的交互功能
 */
class GeminiService {
    constructor() {
        // Gemini API密钥
        this.apiKey = "AIzaSyBdqdXJnFUvFH_oV-jra8YSM3lyNCF-Npc";
        // API基础URL
        this.apiBaseUrl = "https://generativelanguage.googleapis.com/v1beta";
        // 使用的模型
        this.model = "gemini-2.0-flash";
    }

    /**
     * 使用Gemini API分析文本
     * @param {string} text 要分析的文本
     * @returns {Promise<object>} 分析结果
     */
    async analyzeText(text) {
        try {
            const endpoint = `${this.apiBaseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;
            
            // 构建请求体
            const requestBody = {
                contents: [
                    {
                        parts: [
                            {
                                text: `分析以下文本，提取标题、引言、核心要点（3-5个）和结论。
                                返回JSON格式，包含以下字段：title, intro, points (数组), conclusion。
                                文本内容：${text}`
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.2,
                    topP: 0.8,
                    topK: 40,
                    maxOutputTokens: 1024
                }
            };

            // 发送请求
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            // 检查响应状态
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Gemini API错误: ${errorData.error?.message || '未知错误'}`);
            }

            // 解析响应
            const data = await response.json();
            
            // 检查是否有候选结果
            if (!data.candidates || data.candidates.length === 0) {
                throw new Error('Gemini API没有返回有效结果');
            }

            // 获取文本内容
            const content = data.candidates[0].content;
            if (!content || !content.parts || content.parts.length === 0) {
                throw new Error('Gemini API返回的内容格式不正确');
            }

            const resultText = content.parts[0].text;
            
            // 尝试解析JSON结果
            try {
                // 查找JSON部分（可能嵌入在Markdown代码块中）
                const jsonMatch = resultText.match(/```json\n([\s\S]*?)\n```/) || 
                                 resultText.match(/```\n([\s\S]*?)\n```/) || 
                                 resultText.match(/{[\s\S]*?}/);
                
                let jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : resultText;
                
                // 确保它是一个有效的JSON字符串
                if (!jsonStr.trim().startsWith('{')) {
                    jsonStr = resultText;
                }
                
                const parsedResult = JSON.parse(jsonStr);
                
                // 确保结果包含所需的所有字段
                return {
                    title: parsedResult.title || '读书笔记',
                    intro: parsedResult.intro || '',
                    points: Array.isArray(parsedResult.points) ? parsedResult.points : [],
                    conclusion: parsedResult.conclusion || '',
                    success: true
                };
            } catch (jsonError) {
                console.error('解析Gemini API返回的JSON失败:', jsonError);
                
                // 如果JSON解析失败，尝试从文本中提取信息
                const lines = resultText.split('\n').filter(line => line.trim().length > 0);
                
                return {
                    title: lines[0] || '读书笔记',
                    intro: lines.length > 1 ? lines[1] : '',
                    points: lines.slice(2, -1).map(line => line.replace(/^[•\-*]\s*/, '')),
                    conclusion: lines.length > 2 ? lines[lines.length - 1] : '',
                    success: true
                };
            }
        } catch (error) {
            console.error('Gemini API调用失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// 导出Gemini服务
window.GeminiService = GeminiService;
