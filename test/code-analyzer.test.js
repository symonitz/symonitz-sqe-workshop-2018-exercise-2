import assert from 'assert';
import {subtitue} from '../src/js/code-analyzer';

describe('', () => {
    it('is parsing an empty function correctly', () => {
        assert.equal(JSON.stringify(subtitue('let k = 3;\n' +
            'function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    if (b < z) {\n' +
                '        c = c + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } else if (b < z * 2) {\n' +
                '        c = c + x + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } else {\n' +
                '        c = c + z + 5;\n' +
                '        return x + y + z + c;\n' +
                '    }\n' +
                '}\n', '{"x":2, "y":3, "z":5}')),
        JSON.stringify([ 'function foo(x, y, z) {',
            '<span style="color: red; ">    if (x + 1 + y < z) {</span>',
            '        return x + y + z + 0 + 5;',
            '<span style="color: green; ">    } else if (x + 1 + y < z * 2) {</span>',
            '        return x + y + z + 0 + 5 + x + 5;',
            '    } else {',
            '        return x + y + z + 0 + 5 + x + 5 + z + 5;',
            '    }',
            '}' ]));});
    it('is parsing an empty function correctly', () => {
        assert.equal(JSON.stringify(subtitue('function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    while (a < z) {\n' +
            '        c = a + b;\n' +
            '        z = c * 2;\n' +
            '    }\n' +
            '    \n' +
            '    return z;\n' +
            '}\n', '{"x":2, "y":3, "z":5}')),
        JSON.stringify([ 'function foo(x, y, z) {',
            '    while (x + 1 < z) {',
            '        z = x + 1 + x + 1 + y * 2;',
            '    }',
            '    return z;',
            '}' ]));
    });it('is parsing an empty function correctly', () => {
        assert.equal(JSON.stringify(subtitue('function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    let c = 2;\n' +
            '}\n' +
            'let k = 5;', '{"x":2, "y":3, "z":5}')),
        JSON.stringify([ 'function foo(x, y, z) {', '}' ]));
    });
    it('is parsing an empty function correctly', () => {
        assert.equal(JSON.stringify(subtitue('function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    if (b < z) {\n' +
            '        c = c + 5;\n' +
            '        return x + y + z + c;\n' +
            '    } else {\n' +
            '        c = c + z + 5;\n' +
            '        return x + y + z + c;\n' +
            '    }\n' +
            '}\n', '{"x":2, "y":3, "z":5}')),
        JSON.stringify([ 'function foo(x, y, z) {',
            '<span style="color: red; ">    if (x + 1 + y < z) {</span>',
            '        return x + y + z + 0 + 5;',
            '    } else {',
            '        return x + y + z + 0 + 5 + z + 5;',
            '    }',
            '}' ]
        ));
    });
    it('is parsing an empty function correctly', () => {
        assert.equal(JSON.stringify(subtitue('function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    if (b < z) {\n' +
            '        c = c + 5;\n' +
            '        return x + y + z + c;\n' +
            '    }\n' +
            '}\n', '{"x":2, "y":3, "z":5}')),
        JSON.stringify([ 'function foo(x, y, z) {',
            '<span style="color: red; ">    if (x + 1 + y < z) {</span>',
            '        return x + y + z + 0 + 5;',
            '    }',
            '}' ]
        ));
    });
    it('is parsing an empty function correctly', () => {
        assert.equal(JSON.stringify(subtitue('function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    if (x < z) {\n' +
            '        y = y + 5;\n' +
            '        return x + y + z + y;\n' +
            '}\n' +
            '}\n', '{"x":2, "y":3, "z":5}')),
        JSON.stringify([ 'function foo(x, y, z) {',
            '<span style="color: green; ">    if (x < z) {</span>',
            '        y = y + 5;',
            '        return x + y + z + y;',
            '    }',
            '}' ]
        ));
    });


    it('is parsing an empty function correctly', () => {
        assert.equal(JSON.stringify(subtitue('function foo(x, y, z){\n' +
            '    let a = x;\n' +
            '    let b = y;\n' +
            '    let c = z;\n' +
            '    \n' +
            '    if (b < z) {\n' +
            '        y = y + 5;\n' +
            '        return a + c + z + y;\n' +
            '}\n' +
            '}\n', '{"x":2, "y":3, "z":5}')),
        JSON.stringify([ 'function foo(x, y, z) {',
            '<span style="color: green; ">    if (y < z) {</span>',
            '        y = y + 5;',
            '        return x + z + z + y;',
            '    }',
            '}' ]
        ));
    });


    it('is parsing an empty function correctly', () => {
        assert.equal(JSON.stringify(subtitue('function sort(a, b){\n' +
            '    let x = 3;\n' +
            '    if (x < x) {\n' +
            '        a = x + 5;\n' +
            '        return a;\n' +
            '    }\n' +
            '}\n', '{"a":3, "b":7}')),
        JSON.stringify([ 'function sort(a, b) {',
            '<span style="color: red; ">    if (3 < 3) {</span>',
            '        a = 3 + 5;',
            '        return a;',
            '    }',
            '}' ]
        ));
    });

    it('is parsing an empty function correctly', () => {
        assert.equal(JSON.stringify(subtitue('let x = 3;\n' +
            'function sort(a, b){\n' +
            '    let a = x;\n' +
            '}\n', '{"a":2, "b":1}')),
        JSON.stringify([ 'function sort(a, b) {', '}' ]
        ));
    });










});
