# -*- coding: utf-8 -*-

# Copyright (C) 2016, Maximilian Köhl <mail@koehlma.de>
#
# This program is free software: you can redistribute it and/or modify it under
# the terms of the GNU Lesser General Public License version 3 as published by
# the Free Software Foundation.
#
# This program is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
# PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License along
# with this program. If not, see <http://www.gnu.org/licenses/>.

import argparse
import dis
import os.path
import types


def convert(const):
    js = []
    if const is None or isinstance(const, bool):
        js.append('jaspy.%r' % const)
    elif isinstance(const, int):
        js.append('jaspy.Int.pack(%r)' % const)
    elif isinstance(const, float):
        js.append('jaspy.Float.pack(%r)' % const)
    elif isinstance(const, str):
        js.append('jaspy.Str.pack(%r)' % const)
    elif isinstance(const, bytes):
        js.append('jaspy.pack_bytes(%r)' % ', '.join(map(int, const)))
    elif isinstance(const, tuple):
        js.append('jaspy.pack_tuple([%s])' % ', '.join(map(convert, const)))
    elif isinstance(const, types.CodeType):
        js.append('(new jaspy.PythonCode(%s, {' % repr(const.co_code)[1:])
        js.append('name: %r,' % const.co_name)
        js.append('filename: %r,' % const.co_filename)
        js.append('constants: [%s],' % ', '.join(map(convert, const.co_consts)))
        js.append('flags: %r,' % const.co_flags)
        js.append('names: [%s],' % ', '.join(map(repr, const.co_names)))
        js.append('stacksize: %r,' % const.co_stacksize)
        js.append('argcount: %r,' % const.co_argcount)
        js.append('kwargcount: %r,' % const.co_kwonlyargcount)
        js.append('varnames: [%s],' % ', '.join(map(repr, const.co_varnames)))
        js.append('freevars: [%s],' % ', '.join(map(repr, const.co_freevars)))
        js.append('cellvars: [%s],' % ', '.join(map(repr, const.co_cellvars)))
        js.append('firstline: %r,' % const.co_firstlineno)
        js.append('lnotab: \'%s\'' % repr(const.co_lnotab)[2:-1])
        js.append('}))')
    else:
        raise TypeError('invalid type of constant', const)
    return '(' + ''.join(js) + ')'


def disassemble(const):
    dis.dis(const)
    for const in const.co_consts:
        if isinstance(const, types.CodeType):
            disassemble(const)


def compile_and_convert(filename):
    with open(filename, 'r') as source_file:
        source = source_file.read()
    code = compile(source, filename, 'exec')
    return convert(code)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('module', type=argparse.FileType('r'))
    parser.add_argument('--debug', default=False, action='store_true')

    arguments = parser.parse_args()

    filename = os.path.basename(arguments.module.name)
    code = compile(arguments.module.read(), filename, 'exec')
    source = convert(code)
    name = os.path.basename(arguments.module.name).partition('.')[0]

    with open(arguments.module.name + '.js', 'w') as output:
        output.write('jaspy.module(%r, %s);' % (name, source))

    if arguments.debug:
        disassemble(code)


if __name__ == '__main__':
    main()
