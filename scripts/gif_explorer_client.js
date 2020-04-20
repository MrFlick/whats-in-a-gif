/* eslint-disable strict, no-mixed-operators, no-console */

'use strict';

class GifExplorer {
    // sends messages to worker process to decode image
    constructor() {
        this.messageID = 0;
        this.resolvers = {};
        this.rejecters = {};
        this.worker = new Worker('scripts/gif_explorer_worker.js');
        this.worker.onmessage = function ({ data: message }) {
            const { _id: msgID, resp: msgData, error: msgError } = message;
            if (msgError) {
                const rejecter = this.rejecters[msgID];
                if (rejecter) {
                    rejecter(msgError);
                }
            } else {
                const resolver = this.resolvers[msgID];
                if (resolver) {
                    resolver(msgData);
                }
            }
            delete this.rejecters[msgID];
            delete this.resolvers[msgID];
        }.bind(this);
    }

    sendMessage(cmd, data) {
        const msgID = this.messageID++;
        const msg = { _id: msgID, cmd, data };
        return new Promise((resolve, reject) => {
            this.resolvers[msgID] = resolve;
            this.rejecters[msgID] = reject;
            this.worker.postMessage(msg);
        });
    }

    setFile(file) {
        return this.sendMessage('setfile', { file });
    }

    getToc() {
        return this.sendMessage('toc');
    }

    getParse(chunk) {
        return this.sendMessage('parse', chunk);
    }

    getBytes(offset, length) {
        return this.sendMessage('bytes', { offset, length });
    }

    hello() {
        return this.sendMessage('hello');
    }
}

class GifView {
    constructor(ele, template, data) {
        this.ele = ele;
        this.template = template;
        this.data = data || [];
        this.sectionNames = {
            HDR: 'Header',
            LSD: 'Logical Screen Descriptor',
            GCT: 'Global Color Table',
            GCX: 'Graphics Control Extension',
            DSC: 'Image Descriptor',
            CT: 'Local Color Table',
            IMG: 'Image Data',
            PEX: 'Plain Text Extension',
            CX: 'Comment Extension',
            AX: 'Application Extension',
            END: 'Terminator',
        };
        this.tt = new TemplateRenderer();
        this.initTemplates();
    }

    initTemplates() {
        const source = document.getElementById('gif_view_template').content;
        for (const tmpl of source.children) {
            this.tt.addTemplate(tmpl.classList.item(0), tmpl);
        }
        const others = ['code_table_template', 'code_view_template',
            'byte_view_template', 'code_unit_template',
            'color_table_template', 'image_frame_template',
            'expander'];
        for (const tmpl of others) {
            const ele = document.getElementById(tmpl);
            if (ele) {
                this.tt.addTemplate(tmpl, ele.content);
            } else {
                console.warn(`Could not load template "${tmpl}"`);
            }
        }
    }

    setData(data) {
        this.data = data;
    }

    render(ge) {
        this.clear();
        this.data.forEach((block, idx) => { this.renderBlock(block, idx); });
        // activate components that might need state or behaviors
        this.ele.querySelectorAll('.color_table_view').forEach((ele) => {
            const block = this.data[ele.dataset.block];
            const ctv = new ColorTableViewer(ele, this.tt, block);
            ctv.init();
        }, this);
        this.ele.querySelectorAll('.image_frame_view').forEach((ele) => {
            const bidx = ele.dataset.block;
            const fv = new FrameViewer(ele, this.tt, this.data, bidx);
            fv.init();
        }, this);
        this.ele.querySelectorAll('.byte_view').forEach((ele) => {
            const block = this.data[ele.dataset.block];
            const bv = new ByteBrowser(ele, this.tt,
                ge, block.offset, block.length);
            const expand = new DelayedExpander(ele, this.tt, 'Show Bytes', bv);
            expand.init();
        });
        this.ele.querySelectorAll('.code_unit_view').forEach((ele) => {
            const block = this.data[ele.dataset.block];
            const ub = new UnitBrowser(ele, this.tt, block);
            const expand = new DelayedExpander(ele, this.tt, 'Show Code Units (Stream + Table)', ub);
            expand.init();
        });
    }

    renderBlock(block, idx) {
        let { type } = block;
        const info = { _bidx: idx };
        const headerInfo = {
            offset: block.offset, length: block.length,
            description: this.sectionNames[block.type], _bidx: info._bidx,
        };
        const header = this.tt.newFromName('block_header', headerInfo, info);
        if (type === 'GCT') type = 'CT';
        const body = this.tt.newFromName(type, block, info);
        body.insertBefore(header, body.childNodes[0]);
        this.ele.appendChild(body);
    }

    clear() {
        const empty = this.ele.cloneNode(false);
        this.ele.parentNode.replaceChild(empty, this.ele);
        this.ele = empty;
    }
}

class FrameViewer {
    constructor(ele, renderer, data, blockIndex) {
        this.ele = ele;
        this.renderer = renderer;
        this.data = data;
        this.blockIndex = blockIndex;
        this.canvas = null;
    }

    init() {
        const ele = this.renderer.newFromName('image_frame_template', {});
        this.ele.appendChild(ele);
        this.canvas = this.ele.querySelector('canvas');

        this.render();
    }

    render() {
        this.imageIndexRender(this.blockIndex);
    }

    findBlockType(type, start = 0, step = 1) {
        let idx = parseInt(start, 10);
        while (idx >= 0 && idx < this.data.length && this.data[idx].type !== type) {
            idx += step;
        }
        if (idx >= 0 && idx < this.data.length) {
            return idx;
        }
        return null;
    }

