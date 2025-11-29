const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imageDropzone = document.getElementById('imageDropzone');
const bgImageInput = document.getElementById('bgImageInput');
const overlayImage = document.getElementById('overlayImage');  
const leftDrawer = document.getElementById('left-drawer');
const leftToggle = document.getElementById('left-drawer-toggle');
const rightDrawer = document.getElementById('right-drawer');
const rightToggle = document.getElementById('right-drawer-toggle');
const layerListContainer = document.getElementById('layer-list');
const fileNamePreview = document.getElementById('fileNamePreview');  

const canvasStandard = document.getElementById('canvasStandard');
const cardAttribute = document.getElementById('cardAttribute');
const manaCost = document.getElementById('manaCost');

const inputs = {
    cardName: {
        text: document.getElementById('inputCardName'),
        unit: document.getElementById('unitCardName'),
        size: document.getElementById('sizeCardName'),
         
        defPct: 6,
        color: '#FFB9FF',  
        bgColor: '#545454',  
        bgOpacity: 0.5,
        borderColor: '#000000',
        borderWidth: 7,
        letterSpacing: 0,
        lineHeightMult: 1.2
    },
    flavor: {
        text: document.getElementById('inputFlavor'),
        unit: document.getElementById('unitFlavor'),
        size: document.getElementById('sizeFlavor'),
        defPct: 3.5,
        color: '#FFB9FF',
        bgColor: '#FFDCFF',  
        bgOpacity: 0.5,
        borderColor: '#000000',
        borderWidth: 4,
        letterSpacing: 1,
        lineHeightPx: 2  
    },
    bp: {
        text: document.getElementById('inputBP'),
        unit: document.getElementById('unitBP'),
        size: document.getElementById('sizeBP'),
        defPct: 5,
        color: '#FFFFFF',
        bgColor: '#545454',
        bgOpacity: 0.5,
        borderColor: '#000000',
        borderWidth: 5,
        letterSpacing: 1,
        lineHeightPx: 2
    },
    effect: {
        text: document.getElementById('inputEffect'),
        unit: document.getElementById('unitEffect'),
        size: document.getElementById('sizeEffect'),
        defPct: 3,
        color: '#FFB9FF',
        bgColor: '#8CF5E6',  
        bgOpacity: 0.3,
        borderColor: '#000000',
        borderWidth: 4,
        letterSpacing: 1,
        lineHeightPx: 2,
        fullWidthBg: true  
    }
};

const saveImageBtn = document.getElementById('saveImageBtn');

let bgObject = null;  
let isBgLoaded = false;
let currentStandard = "608x1080";  

for (let i = 0; i <= 99; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = i;
    manaCost.appendChild(opt);
}
manaCost.value = 0;

if (leftDrawer.classList.contains('open')) document.body.classList.add('is-left-open');
if (rightDrawer.classList.contains('open')) document.body.classList.add('is-right-open');

leftToggle.addEventListener('click', () => {
    leftDrawer.classList.toggle('open');
    document.body.classList.toggle('is-left-open');
});
rightToggle.addEventListener('click', () => {
    rightDrawer.classList.toggle('open');
    document.body.classList.toggle('is-right-open');
});

function updateCanvasSettings() {
    currentStandard = canvasStandard.value;
    const attr = cardAttribute.value;

    if (currentStandard === "608x1080") {
        canvas.width = 608;
        canvas.height = 1080;
    } else {
        canvas.width = 768;
        canvas.height = 1366;
    }

    let fileName = "";
    if (currentStandard === "608x1080") {
        fileName = (attr === "S") ? "S608x1080.png" : "M608x1080.png";
    } else {
        fileName = (attr === "S") ? "S2_768x1366.png" : "M2_768x1366.png";
    }

    overlayImage.src = `Picture/${fileName}`;

    if (bgObject) {
        bgObject.width = canvas.width;
        bgObject.height = canvas.height;
    }

    drawCanvas();
}

overlayImage.onload = () => drawCanvas();
overlayImage.onerror = () => {
    console.warn("枠画像が見つかりません: Pictureフォルダを確認してください");
    drawCanvas();  
};

canvasStandard.addEventListener('change', updateCanvasSettings);
cardAttribute.addEventListener('change', updateCanvasSettings);
manaCost.addEventListener('change', drawCanvas);

Object.values(inputs).forEach(inp => {
    inp.text.addEventListener('input', drawCanvas);
    inp.unit.addEventListener('change', drawCanvas);
    inp.size.addEventListener('input', drawCanvas);
});

imageDropzone.addEventListener('click', (e) => {
    if (e.target === canvas) return;
    bgImageInput.click();
});

bgImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) loadBackground(URL.createObjectURL(file));
});

imageDropzone.addEventListener('dragover', (e) => { e.preventDefault(); });
imageDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        loadBackground(URL.createObjectURL(file));
    }
});

function loadBackground(src) {
    const img = new Image();
    img.src = src;
    img.onload = () => {
        isBgLoaded = true;
        imageDropzone.classList.add('has-image');

        bgObject = {
            img: img,
            x: 0, y: 0,
            width: canvas.width,
            height: canvas.height
        };
        
        updateLayerList();
        drawCanvas();
    };
}

function updateLayerList() {
    layerListContainer.innerHTML = '';
    if (bgObject) {
        const item = document.createElement('div');
        item.className = 'layer-item';
        const thumb = document.createElement('div');
        thumb.className = 'layer-thumb';
        const img = document.createElement('img');
        img.src = bgObject.img.src;
        thumb.appendChild(img);
        const info = document.createElement('div');
        info.textContent = '背面画像';
        item.appendChild(thumb);
        item.appendChild(info);
        layerListContainer.appendChild(item);
    }
}

function drawCanvas() {
     
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (bgObject) {
        ctx.drawImage(bgObject.img, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (overlayImage.complete && overlayImage.naturalWidth !== 0) {
        ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);
    }

    drawManaCost();

    const LAYOUT_SETTINGS = {
         
        default: {
            top: 12,     
            right: 18    
        },
         
        sm_608: {
            top: 14,     
            right: 12    
        }
    };

    let configTop = LAYOUT_SETTINGS.default.top;
    let configRight = LAYOUT_SETTINGS.default.right;

    if (currentStandard === "608x1080") {
        const attr = cardAttribute.value;
        if (attr === "S" || attr === "M") {
            configTop = LAYOUT_SETTINGS.sm_608.top;
            configRight = LAYOUT_SETTINGS.sm_608.right;
        }
    }

    const padding = {
        bottom: 15,  
        top: configTop,     
        right: configRight, 
        left: 40,    
        effectBottomSpace: 12  
    };

    const nameH = drawCardName(padding);

    const effectBottomY = canvas.height - padding.bottom - nameH - padding.effectBottomSpace;
    drawEffect(effectBottomY);

    const flavorH = drawFlavor(padding);

    drawBP(padding, flavorH);
}

function hasRubyChars(text) {
    return text && (text.includes('(') || text.includes('（'));
}

function drawManaCost() {
    const val = manaCost.value; 
    const str = val.toString();
    
    let x, y;
    if (currentStandard === "608x1080") {
        x = 140; y = 20;
    } else {
        x = 210; y = 20;
    }

    const size = calculatePx(10.5, "%");
    ctx.font = `${size}px Arial`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    
    ctx.strokeStyle = "rgb(0,0,0)";
    ctx.lineWidth = 15;
    ctx.lineJoin = "round";
    ctx.fillStyle = "rgb(0,255,255)";

    const letterSpacing = -2;
    
    let currentX = x;
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        ctx.strokeText(char, currentX, y);
        ctx.fillText(char, currentX, y);
        const w = ctx.measureText(char).width;
        currentX += w + letterSpacing;
    }
}

function drawCardName(padding) {
    const cfg = inputs.cardName;
    const text = cfg.text.value;
    if (!text) return 0;

    const size = getFontSize(cfg);
    const rubySize = size * 0.5;
    const baseLineHeight = size * (cfg.lineHeightMult || 1.2);

    const hasRuby = hasRubyChars(text);
    const effectiveRubySize = hasRuby ? rubySize : 0;

    const lineUnitHeight = baseLineHeight + effectiveRubySize;
    
    const lines = text.split('\n');
    const totalHeight = lines.length * lineUnitHeight;

    const bottomY = canvas.height - padding.bottom;
    const startY = bottomY - totalHeight; 

    if (cfg.bgOpacity > 0) {
        ctx.save();
        ctx.fillStyle = hexToRgba(cfg.bgColor, cfg.bgOpacity);
        
        const extraPadding = 6;
         
        const bgTopY = startY - extraPadding;

        ctx.fillRect(0, bgTopY, canvas.width, canvas.height - bgTopY);
        
        ctx.restore();
    }

    drawFieldWithRuby({
        ctx: ctx,
        text: text,
        x: canvas.width / 2,
        y: startY,
        cfg: cfg,
        size: size,
        align: "center",
        lineHeight: lineUnitHeight,
        drawBackground: false, 
        enableRuby: hasRuby,
        useFixedTop: true  
    });

    return totalHeight;
}

