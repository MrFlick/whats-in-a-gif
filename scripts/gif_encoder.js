/* eslint-disable no-unused-vars,  no-mixed-operators */
/* global GridDraw GifEncoder CodeTree EncodeExplainer */

function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

class PageController {
    constructor() {
        this.editor = null;
        this.explainer = null;
        this.drawmode = null;
        this.init();
    }

    init() {
        this.drawmode = new ModeChooser(
            document.getElementById('draw-mode'),
            [
                { code: '4color', name: '4-color Mode' },
                { code: '16color', name: '16-color Mode' },
            ],
        );
        this.drawmode.ele.addEventListener('changed', (e) => {
            this.setSample(e.detail.mode);
        });
        const sample = this.getSample('4color');
        this.editor = new GridDraw(
            document.getElementById('draw-box'),
            sample.data, sample.colors,
        );
        this.explainer = new EncodeExplainer(
            document.getElementById('explain-results'),
        );
        this.editor.ele.addEventListener('changed', () => {
            this.explain();
        });
        this.explain();
    }

    explain() {
        this.explainer.explain(this.editor.getColorStream(),
            this.editor.getColorPallete());
    }

    getSample(name) {
        const result = {};
        if (name === '16color') {
            // pallete from https://androidarts.com/palette/16pal.htm
            result.colors = [
                '#000000', '#9D9D9D', '#FFFFFF', '#BE2633',
                '#E06F8B', '#493C2B', '#A46422', '#EB8931',
                '#F7E26B', '#2F484E', '#44891A', '#A3CE27',
                '#1B2632', '#005784', '#31A2F2', '#B2DCEF',
            ];
            result.data = [
                11, 11, 11, 11, 11, 7, 7, 7, 7, 7,
                11, 11, 11, 11, 14, 14, 7, 7, 7, 7,
                11, 11, 11, 14, 14, 14, 14, 7, 7, 7,
                11, 11, 14, 14, 15, 15, 14, 14, 7, 7,
                11, 14, 14, 15, 15, 15, 15, 14, 14, 7,
                7, 14, 14, 15, 15, 15, 15, 14, 14, 11,
                7, 7, 14, 14, 15, 15, 14, 14, 11, 11,
                7, 7, 7, 14, 14, 14, 14, 11, 11, 11,
                7, 7, 7, 7, 14, 14, 11, 11, 11, 11,
                7, 7, 7, 7, 7, 11, 11, 11, 11, 11,
            ];
        } else { // 4color /default
            result.colors = [
                '#FFFFFF', '#FF0000', '#0000FF', '#000000',
            ];
            result.data = [
                1, 1, 1, 1, 1, 2, 2, 2, 2, 2,
                1, 1, 1, 1, 1, 2, 2, 2, 2, 2,
                1, 1, 1, 1, 1, 2, 2, 2, 2, 2,
                1, 1, 1, 0, 0, 0, 0, 2, 2, 2,
                1, 1, 1, 0, 0, 0, 0, 2, 2, 2,
                2, 2, 2, 0, 0, 0, 0, 1, 1, 1,
                2, 2, 2, 0, 0, 0, 0, 1, 1, 1,
                2, 2, 2, 2, 2, 1, 1, 1, 1, 1,
                2, 2, 2, 2, 2, 1, 1, 1, 1, 1,
                2, 2, 2, 2, 2, 1, 1, 1, 1, 1,
            ];
        }
        return result;
    }

    setSample(name) {
        const sample = this.getSample(name);
        this.editor.setColorPallete(sample.colors);
        this.editor.setColorStream(sample.data);
    }
}

class ModeChooser {
    constructor(ele, modes) {
        this.ele = ele;
        for (let idx = 0; idx < modes.length; idx++) {
            const input = document.createElement('input');
            const modeid = `mode${idx}`;
            input.type = 'radio';
            input.name = 'imgmode';
            input.id = modeid;
            input.value = modes[idx].code;
            if (idx === 0) {
                this.mode = modes[idx].code;
                input.checked = true;
            }
            const label = document.createElement('label');
            label.appendChild(document.createTextNode(modes[idx].name));
            label.htmlFor = modeid;
            this.ele.append(input);
            this.ele.append(label);
            input.addEventListener('change', (e) => this.handleChange(e));
        }
    }