    findImageParts(bidx) {
        const part = this.data[bidx];
        let descIdx; let colorIdx; let dataIdx;
        if (part.type === 'DSC') {
            descIdx = bidx;
            if (part.hasColorTable) {
                colorIdx = this.findBlockType('CT', bidx);
            } else {
                colorIdx = this.findBlockType('GCT', 0);
            }
            dataIdx = this.findBlockType('IMG', bidx);
        } else if (part.type === 'IMG') {
            descIdx = this.findBlockType('DSC', bidx, -1);
            return this.findImageParts(descIdx);
        } else {
            throw new Error(`Expecting DSC block, not "${part.type}"`);
        }
        return { desc: descIdx, color: colorIdx, data: dataIdx };
    }

    imageIndexRender(bidx) {
        // Use index stream to draw frame
        const idx = this.findImageParts((bidx === undefined) ? this.findBlockType('DSC') : bidx);

        const imgDesc = this.data[idx.desc];
        const { canvas } = this;
        canvas.width = imgDesc.width;
        canvas.height = imgDesc.height;
        const ctx = canvas.getContext('2d');
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imgData.data;
        const pallete = this.data[idx.color].colors;
        const cidx = this.data[idx.data].indexStream;
        for (let i = 0, poff = 0; i < cidx.length; i += 1, poff += 4) {
            /* eslint-disable prefer-destructuring */
            pixels[poff + 0] = pallete[cidx[i]][0];
            pixels[poff + 1] = pallete[cidx[i]][1];
            pixels[poff + 2] = pallete[cidx[i]][2];
            pixels[poff + 3] = 255;
            /* eslint-enable prefer-destructuring */
        }
        ctx.putImageData(imgData, 0, 0);
    }

    imageCodeRender(bidx) {
        // use code stream to draw frame
        const idx = this.findImageParts((bidx === undefined) ? this.findBlockType('DSC') : bidx);

        const imgDesc = this.data[idx.desc];

        const { canvas } = this;
        canvas.width = imgDesc.width;
        canvas.height = imgDesc.height;
        const ctx = canvas.getContext('2d');
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { data: pixels } = imgData;
        let poff = 0;
        const pallete = this.data[idx.color].colors;
        for (const unit of this.data[idx.data].codeUnits) {
            const { table } = unit;
            for (const code of unit.stream) {
                const seq = unit.table[code];
                for (const index of seq) {
                    const color = pallete[table[index]];
                    /* eslint-disable prefer-destructuring */
                    pixels[poff + 0] = color[0];
                    pixels[poff + 1] = color[1];
                    pixels[poff + 2] = color[2];
                    pixels[poff + 3] = 255;
                    /* eslint-enable prefer-destructuring */
                    poff += 4;
                }
            }
        }
        ctx.putImageData(imgData, 0, 0);
    }
}

class ColorTableViewer {
    constructor(ele, renderer, data) {
        this.ele = ele;
        this.renderer = renderer;
        this.data = data;
        this.canvas = null;
        this.nRows = 1;
        this.nCols = 1;
        this.boxSize = 25;
        this.boxPadding = 2;
    }

    init() {
        const renderer = this.renderer.rendererFromName('color_table_template').clone();
        renderer.update({});
        this.ele.textContent = '';
        this.ele.appendChild(renderer.model);

        this.toolTipPartial = renderer.getPartial('tooltip');

        const { colorCount } = this.data;
        this.boxPadding = 2;
        if (colorCount < 16) {
            this.nRows = 1;
            this.nCols = colorCount / this.nRows;
        } else if (colorCount < 64) {
            this.nCols = 8;
            this.nRows = colorCount / this.nCols;
        } else {
            this.nCols = 16;
            this.nRows = colorCount / this.nCols;
            this.boxSize = 20;
        }
        const width = this.nCols * (this.boxSize + this.boxPadding) + this.boxPadding;
        const height = this.nRows * (this.boxSize + this.boxPadding) + this.boxPadding;

        this.canvas = this.ele.querySelector('canvas');
        this.canvas.width = width;
        this.canvas.height = height;

        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseout', this.onMouseOut.bind(this));

        this.render();
    }

    render() {
        const ctx = this.canvas.getContext('2d');
        const { colors: pallete } = this.data;
        const size = this.boxSize;
        const padding = this.boxPadding;
        const pad = (i) => padding + i * (size + padding);
        let pidx = 0;
        for (let row = 0; row < this.nRows; row++) {
            for (let col = 0; col < this.nCols; col++) {
                const [r, g, b] = pallete[pidx];
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                ctx.fillRect(pad(col), pad(row), size, size);
                pidx += 1;
            }
        }
    }

    onMouseMove(evt) {
        const rect = this.canvas.getBoundingClientRect();
        let x = Math.floor((evt.clientX - rect.left) / (rect.right - rect.left) * this.canvas.width);
        let y = Math.floor((evt.clientY - rect.top) / (rect.bottom - rect.top) * this.canvas.height);
        if (x < 0) x = 0; if (x > this.canvas.width) x = this.canvas.width;
        if (y < 0) y = 0; if (y > this.canvas.height) y = this.canvas.height;

        const clamp = (val, min, max) => Math.max(Math.min(val, max), min);
        const row = clamp(Math.floor(y / (this.boxSize + this.boxPadding)), 0, this.nRows - 1);
        const col = clamp(Math.floor(x / (this.boxSize + this.boxPadding)), 0, this.nCols - 1);
        const idx = row * this.nCols + col;
        const color = this.data.colors[idx];
        this.onColorEnter(evt, idx, color);
    }

