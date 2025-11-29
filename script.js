// --- DOM要素の取得 ---
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imageDropzone = document.getElementById('imageDropzone');
const bgImageInput = document.getElementById('bgImageInput');
const overlayImage = document.getElementById('overlayImage'); // 枠画像用imgタグ
const leftDrawer = document.getElementById('left-drawer');
const leftToggle = document.getElementById('left-drawer-toggle');
const rightDrawer = document.getElementById('right-drawer');
const rightToggle = document.getElementById('right-drawer-toggle');
const layerListContainer = document.getElementById('layer-list');
const fileNamePreview = document.getElementById('fileNamePreview'); // ファイル名プレビュー用

// 入力コントロール
const canvasStandard = document.getElementById('canvasStandard');
const cardAttribute = document.getElementById('cardAttribute');
const manaCost = document.getElementById('manaCost');

// テキスト入力群
const inputs = {
    cardName: {
        text: document.getElementById('inputCardName'),
        unit: document.getElementById('unitCardName'),
        size: document.getElementById('sizeCardName'),
        // デフォルト設定
        defPct: 6,
        color: '#FFB9FF', // R255, G185, B255
        bgColor: '#545454', // R84, G84, B84
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
        bgColor: '#FFDCFF', // R255, G220, B255
        bgOpacity: 0.5,
        borderColor: '#000000',
        borderWidth: 4,
        letterSpacing: 1,
        lineHeightPx: 2 // 行間+2px
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
        bgColor: '#8CF5E6', // R140, G245, B230
        bgOpacity: 0.3,
        borderColor: '#000000',
        borderWidth: 4,
        letterSpacing: 1,
        lineHeightPx: 2,
        fullWidthBg: true // 特殊フラグ
    }
};

const saveImageBtn = document.getElementById('saveImageBtn');

// --- 状態変数 ---
let bgObject = null; // 背面画像オブジェクト
let isBgLoaded = false;
let currentStandard = "608x1080"; // 初期値

// --- 初期化処理 ---

// マナコストのプルダウン生成 (0-99)
for (let i = 0; i <= 99; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = i;
    manaCost.appendChild(opt);
}
manaCost.value = 0;

// イベントリスナー設定
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

// キャンバス規格・属性変更時の処理
function updateCanvasSettings() {
    currentStandard = canvasStandard.value;
    const attr = cardAttribute.value;
    
    // キャンバスサイズ変更
    if (currentStandard === "608x1080") {
        canvas.width = 608;
        canvas.height = 1080;
    } else {
        canvas.width = 768;
        canvas.height = 1366;
    }

    // 枠画像のパス決定
    let fileName = "";
    if (currentStandard === "608x1080") {
        fileName = (attr === "S") ? "S608x1080.png" : "M608x1080.png";
    } else {
        fileName = (attr === "S") ? "S2_768x1366.png" : "M2_768x1366.png";
    }

    // 枠画像の読み込み
    overlayImage.src = `Picture/${fileName}`;
    
    // 背景画像のリサイズ
    if (bgObject) {
        bgObject.width = canvas.width;
        bgObject.height = canvas.height;
    }

    drawCanvas();
}

overlayImage.onload = () => drawCanvas();
overlayImage.onerror = () => {
    console.warn("枠画像が見つかりません: Pictureフォルダを確認してください");
    drawCanvas(); // 画像なしで描画
};

canvasStandard.addEventListener('change', updateCanvasSettings);
cardAttribute.addEventListener('change', updateCanvasSettings);
manaCost.addEventListener('change', drawCanvas);

// 各テキスト入力の変更検知
Object.values(inputs).forEach(inp => {
    inp.text.addEventListener('input', drawCanvas);
    inp.unit.addEventListener('change', drawCanvas);
    inp.size.addEventListener('input', drawCanvas);
});


// --- 背面画像読み込み処理 ---

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
        
        // 規格に合わせてリサイズして保持
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


// --- 描画ロジック (Core) ---

