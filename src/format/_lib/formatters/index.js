import getUTCDayOfYear from '../../../_lib/getUTCDayOfYear/index.js'
import getUTCISOWeek from '../../../_lib/getUTCISOWeek/index.js'
import getUTCISOWeekYear from '../../../_lib/getUTCISOWeekYear/index.js'

/*
 * |     | Unit                           |     | Unit                         |
 * |-----|--------------------------------|-----|------------------------------|
 * |  a  | AM or PM                       |  A* | Milliseconds in day          |
 * |  b  |                                |  B  |                              |
 * |  c  | Stand-alone local day of week  |  C  |                              |
 * |  d  | Day of month                   |  D  | Day of year                  |
 * |  e  | Local day of week              |  E  | Day of week                  |
 * |  f  |                                |  F* | Day of week in month         |
 * |  g  | Modified Julian day            |  G  | Era                          |
 * |  h  | Hour [1-12]                    |  H  | Hour [0-23]                  |
 * |  i  |                                |  I  |                              |
 * |  j* | (nothing - not used in format) |  J  |                              |
 * |  k  | Hour [1-24]                    |  K  | Hour [0-11]                  |
 * |  l* | (nothing - deprecated)         |  L* | Stand-alone month            |
 * |  m  | Minute                         |  M  | Month                        |
 * |  n  |                                |  N  |                              |
 * |  o! | Ordinal number modifier        |  O* | Timezone (GMT)               |
 * |  p  |                                |  P  |                              |
 * |  q* | Stand-alone quarter            |  Q  | Quarter                      |
 * |  r  |                                |  R  |                              |
 * |  s  | Second                         |  S  | Fractional second            |
 * |  t! | Seconds timestamp              |  T! | Milliseconds timestamp       |
 * |  u  | Extended year                  |  U* | Cyclic year                  |
 * |  v* | Timezone (generic non-locat.)  |  V* | Timezone (location)          |
 * |  w  | ISO week of year               |  W* | Week of month                |
 * |  x  | Timezone (ISO-8601 w/o Z)      |  X* | Timezone (ISO-8601)          |
 * |  y  | Year (abs)                     |  Y  | ISO week-numbering year      |
 * |  z* | Timezone (specific non-locat.) |  Z* | Timezone (aliases)           |
 *
 * Letters marked by * are not implemented but reserved by Unicode standard.
 *
 * Letters marked by ! are non-standard, but implemented by date-fns.
 * They could be changed in a future major release.
 */