    onMouseOut() {
        this.onColorLeave();
    }

    onColorEnter(evt, index, color) {
        const [r, g, b] = color;
        const hexColor = `#${
            [r, g, b].map((cb) => cb.toString(16).toUpperCase().padStart(2, '0'))
                .join('')}`;
        const rgbColor = `rgb(${r}, ${g}, ${b})`;
        const colorData = {
            index,
            hexColor,
            rgbColor,
        };

        this.toolTipPartial.ele.style.left = `${evt.pageX + 5}px`;
        this.toolTipPartial.ele.style.top = `${evt.pageY + 5}px`;
        this.toolTipPartial.ele.style.display = 'block';
        this.toolTipPartial.update(colorData);
    }

    onColorLeave() {
        this.toolTipPartial.ele.style.display = 'none';
    }
}

class ByteBrowser {
    constructor(ele, renderer, ge, offset, length) {
        this.ele = ele;
        this.renderer = renderer;
        this.ge = ge; // gif explorer
        this.byteOffset = offset;
        this.byteLength = length;
        this.relativeOffset = 0;
        this.nCols = 25;
        this.nRows = Math.floor((Math.min(length, 255) - 1) / this.nCols) + 1;
        this.pageSize = this.nRows * this.nCols;
        this.cells = [];
        this.rowLabels = [];
        this.buttons = { next: [], prev: [], jump: [] };
    }

    init() {
        const emptydata = {
            rows: Array.from({ length: this.nRows }).map(() => ({
                offset: 0,
                bytes: Array.from({ length: this.nCols }).map(() => 0),
            })),
        };
        const renderer = this.renderer.rendererFromName('byte_view_template').clone();
        renderer.update(emptydata);
        this.ele.textContent = '';
        this.ele.appendChild(renderer.model);

        this.toolTipPartial = renderer.getPartial('tooltip');
        this.navPartial = renderer.getPartial('nav');

        const table = this.ele.querySelector('table');
        this.rowLabels = table.querySelectorAll('td.offset');
        this.cells = table.querySelectorAll('td.byte');

        table.addEventListener('mouseover', this.getOnMouseOver(table));
        table.addEventListener('mouseout', this.getOnMouseOut(table));

        this.buttons.prev = this.ele.querySelectorAll('button.prev');
        this.buttons.prev.forEach((ele) => {
            ele.addEventListener('click', (evt) => {
                evt.preventDefault();
                this.prevPage();
                this.render();
            });
            ele.dataset.origDisplay = getComputedStyle(ele).display;
        });
        this.buttons.next = this.ele.querySelectorAll('button.next');
        this.buttons.next.forEach((ele) => {
            ele.addEventListener('click', (evt) => {
                evt.preventDefault();
                this.nextPage();
                this.render();
            });
            ele.dataset.origDisplay = getComputedStyle(ele).display;
        });
        this.ele.querySelectorAll('input.goto').forEach((ele) => {
            this.jumpTo = ele;
            const update = debounce((page) => {
                this.setPageOffset(page);
                this.render();
            }, 600);
            ele.addEventListener('keyup', () => {
                update(ele.value);
            });
        }, this);
        this.buttons.jump = this.ele.querySelectorAll('.jump');
        this.buttons.jump.forEach((ele) => {
            ele.dataset.origDisplay = getComputedStyle(ele).display;
        });

        this.render();
    }

    render() {
        const boff = this.relativeOffset + this.byteOffset;
        const blength = Math.min(this.byteLength - this.relativeOffset, this.pageSize);
        this.ge.getBytes(boff, blength)
            .then(({ bytes }) => {
                for (let i = 0; i < this.cells.length; i++) {
                    const val = (i < bytes.length) ? this.formatByte(bytes[i]) : '-';
                    this.cells[i].textContent = val;
                }
                for (let i = 0; i < this.rowLabels.length; i++) {
                    const val = (this.nRows > 1) ? this.relativeOffset + i * this.nCols : '';
                    this.rowLabels[i].textContent = val;
                }
            });
        this.navPartial.update(this.getPageInfo());
        const showNav = this.byteLength > this.pageSize;
        [this.buttons.prev, this.buttons.next, this.buttons.jump].forEach((list) => {
            list.forEach((ele) => { ele.style.display = (showNav) ? ele.dataset.origDisplay : 'none'; });
        });
        if (showNav) {
            this.buttons.prev.forEach((ele) => { ele.disabled = !(this.relativeOffset > 0); });
            this.buttons.next.forEach((ele) => {
                ele.disabled = !(this.relativeOffset < this.byteLength - this.pageSize);
            });
        }
    }

    getOnMouseOver(table) {
        // mouseover/out inspired by https://javascript.info/mousemove-mouseover-mouseout-mouseenter-mouseleave
        return (event) => {
            if (this.currentCell) return;
            const target = event.target.closest('td');
            if (!target) return;
            if (!target.classList.contains('byte')) return;
            if (target.textContent === '-') return;
            if (!table.contains(target)) return;

            this.currentCell = target;
            this.onByteEnter(this.currentCell, event);
        };
    }

    getOnMouseOut() {
        return (event) => {
            if (!this.currentCell) return;
            let { relatedTarget } = event;

            while (relatedTarget) {
                if (relatedTarget === this.currentCell) return;
                relatedTarget = relatedTarget.parentNode;
            }
            this.onByteLeave(this.currentCell);
            this.currentCell = null;
        };
    }