function drawFlavor(padding) {
    const cfg = inputs.flavor;
    const text = cfg.text.value;
    if (!text) return 0;

    const size = getFontSize(cfg);
    const rubySize = size * 0.5;
    const lineGap = cfg.lineHeightPx || 0;
    
    const hasRuby = hasRubyChars(text);
    const effectiveRubySize = hasRuby ? rubySize : 0;

    const lineHeight = size + effectiveRubySize + lineGap + 4;

    drawFieldWithRuby({
        ctx: ctx,
        text: text,
        x: canvas.width - padding.right,
        y: padding.top,
        cfg: cfg,
        size: size,
        align: "right",
        lineHeight: lineHeight,
        drawBackground: true,
        enableRuby: hasRuby,
        useFixedTop: true  
    });

    return (text.split('\n').length * lineHeight) + 12;
}

function drawBP(padding, offsetHeight) {
    const cfg = inputs.bp;
    const text = cfg.text.value;
    if (!text) return 0;

    const size = getFontSize(cfg);
    const lineGap = cfg.lineHeightPx || 0;
    const lineHeight = size + lineGap + 10;

    const startY = padding.top + offsetHeight;

    drawFieldWithRuby({
        ctx: ctx,
        text: text,
        x: canvas.width - padding.right,
        y: startY,
        cfg: cfg,
        size: size,
        align: "right",
        lineHeight: lineHeight,
        drawBackground: true,
        enableRuby: false,
        useFixedTop: true  
    });
    
    return text.split('\n').length * lineHeight;
}

function drawEffect(bottomY) {
    const cfg = inputs.effect;
    const text = cfg.text.value;
    if (!text) return;

    const size = getFontSize(cfg);
    const rubySize = size * 0.5;
    const lineGap = cfg.lineHeightPx || 0;
    
    const hasRuby = hasRubyChars(text);
    const effectiveRubySize = hasRuby ? rubySize : 0;

    const lineHeight = size + effectiveRubySize + lineGap + 4;
    
    const lines = text.split('\n');
    const totalHeight = lines.length * lineHeight;
    
    const startY = bottomY - totalHeight;

    if (cfg.bgOpacity > 0 && cfg.fullWidthBg) {

        const topPadding = hasRuby ? 12 : 6;
        const bottomPadding = 6;

        const bgH = totalHeight + topPadding + bottomPadding;
        const bgY = startY - topPadding; 
        
        ctx.save();
        ctx.fillStyle = hexToRgba(cfg.bgColor, cfg.bgOpacity);
        ctx.fillRect(0, bgY, canvas.width, bgH);
        ctx.restore();
    }

    drawFieldWithRuby({
        ctx: ctx,
        text: text,
        x: 20, 
        y: startY,
        cfg: cfg,
        size: size,
        align: "left",
        lineHeight: lineHeight,
        drawBackground: !cfg.fullWidthBg,
        enableRuby: hasRuby,
        useFixedTop: false  
    });
}

