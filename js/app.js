/**
 * 小红书风格读书卡片生成器 - 主应用逻辑
 */
document.addEventListener('DOMContentLoaded', () => {
    // 初始化应用
    const app = new CardGeneratorApp();
    app.init();
});

class CardGeneratorApp {
    constructor() {
        // 初始化文本处理器和卡片渲染器
        this.textProcessor = new TextProcessor();
        this.cardRenderer = new CardRenderer();

        // 存储处理后的内容
        this.processedContent = null;

        // DOM元素
        this.elements = {
            // 步骤导航
            steps: {
                step1: document.getElementById('step-1'),
                step2: document.getElementById('step-2'),
                step3: document.getElementById('step-3')
            },
            // 内容区域
            sections: {
                inputSection: document.getElementById('input-section'),
                previewSection: document.getElementById('preview-section'),
                exportSection: document.getElementById('export-section')
            },
            // 输入相关
            input: {
                textInput: document.getElementById('text-input'),
                wordCount: document.querySelector('.word-count'),
                processBtn: document.getElementById('process-btn')
            },
            // 预览相关
            preview: {
                templates: document.querySelectorAll('.template'),
                bgColor: document.getElementById('bg-color'),
                fontFamily: document.getElementById('font-family'),
                fontSize: document.getElementById('font-size'),
                signature: document.getElementById('signature'),
                cardPreview: document.getElementById('card-preview'),
                backToInputBtn: document.getElementById('back-to-input-btn'),
                goToExportBtn: document.getElementById('go-to-export-btn')
            },
            // 导出相关
            export: {
                exportCardPreview: document.getElementById('export-card-preview'),
                exportPng: document.getElementById('export-png'),
                exportJpg: document.getElementById('export-jpg'),
                resolution: document.getElementById('resolution'),
                backToPreviewBtn: document.getElementById('back-to-preview-btn'),
                createNewBtn: document.getElementById('create-new-btn')
            },
            // 进度条
            progress: {
                overlay: document.getElementById('progress-overlay'),
                fill: document.querySelector('.progress-fill'),
                text: document.querySelector('.progress-text')
            }
        };
    }

    /**
     * 初始化应用
     */
    init() {
        // 加载html2canvas库
        ExportUtils.loadHtml2Canvas();

        // 绑定事件
        this.bindEvents();
    }

    /**
     * 绑定事件处理程序
     */
    bindEvents() {
        // 文本输入事件
        this.elements.input.textInput.addEventListener('input', this.handleTextInput.bind(this));
        this.elements.input.processBtn.addEventListener('click', this.processText.bind(this));

        // 模板选择事件
        this.elements.preview.templates.forEach(template => {
            template.addEventListener('click', () => this.selectTemplate(template));
        });

        // 自定义选项事件
        this.elements.preview.bgColor.addEventListener('input', this.updateCustomOptions.bind(this));
        this.elements.preview.fontFamily.addEventListener('change', this.updateCustomOptions.bind(this));
        this.elements.preview.fontSize.addEventListener('input', this.updateCustomOptions.bind(this));
        this.elements.preview.signature.addEventListener('input', this.updateCustomOptions.bind(this));

        // 导航按钮事件
        this.elements.preview.backToInputBtn.addEventListener('click', () => this.navigateTo('input'));
        this.elements.preview.goToExportBtn.addEventListener('click', () => this.navigateTo('export'));
        this.elements.export.backToPreviewBtn.addEventListener('click', () => this.navigateTo('preview'));
        this.elements.export.createNewBtn.addEventListener('click', () => this.resetApp());

        // 导出按钮事件
        this.elements.export.exportPng.addEventListener('click', () => this.exportCard('png'));
        this.elements.export.exportJpg.addEventListener('click', () => this.exportCard('jpg'));
    }

    /**
     * 处理文本输入事件
     */
    handleTextInput() {
        const text = this.elements.input.textInput.value;
        const wordCount = text.length;

        // 更新字数统计
        this.elements.input.wordCount.textContent = `${wordCount}/10000`;

        // 如果超过10000字，截断文本
        if (wordCount > 10000) {
            this.elements.input.textInput.value = text.substring(0, 10000);
            this.elements.input.wordCount.textContent = '10000/10000';
        }
    }

    /**
     * 处理文本
     */
    async processText() {
        const text = this.elements.input.textInput.value.trim();

        // 检查文本是否为空
        if (text.length === 0) {
            alert('请输入文本内容');
            return;
        }

        // 显示进度条
        this.showProgress('正在处理文本...', 0);

        try {
            // 更新进度
            this.updateProgress('使用Gemini AI分析文本...', 30);

            // 处理文本
            this.processedContent = await this.textProcessor.processText(text);

            // 检查处理结果
            if (!this.processedContent.success) {
                throw new Error(this.processedContent.error || '文本处理失败');
            }

            // 更新进度
            this.updateProgress('生成卡片预览...', 70);

            // 渲染卡片预览
            await this.renderCardPreview();

            // 更新进度
            this.updateProgress('完成', 100);

            // 导航到预览页面
            setTimeout(() => {
                this.hideProgress();
                this.navigateTo('preview');
            }, 500);
        } catch (error) {
            console.error('处理文本失败:', error);
            this.hideProgress();
            alert('处理文本失败: ' + error.message);
        }
    }