    handleChange(e) {
        this.mode = e.target.value;
        const myEvent = new CustomEvent('changed', {
            detail: { mode: this.mode },
            bubbles: true,
            cancelable: true,
            composed: false,
        });
        this.ele.dispatchEvent(myEvent);
    }
}

class GridDraw {
    constructor(ele, data, colors) {
        this.ele = ele;
        this.canvas = this.ele.querySelector('canvas');
        this.rows = 10;
        this.cols = 10;
        this.drawColor = 0;
        this.data = data || [];
        this.colors = colors || Array.from({ length: this.nrows * this.ncols });
        this.handleChange = debounce(this.sendChangeEvent.bind(this));
        const setColorIndexAt = (e) => {
            const cell = this.getCellIndex(e);
            if (this.drawColor !== this.data[cell.i]) {
                this.data[cell.i] = this.drawColor;
                this.redraw();
                this.handleChange();
            }
        };

        this.canvas.addEventListener('mousedown', (e) => {
            e.preventDefault();
            setColorIndexAt(e);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            e.preventDefault();
            if (e.buttons === 1) {
                setColorIndexAt(e);
            }
        });
        this.picker = new ColorPicker(this.ele, this.setDrawColorIndex.bind(this), this.colors);
        this.redraw();
    }

    sendChangeEvent() {
        const myEvent = new CustomEvent('changed', {
            detail: {},
            bubbles: true,
            cancelable: true,
            composed: false,
        });
        this.ele.dispatchEvent(myEvent);
    }

    getMousePosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        return { x, y };
    }

    getCellIndex(event) {
        const point = this.getMousePosition(event);
        const calc = {
            r: Math.floor(point.x / (this.canvas.width / this.cols)),
            c: Math.floor(point.y / (this.canvas.height / this.rows)),
            i: 0,
        };
        if (calc.r < 0) { calc.r = 0; }
        if (calc.c < 0) { calc.c = 0; }
        if (calc.r >= this.rows) { calc.r = this.rows - 1; }
        if (calc.c >= this.cols) { calc.c = this.cols - 1; }
        calc.i = calc.r * this.cols + calc.c;
        return calc;
    }

    redraw() {
        const cellWidth = this.canvas.width / this.cols;
        const cellHeight = this.canvas.height / this.rows;
        const ctx = this.canvas.getContext('2d');
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const idx = row * this.rows + col;
                ctx.fillStyle = this.colors[this.data[idx]];
                ctx.fillRect(row * cellHeight, col * cellWidth,
                    cellHeight, cellWidth);
            }
        }
        ctx.strokeStyle = 'rgb(75,75,75)';
        ctx.beginPath();
        for (let row = 1; row < this.rows; row++) {
            ctx.moveTo(row * cellHeight, 0);
            ctx.lineTo(row * cellHeight, this.canvas.width);
        }
        ctx.stroke();
        ctx.beginPath();
        for (let col = 1; col < this.cols; col++) {
            ctx.moveTo(0, col * cellWidth);
            ctx.lineTo(this.canvas.height, col * cellWidth);
        }
        ctx.stroke();
    }

    getColorStream() {
        return [...this.data];
    }

    getColorPallete() {
        return [...this.colors];
    }

    setColorStream(data) {
        const ncol = this.colors.length;
        const ndata = data.length;
        for (let i = 0; i <= this.rows * this.cols; i++) {
            if (i < ndata) {
                this.data[i] = data[i] % ncol;
            }
        }
        this.redraw();
        this.handleChange();
    }

    setColorPallete(colors) {
        this.colors = [...colors];
        this.redraw();
        this.picker.setColors(this.colors);
        this.handleChange();
    }

    setDrawColorIndex(index) {
        this.drawColor = index;
    }
}

