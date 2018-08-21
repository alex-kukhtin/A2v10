describe("Url tools", function () {

    const url = require('std:url');
    const utils = require('std:utils');
    const td = require('std:testdata');

    it("combine segments", function () {
        expect(url.combine('/', '/s1/', 's2')).toBe('/s1/s2');
        expect(url.combine('/', 's1/s2', '/s3')).toBe('/s1/s2/s3');
        expect(url.combine('/', 's1/s2', '/s3')).toBe('/s1/s2/s3');
        expect(url.combine('s1/s2', '/s3')).toBe('/s1/s2/s3');
        expect(url.combine('\\s1\\s2', '\s3')).toBe('/s1/s2/s3');
        expect(url.combine('\\s1\\s2', '\\s3/s4\\', '\\s5/')).toBe('/s1/s2/s3/s4/s5');
    });


    it("make query string (simple)", function () {
        expect(url.makeQueryString({ x: 5, y: 6 })).toBe('?x=5&y=6');
        expect(url.makeQueryString({ x: 5, t: 'test' })).toBe('?x=5&t=test');
        expect(url.makeQueryString({ x: 5, t: '?test' })).toBe('?x=5&t=%3Ftest');
        expect(url.makeQueryString({ x: 5, t: '&test' })).toBe('?x=5&t=%26test');
        expect(url.makeQueryString({ x: 5, t: 'кир' })).toBe('?x=5&t=%D0%BA%D0%B8%D1%80');
        expect(url.makeQueryString('test')).toBe('');
        expect(url.makeQueryString(123)).toBe('');
        expect(url.makeQueryString()).toBe('');
        expect(url.makeQueryString(true)).toBe('');
    });

    it("make query string (object)", function () {
		let cust = td.createCustomer({ Id: 1234 });
        expect(url.makeQueryString({ Customer: cust, y: 6 })).toBe('?Customer=1234&y=6');
    });

    it("make query string (date)", function () {
        let today = utils.date.today();
		let strToday = utils.format(today, 'DateUrl');
        expect(url.makeQueryString({ From: today, To: utils.date.zero() })).toBe('?From=' + strToday);
    });

    it("parse query string (simple)", function () {
        expect(url.parseQueryString('?Customer=1234&y=6')).toEqual({ Customer: '1234', y: '6' });
        expect(url.parseQueryString('?x=5&t=test')).toEqual({ x: '5', t: 'test' });
        expect(url.parseQueryString('?x=5&t=%3Ftest')).toEqual({ x: '5', t: '?test' });
        expect(url.parseQueryString('?x=5&t=%26test')).toEqual({ x: '5', t: '&test' });
        expect(url.parseQueryString('?x=5&t=%D0%BA%D0%B8%D1%80')).toEqual({x: '5', t: 'кир'});
    });

    it("parse url and query", function () {
        expect(url.parseUrlAndQuery('/s1', {})).toEqual({ url: '/s1', query: {} });
        expect(url.parseUrlAndQuery('/s1', { x: 1 })).toEqual({ url: '/s1', query: { x: '1' } });
        expect(url.parseUrlAndQuery('/s1?x=1')).toEqual({ url: '/s1', query: { x: '1' } });
        expect(url.parseUrlAndQuery('/s1/s2/s3?x=test')).toEqual({ url: '/s1/s2/s3', query: { x: 'test' } });
        expect(url.parseUrlAndQuery('/s1/s2/s3?x=test', {y: 6})).toEqual({ url: '/s1/s2/s3', query: { x: 'test', y: '6' } });
    });

    it('replace url query', function () {
		expect(url.replaceUrlQuery('/s1/s2?x=5&y=6', { y: 7, x: 8 })).toEqual('/s1/s2?x=8&y=7');
		expect(url.replaceUrlQuery('/s1/s2?x=5&y=6')).toEqual('/s1/s2?x=5&y=6');
		expect(url.replaceUrlQuery('/s1/s2', { x: 5, y: 6 })).toEqual('/s1/s2?x=5&y=6');
    });

    it('id change only', function () {
        expect(url.idChangedOnly('/s1/s2/123', '/s1/s2/new')).toBe(true);
        expect(url.idChangedOnly('/s1/s8/123', '/s1/s2/new')).toBe(false);
        expect(url.idChangedOnly('', '')).toBe(false);
    });
});