    onByteEnter(ele, evt) {
        ele.classList.add('hover');
        const hex = ele.textContent;
        const dec = parseInt(hex, 16);
        const colIndex = parseInt(ele.dataset.byteCol, 10);
        const rowIndex = parseInt(ele.parentNode.dataset.byteRow, 10);
        const relOffset = this.relativeOffset + rowIndex * this.nCols + colIndex;
        const fileOffset = this.byteOffset + relOffset;

        this.toolTipPartial.ele.style.left = `${evt.pageX + 5}px`;
        this.toolTipPartial.ele.style.top = `${evt.pageY + 5}px`;
        this.toolTipPartial.ele.style.display = 'block';
        this.toolTipPartial.update({
            hex, dec, relOffset, fileOffset,
        });
    }

    onByteLeave(ele) {
        this.toolTipPartial.ele.style.display = 'none';
        ele.classList.remove('hover');
    }

    getPageInfo() {
        return {
            byteLength: this.byteLength,
            page: Math.floor((this.relativeOffset + 1) / this.pageSize) + 1,
            pageCount: Math.floor((this.byteLength - 1) / this.pageSize) + 1,
        };
    }

    nextPage() {
        if (this.relativeOffset < this.byteLength - this.pageSize) {
            this.relativeOffset += this.pageSize;
        }
    }

    prevPage() {
        if (this.relativeOffset >= this.pageSize) {
            this.relativeOffset -= this.pageSize;
        }
    }

    setPageOffset(offset) {
        const newOffset = parseInt(offset.toLowerCase(), 10);
        const page = Math.max(1,
            Math.min(newOffset, Math.floor(this.byteLength / this.pageSize) + 1));
        this.relativeOffset = (page - 1) * this.pageSize;
    }

    formatByte(val) {
        return val.toString(16).toUpperCase().padStart(2, '0');
    }
}

class UnitBrowser {
    constructor(ele, renderer, data) {
        this.ele = ele;
        this.renderer = renderer;
        this.updateder = null;
        this.data = data;
        this.unitOffset = 0;
        this.buttons = { prev: [], next: [], jump: [] };
        this.children = [];
    }

    init() {
        const renderer = this.renderer.rendererFromName('code_unit_template').clone();
        this.updater = renderer.update;
        this.updater(this.getUnitData());
        this.ele.textContent = '';
        this.ele.appendChild(renderer.model);

        this.buttons.prev = this.ele.querySelectorAll('button.prev');
        this.buttons.prev.forEach((ele) => {
            ele.addEventListener('click', (evt) => {
                evt.preventDefault();
                this.prevPage();
                this.render();
            });
            ele.dataset.origDisplay = getComputedStyle(ele).display;
        });
        this.buttons.next = this.ele.querySelectorAll('button.next');
        this.buttons.next.forEach((ele) => {
            ele.addEventListener('click', (evt) => {
                evt.preventDefault();
                this.nextPage();
                this.render();
            });
            ele.dataset.origDisplay = getComputedStyle(ele).display;
        });
        this.ele.querySelectorAll('input.goto').forEach((ele) => {
            this.jumpTo = ele;
            const update = debounce((unit) => {
                this.setUnitOffset(unit);
                this.render();
            }, 600);
            ele.addEventListener('keyup', () => {
                update(ele.value);
            });
        }, this);
        this.buttons.jump = this.ele.querySelectorAll('.jump');
        this.buttons.jump.forEach((ele) => {
            ele.dataset.origDisplay = getComputedStyle(ele).display;
        });

        this.render();
        this.initChildren();
    }

    initChildren() {
        this.ele.querySelectorAll('.code_table_view').forEach((ele) => {
            const block = this.data;
            const tb = new CodeTableBrowser(ele, this.renderer, block);
            tb.init();
            this.children.push(tb);
        });
        this.ele.querySelectorAll('.code_stream_view').forEach((ele) => {
            const block = this.data;
            const cb = new CodeBrowser(ele, this.renderer, block);
            cb.init();
            this.children.push(cb);
        });
    }

    render() {
        this.updater(this.getUnitData());

        [this.buttons.prev, this.buttons.next, this.buttons.jump].forEach((list) => {
            list.forEach((ele) => {
                ele.style.display = (this.data.codeUnitCount > 1) ? ele.dataset.origDisplay : 'none';
            });
        });
        if (this.data.codeUnitCount > 1) {
            this.buttons.prev.forEach((ele) => {
                ele.disabled = !(this.unitOffset > 0);
            });
            this.buttons.next.forEach((ele) => {
                ele.disabled = !(this.unitOffset < this.data.codeUnitCount);
            });
        }
    }

    getUnitData() {
        const { byteOffset, bitOffset } = this.data.codeUnits[this.unitOffset].start;
        return {
            codeUnit: this.unitOffset + 1,
            codeUnitCount: this.data.codeUnitCount,
            byteOffset, bitOffset,
        };
    }

    nextPage() {
        if (this.unitOffset < this.data.codeUnitCount - 1) {
            this.unitOffset++;
            this.propagateUnitOffset();
        }
    }

    prevPage() {
        if (this.unitOffset > 0) {
            this.unitOffset--;
            this.propagateUnitOffset();
        }
    }

    setUnitOffset(offset) {
        const newOffset = parseInt(offset.toLowerCase(), 10);
        const units = this.data.codeUnitCount;
        const page = Math.max(1, Math.min(newOffset, units));
        this.unitOffset = (page - 1);
        this.propagateUnitOffset();
    }

