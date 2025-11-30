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
            top: 13,     
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

// --- PNGデータ埋め込み関連の関数 ---

// CRC32計算テーブルの生成
const crcTable = (() => {
    let c;
    const table = [];
    for (let n = 0; n < 256; n++) {
        c = n;
        for (let k = 0; k < 8; k++) {
            c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        table[n] = c;
    }
    return table;
})();

// CRC32チェックサムを計算する関数
function crc32(bytes) {
    let crc = -1;
    for (let i = 0; i < bytes.length; i++) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ bytes[i]) & 0xFF];
    }
    return (crc ^ -1) >>> 0;
};

// PNGデータURLにテキストデータを埋め込む関数
function injectDataIntoPNG(dataUrl, key, text) {
    // DataURLからbase64部分をデコード
    const base64Data = dataUrl.substring(dataUrl.indexOf(',') + 1);
    const decodedData = atob(base64Data);
    const bytes = new Uint8Array(decodedData.length);
    for (let i = 0; i < decodedData.length; i++) {
        bytes[i] = decodedData.charCodeAt(i);
    }

    // PNGシグネチャをスキップ (8バイト)
    const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
    let offset = 8;

    // キーとテキストをUTF-8にエンコード
    const textEncoder = new TextEncoder();
    const keyBytes = textEncoder.encode(key);
    const textBytes = textEncoder.encode(text);
    
    // tEXtチャンクのデータ部分を作成 (key + null separator + text)
    const chunkData = new Uint8Array(keyBytes.length + 1 + textBytes.length);
    chunkData.set(keyBytes, 0);
    chunkData.set([0], keyBytes.length);
    chunkData.set(textBytes, keyBytes.length + 1);

    // チャンクタイプ (tEXt)
    const chunkType = new Uint8Array([116, 69, 88, 116]);
    
    // CRC計算用のデータ (Chunk Type + Chunk Data)
    const crcData = new Uint8Array(chunkType.length + chunkData.length);
    crcData.set(chunkType, 0);
    crcData.set(chunkData, chunkType.length);
    
    // CRCチェックサムを計算
    const crc = crc32(crcData);

    // 新しいtEXtチャンクを構築
    const chunkLength = chunkData.length;
    const newChunk = new Uint8Array(4 + 4 + chunkLength + 4);
    const view = new DataView(newChunk.buffer);
    
    // 1. Length (4バイト)
    view.setUint32(0, chunkLength, false); 
    // 2. Chunk Type (4バイト)
    newChunk.set(chunkType, 4);
    // 3. Chunk Data
    newChunk.set(chunkData, 8);
    // 4. CRC (4バイト)
    view.setUint32(8 + chunkLength, crc, false);

    // IENDチャンクの位置を見つける
    // 通常、IENDは最後の12バイト
    const iendOffset = bytes.length - 12;
    
    // 新しいバイト配列を作成 (元のデータ + 新しいチャンク)
    const newBytes = new Uint8Array(bytes.length + newChunk.length);
    // IENDチャンクの前までをコピー
    newBytes.set(bytes.subarray(0, iendOffset), 0);
    // 新しいチャンクを挿入
    newBytes.set(newChunk, iendOffset);
    // IENDチャンクを末尾にコピー
    newBytes.set(bytes.subarray(iendOffset), iendOffset + newChunk.length);

    // 新しいPNGデータをBase64に再エンコード
    let newBinary = '';
    for (let i = 0; i < newBytes.length; i++) {
        newBinary += String.fromCharCode(newBytes[i]);
    }
    const newBase64 = btoa(newBinary);

    return 'data:image/png;base64,' + newBase64;
}

// カードデータをJSON文字列として取得する関数
function getCardDataAsJson() {
    const data = {
        attribute: cardAttribute.value,
        mana: manaCost.value,
        cardName: inputs.cardName.text.value.replace(/\r?\n/g, ' '),
        flavor: inputs.flavor.text.value.replace(/\r?\n/g, ' '),
        bp: inputs.bp.text.value.replace(/\r?\n/g, ' '),
        effect: inputs.effect.text.value.replace(/\r?\n/g, ' ')
    };
    return JSON.stringify(data);
}

saveImageBtn.addEventListener('click', () => {
    // 最終描画
    drawCanvas();  
    
    // データをJSON形式で取得
    const cardDataJson = getCardDataAsJson();
    
    // 元の画像データを取得
    const originalPngDataUrl = canvas.toDataURL('image/png');
    
    // PNGにデータを埋め込む
    const newPngDataUrl = injectDataIntoPNG(originalPngDataUrl, 'smCardData', cardDataJson);

    // ファイル名を生成
    const fileName = getCleanFileName();
    
    // 新しいデータでリンクを作成してダウンロード
    const link = document.createElement('a');
    link.download = `${fileName}.png`;
    link.href = newPngDataUrl;
    link.click();
});

setTimeout(() => {
    updateCanvasSettings();
    updateFileNamePreview();  
}, 100);