class ColorPicker {
    constructor(ele, cb, colors) {
        this.ele = ele;
        this.colors = colors;
        this.active = document.createElement('canvas');
        this.palette = document.createElement('canvas');
        this.palette.style.cursor = 'pointer';
        this.activeColor = 0;
        const div = document.createElement('div');
        const picker = document.createElement('div');
        picker.classList.add('color-picker');
        picker.appendChild(document.createTextNode('Brush'));
        picker.append(this.active, this.palette);
        picker.appendChild(document.createTextNode('Palette'));
        picker.append(this.palette);
        div.append(picker);
        this.ele.append(div);
        this.nRows = 1;
        this.nCols = 1;
        this.boxSize = 30;
        this.boxPadding = 2;
        this.cb = cb;
        this.palette.addEventListener('click', this.onMouseClick.bind(this));
        this.resize();
        this.render();
    }

    setColors(colors) {
        this.colors = [...colors];
        this.resize();
        this.render();
    }

    resize(size) {
        const colorCount = size || this.colors.length || 1;
        this.boxPadding = 2;
        if (colorCount < 16) {
            this.nCols = 2;
            this.nRows = colorCount / this.nCols;
        } else if (colorCount < 64) {
            this.nRows = 8;
            this.nCols = colorCount / this.nRows;
        } else {
            this.nRows = 16;
            this.nCols = colorCount / this.nRows;
            this.boxSize = 20;
        }
        const width = this.nCols * (this.boxSize + this.boxPadding) + this.boxPadding;
        const height = this.nRows * (this.boxSize + this.boxPadding) + this.boxPadding;

        this.palette.width = width;
        this.palette.height = height;

        this.active.width = width;
        this.active.height = this.boxSize;
    }

    render() {
        this.renderPalette();
        this.renderActiveColor();
    }

    renderPalette() {
        const ctx = this.palette.getContext('2d');
        const pallete = this.colors;
        const size = this.boxSize;
        const padding = this.boxPadding;
        const pad = (i) => padding + i * (size + padding);
        let pidx = 0;
        for (let row = 0; row < this.nRows; row++) {
            for (let col = 0; col < this.nCols; col++) {
                ctx.fillStyle = pallete[pidx];
                ctx.fillRect(pad(col), pad(row), size, size);
                pidx += 1;
            }
        }
    }

    renderActiveColor() {
        const ctx = this.active.getContext('2d');
        const padding = this.boxPadding;
        const pallete = this.colors;
        ctx.fillStyle = pallete[this.activeColor];
        ctx.fillRect(padding, padding, this.active.width - 2 * padding,
            this.active.height - padding);
    }

    onMouseClick(evt) {
        const r = this.palette.getBoundingClientRect();
        let x = Math.floor((evt.clientX - r.left) / (r.right - r.left) * this.palette.width);
        let y = Math.floor((evt.clientY - r.top) / (r.bottom - r.top) * this.palette.height);
        if (x < 0) x = 0; if (x > this.palette.width) x = this.palette.width;
        if (y < 0) y = 0; if (y > this.palette.height) y = this.palette.height;

        const clamp = (val, min, max) => Math.max(Math.min(val, max), min);
        const row = clamp(Math.floor(y / (this.boxSize + this.boxPadding)), 0, this.nRows - 1);
        const col = clamp(Math.floor(x / (this.boxSize + this.boxPadding)), 0, this.nCols - 1);
        const idx = row * this.nCols + col;
        this.activeColor = idx;
        this.renderActiveColor();
        if (this.cb) this.cb(idx);
    }
}

class ByteEncoder {
    constructor(enc) {
        this.enc = enc;
        this.lzw_min = this.enc.lzw_min;
    }

