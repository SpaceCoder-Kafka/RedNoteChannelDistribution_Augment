/**
 * 导出工具 - 负责将卡片导出为图像
 */
class ExportUtils {
    /**
     * 导出图像
     * @param {string} dataUrl 图像数据URL
     * @param {string} format 图像格式 ('png' 或 'jpg')
     * @param {string} filename 文件名（不含扩展名）
     */
    static exportImage(dataUrl, format = 'png', filename = '小红书读书卡片') {
        return new Promise((resolve) => {
            try {
                // 创建下载链接
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = `${filename}.${format}`;
                
                // 模拟点击下载
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                resolve(true);
            } catch (error) {
                console.error('导出图像失败:', error);
                resolve(false);
            }
        });
    }

    /**
     * 加载html2canvas库
     * @returns {Promise<boolean>} 加载是否成功
     */
    static loadHtml2Canvas() {
        return new Promise((resolve) => {
            // 检查是否已加载
            if (typeof html2canvas !== 'undefined') {
                resolve(true);
                return;
            }
            
            // 创建script元素
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
            script.async = true;
            
            // 设置加载事件
            script.onload = () => {
                resolve(true);
            };
            
            script.onerror = () => {
                console.error('加载html2canvas库失败');
                resolve(false);
            };
            
            // 添加到文档
            document.head.appendChild(script);
        });
    }
}

// 导出工具
window.ExportUtils = ExportUtils;
