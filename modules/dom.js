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

jaspy.module('dom', function ($, module, builtins) {
    var MetaElement = module.$class('MetaElement', [builtins.type]);
    var Element = module.$class('Element', [builtins.object], MetaElement);


    Element.$def('__new__', function (cls, tag) {
        Element.check_subclass(cls);
        var self = new $.PyObject(cls);
        self.element = document.createElement($.Str.unpack(tag, 'div'));
        self.element.__element__ = self;
        return self;
    }, ['tag'], {defaults: {'tag': builtins.None}});

    Element.$def('__str__', function (self) {
        Element.check(self);
        return $.Str.pack('<' + self.element.nodeName.toLowerCase() + ' element at 0x' + self.get_address() + '>');
    });

    Element.$def('__getitem__', function (self, name) {
        Element.check(self);
        return $.Str.pack(self.element.getAttribute($.Str.unpack(name)));
    }, ['name']);

    Element.$def('__setitem__', function (self, name, value) {
        Element.check(self);
        self.element.setAttribute($.Str.unpack(name), $.Str.unpack(value));
    }, ['name', 'value']);

    Element.$def('__getattr__', function (self, name) {
        Element.check(self);
        var child = new $.PyObject(Element);
        child.element = document.createElement($.Str.unpack(name, 'div'));
        child.element.__element__ = self;
        self.element.appendChild(child.element);
        return child;
    }, ['name']);

    Element.$def_property('text', function (self) {
        Element.check(self);
        return $.Str.pack(self.element.textContent);
    }, function (self, value) {
        Element.check(self);
        self.element.textContent = $.Str.unpack(value);
    });

    Element.$def_property('html', function (self) {
        Element.check(self);
        return $.Str.pack(self.element.innerHTML);
    }, function (self, value) {
        Element.check(self);
        self.element.innerHTML = $.Str.unpack(value);
    });

    Element.$def('css', function (self, name, value) {
        Element.check(self);
        if (value === builtins.NotImplemented) {
            return $.Str.pack(self.element.style[$.Str.unpack(name)]);
        } else {
            self.element.style[$.Str.unpack(name)] = $.Str.unpack(value, '');
        }
    }, ['name', 'value'], {defaults: {'value': builtins.NotImplemented}});

    Element.$def('append', function (self, other) {
        Element.check(self);
        Element.check(other);
        self.element.appendChild(other.element);
    }, ['other']);


    module.$def('get_body', function () {
        if (document.body) {
            if (document.body.__element__) {
                return document.body.__element__;
            }
            var element = new $.PyObject(Element);
            element.element = document.body;
            document.body.__element__ = element;
            return element;
        } else {
            $.raise(builtins.ValueError, 'unable to load body from dom');
        }
    });


    Element.$def('register_listener', function (self, name, callback) {
        Element.check(self);
        var element = self.element;
        element.addEventListener($.Str.unpack(name), function (event) {
            $.resume(callback, [self], {});
        });
    }, ['name', 'resume']);




    module.$def('set_interval', function (interval, callback) {
        var handle = $.pack_int(setInterval(function () {
            $.resume(callback, [handle], {});
        }, $.unpack_int(interval)));
        return handle;
    }, ['interval', 'resume']);

}, ['builtins']);