var formatters = {
  // Era
  G: function (pattern, date, localize) {
    var era = date.getUTCFullYear() > 0 ? 1 : -1
    switch (pattern) {
      // AD, BC
      case 'G':
      case 'GG':
      case 'GGG':
        return localize.era(era, {type: 'short'})
      // A, B
      case 'GGGGG':
        return localize.era(era, {type: 'narrow'})
      // Anno Domini, Before Christ
      case 'GGGG':
      default:
        return localize.era(era, {type: 'long'})
    }
  },

  // Year
  y: function (pattern, date, localize, options) {
    // From http://www.unicode.org/reports/tr35/tr35-31/tr35-dates.html#Date_Format_Patterns
    // | Year     |     y | yy |   yyy |  yyyy | yyyyy |
    // |----------|-------|----|-------|-------|-------|
    // | AD 1     |     1 | 01 |   001 |  0001 | 00001 |
    // | AD 12    |    12 | 12 |   012 |  0012 | 00012 |
    // | AD 123   |   123 | 23 |   123 |  0123 | 00123 |
    // | AD 1234  |  1234 | 34 |  1234 |  1234 | 01234 |
    // | AD 12345 | 12345 | 45 | 12345 | 12345 | 12345 |

    var signedYear = date.getUTCFullYear()

    // Returns 1 for 1 BC (which is year 0 in JavaScript)
    var year = signedYear > 0 ? signedYear : 1 - signedYear

    // Two digit year
    if (pattern.length === 2) {
      return addLeadingZeros(year, 4).substr(2)
    }

    // Padding
    return addLeadingZeros(year, pattern.length)
  },

  // ISO week-numbering year
  Y: function (pattern, date, localize, options) {
    var isoWeekYear = getUTCISOWeekYear(date, options)

    // Two digit year
    if (pattern.length === 2) {
      return addLeadingZeros(isoWeekYear, 4).substr(2)
    }

    // Padding
    return addLeadingZeros(isoWeekYear, pattern.length)
  },

  // Extended year. This is a single number designating the year of this calendar system.
  // The main difference between `y` and `u` localizers are B.C. years:
  // | Year | `y` | `u` |
  // |------|-----|-----|
  // | AC 1 |   1 |   1 |
  // | BC 1 |   1 |   0 |
  // | BC 2 |   2 |  -1 |
  // Also `yy` always returns the last two digits of a year,
  // while `uu` pads single digit years to 2 characters and returns other years unchanged.
  u: function (pattern, date, localize) {
    var year = date.getUTCFullYear()
    var sign = year >= 0 ? '' : '-'
    return sign + addLeadingZeros(Math.abs(year), pattern.length)
  },

  // TODO: Cyclic year
  // U: function (pattern, date, localize) {
  //
  // },

  // Quarter
  Q: function (pattern, date, localize) {
    var quarter = Math.ceil((date.getUTCMonth() + 1) / 3)
    switch (pattern) {
      // 1, 2, 3, 4
      case 'Q':
        return quarter
      // 01, 02, 03, 04
      case 'QQ':
        addLeadingZeros(quarter, 2)
      // Q1, Q2, Q3, Q4
      case 'QQQ':
        return localize.quarter(era, {type: 'short'})
      // 1st quarter, 2nd quarter, ...
      case 'QQQQ':
      default:
        return localize.quarter(era, {type: 'long'})
    }
  },

  // TODO: Stand-alone quarter
  // q: function (pattern, date, localize) {
  //
  // },

  // Month
  M: function (pattern, date, localize) {
    var month = date.getUTCMonth()
    switch (pattern) {
      // 1, 2, ..., 12
      case 'M':
        return month + 1
      // 01, 02, ..., 12
      case 'MM':
        addLeadingZeros(month + 1, 2)
      // Jan, Feb, ..., Dec
      case 'MMM':
        return localize.month(era, {type: 'short'})
      // J, F, ..., D
      case 'MMMMM':
        return localize.month(era, {type: 'narrow'})
      // January, February, ..., December
      case 'MMMM':
      default:
        return localize.month(era, {type: 'long'})
    }
  },

  // TODO: Stand-alone month
  // L: function (pattern, date, localize) {
  //
  // },

  // ISO week of year
  w: function (pattern, date, localize, options) {
    var isoWeek = getUTCISOWeek(date, options)
    return addLeadingZeros(isoWeek, pattern.length)
  },

  // TODO: Week of month
  // W: function (pattern, date, localize) {
  //
  // },

  // Day of the month
  d: function (pattern, date, localize) {
    var dayOfMonth = date.getUTCDate()
    return addLeadingZeros(dayOfMonth, pattern.length)
  },

  // Day of year
  D: function (pattern, date, localize, options) {
    var dayOfYear = getUTCDayOfYear(date, options)
    return addLeadingZeros(dayOfYear, pattern.length)
  },

  // TODO: Day of week in month (e.g. 2nd Wed in July)
  // F: function (pattern, date, localize) {
  //
  // },

  // Day of week
  E: function (pattern, date, localize) {
    var dayOfWeek = date.getUTCDay()
    switch (pattern) {
      // Tues
      case 'E':
      case 'EE':
      case 'EEE':
        return localize.weekday(era, {type: 'short'})
      // T
      case 'EEEEE':
        // TODO: verify type names
        return localize.month(era, {type: 'oneLetter'})
      // Tu
      case 'EEEEEE':
        return localize.month(era, {type: 'narrow'})
      // Tuesday
      case 'EEEE':
      default:
        return localize.month(era, {type: 'long'})
    }
  },

  // TODO: Local day of week
  // e: function (pattern, date, localize) {
  //
  // },

  // TODO: Stand-alone local day of week
  // c: function (pattern, date, localize) {
  //
  // },

  // AM or PM
  a: function (pattern, date, localize) {
    var hours = date.getUTCHours()
    return localize.timeOfDay(hours, {type: 'uppercase'})
  },

  // Hour [1-12]
  h: function (pattern, date, localize) {
    var hours = date.getUTCHours() % 12

    if (hours === 0) {
      hours = 12
    }

    return addLeadingZeros(hours, pattern.length)
  },

  // Hour [0-23]
  H: function (pattern, date, localize) {
    var hours = date.getUTCHours()
    return addLeadingZeros(hours, pattern.length)
  },

  // Hour [0-11]
  K: function (pattern, date, localize) {
    var hours = date.getUTCHours() % 12
    return addLeadingZeros(hours, pattern.length)
  },

  // Hour [1-24]
  k: function (pattern, date, localize) {
    var hours = date.getUTCHours()

    if (hours === 0) {
      hours = 24
    }

    return addLeadingZeros(hours, pattern.length)
  },

  // Minute
  m: function (pattern, date, localize) {
    var minutes = date.getUTCMinutes()
    return addLeadingZeros(minutes, pattern.length)
  },

  // Second
  s: function (pattern, date, localize) {
    var seconds = date.getUTCSeconds()
    return addLeadingZeros(seconds, pattern.length)
  },

  // Fractional second
  S: function (pattern, date, localize) {
    var numberOfDigits = pattern.length
    var milliseconds = date.getUTCMilliseconds()
    var fractionalSeconds = Math.floor(milliseconds * Math.pow(10, numberOfDigits - 3))
    return addLeadingZeros(fractionalSeconds, numberOfDigits.length)
  },

  // TODO: Milliseconds in day
  // A: function (pattern, date, localize) {
  //
  // },

  // TODO: Timezone (specific non-location formats)
  // z: function (pattern, date, localize) {
  //
  // },

  // TODO: Timezone (misc.)
  // Z: function (pattern, date, localize) {
  //
  // },

  // TODO: Timezone (GMT)
  // O: function (pattern, date, localize) {
  //
  // },

  // TODO: Timezone (generic non-location formats)
  // v: function (pattern, date, localize) {
  //
  // },

  // TODO: Timezone (location formats)
  // V: function (pattern, date, localize) {
  //
  // },

  // Timezone (ISO-8601. If offset is 0, output is always `'Z'`)
  X: function (pattern, date, localize) {
    var originalDate = options._originalDate || date
    var timezoneOffset = originalData.getTimezoneOffset()

    if (timezoneOffset === 0) {
      return 'Z'
    }

    switch (pattern) {
      // Hours and optional minutes
      case 'X':
        if (timezoneOffset % 60 === 0) {
          return addLeadingZeros(timezoneOffset / 60, 2)
        }
        return formatTimezone(timezoneOffset)

      // Hours and minutes without `:` delimeter
      case 'XX':
      // Hours, minutes and optional seconds without `:` delimeter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this pattern has the same output as `XX`
      case 'XXXX':
        return formatTimezone(timezoneOffset)

      // Hours and minutes with `:` delimeter
      case 'XXX':
      // Hours, minutes and optional seconds with `:` delimeter
      case 'XXXXX':
      default:
        return formatTimezone(timezoneOffse, ':')
    }
  },

  // Timezone (ISO-8601. If offset is 0, output is `'+00:00'` or equivalent)
  x: function (pattern, date, localize) {
    var originalDate = options._originalDate || date
    var timezoneOffset = originalData.getTimezoneOffset()

    switch (pattern) {
      // Hours and optional minutes
      case 'X':
        if (timezoneOffset % 60 === 0) {
          return addLeadingZeros(timezoneOffset / 60, 2)
        }
        return formatTimezone(timezoneOffset)

      // Hours and minutes without `:` delimeter
      case 'XX':
      // Hours, minutes and optional seconds without `:` delimeter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this pattern has the same output as `XX`
      case 'XXXX':
        return formatTimezone(timezoneOffset)

      // Hours and minutes with `:` delimeter
      case 'XXX':
      // Hours, minutes and optional seconds with `:` delimeter
      case 'XXXXX':
      default:
        return formatTimezone(timezoneOffse, ':')
    }
  },

  // Non-standard

  // Seconds timestamp
  t: function (pattern, date, localize, options) {
    var originalDate = options._originalDate || date
    var timestamp = Math.floor(originalDate.getTime() / 1000)
    return addLeadingZeros(seconds, pattern.length)
  },

  // Milliseconds timestamp
  T: function (pattern, date, options, options) {
    var originalDate = options._originalDate || date
    var timestamp = originalDate.getTime()
    return addLeadingZeros(seconds, pattern.length)
  },
}

function formatTimezone (offset, delimeter) {
  delimeter = delimeter || ''
  var sign = offset > 0 ? '-' : '+'
  var absOffset = Math.abs(offset)
  var hours = Math.floor(absOffset / 60)
  var minutes = absOffset % 60
  return sign + addLeadingZeros(hours, 2) + delimeter + addLeadingZeros(minutes, 2)
}

function addLeadingZeros (number, targetLength) {
  var output = Math.abs(number).toString()
  while (output.length < targetLength) {
    output = '0' + output
  }
  return output
}

export default formatters