    /**
     * 选择模板
     * @param {HTMLElement} templateElement 模板元素
     */
    async selectTemplate(templateElement) {
        // 移除所有模板的活动状态
        this.elements.preview.templates.forEach(t => t.classList.remove('active'));

        // 添加活动状态到选中的模板
        templateElement.classList.add('active');

        // 获取模板名称
        const templateName = templateElement.dataset.template;

        // 设置当前模板
        this.cardRenderer.setTemplate(templateName);

        // 重新渲染卡片预览
        await this.renderCardPreview();
    }

    /**
     * 更新自定义选项
     */
    async updateCustomOptions() {
        // 获取自定义选项值
        const options = {
            bgColor: this.elements.preview.bgColor.value,
            fontFamily: this.elements.preview.fontFamily.value,
            fontSize: parseInt(this.elements.preview.fontSize.value),
            signature: this.elements.preview.signature.value
        };

        // 更新卡片渲染器的自定义选项
        this.cardRenderer.updateCustomOptions(options);

        // 重新渲染卡片预览
        await this.renderCardPreview();
    }

    /**
     * 渲染卡片预览
     */
    async renderCardPreview() {
        if (!this.processedContent) return;

        // 显示加载指示器
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.textContent = '正在生成卡片...';
        this.elements.preview.cardPreview.innerHTML = '';
        this.elements.preview.cardPreview.appendChild(loadingIndicator);

        try {
            // 渲染卡片
            await this.cardRenderer.renderCard(this.processedContent, this.elements.preview.cardPreview);
        } catch (error) {
            console.error('渲染卡片预览失败:', error);
            this.elements.preview.cardPreview.innerHTML = '<div class="error-message">渲染卡片失败</div>';
        }
    }

    /**
     * 导出卡片
     * @param {string} format 导出格式 ('png' 或 'jpg')
     */
    async exportCard(format) {
        // 显示进度条
        this.showProgress(`正在导出${format.toUpperCase()}图像...`, 0);

        try {
            // 更新进度
            this.updateProgress('准备导出...', 20);

            // 获取分辨率
            const resolution = parseInt(this.elements.export.resolution.value);

            // 更新进度
            this.updateProgress('渲染图像...', 40);

            // 渲染为图像
            const cardElement = this.elements.export.exportCardPreview.querySelector('.card');
            const dataUrl = await this.cardRenderer.renderToImage(cardElement, format, resolution);

            // 更新进度
            this.updateProgress('保存图像...', 80);

            // 导出图像
            await ExportUtils.exportImage(dataUrl, format);

            // 更新进度
            this.updateProgress('导出完成', 100);

            // 隐藏进度条
            setTimeout(() => {
                this.hideProgress();
            }, 500);
        } catch (error) {
            console.error('导出卡片失败:', error);
            this.hideProgress();
            alert('导出卡片失败: ' + error.message);
        }
    }

    /**
     * 导航到指定页面
     * @param {string} page 页面名称 ('input', 'preview', 或 'export')
     */
    async navigateTo(page) {
        // 隐藏所有步骤和部分
        Object.values(this.elements.steps).forEach(step => step.classList.remove('active'));
        Object.values(this.elements.sections).forEach(section => section.classList.remove('active'));

        // 显示指定页面
        switch (page) {
            case 'input':
                this.elements.steps.step1.classList.add('active');
                this.elements.sections.inputSection.classList.add('active');
                break;

            case 'preview':
                this.elements.steps.step2.classList.add('active');
                this.elements.sections.previewSection.classList.add('active');
                break;

            case 'export':
                // 在导航到导出页面之前，复制预览卡片
                if (this.elements.preview.cardPreview.innerHTML) {
                    this.elements.export.exportCardPreview.innerHTML = this.elements.preview.cardPreview.innerHTML;
                }

                this.elements.steps.step3.classList.add('active');
                this.elements.sections.exportSection.classList.add('active');
                break;
        }
    }

    /**
     * 重置应用
     */
    resetApp() {
        // 清空输入
        this.elements.input.textInput.value = '';
        this.elements.input.wordCount.textContent = '0/10000';

        // 重置处理内容
        this.processedContent = null;

        // 重置自定义选项
        this.elements.preview.bgColor.value = '#ffffff';
        this.elements.preview.fontFamily.value = 'default';
        this.elements.preview.fontSize.value = 16;
        this.elements.preview.signature.value = '';

        // 重置卡片渲染器
        this.cardRenderer = new CardRenderer();

        // 清空预览
        this.elements.preview.cardPreview.innerHTML = '';
        this.elements.export.exportCardPreview.innerHTML = '';

        // 导航到输入页面
        this.navigateTo('input');
    }

    /**
     * 显示进度条
     * @param {string} text 进度文本
     * @param {number} percent 进度百分比
     */
    showProgress(text, percent) {
        this.elements.progress.overlay.style.display = 'flex';
        this.elements.progress.text.textContent = text;
        this.elements.progress.fill.style.width = `${percent}%`;
    }

    /**
     * 更新进度条
     * @param {string} text 进度文本
     * @param {number} percent 进度百分比
     */
    updateProgress(text, percent) {
        this.elements.progress.text.textContent = text;
        this.elements.progress.fill.style.width = `${percent}%`;
    }

    /**
     * 隐藏进度条
     */
    hideProgress() {
        this.elements.progress.overlay.style.display = 'none';
    }
}
