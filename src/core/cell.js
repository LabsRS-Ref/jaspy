/*
 * Copyright (C) 2016, Maximilian Koehl <mail@koehlma.de>
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License version 3 as published by
 * the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */


var Cell = $Class('cell', {
    constructor: function (object) {
        PyObject.call(this, Cell.cls);
        this.set(object || None);
    },

    set: function (object) {
        if (!(object instanceof PyObject)) {
            raise(TypeError, 'only python objects can be stored in a cell');
        }
        this.object = object;
    },

    get: function () {
        return this.object;
    }
});


$.Cell = Cell;
