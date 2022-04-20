/* eslint-disable strict, no-unused-vars */

'use strict';

class DataReader {
    constructor(ab, little, source) {
        this.index = 0;
        this.littleEndian = little || false;
        this.dv = new DataView(ab);
        this.source = source;
    }

    check(size) {
        if (this.index + size <= this.dv.byteLength) {
            return true;
        }
        return false;
    }

    advance(x) {
        this.index += x;
    }

    peekByte(offset = 0) {
        this.check(1 + offset);
        return this.dv.getUint8(this.index + offset);
    }

    slice(offset, length) {
        const ab = new Uint8Array(this.dv.buffer, offset, length);
        return ab;
    }

    readUint8() {
        this.check(1);
        const val = this.dv.getUint8(this.index);
        this.advance(1);
        return val;
    }

    readUint8Array(len) {
        const r = [];
        for (let i = 0; i < len; i++) {
            r.push(this.readUint8());
        }
        return r;
    }

    readUint16() {
        this.check(2);
        const val = this.dv.getUint16(this.index, this.littleEndian);
        this.advance(2);
        return val;
    }

    readUint32() {
        this.check(4);
        const val = this.dv.getUint32(this.index, this.littleEndian);
        this.advance(4);
        return val;
    }

    readInt32() {
        this.check(4);
        const val = this.dv.getInt32(this.index, this.littleEndian);
        this.advance(4);
        return val;
    }

    readString(len) {
        let str = '';
        for (let i = 0; i < len; i++) {
            str += String.fromCharCode(this.readUint8());
        }
        return str;
    }

    readEscapedString(len) {
        let str = '';
        for (let i = 0; i < len; i++) {
            const char = this.readUint8();
            if (char >= 32 && char <= 126) {
                str += String.fromCharCode(char);
            } else {
                str += `\\x${char.toString(16).padStart(2, '0')}`;
            }
        }
        return str;
    }

    readNullTerminatedString() {
        let str = '';
        let val = this.readUint8();
        while (val !== 0) {
            str += String.fromCharCode(val);
            val = this.readUint8();
        }
        return str;
    }

    readToEnd() {
        const bytes = this.slice(this.index, this.dv.byteLength - this.index);
        this.index = this.dv.byteLength + 1;
        return bytes;
    }

    hasMore(x) {
        this.check(1);
        return this.index <= this.dv.byteLength - (x || 1);
    }

    setOffset(offset) {
        this.index = offset;
    }

    getOffset() {
        return this.index;
    }

    skip(x) {
        this.check(x);
        this.advance(x);
    }
}

class BitReader {
    constructor(bytes) {
        this.bytes = bytes || new Int8Array();
        this.byteOffset = 0;
        this.bitOffset = 0;
        this.totalByteOffset = 0;
    }

    readBits(len) {
        let result = 0;
        let rbits = 0;
        while (rbits < len) {
            if (this.byteOffset >= this.bytes.length) {
                throw new Error(`Not enough bytes to read ${len} bits (read ${rbits} bits)`);
            }
            const bbits = Math.min(8 - this.bitOffset, len - rbits);
            const mask = (0xFF >> (8 - bbits)) << this.bitOffset;
            result += ((this.bytes[this.byteOffset] & mask) >> this.bitOffset) << rbits;
            rbits += bbits;
            this.bitOffset += bbits;
            if (this.bitOffset === 8) {
                this.byteOffset += 1;
                this.totalByteOffset += 1;
                this.bitOffset = 0;
            }
        }
        return result;
    }

    hasBits(len = 1) {
        if (len > 12) {
            throw new Error(`Exceeds max bit size: ${len} (max: 12)`);
        }
        if (this.byteOffset >= this.bytes.length) return false;
        const bitsRemain = 8 - this.bitOffset;
        if (len <= bitsRemain) return true;
        const bytesRemain = this.bytes.length - this.byteOffset - 1;
        if (bytesRemain < 1) return false;
        if (len > bitsRemain + 8 * bytesRemain) return false;
        return true;
    }

    setBytes(bytes, byteOffset = 0, bitOffset = 0) {
        this.bytes = bytes;
        this.byteOffset = byteOffset;
        this.bitOffset = bitOffset;
    }

    pushBytes(bytes) {
        if (this.hasBits()) {
            const remainBytes = this.bytes.length - this.byteOffset;
            const extended = new Uint8Array(remainBytes + bytes.length);
            extended.set(this.bytes.slice(this.byteOffset));
            extended.set(bytes, remainBytes);
            this.bytes = extended;
            this.byteOffset = 0;
        } else {
            this.bytes = bytes;
            this.byteOffset = 0;
            this.bitOffset = 0;
        }
    }

    getState() {
        return {
            bitOffset: this.bitOffset,
            byteOffset: this.totalByteOffset,
        };
    }
}