function drawCanvas() {
    // 1. クリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. 背面画像 (最背面)
    if (bgObject) {
        ctx.drawImage(bgObject.img, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 3. 枠画像 (オーバーレイ)
    if (overlayImage.complete && overlayImage.naturalWidth !== 0) {
        ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);
    }

    // 4. テキスト描画
    drawManaCost();

    // 座標計算用パディング（画像端からの距離）
    const padding = {
        bottom: 15, // カード名の下余白
        top: 12,    // フレーバー上余白
        right: 18,  // 右余白
        left: 40,   // 左余白
        effectBottomSpace: 12 // カード名と効果の間隔（12pxにすることで背景6px+6pxがピッタリ接する）
    };

    // 4-1. カード名 (下部中央、改行時は上へ積み上げ)
    const nameH = drawCardName(padding);

    // 4-2. 効果 (左下、カード名の上)
    const effectBottomY = canvas.height - padding.bottom - nameH - padding.effectBottomSpace;
    drawEffect(effectBottomY);

    // 4-3. フレーバーテキスト (右上、改行時は下へ)
    const flavorH = drawFlavor(padding);

    // 4-4. BP/スペル (右上、フレーバーの下)
    // フレーバーの下に配置するので、flavorHをオフセットとして渡す
    drawBP(padding, flavorH);
}


// --- 個別描画関数群 ---

// ヘルパー：テキストにルビ記号が含まれているかチェック
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
    
    // ルビの有無チェック
    const hasRuby = hasRubyChars(text);
    const effectiveRubySize = hasRuby ? rubySize : 0;

    // 1行あたりの高さ
    const lineUnitHeight = baseLineHeight + effectiveRubySize;
    
    const lines = text.split('\n');
    const totalHeight = lines.length * lineUnitHeight;
    
    // 描画開始Y座標 (下揃え)
    // 「背景色を下にずらす」処理のため、Boxの上端(startY)を計算の基準にします
    // Box全体が bottomY - totalHeight から始まると考えます
    const bottomY = canvas.height - padding.bottom;
    const startY = bottomY - totalHeight; 

    // --- 背景描画 ---
    if (cfg.bgOpacity > 0) {
        ctx.save();
        ctx.fillStyle = hexToRgba(cfg.bgColor, cfg.bgOpacity);
        
        const extraPadding = 6;
        // 背景の上端計算: ルビの有無にかかわらずstartYを基準にする
        const bgTopY = startY - extraPadding;
        
        // 画面幅いっぱい、上端から画面下端まで
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
        useFixedTop: true // カード名は背景固定・文字ずらしモード
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

    // 行の高さ
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
        useFixedTop: true // フレーバーも背景固定・文字ずらしモード
    });

    // 戻り値調整: 固定トップモードなので、描画した高さ分だけ返す（変な減算をしない）
    // 背景のパディング(上下6pxずつ=12px)分を加算
    return (text.split('\n').length * lineHeight) + 12;
}

function drawBP(padding, offsetHeight) {
    const cfg = inputs.bp;
    const text = cfg.text.value;
    if (!text) return 0;

    const size = getFontSize(cfg);
    const lineGap = cfg.lineHeightPx || 0;
    const lineHeight = size + lineGap + 10;

    // フレーバーの下から描画開始
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
        useFixedTop: true // BPも同様
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

    // 効果欄特有: 全幅背景
    if (cfg.bgOpacity > 0 && cfg.fullWidthBg) {
        // カード名背景の上パディング(6px)と隙間なく接続させるため、
        // 下パディングを6pxに固定計算します
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
        useFixedTop: false // 効果欄は従来通り（文字基準で背景を上に伸ばす）
    });
}


// --- 汎用ルビ描画システム ---

/**
 * ルビ付きテキストを描画する統合関数
 * @param {boolean} useFixedTop trueの場合、y座標を「背景ボックスの上端」として扱い、文字を下にずらしてルビを描画します（背景が上に伸びない）。falseの場合、y座標を基準にルビ分背景を上に伸ばします。
 */
