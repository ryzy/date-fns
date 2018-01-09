// @flow
/* eslint-env mocha */

import assert from 'power-assert'
import format from '.'

describe('format', function () {
  var date = new Date(1986, 3 /* Apr */, 4, 0, 32, 55, 123)

  var offset = date.getTimezoneOffset()
  var absoluteOffset = Math.abs(offset)
  var hours = Math.floor(absoluteOffset / 60)
  var hoursLeadingZero = hours < 10 ? '0' : ''
  var minutes = absoluteOffset % 60
  var minutesLeadingZero = minutes < 10 ? '0' : ''
  var sign = offset > 0 ? '-' : '+'
  var timezone = sign + hoursLeadingZero + hours + ':' + minutesLeadingZero + minutes
  var timezoneShort = timezone.replace(':', '')

  var timestamp = date.getTime().toString()
  var secondsTimestamp = Math.floor(date.getTime() / 1000).toString()

  it('accepts a string', function () {
    var date = new Date(2014, 3, 4).toISOString()
    assert(format(date, 'yyyy-MM-dd') === '2014-04-04')
  })

  it('accepts a timestamp', function () {
    var date = new Date(2014, 3, 4).getTime()
    assert(format(date, 'yyyy-MM-dd') === '2014-04-04')
  })

  it('escapes characters between the single quote characters', function () {
    var result = format(date, "'yyyy-'MM-dd'THH:mm:ss.SSSX' yyyy-'MM-dd'")
    assert(result === 'YYYY-04-04THH:mm:ss.SSSX 1986-MM-dd')
  })

  it('two single quote characters are transformed into a "real" single quote', function () {
    var date = new Date(2014, 3, 4, 5)
    assert(format(date, "''h 'o''clock'''") === "'5 o'clock'")
  })

  describe('ordinal numbers', function () {
    it('ordinal day of an ordinal month', function () {
      var result = format(date, "do 'day of the' Mo 'month' of YYYY")
      assert(result === '4th day of the 4th month of 1986')
    })

    it('should return a correct ordinal number', function () {
      var result = []
      for (var i = 1; i <= 31; i++) {
        result.push(format(new Date(2015, 0, i), 'do'))
      }
      var expected = [
        '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th',
        '11th', '12th', '13th', '14th', '15th', '16th', '17th', '18th', '19th', '20th',
        '21st', '22nd', '23rd', '24th', '25th', '26th', '27th', '28th', '29th', '30th', '31st'
      ]
      assert.deepEqual(result, expected)
    })
  })

  it('era', function () {
    var result = format(date, 'G GG GGG GGGG GGGGG')
    assert(result === 'AD AD AD Anno Domini A')
  })

  describe('year', function () {
    describe('regular year', function () {
      it('works as expected', function () {
        var result = format(date, 'y yo yy yyo yyy yyyy yyyyy yyyyyo')
        assert(result === '1986 1986th 86 86th 1986 1986 01986 01986th')
      })

      it('1 BC formats as 1', function () {
        var date = new Date(0, 0 /* Jan */, 1)
        date.setFullYear(0)
        var result = format(date, 'y')
        assert(result === '1')
      })

      it('2 BC formats as 2', function () {
        var date = new Date(0, 0 /* Jan */, 1)
        date.setFullYear(-1)
        var result = format(date, 'y')
        assert(result === '2')
      })
    })

    describe('week-numbering year', function () {
      it('works as expected', function () {
        var result = format(date, 'Y Yo YY YYo YYY YYYY YYYYY YYYYYo')
        assert(result === '1986 1986th 86 86th 1986 1986 01986 01986th')
      })

      it('the first week of the next year', function () {
        var result = format(new Date(2013, 11 /* Dec */, 30), 'YYYY')
        assert(result === '2014')
      })

      it('the last week of the previous year', function () {
        var result = format(new Date(2016, 0 /* Jan */, 1), 'YYYY')
        assert(result === '2015')
      })

      it('1 BC formats as 0', function () {
        var date = new Date(0, 6 /* Jul */, 2)
        date.setFullYear(0)
        var result = format(date, 'Y')
        assert(result === '0')
      })

      it('2 BC formats as -1', function () {
        var date = new Date(0, 6 /* Jul */, 2)
        date.setFullYear(-1)
        var result = format(date, 'Y')
        assert(result === '-1')
      })
    })

    describe('extended year', function () {
      it('works as expected', function () {
        var result = format(date, 'u uo uu uuo uuu uuuu uuuuu uuuuuo')
        assert(result === '1986 1986th 86 86th 1986 1986 01986 01986th')
      })

      it('1 BC formats as 0', function () {
        var date = new Date(0, 0, 1)
        date.setFullYear(0)
        var result = format(date, 'u')
        assert(result === '0')
      })

      it('2 BC formats as -1', function () {
        var date = new Date(0, 0, 1)
        date.setFullYear(-1)
        var result = format(date, 'u')
        assert(result === '-1')
      })
    })
  })

  describe('quarter', function () {
    it('formatting quarter', function () {
      var result = format(date, 'Q Qo QQ QQo QQQ QQQQ')
      assert(result === '2 2nd 02 02nd Q2 2nd quarter')
    })

    it('stand-alone quarter', function () {
      var result = format(date, 'q qo qq qqo qqq qqqq')
      assert(result === '2 2nd 02 02nd Q2 2nd quarter')
    })

    it('returns a correct quarter for each month', function () {
      var result = []
      for (var i = 0; i <= 11; i++) {
        result.push(format(new Date(1986, i, 1), 'Q'))
      }
      var expected = ['1', '1', '1', '2', '2', '2', '3', '3', '3', '4', '4', '4']
      assert.deepEqual(result, expected)
    })
  })

  describe('month', function () {
    it('formatting month', function () {
      var result = format(date, 'M Mo MM MMo MMM MMMM MMMMM')
      assert(result === '4 4th 04 04th Sep September S')
    })

    it('stand-alone month', function () {
      var result = format(date, 'L Lo LL LLo LLL LLLL LLLLL')
      assert(result === '4 4th 04 04th Sep September S')
    })
  })

  describe('week', function () {
    it('week of year', function () {
      var result = format(date, 'w ww')
      assert(result === '14 14')
    })

    it.skip('week of month', function () {
      var result = format(date, 'W')
      assert(result === 'TODO')
    })
  })

  describe('day', function () {
    it('date', function () {
      var result = format(date, 'd do dd ddo')
      assert(result === '4 4th 04 04th')
    })

    describe('day of year', function () {
      it('works as expected', function () {
        var result = format(date, 'D Do DD DDD DDDDDo')
        assert(result === '94 94th 94 094 00094th')
      })

      it('returns a correct day number for the last day of a leap year', function () {
        var result = format(new Date(1992, 11 /* Dec */, 31, 23, 59, 59, 999), 'D')
        assert(result === '366')
      })
    })

    it.skip('day of week in month', function () {
      var result = format(date, 'F')
      assert(result === 'TODO')
    })

    it.skip('modified julian day', function () {
      var result = format(date, 'g gggggggggg')
      assert(result === 'TODO')
    })
  })

  describe('week day', function () {
    describe('ISO day of week', function () {
      it('works as expected', function () {
        var result = format(date, 'E Eo EE EEo EEE EEEE EEEEE EEEEEE')
        assert(result === '5 5th 05 05th Fri Friday F Fr')
      })

      it('returns a correct day of an ISO week', function () {
        var result = []
        for (var i = 1; i <= 7; i++) {
          result.push(format(new Date(1986, 8 /* Sep */, i), 'E'))
        }
        var expected = ['1', '2', '3', '4', '5', '6', '7']
        assert.deepEqual(result, expected)
      })
    })

    it('formatting day of week', function () {
      var result = format(date, 'e eo ee eeo eee eeee eeeee eeeeee')
      assert(result === '5 5th 05 05th Fri Friday F Fr')
    })

    it('stand-alone day of week', function () {
      var result = format(date, 'c co cc cco ccc cccc ccccc cccccc')
      assert(result === '5 5th 05 05th Fri Friday F Fr')
    })
  })

  describe('day period and hour', function () {
    it('hour [1-12]', function () {
      var result = format(date, 'h hh hhho')
      assert(result === '12 12 012th')
    })

    it('hour [0-23]', function () {
      var result = format(date, 'H HH HHHo')
      assert(result === '0 00 000th')
    })

    it('hour [0-11]', function () {
      var result = format(date, 'K KK KKKo')
      assert(result === '0 00 000th')
    })

    it('hour [1-24]', function () {
      var result = format(date, 'k kk kkko')
      assert(result === '24 24 024th')
    })

    it('day period', function () {
      var result = format(date, 'a')
      assert(result === 'AM')
    })

    it('12 PM', function () {
      var date = new Date(1986, 3 /* Apr */, 4, 12, 0, 0, 900)
      assert(format(date, 'h H K k a') === '12 12 0 12 PM')
    })

    it('12 AM', function () {
      var date = new Date(1986, 3 /* Apr */, 6, 0, 0, 0, 900)
      assert(format(date, 'h H K k a') === '12 0 0 24 AM')
    })
  })

  it('minute', function () {
    var result = format(date, 'm mm mmmo')
    assert(result === '32 32 032th')
  })

  describe('second', function () {
    it('second', function () {
      var result = format(date, 's ss ssso')
      assert(result === '55 55 055th')
    })

    it('fractional seconds', function () {
      var result = format(date, 'S So SS SSo SSS SSSS')
      assert(result === '1 1st 12 12nd 123 1230')
    })

    it.skip('milliseconds in day', function () {
      var result = format(date, 'A')
      assert(result === 'TODO')
    })
  })

  describe('time zone', function () {
    it('should toDate the given date in a local timezone', function () {
      assert(format('2015-01-01', 'yyyy-MM-dd') === '2015-01-01')
    })

    it.skip('specific non-location formats', function () {
      var result = format(date, 'z zz zzz zzzz')
      assert(result === 'TODO')
    })

    it.skip('aliases', function () {
      var result = format(date, 'Z ZZ ZZZ ZZZZ ZZZZZ')
      assert(result === 'TODO')
    })

    it.skip('GMT', function () {
      var result = format(date, 'O OO OOO OOOO')
      assert(result === 'TODO')
    })

    it.skip('generic non-location formats', function () {
      var result = format(date, 'v vv vvv vvvv')
      assert(result === 'TODO')
    })

    it.skip('location formats', function () {
      var result = format(date, 'V VV VVV VVVV')
      assert(result === 'TODO')
    })

    it.skip('ISO-8601 with Z', function () {
      var result = format(date, 'X XX XXX XXXX XXXXX')
      assert(result === 'TODO')
    })

    it.skip('ISO-8601 without Z', function () {
      var result = format(date, 'x xx xxx xxxx xxxxx')
      assert(result === 'TODO')
    })
  })

  describe('timestamp', function () {
    it.skip('seconds timestamp', function () {
      var result = format(date, 't')
      assert(result === secondsTimestamp)
    })

    it.skip('milliseconds timestamp', function () {
      var result = format(date, 'T')
      assert(result === timestamp)
    })
  })

  describe('edge cases', function () {
    it("returns String('Invalid Date') if the date isn't valid", function () {
      assert(format(new Date(NaN), 'MMMM d, yyyy') === 'Invalid Date')
    })

    it('handles dates before 100 AD', function () {
      var initialDate = new Date(0)
      initialDate.setFullYear(7, 11 /* Dec */, 31)
      initialDate.setHours(0, 0, 0, 0)
      assert(format(initialDate, 'Y ww E') === '8 01 1')
    })
  })

  it('implicitly converts `formatString`', function () {
    // eslint-disable-next-line no-new-wrappers
    var formatString = new String('yyyy-MM-dd')

    var date = new Date(2014, 3, 4)

    // $ExpectedMistake
    assert(format(date, formatString) === '2014-04-04')
  })

  describe.skip('custom locale', function () {

  })

  it('throws `RangeError` if `options.additionalDigits` is not convertable to 0, 1, 2 or undefined', function () {
    // $ExpectedMistake
    var block = format.bind(null, date, 'yyyy-MM-dd', {additionalDigits: NaN})
    assert.throws(block, RangeError)
  })

  it('throws TypeError exception if passed less than 2 arguments', function () {
    assert.throws(format.bind(null), TypeError)
    assert.throws(format.bind(null, 1), TypeError)
  })
})
