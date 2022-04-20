/* eslint-disable strict, no-unused-vars */
/* global FileReaderSync BitReader DataReader */

'use strict';

// Requires DataReader and BitReader from data_helpers.js
// Also assumes we can access synchronous file reader

class GifReader {
    constructor() {
        this.file = null;
        this.dv = null;
    }

    // can be File or Blob
    setFile(file) {
        this.file = file;
        const reader = new FileReaderSync();
        const ab = reader.readAsArrayBuffer(this.file);
        this.dv = new DataReader(ab, true);
        return { size: ab.byteLength };
    }

    getBytes(offset, length) {
        this.checkFileSet();
        this.dv.setOffset(offset);
        return { bytes: this.dv.readUint8Array(length) };
    }

    getToc() {
        this.checkFileSet();
        this.dv.setOffset(0);
        const parts = [];
        const header = this.parseHeader();
        parts.push(header);
        const lcd = this.parseLogicalScreenDescriptor();
        parts.push(lcd);
        if (lcd.hasColorTable) {
            parts.push(this.parseColorTable(lcd.colorTableSize, 'GCT'));
        }
        while (this.dv.hasMore()) {
            const block = this.dv.peekByte();
            if (block === 0x21) {
                const type = this.dv.peekByte(1);
                if (type === 0xF9) {
                    const gce = this.parseGraphicsControlExtension();
                    parts.push(gce);
                } else if (type === 0x01) {
                    const pte = this.parsePlainTextExtension();
                    parts.push(pte);
                } else if (type === 0xFE) {
                    const ce = this.parseCommentExtension();
                    parts.push(ce);
                } else if (type === 0xFF) {
                    const appe = this.scanApplicationExtension();
                    parts.push(appe);
                } else {
                    return new Error(`Unknown extention type: ${type}`);
                }
            } else if (block === 0x2C) {
                const idesc = this.parseImageDescriptor();
                parts.push(idesc);
                if (idesc.hasColorTable) {
                    parts.push(this.scanColorTable(idesc.colorTableSize));
                }
                const iblocks = this.parseImageData();
                parts.push(iblocks);
            } else if (block === 0x3B) {
                const trailer = this.parseTrailer();
                parts.push(trailer);
                if (this.dv.hasMore()) {
                    parts.push(this.parseTrailingTrivia());
                }
            } else {
                throw this.getByteError('Unexpected block type', block);
            }
        }
        return parts;
    }

    parseHeader() {
        const offset = this.dv.getOffset();
        const signature = this.dv.readEscapedString(3);
        let isGif = false;
        let version = '';
        if (signature === 'GIF') {
            isGif = true;
            version = this.dv.readEscapedString(3);
        } else {
            throw new Error(`Expected magic string "GIF", found "${signature}"`);
        }
        const length = this.dv.getOffset() - offset;
        return {
            offset, length, type: 'HDR',
            isGif, version, signature,
        };
    }

    parseLogicalScreenDescriptor() {
        const offset = this.dv.getOffset();
        const width = this.dv.readUint16();
        const height = this.dv.readUint16();
        const packed = this.dv.readUint8();
        const hasColorTable = (packed & 0x80) > 0;
        const colorResolution = (packed & 0x70) >> 4;
        const colorSorted = (packed & 0x08) >> 3;
        const colorTableSize = (packed & 0x07);
        const backgroundIndex = this.dv.readUint8();
        const aspect = this.dv.readUint8();
        const length = this.dv.getOffset() - offset;
        return {
            offset, length, type: 'LSD',
            width, height, backgroundIndex, aspect,
            hasColorTable, colorResolution, colorSorted, colorTableSize,
        };
    }

    scanColorTable(tableSize, type) {
        const offset = this.dv.getOffset();
        const colorCount = 2 << tableSize;
        const length = colorCount * 3;
        this.dv.skip(length);
        return {
            offset, length, type: type || 'CT',
            colorCount, tableSize,
        };
    }

    parseColorTable(tableSize, type) {
        const stats = this.scanColorTable(tableSize, type);
        this.dv.setOffset(stats.offset);
        const colors = [];
        for (let i = 0; i < stats.colorCount; i++) {
            colors.push(this.readColor());
        }

        // return { ...stats, colors }
        return Object.assign({}, stats, { colors });
    }