    * encode(colorStream) {
        let nBits = this.lzw_min + 1;
        let bitIncrease = 2 ** nBits;
        const bitBuffer = [];

        function popByteFromBitBuffer(buffer) {
            let newByte = 0;
            const range = Math.min(8, buffer.length);
            for (let i = 0; i < range; i++) {
                newByte += buffer.pop() << i;
            }
            return newByte;
        }

        for (const action of this.enc.encode(colorStream)) {
            if (action.emit != null) {
                action.bits = nBits;
                for (let i = 0; i < nBits; i++) {
                    bitBuffer.unshift((action.emit >> i) & 1);
                }
                action.bitBuffer = [...bitBuffer];
                if (bitBuffer.length >= 8) {
                    action.emitByte = popByteFromBitBuffer(bitBuffer);
                }
            }
            if (action.new && action.new.code === bitIncrease) {
                nBits += 1;
                bitIncrease *= 2;
            }
            yield action;
        }
        if (bitBuffer.length) {
            yield {
                step: 'Clear Bit Buffer',
                emitByte: popByteFromBitBuffer(bitBuffer),
                bitBuffer: [],
            };
        }
    }
}

class ImageDataEncoder {
    constructor(colors) {
        this.nColors = colors.length;
        this.lzw_min = Math.max(2, Math.ceil(Math.log2(this.nColors)));
    }

    clear() {
        return (this.lzw_min ** 2);
    }

    eoi() {
        return (this.clear() + 1);
    }

    * encode(colorStream) {
        const codeTree = new CodeTree(this.nColors, this.eoi() + 1);
        yield { emit: this.clear(), step: 'Init' };
        for (const color of colorStream) {
            yield codeTree.append(color);
        }
        yield { ...codeTree.finalize(), step: 'Clear Index Buffer' };
        yield { emit: this.eoi(), step: 'EOI' };
    }
}

class CodeTree {
    constructor(nColors, firstCode) {
        this.nColors = nColors;
        this.firstCode = firstCode;
        this.clear();
    }

    append(color) {
        this.buffer.push(color);
        if (this.current.children[color] != null) {
            this.current = this.current.children[color];
            return { color, found: this.current.code };
        }
        const emitCode = this.current.code;
        const newNode = { code: this.nextCode++, children: [] };
        this.current.children[color] = newNode;
        const result = {
            color,
            emit: emitCode,
            new: { code: newNode.code, colors: [...this.buffer] },
        };
        this.current = this.root.children[color];
        this.buffer = [color];
        return result;
    }

    finalize() {
        const result = { emit: this.current.code };
        this.clear();
        return result;
    }

    clear() {
        this.root = {
            code: null, children: Array.from({ length: this.nColors },
                (v, i) => ({ code: i, children: [] })),
        };
        this.current = this.root;
        this.nextCode = this.firstCode;
        this.buffer = [];
    }
}

class EncodeExplainer {
    constructor(ele) {
        this.ele = ele;
        this.tabHelper = new TabHelper();
        this.tabHelper.createTabs(['Encoding Steps', 'Resulting Code Table', 'Image Data Bytes']);
        this.ele.append(this.tabHelper.ele);
    }

