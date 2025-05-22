/**
 * 导出工具 - 负责将卡片导出为图像
 */
class ExportUtils {
    /**
     * 导出单张图像
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
     * 导出多张图像
     * @param {string[]} dataUrls 图像数据URL数组
     * @param {string} format 图像格式 ('png' 或 'jpg')
     * @param {string} baseFilename 基础文件名（不含扩展名）
     */
    static exportMultipleImages(dataUrls, format = 'png', baseFilename = '小红书读书卡片') {
        return new Promise(async (resolve) => {
            try {
                // 记录成功导出的数量
                let successCount = 0;

                // 依次导出每张图像
                for (let i = 0; i < dataUrls.length; i++) {
                    const filename = `${baseFilename}_${i + 1}`;
                    const success = await this.exportImage(dataUrls[i], format, filename);
                    if (success) successCount++;

                    // 添加小延迟，避免浏览器阻止多个下载
                    if (i < dataUrls.length - 1) {
                        await new Promise(r => setTimeout(r, 300));
                    }
                }

                resolve(successCount === dataUrls.length);
            } catch (error) {
                console.error('导出多张图像失败:', error);
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