    propagateUnitOffset() {
        this.children.forEach((ele) => {
            if (ele.setCodeUnit) {
                ele.setCodeUnit(this.unitOffset);
                ele.render();
            }
        });
    }
}

class DelayedExpander {
    constructor(ele, renderer, message, object) {
        this.ele = ele;
        this.renderer = renderer;
        this.message = message;
        this.object = object;
        this.me = null;
        this.parts = { header: null, content: null };
    }

    init() {
        const renderer = this.renderer.rendererFromName('expander').clone();
        this.updater = renderer.update;
        this.updater({ message: this.message });
        this.me = renderer.model;

        this.parts.header = this.me.querySelector('.header');
        this.parts.content = this.me.querySelector('.content');

        this.me.querySelectorAll('a.expand').forEach((ele) => {
            ele.addEventListener('click', (evt) => {
                evt.preventDefault();
                this.expand();
            });
        });

        this.ele.parentNode.insertBefore(this.me, this.ele);
        this.parts.content.appendChild(this.ele);
    }

    expand() {
        if (this.object && this.object.init) {
            this.object.init();
        }
        this.parts.header.classList.add('collapsed');
        this.parts.content.classList.remove('collapsed');
    }
}

class CodeBrowser {
    constructor(ele, renderer, data) {
        this.ele = ele;
        this.renderer = renderer;
        this.data = data;
        this.unitIndex = 0;
        this.codeOffset = 0;
        this.nCols = 10;
        const stream = this.getCodeStream();
        this.nRows = Math.floor((Math.min(stream.length, 100) - 1) / this.nCols) + 1;
        this.pageSize = this.nCols * this.nRows;
        this.cells = [];
        this.rowLabels = [];
        this.buttons = { next: [], prev: [], jump: [] };
    }

    init() {
        const emptydata = {
            rows: Array.from({ length: this.nRows }).map(() => ({
                offset: 0,
                codes: Array.from({ length: this.nCols }).map(() => 0),
            })),
        };
        const renderer = this.renderer.rendererFromName('code_view_template').clone();
        this.updateder = renderer.update;
        renderer.update(emptydata);
        this.ele.textContent = '';
        this.ele.appendChild(renderer.model);

        const table = this.ele.querySelector('table');
        this.cells = table.querySelectorAll('td.code');
        this.rowLabels = table.querySelectorAll('td.offset');

        this.toolTipPartial = renderer.getPartial('tooltip');

        table.addEventListener('mouseover', this.getOnMouseOver(table));
        table.addEventListener('mouseout', this.getOnMouseOut(table));

        this.buttons.prev = this.ele.querySelectorAll('button.prev');
        this.buttons.prev.forEach((ele) => {
            ele.addEventListener('click', (evt) => {
                evt.preventDefault();
                this.prevPage();
                this.render();
            });
            ele.dataset.origDisplay = getComputedStyle(ele).display;
        });
        this.buttons.next = this.ele.querySelectorAll('button.next');
        this.buttons.next.forEach((ele) => {
            ele.addEventListener('click', (evt) => {
                evt.preventDefault();
                this.nextPage();
                this.render();
            });
            ele.dataset.origDisplay = getComputedStyle(ele).display;
        });
        this.ele.querySelectorAll('input.goto').forEach((ele) => {
            this.jumpTo = ele;
            const update = debounce((page) => {
                this.setPageOffset(page);
                this.render();
            }, 600);
            ele.addEventListener('keyup', () => {
                update(ele.value);
            });
        }, this);

        this.buttons.jump = this.ele.querySelectorAll('.jump');
        this.buttons.jump.forEach((ele) => {
            ele.dataset.origDisplay = getComputedStyle(ele).display;
        });

        this.render();
    }

    render() {
        this.updateder(this.getPageData());

        const codes = this.getCodeStream();
        [this.buttons.prev, this.buttons.next, this.buttons.jump].forEach((list) => {
            list.forEach((ele) => {
                ele.style.display = (codes.length > this.pageSize) ? ele.dataset.origDisplay : 'none';
            });
        });
        if (codes.length > this.pageSize) {
            this.buttons.prev.forEach((ele) => {
                ele.disabled = !(this.codeOffset > 0);
            });
            this.buttons.next.forEach((ele) => {
                ele.disabled = !(this.codeOffset < codes.length - this.pageSize);
            });
        }
    }

    getOnMouseOver(table) {
        // mouseover/out inspired by https://javascript.info/mousemove-mouseover-mouseout-mouseenter-mouseleave
        return (event) => {
            if (this.currentCell) return;
            const target = event.target.closest('td');
            if (!target) return;
            if (!target.classList.contains('code')) return;
            if (target.textContent === '-') return;
            if (!table.contains(target)) return;

            this.currentCell = target;
            this.onCodeEnter(this.currentCell, event);
        };
    }

    getOnMouseOut() {
        return (event) => {
            if (!this.currentCell) return;
            let { relatedTarget } = event;

            while (relatedTarget) {
                if (relatedTarget === this.currentCell) return;
                relatedTarget = relatedTarget.parentNode;
            }
            this.onCodeLeave(this.currentCell);
            this.currentCell = null;
        };
    }

    onCodeEnter(ele, evt) {
        ele.classList.add('hover');
        const code = ele.textContent;
        const colIndex = parseInt(ele.dataset.codeCol, 10);
        const rowIndex = parseInt(ele.parentNode.dataset.codeRow, 10);
        const codeOffset = this.codeOffset + rowIndex * this.nCols + colIndex;

        this.toolTipPartial.ele.style.left = `${evt.pageX + 5}px`;
        this.toolTipPartial.ele.style.top = `${evt.pageY + 5}px`;
        this.toolTipPartial.ele.style.display = 'block';
        this.toolTipPartial.update({ code, codeOffset });
    }