function drawFieldWithRuby({ ctx, text, x, y, cfg, size, align, lineHeight, drawBackground, enableRuby = true, useFixedTop = false }) {
    if (!text) return;
    
    const lines = text.split('\n');
    const rubySize = size * 0.5;
    const spacing = parseInt(cfg.letterSpacing || 0);

    // 1. レイアウト計算
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

    // 2. 背景の描画
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

            // 背景位置の計算
            let rectY;
            if (useFixedTop) {
                // FixedTopモード: yがボックスの上端。i行目もそこから単純加算。
                rectY = y + (i * lineHeight);
            } else {
                // 従来モード: ルビがある場合、その分上に背景を伸ばす
                const currentRubySize = enableRuby ? rubySize : 0;
                rectY = y + (i * lineHeight) - currentRubySize;
            }
            
            const extraPadding = 6;
            const rectH = lineHeight + (extraPadding * 2);
            // rectYはコンテンツエリアの上端なので、パディング分上にずらして描画
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

    // 3. 文字の描画
    ctx.save();
    ctx.fillStyle = cfg.color;
    ctx.strokeStyle = hexToRgba(cfg.borderColor, 1);
    ctx.lineWidth = cfg.borderWidth;
    ctx.lineJoin = "round";
    ctx.textBaseline = "alphabetic"; 

    layoutLines.forEach((lineLayout, i) => {
        // 文字のベースライン位置計算
        let lineY;
        
        if (useFixedTop) {
            // FixedTopモード: yが上端。文字は「ルビサイズ + 文字サイズ」分下に位置する。
            const currentRubySize = enableRuby ? rubySize : 0;
            lineY = y + (i * lineHeight) + currentRubySize + size + 2;
        } else {
            // 従来モード: y + 文字サイズ
            lineY = y + (i * lineHeight) + size + 2;
        }
        
        let currentX = x;
        if (align === "center") currentX = x - (lineLayout.width / 2);
        if (align === "right") currentX = x - lineLayout.width;

        lineLayout.segments.forEach(seg => {
            // --- 親文字 ---
            ctx.font = `${size}px Arial`;
            ctx.textAlign = "left";
            
            if (cfg.borderWidth > 0) ctx.strokeText(seg.text, currentX, lineY);
            ctx.fillText(seg.text, currentX, lineY);

            // --- ルビ ---
            if (seg.ruby) {
                ctx.save();
                ctx.font = `${rubySize}px Arial`;
                
                const rubyWidth = ctx.measureText(seg.ruby).width;
                const segCenter = currentX + (seg.width / 2);
                const rubyY = lineY - size - 2; // 親文字の上に配置

                ctx.textAlign = "center";
                
                // 長体処理
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

/**
 * テキスト解析ヘルパー
 * "漢字(ルビ)" -> [{text:"漢字", ruby:"ルビ"}, ...]
 */
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


// --- ユーティリティ ---

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

// --- 保存機能 & ファイル名生成ロジック ---

/**
 * 現在の入力に基づいてクリーンなファイル名を生成する
 * 形式: [コスト]_[カード名(ルビ抜き)]_[BP(改行抜き)].png
 * OS禁止文字はアンダースコアに置換
 */
function getCleanFileName() {
    const cost = manaCost.value;
    
    // カード名: 改行とルビ(カッコと中身)を除去
    let rawName = inputs.cardName.text.value || "";
    // \([^\)]*\) -> 半角カッコと中身を除去
    // （[^）]*） -> 全角カッコと中身を除去
    let name = rawName.replace(/\([^\)]*\)/g, "").replace(/（[^）]*）/g, "").replace(/\n/g, "");
    
    // BP: 改行を除去
    let rawBP = inputs.bp.text.value || "";
    let bp = rawBP.replace(/\n/g, "");

    // ファイル名に使用できない文字を置換 (< > : " / \ | ? *)
    // Windows等での保存トラブル防止のため、アンダースコアに置換します
    const sanitize = (str) => str.replace(/[<>:"/\\|?*]/g, "_");

    // 空白の場合はプレースホルダーを入れる等の調整も可能ですが、
    // ここでは単純に結合します。
    return `${cost}_${sanitize(name)}_${sanitize(bp)}`;
}

/**
 * 左メニューのファイル名プレビューを更新する
 */
function updateFileNamePreview() {
    if(fileNamePreview) {
        // textContent -> innerHTML に変更して <br> を有効化
        fileNamePreview.innerHTML = `保存ファイル名<br>${getCleanFileName()}.png`;
    }
}

// ファイル名に関わる要素が変更されたらプレビューを更新
manaCost.addEventListener('change', updateFileNamePreview);
inputs.cardName.text.addEventListener('input', updateFileNamePreview);
inputs.bp.text.addEventListener('input', updateFileNamePreview);

saveImageBtn.addEventListener('click', () => {
    drawCanvas(); // 最新状態を描画
    
    const fileName = getCleanFileName();
    
    const link = document.createElement('a');
    link.download = `${fileName}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
});

// 初期描画
setTimeout(() => {
    updateCanvasSettings();
    updateFileNamePreview(); // 初期プレビュー表示
}, 100);