    parseGraphicsControlExtension() {
        const offset = this.dv.getOffset();
        const extensionMarker = this.dv.readUint8();
        if (extensionMarker !== 0x21) {
            throw this.getByteError('Wrong extension byte', extensionMarker);
        }
        const extensionType = this.dv.readUint8();
        if (extensionType !== 0xF9) {
            throw this.getByteError('Wrong extension type', extensionType);
        }
        const dataSize = this.dv.readUint8();
        const packed = this.dv.readUint8();
        const reserved = (packed & 0xE0) >> 5;
        const disposal = (packed & 0x1C) >> 2;
        const userInput = (packed & 0x02) >> 1 > 0;
        const transparentFlag = (packed & 0x01) > 0;
        const delayTime = this.dv.readUint16();
        const transparentIndex = this.dv.readUint8();
        const terminator = this.dv.readUint8();
        if (terminator !== 0) {
            throw this.getByteError('Non-zero terminator', terminator);
        }
        const length = this.dv.getOffset() - offset;
        return {
            offset, length, type: 'GCX',
            reserved, disposal, userInput, transparentFlag,
            delayTime, transparentIndex,
        };
    }

    parseImageDescriptor() {
        const offset = this.dv.getOffset();
        const length = 10;
        const extensionMarker = this.dv.readUint8();
        if (extensionMarker !== 0x2C) {
            throw this.getByteError('Wrong descriptor byte', extensionMarker);
        }
        const left = this.dv.readUint16();
        const top = this.dv.readUint16();
        const width = this.dv.readUint16();
        const height = this.dv.readUint16();
        const packed = this.dv.readUint8();
        const hasColorTable = (packed & 0x80) > 0;
        const interlaced = (packed & 0x40) >> 6 > 0;
        const colorSorted = (packed & 0x20) >> 5 > 0;
        const reserved = (packed & 0x18) >> 3;
        const colorTableSize = (packed & 0x07);
        return {
            offset, length, type: 'DSC',
            left, top, width, height,
            hasColorTable, interlaced, colorSorted, reserved, colorTableSize,
        };
    }

    scanImageData() {
        const offset = this.dv.getOffset();
        const lzwmin = this.dv.readUint8();
        const { blocks } = this.scanBlocks();
        const length = this.dv.getOffset() - offset;
        return {
            offset, length, type: 'IMG',
            lzwmin, blocks,
        };
    }

    parseImageData(data) {
        const bdata = data || this.scanImageData();
        const indexStream = [];
        const codeUnits = [];
        let codeStream = null;
        let codeTable = null;
        const { lzwmin, blocks } = bdata;
        const br = new BitReader();
        const clearCode = 2 << (lzwmin - 1);
        const eoiCode = clearCode + 1;

        let lastCode = eoiCode;
        let size = lzwmin + 1;
        let growCode = (2 << size - 1) - 1;

        let isInitialized = false;
        let blockIndex = 0;

        for (const { offset, length } of blocks) {
            blockIndex++;
            br.pushBytes(this.dv.slice(offset, length));
            while (br.hasBits(size)) {
                const codeStart = br.getState();
                const code = br.readBits(size);
                if (code === eoiCode) {
                    codeStream.push(code);
                    break;
                } else if (code === clearCode) {
                    codeUnits.push({ stream: [], table: [], start: codeStart });
                    codeStream = codeUnits[codeUnits.length - 1].stream;
                    codeTable = codeUnits[codeUnits.length - 1].table;
                    for (let i = 0; i <= eoiCode; i++) {
                        codeTable[i] = (i < clearCode) ? [i] : [];
                    }
                    lastCode = eoiCode;
                    size = lzwmin + 1;
                    growCode = (2 << size - 1) - 1;
                    isInitialized = false;
                } else if (!isInitialized) {
                    indexStream.push(...codeTable[code]);
                    isInitialized = true;
                } else {
                    let k = 0;
                    const prevCode = codeStream[codeStream.length - 1];
                    if (code <= lastCode) {
                        indexStream.push(...codeTable[code]);
                        // eslint-disable-next-line prefer-destructuring
                        k = codeTable[code][0];
                    } else {
                        // eslint-disable-next-line prefer-destructuring
                        k = codeTable[prevCode][0];
                        indexStream.push(...codeTable[prevCode], k);
                    }
                    if (lastCode < 0xFFF) {
                        lastCode += 1;
                        codeTable[lastCode] = [...codeTable[prevCode], k];
                        if (lastCode === growCode && lastCode < 0xFFF) {
                            size += 1;
                            growCode = (2 << size - 1) - 1;
                        }
                    }
                }
                codeStream.push(code);
            }
        }
        return Object.assign({}, bdata, {
            indexStream, clearCode, eoiCode,
            codeUnits, blockCount: blocks.length,
            codeUnitCount: codeUnits.length,
        });
        // return {
        //     ...data, indexStream, clearCode, eoiCode,
        //     codeUnits, blockCount: blocks.length,
        //     codeUnitCount: codeUnits.length,
        // };
    }