    explain(colorStream, colors) {
        const idEncoder = new ImageDataEncoder(colors);
        const encoder = new ByteEncoder(idEncoder);
        const codeTable = colors.map((v, i) => [i]);
        codeTable[idEncoder.clear()] = 'Clear';
        codeTable[idEncoder.eoi()] = 'EOI';
        const codeStream = [];
        const bytes = [];
        let stepIdx = 0;

        const table = new TableBuilder({ className: 'alg_steps' });
        table.addRow([
            'Step', 'Type', 'Color', 'Index Buffer', 'Known Code',
            'New Code', 'Add to Code Stream', 'Code Size', 'Bit Buffer', 'New Byte',
        ]);
        for (const r of encoder.encode(colorStream)) {
            let bitbufferDesc = '';
            let newByteDesc = '';
            if (r.emit != null) {
                codeStream.push(r.emit);
            }
            if (r.emitByte != null) {
                bitbufferDesc = r.bitBuffer.join('');
                bytes.push(r.emitByte);
                newByteDesc = `00${r.emitByte.toString(16).toUpperCase()}`.substr(-2);
            }
            if (r.new) {
                codeTable[r.new.code] = r.new.colors;
            }
            table.addRow();
            table.addCell(stepIdx++);
            const stepType = r.step || ((r.emit != null) ? 'Emit' : 'Silent');
            table.addCell(stepType);
            const color = (r.color != null) ? r.color : '';
            table.addCell(color);
            if (r.found != null) {
                const buffer = codeTable[r.found].join(', ');
                table.addCell(buffer);
                table.addCell(`#${r.found}`);
                table.addCell();
            } else if (r.new) {
                const buffer = r.new.colors.join(', ');
                table.addCell(buffer);
                table.addCell();
                table.addCell(`#${r.new.code}`);
            } else {
                table.addCell();
                table.addCell();
                table.addCell();
            }
            const emitCode = (r.emit != null) ? `#${r.emit}` : '';
            table.addCell(emitCode);
            const bitSize = (r.emit != null) ? r.bits : '';
            table.addCell(bitSize);
            bitbufferDesc = (r.emit != null) ? bitbufferDesc : '';
            table.addCell(bitbufferDesc);
            newByteDesc = (r.emitByte != null || newByteDesc) ? newByteDesc : '';
            table.addCell(newByteDesc);
        }
        const ctOut = new TableBuilder({ className: 'alg_steps' });
        ctOut.addRow().addCell('Code').addCell('Value');
        for (let i = 0; i < codeTable.length; i++) {
            ctOut.addRow().addCell(`#${i}`).addCell(codeTable[i]);
        }
        const bOut = document.createElement('p');
        bytes.unshift(bytes.length);
        bytes.unshift(encoder.lzw_min);
        bytes.push(0);
        bOut.append(document.createTextNode(
            bytes.map((x) => (`00${x.toString(16).toUpperCase()}`).substr(-2)).join(', '),
        ));
        this.tabHelper.setTabConent(0, table.ele);
        this.tabHelper.setTabConent(1, ctOut.ele);
        this.tabHelper.setTabConent(2, bOut);
    }
}

class TableBuilder {
    constructor(attr) {
        const { className = null } = attr || {};
        this.ele = document.createElement('table');
        if (className) {
            this.ele.classList.add(className);
        }
        this.lastRow = null;
    }

    addRow(values, attr) {
        const { className = null } = attr | {};
        const tr = this.ele.insertRow();
        this.lastRow = tr;
        if (className) {
            tr.classList.add(className);
        }
        if (values) {
            values.forEach((v) => this.addCell(v));
        }
        return this;
    }

    addCell(value, attr) {
        const { className = null } = attr || {};
        const td = this.lastRow.insertCell();
        if (className) {
            td.classList.add(className);
        }
        if (value !== undefined) {
            td.append(document.createTextNode(value));
        }
        return this;
    }
}

class TabHelper {
    constructor() {
        this.nextid = 1;
        this.ele = document.createElement('main');
        this.tabBodies = [];
    }

    createTabs(names) {
        for (let idx = 0; idx < names.length; idx++) {
            const tabid = `tab${idx + 1}`;
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'tabs';
            input.id = tabid;
            if (idx === 0) {
                input.checked = true;
            }
            const label = document.createElement('label');
            label.appendChild(document.createTextNode(names[idx]));
            label.htmlFor = tabid;
            this.ele.append(input);
            this.ele.append(label);
        }
        for (let idx = 0; idx < names.length; idx++) {
            const sectionid = `content${idx + 1}`;
            const content = document.createElement('section');
            content.id = sectionid;
            content.append(document.createTextNode(sectionid));
            this.ele.append(content);
            this.tabBodies.push(content);
        }
    }

    setTabConent(idx, newEle) {
        this.clearTab(idx);
        this.tabAppend(idx, newEle);
    }

    tabAppend(idx, ele) {
        this.tabBodies[idx].append(ele);
    }

    clearTab(idx) {
        this.tabBodies[idx].innerHTML = '';
    }
}
