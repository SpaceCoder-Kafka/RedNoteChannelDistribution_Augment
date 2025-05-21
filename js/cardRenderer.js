/**
 * 卡片渲染器 - 负责将处理后的文本渲染为精美卡片
 */
class CardRenderer {
    constructor() {
        this.currentTemplate = 'simple'; // 默认模板
        this.customOptions = {
            bgColor: '#ffffff',
            fontFamily: 'default',
            fontSize: 16,
            signature: ''
        };
    }

    /**
     * 设置当前模板
     * @param {string} templateName 模板名称
     */
    setTemplate(templateName) {
        this.currentTemplate = templateName;
    }

    /**
     * 更新自定义选项
     * @param {object} options 自定义选项
     */
    updateCustomOptions(options) {
        this.customOptions = { ...this.customOptions, ...options };
    }

    /**
     * 渲染卡片
     * @param {object} content 结构化内容
     * @param {HTMLElement} container 容器元素
     */
    renderCard(content, container) {
        return new Promise((resolve) => {
            // 清空容器
            container.innerHTML = '';
            
            // 创建卡片元素
            const card = document.createElement('div');
            card.className = `card ${this.currentTemplate}`;
            
            // 应用自定义样式
            this.applyCustomStyles(card);
            
            // 创建卡片内容
            this.createCardContent(card, content);
            
            // 添加到容器
            container.appendChild(card);
            
            // 模拟渲染延迟
            setTimeout(() => {
                resolve(true);
            }, 500);
        });
    }

    /**
     * 应用自定义样式
     * @param {HTMLElement} card 卡片元素
     */
    applyCustomStyles(card) {
        // 背景颜色
        card.style.backgroundColor = this.customOptions.bgColor;
        
        // 字体样式
        if (this.customOptions.fontFamily !== 'default') {
            card.style.fontFamily = this.getFontFamily(this.customOptions.fontFamily);
        }
        
        // 字体大小
        card.style.fontSize = `${this.customOptions.fontSize}px`;
    }

    /**
     * 获取字体系列
     * @param {string} fontFamily 字体名称
     * @returns {string} CSS字体系列
     */
    getFontFamily(fontFamily) {
        switch (fontFamily) {
            case 'serif':
                return "'SimSun', 'Times New Roman', serif";
            case 'sans-serif':
                return "'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif";
            case 'monospace':
                return "'Courier New', monospace";
            default:
                return "'PingFang SC', 'Helvetica Neue', Arial, sans-serif";
        }
    }

    /**
     * 创建卡片内容
     * @param {HTMLElement} card 卡片元素
     * @param {object} content 结构化内容
     */
    createCardContent(card, content) {
        // 创建卡片头部
        const header = document.createElement('div');
        header.className = 'card-header';
        
        // 创建标题
        const title = document.createElement('div');
        title.className = 'card-title';
        title.textContent = content.title || '读书笔记';
        header.appendChild(title);
        
        // 添加头部到卡片
        card.appendChild(header);
        
        // 创建引言
        if (content.intro) {
            const intro = document.createElement('div');
            intro.className = 'card-intro';
            intro.textContent = content.intro;
            card.appendChild(intro);
        }
        
        // 创建核心要点
        if (content.points && content.points.length > 0) {
            const pointsContainer = document.createElement('div');
            pointsContainer.className = 'card-points';
            
            content.points.forEach(point => {
                const pointElement = document.createElement('div');
                pointElement.className = 'card-point';
                pointElement.textContent = point;
                pointsContainer.appendChild(pointElement);
            });
            
            card.appendChild(pointsContainer);
        }
        
        // 创建结论
        if (content.conclusion) {
            const conclusion = document.createElement('div');
            conclusion.className = 'card-conclusion';
            conclusion.textContent = content.conclusion;
            card.appendChild(conclusion);
        }
        
        // 添加签名
        if (this.customOptions.signature) {
            const signature = document.createElement('div');
            signature.className = 'card-signature';
            signature.textContent = this.customOptions.signature;
            card.appendChild(signature);
        }
    }

    /**
     * 将卡片渲染为图像
     * @param {HTMLElement} cardElement 卡片元素
     * @param {string} format 图像格式 ('png' 或 'jpg')
     * @param {number} resolution 分辨率
     * @returns {Promise<string>} 图像数据URL
     */
    renderToImage(cardElement, format = 'png', resolution = 1080) {
        return new Promise((resolve, reject) => {
            try {
                // 使用html2canvas库渲染DOM为图像
                // 注意：实际应用中需要引入html2canvas库
                if (typeof html2canvas === 'undefined') {
                    // 模拟html2canvas功能
                    console.log('使用模拟的html2canvas功能');
                    
                    // 创建一个canvas元素
                    const canvas = document.createElement('canvas');
                    const width = cardElement.offsetWidth;
                    const height = cardElement.offsetHeight;
                    
                    // 设置分辨率
                    const scale = resolution / Math.max(width, height * 1.5);
                    canvas.width = width * scale;
                    canvas.height = height * scale;
                    
                    // 获取上下文
                    const ctx = canvas.getContext('2d');
                    
                    // 设置背景色
                    ctx.fillStyle = this.customOptions.bgColor;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    // 绘制一些模拟内容
                    ctx.fillStyle = '#333';
                    ctx.font = `${20 * scale}px Arial`;
                    ctx.fillText('卡片图像渲染示例', 50 * scale, 50 * scale);
                    
                    // 返回数据URL
                    const imageType = format === 'jpg' ? 'image/jpeg' : 'image/png';
                    const quality = format === 'jpg' ? 0.9 : undefined;
                    const dataUrl = canvas.toDataURL(imageType, quality);
                    
                    setTimeout(() => {
                        resolve(dataUrl);
                    }, 1000);
                } else {
                    // 使用实际的html2canvas
                    const options = {
                        scale: resolution / Math.max(cardElement.offsetWidth, cardElement.offsetHeight * 1.5),
                        useCORS: true,
                        allowTaint: true,
                        backgroundColor: this.customOptions.bgColor
                    };
                    
                    html2canvas(cardElement, options).then(canvas => {
                        const imageType = format === 'jpg' ? 'image/jpeg' : 'image/png';
                        const quality = format === 'jpg' ? 0.9 : undefined;
                        const dataUrl = canvas.toDataURL(imageType, quality);
                        resolve(dataUrl);
                    }).catch(error => {
                        reject(error);
                    });
                }
            } catch (error) {
                reject(error);
            }
        });
    }
}

// 导出卡片渲染器
window.CardRenderer = CardRenderer;