function drawFieldWithRuby({ ctx, text, x, y, cfg, size, align, lineHeight, drawBackground, enableRuby = true, useFixedTop = false }) {
    if (!text) return;
    
    const lines = text.split('\n');
    const rubySize = size * 0.5;
    const spacing = parseInt(cfg.letterSpacing || 0);

    const layoutLines = lines.map(lineStr => {
        const segments = enableRuby ? parseRubyText(lineStr) : [{ text: lineStr, ruby: null }];
        
        ctx.font = `${size}px Arial`;
        let totalWidth = 0;
        
        segments.forEach(seg => {
            seg.width = ctx.measureText(seg.text).width;
            totalWidth += seg.width + spacing;
        });
        if (segments.length > 0) totalWidth -= spacing; 

        return { segments, width: totalWidth };
    });

    let maxLineWidth = 0;
    layoutLines.forEach(l => {
        if (l.width > maxLineWidth) maxLineWidth = l.width;
    });

    if (drawBackground && cfg.bgOpacity > 0) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = ctx.canvas.width;
        tempCanvas.height = ctx.canvas.height;
        const tCtx = tempCanvas.getContext('2d');
        
        tCtx.fillStyle = cfg.bgColor;

        layoutLines.forEach((lineLayout, i) => {
            let drawWidth = maxLineWidth;
            
            let startX = x;
            if (align === "center") startX = x - (drawWidth / 2);
            if (align === "right") startX = x - drawWidth;

            let rectY;
            if (useFixedTop) {
                 
                rectY = y + (i * lineHeight);
            } else {
                 
                const currentRubySize = enableRuby ? rubySize : 0;
                rectY = y + (i * lineHeight) - currentRubySize;
            }
            
            const extraPadding = 6;
            const rectH = lineHeight + (extraPadding * 2);
             
            const drawY = rectY - extraPadding;
            const hPad = 5;

            tCtx.fillRect(
                startX - hPad,
                drawY,
                drawWidth + hPad * 2,
                rectH
            );
        });

        ctx.save();
        ctx.globalAlpha = cfg.bgOpacity;
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.restore();
    }

    ctx.save();
    ctx.fillStyle = cfg.color;
    ctx.strokeStyle = hexToRgba(cfg.borderColor, 1);
    ctx.lineWidth = cfg.borderWidth;
    ctx.lineJoin = "round";
    ctx.textBaseline = "alphabetic"; 

    layoutLines.forEach((lineLayout, i) => {
         
        let lineY;
        
        if (useFixedTop) {
             
            const currentRubySize = enableRuby ? rubySize : 0;
            lineY = y + (i * lineHeight) + currentRubySize + size + 2;
        } else {
             
            lineY = y + (i * lineHeight) + size + 2;
        }
        
        let currentX = x;
        if (align === "center") currentX = x - (lineLayout.width / 2);
        if (align === "right") currentX = x - lineLayout.width;

        lineLayout.segments.forEach(seg => {
             
            ctx.font = `${size}px Arial`;
            ctx.textAlign = "left";
            
            if (cfg.borderWidth > 0) ctx.strokeText(seg.text, currentX, lineY);
            ctx.fillText(seg.text, currentX, lineY);

            if (seg.ruby) {
                ctx.save();
                ctx.font = `${rubySize}px Arial`;
                
                const rubyWidth = ctx.measureText(seg.ruby).width;
                const segCenter = currentX + (seg.width / 2);
                const rubyY = lineY - size - 2;  

                ctx.textAlign = "center";

                let scaleX = 1;
                const maxRubyWidth = seg.width * 1.5;
                if (rubyWidth > maxRubyWidth) {
                    scaleX = maxRubyWidth / rubyWidth;
                }

                ctx.translate(segCenter, rubyY);
                if (scaleX < 1) ctx.scale(scaleX, 1);

                const oldLineWidth = ctx.lineWidth;
                ctx.lineWidth = oldLineWidth * 0.5;
                
                if (cfg.borderWidth > 0) ctx.strokeText(seg.ruby, 0, 0);
                ctx.fillText(seg.ruby, 0, 0);

                ctx.restore();
            }

            currentX += seg.width + spacing;
        });
    });
    ctx.restore();
}

function parseRubyText(text) {
    const result = [];
    const normalized = text.replace(/（/g, '(').replace(/）/g, ')');
    const regex = /([^\(\)]+)\(([^\(\)]+)\)|([^\(\)]+)/g;
    
    let match;
    while ((match = regex.exec(normalized)) !== null) {
        if (match[1] && match[2]) {
            result.push({ text: match[1], ruby: match[2] });
        } else if (match[0]) {
            result.push({ text: match[0], ruby: null });
        }
    }
    return result;
}

function getFontSize(cfg) {
    const val = parseFloat(cfg.size.value);
    const unit = cfg.unit.value;
    if (unit === '%') {
        return calculatePx(val, '%');
    }
    return val;
}

function calculatePx(val, unit) {
    if (unit === '%') {
        return (val / 100) * canvas.width;
    }
    return val;
}

function hexToRgba(hex, alpha) {
    if (!hex) return `rgba(0,0,0,${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

function getCleanFileName() {
    const cost = manaCost.value;

    let rawName = inputs.cardName.text.value || "";

    let name = rawName.replace(/\([^\)]*\)/g, "").replace(/（[^）]*）/g, "").replace(/\n/g, "");

    let rawBP = inputs.bp.text.value || "";
    let bp = rawBP.replace(/\n/g, "");

    const sanitize = (str) => str.replace(/[<>:"/\\|?*]/g, "_");

    return `${cost}_${sanitize(name)}_${sanitize(bp)}`;
}

function updateFileNamePreview() {
    if(fileNamePreview) {
         
        fileNamePreview.innerHTML = `保存ファイル名<br>${getCleanFileName()}.png`;
    }
}

manaCost.addEventListener('change', updateFileNamePreview);
inputs.cardName.text.addEventListener('input', updateFileNamePreview);
inputs.bp.text.addEventListener('input', updateFileNamePreview);

saveImageBtn.addEventListener('click', () => {
    drawCanvas();  
    
    const fileName = getCleanFileName();
    
    const link = document.createElement('a');
    link.download = `${fileName}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
});

setTimeout(() => {
    updateCanvasSettings();
    updateFileNamePreview();  
}, 100);
