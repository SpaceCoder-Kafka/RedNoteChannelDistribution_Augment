/**
 * html2canvas模拟实现
 * 注意：这只是一个简单的模拟，用于演示目的
 * 实际应用中应使用真正的html2canvas库
 */
window.html2canvas = function(element, options) {
    return new Promise((resolve) => {
        console.log('使用模拟的html2canvas库');
        
        // 创建canvas元素
        const canvas = document.createElement('canvas');
        const width = element.offsetWidth;
        const height = element.offsetHeight;
        
        // 设置分辨率
        const scale = options?.scale || 1;
        canvas.width = width * scale;
        canvas.height = height * scale;
        
        // 获取上下文
        const ctx = canvas.getContext('2d');
        
        // 设置背景色
        ctx.fillStyle = options?.backgroundColor || '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 模拟渲染元素内容
        // 这里只是简单地绘制一些文本，实际的html2canvas会渲染完整的DOM
        ctx.fillStyle = '#333333';
        ctx.font = `${16 * scale}px Arial`;
        
        // 尝试获取卡片标题
        const titleElement = element.querySelector('.card-title');
        if (titleElement) {
            const title = titleElement.textContent;
            ctx.font = `bold ${24 * scale}px Arial`;
            ctx.fillText(title, 40 * scale, 60 * scale);
        }
        
        // 尝试获取卡片引言
        const introElement = element.querySelector('.card-intro');
        if (introElement) {
            const intro = introElement.textContent;
            ctx.font = `${16 * scale}px Arial`;
            ctx.fillText(intro, 40 * scale, 100 * scale);
        }
        
        // 尝试获取卡片要点
        const pointElements = element.querySelectorAll('.card-point');
        if (pointElements.length > 0) {
            ctx.font = `${16 * scale}px Arial`;
            let y = 150 * scale;
            pointElements.forEach((pointElement, index) => {
                const point = pointElement.textContent;
                ctx.fillText(`• ${point}`, 40 * scale, y);
                y += 40 * scale;
            });
        }
        
        // 尝试获取卡片结论
        const conclusionElement = element.querySelector('.card-conclusion');
        if (conclusionElement) {
            const conclusion = conclusionElement.textContent;
            ctx.font = `italic ${16 * scale}px Arial`;
            ctx.fillText(conclusion, 40 * scale, canvas.height - 80 * scale);
        }
        
        // 尝试获取卡片签名
        const signatureElement = element.querySelector('.card-signature');
        if (signatureElement) {
            const signature = signatureElement.textContent;
            ctx.font = `${14 * scale}px Arial`;
            ctx.fillText(signature, canvas.width - 150 * scale, canvas.height - 40 * scale);
        }
        
        // 模拟渲染延迟
        setTimeout(() => {
            resolve(canvas);
        }, 1000);
    });
};
