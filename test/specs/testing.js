var assert = require('assert');

describe('webdriver.io page', function() {
    beforeEach(()=>{
        browser.url('http://localhost:8080');
    })
    it('should have the right title - the fancy generator way', ()=>{
        var title = browser.getTitle();
        assert.equal(title, 'Eat What Food');
    });
    it('data value can be added',()=>{
        $("#calendar").click();
        let val = $('#new_date').getValue();
        val = (val !="")
        expect(val).toBe(true);
    })
    it('should hv date table',()=>{
        $('#calendar').click();
        $('#add_date').click();
        let table = $('#date_list').getTagName();
        expect(table).toBe('table')
    })
    it('date checkbox can be clicked',()=>{
        $('#calendar').click();
        $('#add_date').click();
        $('.date_poll').click();
        let checkbox = $('.date_poll').getAttribute('checked')
        expect(checkbox).toBe('true')
    })
    it('date checkbox can  be cancel',()=>{
        $('#calendar').click();
        $('#add_date').click();
        $('.date_poll').click();
        $('.date_poll').click();
        let checkbox = $('.date_poll').getAttribute('checked')
        expect(checkbox).toBe(null);
    })
});