    onCodeLeave(ele) {
        this.toolTipPartial.ele.style.display = 'none';
        ele.classList.remove('hover');
    }

    getCodeUnit() {
        return this.data.codeUnits[this.unitIndex];
    }

    getCodeStream() {
        return this.getCodeUnit().stream;
    }

    getPageData() {
        const codes = this.getCodeStream();
        let ci = this.codeOffset;
        const page = {
            codeLength: codes.length,
            page: Math.floor(this.codeOffset / this.pageSize) + 1,
            pageCount: Math.floor((codes.length - 1) / this.pageSize) + 1,
            rows: Array.from({ length: this.nRows }).map(() => ({
                offset: ci,
                codes: Array.from({ length: this.nCols }).map(() => {
                    const val = (ci < codes.length) ? `#${codes[ci]}` : '-';
                    ci++;
                    return val;
                }),
            })),
        };
        return page;
    }

    nextPage() {
        const codeStream = this.getCodeStream();
        this.codeOffset = Math.min(this.codeOffset + this.pageSize, codeStream.length);
    }

    prevPage() {
        this.codeOffset = Math.max(0, this.codeOffset - this.pageSize);
    }

    setPageOffset(offset) {
        const newOffset = parseInt(offset.toLowerCase(), 10);
        const codes = this.getCodeStream();
        const page = Math.max(1, Math.min(newOffset, Math.floor(codes.length / this.pageSize) + 1));
        this.codeOffset = (page - 1) * this.pageSize;
    }

    setCodeUnit(offset) {
        if (offset > 0 && offset < this.data.codeUnits.length) {
            this.unitIndex = offset;
            this.setPageOffset(((this.codeOffset / this.pageSize) + 1).toString());
        }
    }
}


class CodeTableBrowser {
    constructor(ele, renderer, data) {
        this.ele = ele;
        this.renderer = renderer;
        this.data = data;
        this.unitIndex = 0;
        this.codeOffset = data.eoiCode + 1;
        this.pageSize = 10;
        this.codeCells = [];
        this.colorCells = [];
        this.jumpTo = null;
        this.buttons = { next: [], prev: [] };
    }

    init() {
        const page = {
            codeOffset: this.codeOffset,
            rows: this.getPageData(),
            tableLength: this.getCodeTable().length,
        };
        const renderer = this.renderer.rendererFromName('code_table_template').clone();
        renderer.update(page);
        this.ele.textContent = '';
        this.ele.appendChild(renderer.model);

        this.codeCells = this.ele.querySelectorAll('td.code');
        this.colorCells = this.ele.querySelectorAll('td.colors');

        this.buttons.prev = this.ele.querySelectorAll('button.prev');
        this.buttons.prev.forEach((ele) => {
            ele.addEventListener('click', () => {
                this.prevPage();
                this.render();
            });
        }, this);
        this.buttons.next = this.ele.querySelectorAll('button.next');
        this.buttons.next.forEach((ele) => {
            ele.addEventListener('click', () => {
                this.nextPage();
                this.render();
            });
        }, this);
        this.ele.querySelectorAll('input.goto').forEach((ele) => {
            this.jumpTo = ele;
            const update = debounce((code) => {
                this.setCodeOffset(code);
                this.render();
            }, 600);
            ele.addEventListener('keyup', () => {
                update(ele.value);
            });
        }, this);
    }

    render() {
        const rows = this.getPageData();
        const codeTable = this.getCodeTable();
        for (let i = 0; i < this.pageSize; i++) {
            const code = (rows[i]) ? rows[i].code : ' ';
            const colors = (rows[i]) ? rows[i].colors : ' ';
            this.codeCells[i].textContent = code;
            this.colorCells[i].textContent = colors;
        }
        if (this.jumpTo) {
            this.jumpTo.value = this.codeOffset;
        }

        this.buttons.prev.forEach((ele) => {
            ele.disabled = (this.codeOffset <= 0);
        });
        this.buttons.next.forEach((ele) => {
            ele.disabled = (this.codeOffset + this.pageSize >= codeTable.length);
        });
    }

    getCodeUnit() {
        return this.data.codeUnits[this.unitIndex];
    }

    getCodeTable() {
        return this.getCodeUnit().table;
    }

    getPageData() {
        const iStart = this.codeOffset;
        const rows = [];
        const codeTable = this.getCodeTable();
        for (let i = iStart; i < iStart + this.pageSize; i++) {
            if (i === this.data.eoiCode) {
                rows.push({ code: `#${i}`, colors: 'EOI' });
            } else if (i === this.data.clearCode) {
                rows.push({ code: `#${i}`, colors: 'CLEAR' });
            } else if (i < codeTable.length) {
                rows.push({ code: `#${i}`, colors: codeTable[i].join(', ') });
            } else {
                rows.push({ code: '', colors: '' });
            }
        }
        return rows;
    }

    nextPage() {
        const codeTable = this.getCodeTable();
        this.codeOffset = Math.min(this.codeOffset + this.pageSize,
            codeTable.length - this.pageSize);
    }

    prevPage() {
        this.codeOffset = Math.max(0, this.codeOffset - this.pageSize);
    }