    scanPlainTextExtension() {
        const offset = this.dv.getOffset();
        const extensionMarker = this.dv.readUint8();
        if (extensionMarker !== 0x21) {
            throw this.getByteError('Wrong extension byte', extensionMarker);
        }
        const extensionType = this.dv.readUint8();
        if (extensionType !== 0x01) {
            throw this.getByteError('Wrong extension type', extensionType);
        }
        const { blocks } = this.scanBlocks();
        const length = this.dv.getOffset() - offset;
        return {
            offset, length, type: 'PTX',
            blocks,
        };
    }

    parsePlainTextExtension() {
        const pte = this.scanPlainTextExtension();
        const message = this.parseTextBlocks(pte.blocks);
        // return {...pte, message};
        return Object.assign({}, pte, { message });
    }

    scanCommentExtension() {
        const offset = this.dv.getOffset();
        const extensionMarker = this.dv.readUint8();
        if (extensionMarker !== 0x21) {
            throw this.getByteError('Wrong extension byte', extensionMarker);
        }
        const extensionType = this.dv.readUint8();
        if (extensionType !== 0xFE) {
            throw this.getByteError('Wrong extension type', extensionType);
        }
        const { blocks } = this.scanBlocks();
        const length = this.dv.getOffset() - offset;
        return {
            offset, length, type: 'CX',
            blocks,
        };
    }

    parseCommentExtension() {
        const cext = this.scanCommentExtension();
        const message = this.parseTextBlocks(cext.blocks);
        // return {...cext, message};
        return Object.assign({}, cext, { message });
    }

    scanApplicationExtension() {
        const offset = this.dv.getOffset();
        const extensionMarker = this.dv.readUint8();
        if (extensionMarker !== 0x21) {
            throw this.getByteError('Wrong extension byte', extensionMarker);
        }
        const extensionType = this.dv.readUint8();
        if (extensionType !== 0xFF) {
            throw this.getByteError('Wrong extension type', extensionType);
        }
        const blockSize = this.dv.readUint8();
        if (blockSize !== 11) {
            throw this.getByteError('Wrong application extensions length', extensionType);
        }
        const identifier = this.dv.readEscapedString(8);
        const code = this.dv.readEscapedString(3);
        let blocks = [];
        let decode = '?';
        if (identifier === 'NETSCAPE' & code === '2.0' & this.dv.peekByte() === 3 & this.dv.peekByte(1) === 1) {
            // sepcial case for only known application extension
            const length = this.dv.readUint8();
            const boffset = this.dv.getOffset();
            const subblock = this.dv.readUint8();
            const loop = this.dv.readUint16();
            const terminator = this.dv.readUint8();
            blocks.push({ offset: boffset, length: 3 });
            decode = `Loop: ${(loop > 0) ? loop : 'forever'}`;
        } else {
            blocks = this.scanBlocks().blocks;
        }
        const length = this.dv.getOffset() - offset;
        return {
            offset, length, type: 'AX',
            identifier, code, blocks, decode,
        };
    }

    parseTrailer() {
        const offset = this.dv.getOffset();
        const length = 1;
        const marker = this.dv.readUint8();
        if (marker !== 0x3B) {
            throw this.getByteError('Wrong trailer byte', marker);
        }
        return { offset, length, type: 'END' };
    }

    parseTrailingTrivia() {
        const offset = this.dv.getOffset();
        const bytes = this.dv.readToEnd();
        const { length } = bytes;
        return {
            offset, length, type: 'TRL', bytes,
        };
    }

    scanBlocks() {
        const offset = this.dv.getOffset();
        let bsize = this.dv.readUint8();
        let length = 1;
        const blocks = [];
        while (bsize > 0) {
            blocks.push({ offset: offset + length, length: bsize });
            length += bsize + 1;
            this.dv.skip(bsize);
            bsize = this.dv.readUint8();
        }
        length += 1;
        return {
            blocks,
            blocksLength: length,
        };
    }

    readColor() {
        return this.dv.readUint8Array(3);
    }

    parseTextBlocks(blocks) {
        let message = '';
        for (const { offset, length } of blocks) {
            const bytes = this.dv.slice(offset, length);
            const part = String.fromCharCode.apply(null, bytes);
            message += part;
        }
        return message;
    }

    getByteError(msg, byte) {
        return new GifError(msg, byte, this.dv.getOffset());
    }

    checkFileSet() {
        if (!this.file) throw new Error('File Not Set. Call .setFile() first.');
    }
}

class GifError extends Error {
    constructor(msg, byte, offset) {
        super(`${msg} : 0x${byte.toString(16)} @${offset}`);
        Error.captureStackTrace(this, GifError);
    }
}