    setCodeOffset(offset) {
        const rawOffset = offset.toLowerCase().replace('#', '');
        let newOffset = parseInt(rawOffset, 10);
        if (Number.isNaN(newOffset)) {
            if (offset === 'clear') {
                newOffset = this.data.clearCode;
            } else if (offset === 'eoi') {
                newOffset = this.data.eoiCode;
            }
            return;
        }
        const codeTable = this.getCodeTable();
        this.codeOffset = Math.min(Math.max(0, newOffset), codeTable.length - 1);
    }

    setCodeUnit(offset) {
        if (offset > 0 && offset < this.data.codeUnits.length) {
            this.unitIndex = offset;
            this.setCodeOffset(this.codeOffset.toString());
        }
    }
}

class TemplateRenderer {
    // I didn't want to rely on any javascript dependcies
    // so I ended up makeing my own template rendered like
    // moustache. This was not a smart choice, but it was
    // a learning opportinuty.
    constructor() {
        this.templates = {};
        this.transforms = {
            pnum: (x) => x.toLocaleString(),
        };
    }

    addTemplate(name, frag) {
        this.templates[name] = this.compileElement(frag);
    }

    tokenSplit(text, token) {
        // split string by a token seperator
        // v-t-v-t-v
        // fill missing tokens with "" or
        // literals.length = tokens.length + 1
        const literals = [];
        const tokens = [];
        const matches = text.split(token);
        let last = 'none';
        for (const match of matches) {
            if (match.match(token)) {
                if (last !== 'literal') literals.push('');
                tokens.push(match.substring(2, match.length - 2));
                last = 'blank';
            } else {
                literals.push(match);
                last = 'literal';
            }
        }
        if (last === 'blank') literals.push('');
        if (tokens.length) {
            return ({ literals, tokens });
        }
        return null;
    }

    getTemplateValue(string, data, state) {
        // find "variable(>function?)(|template?)"
        const regexp = /^([^}]+?)(?:([>])([^}@|]+))?(?:([@|])([^}@|]+))?$/;
        const [, field, , trans, op, param] = string.match(regexp);
        let val = '';
        if (field === '.') {
            val = data;
        } else if (data && data.hasOwnProperty(field)) {
            val = data[field];
        } else if (state && state.hasOwnProperty(field)) {
            val = state[field];
        }
        if (trans) {
            if (!this.transforms[trans]) {
                console.warn(`transform "${trans}" not found`);
            } else {
                val = this.transforms[trans](val);
            }
        }
        if (op === '|') {
            val = this.newFromName(param, val);
            if (val.childNodes && val.childNodes.length === 1 && val.childNodes[0].nodeType === 3) {
                val = val.childNodes[0].textContent;
            }
        }
        if (val === undefined) { val = ''; }
        return val;
    }

    getTextNodeRehydrator(ele, literals, tokens) {
        let oldNodes = [ele];
        return (data, state) => {
            const expanded = tokens.map((b) => this.getTemplateValue(b, data, state));
            let text = literals[0];
            const isSimple = expanded.map((x) => ['string', 'number', 'boolean'].indexOf(typeof x) >= 0);
            const allSimple = isSimple.reduce((a, b) => a + b, 0) === expanded.length;
            if (allSimple) {
                // template just becomes new text
                [text] = literals;
                expanded.forEach((val, i) => {
                    text += val + literals[i + 1];
                });
                ele.textContent = text;
            } else {
                // template creates new nodes
                [text] = literals;
                const frag = document.createDocumentFragment();
                for (let i = 0; i < expanded.length; i++) {
                    if (isSimple[i]) {
                        text += expanded[i] + literals[i + 1];
                    } else {
                        if (text.length) {
                            frag.appendChild(document.createTextNode(text));
                            text = '';
                        }
                        frag.appendChild(expanded[i]);
                    }
                }
                if (text.length) {
                    frag.appendChild(document.createTextNode(text));
                }
                const newNodes = [];
                Array.from(frag.childNodes).forEach((x) => newNodes.push(x));
                const pivot = oldNodes[0];
                for (let i = 1; i < oldNodes.length; i++) {
                    pivot.parentNode.removeChild(oldNodes[i]);
                }
                pivot.parentNode.replaceChild(frag, pivot);
                oldNodes = newNodes;
            }
        };
    }

    getAttrNodeRehydrator(ele, attr, literals, tokens) {
        return (data, state) => {
            let text = literals[0];
            tokens.forEach((b, i) => {
                text += this.getTemplateValue(b, data, state) + literals[i + 1];
            }, this);
            if (attr === 'value' && ele.nodeName === 'INPUT') {
                // forces form elements to update "current" value
                ele[attr] = text;
            }
            ele.setAttribute(attr, text);
        };
    }

    getIteratedNodeRehydrator(ele, token) {
        const maker = this.compileElement(ele).make;
        let oldNodes = [ele];
        return (data, state) => {
            const values = this.getTemplateValue(token, data, state);
            const frag = document.createDocumentFragment();
            const newNodes = [];
            values.forEach((v, i) => {
                const vstate = Object.assign({}, state, { _idx: i });
                const newNode = maker(v, vstate);
                newNodes.push(newNode);
                frag.appendChild(newNode);
            });
            const pivot = oldNodes[0];
            for (let i = 1; i < oldNodes.length; i++) {
                pivot.parentNode.removeChild(oldNodes[i]);
            }
            pivot.parentNode.replaceChild(frag, pivot);
            oldNodes = newNodes;
        };
    }

    newFromName(name, data, state) {
        return this.rendererFromName(name).make(data, state);
    }

    rendererFromName(name) {
        if (!(name in this.templates)) {
            throw new Error(`No template named "${name}" found`);
        }
        return this.templates[name];
    }

    scanElement(ele) {
        const transforms = [];
        let partials = {};
        // find {{...}} tokens
        const regexp = /(\{\{[^}]*?\}\})/g;

        // find all tokens in text and attribute nodes
        const discover = (x) => {
            if (x.nodeType === Node.TEXT_NODE) {
                const ts = this.tokenSplit(x.textContent, regexp);
                if (ts) {
                    transforms.push(this.getTextNodeRehydrator(x, ts.literals, ts.tokens));
                }
                return;
            }
            if (x.hasAttribute && x.hasAttribute('x-partial')) {
                const name = x.getAttribute('x-partial');
                x.removeAttribute('x-partial');
                const partial = this.compileElement(x, false);
                transforms.push(partial.update);
                // partials = {...partials, ...partial.partials} ;
                partials = Object.assign({}, partials, partial.partials);
                partials[name] = { update: partial.update, ele: x };
                return;
            }
            if (x.hasAttribute && x.hasAttribute('x-for-each')) {
                const attr = x.getAttribute('x-for-each');
                x.removeAttribute('x-for-each');
                transforms.push(this.getIteratedNodeRehydrator(x, attr));
                return;
            }
            if (x.hasAttributes && x.hasAttributes()) {
                for (const attr of x.attributes) {
                    const ts = this.tokenSplit(attr.value, regexp);
                    if (ts) {
                        transforms.push(
                            this.getAttrNodeRehydrator(x, attr.name, ts.literals, ts.tokens),
                        );
                    }
                }
            }
            // recurse if necessary
            if (x.childNodes.length) {
                for (const child of x.childNodes) {
                    discover(child);
                }
            }
        };
        discover(ele);
        return { transforms, partials };
    }

    compileElement(ele, makeClone = true) {
        const model = (makeClone) ? ele.cloneNode(true) : ele;
        let transforms = [];
        let partials = {};
        let initialized = false;

        const init = () => {
            const x = this.scanElement(model);
            transforms = x.transforms;
            partials = x.partials;
            initialized = true;
        };

        const updater = (data, state) => {
            if (!initialized) init();
            for (const hyr of transforms) {
                hyr(data, state);
            }
        };
        const maker = (data, state) => {
            if (!initialized) init();
            updater(data, state);
            return model.cloneNode(true);
        };
        const getPartial = (name) => {
            if (!initialized) init();
            return partials[name];
        };
        const cloner = () => this.compileElement(model, true);
        return {
            make: maker,
            update: updater,
            clone: cloner,
            getPartial,
            model,
        };
    }
}

class ModalPopup {
    constructor() {
        const tt = new TemplateRenderer();
        this.ele = null;
        tt.addTemplate('modal', document.getElementById('modal').content);
        this.renderer = tt.rendererFromName('modal').clone();
        this.initialized = false;
    }

    init() {
        this.renderer.update();
        this.ele = this.renderer.model.querySelector('.modal');
        this.ele.querySelectorAll('.close').forEach((ele) => {
            ele.addEventListener('click', (evt) => {
                evt.preventDefault();
                this.close();
            });
        });
        document.body.appendChild(this.renderer.model);
        this.initialized = true;
    }

    open(header, message, moreInfo) {
        if (!this.initialized) this.init();
        this.renderer.update({ header, message, moreInfo });
        this.ele.style.display = 'block';
    }

    openReadError(reason) {
        const header = 'GIF Read Error';
        const message = reason;
        const moreInfo = 'Are you sure this is a valid GIF file?';
        this.open(header, message, moreInfo);
    }

    openRenderError(reason) {
        const header = 'GIF Draw Error';
        const message = reason;
        const moreInfo = 'Are you using an up-to-date browser? If so, '
            + 'there is probably a bug in the code :(';
        this.open(header, message, moreInfo);
    }

    close() {
        this.ele.style.display = 'none';
    }
}

function initUI(gifExplorer) {
    const gv = new GifView(document.getElementById('gif_view'),
        document.getElementById('gif_view_template'));
    const popup = new ModalPopup();
    document.getElementById('files').addEventListener('change', (evt) => {
        const { files } = evt.target;
        if (files.length > 0) {
            gifExplorer.setFile(files[0])
                .then(drawToc);
        }
    }, false);
    function fetchAndDrawToc(url) {
        fetch(url)
            .then((resp) => resp.blob())
            .then((blob) => gifExplorer.setFile(blob))
            .then(drawToc);
    }
    function drawToc() {
        return Promise.resolve()
            .then(() => { gv.clear(); })
            .then(() => gifExplorer.getToc())
            .catch((err) => {
                popup.openReadError(err.toString());
                return Promise.reject();
            })
            .then((x) => {
                gv.setData(x);
                gv.render(gifExplorer);
            })
            .catch((err) => {
                if (err) {
                    popup.openRenderError(err.toString());
                    console.error(err);
                }
            });
    }
    document.querySelectorAll('a.choose-img').forEach((item) => {
        item.addEventListener('click', (evt) => {
            evt.preventDefault();
            fetchAndDrawToc(evt.currentTarget.querySelector('img').src);
        });
    });

    document.querySelectorAll('.autoload-img').forEach((item) => {
        fetchAndDrawToc(item.src);
    });
}

const debounce = (func, wait) => {
    let timeout = null;
    return (...args) => {
        const later = () => {
            timeout = null;
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

window.onload = () => {
    const gifExplorer = new GifExplorer();
    initUI(gifExplorer);
};
