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
 * |  k* | Hour [1-24]                    |  K* | Hour [0-11]                  |
 * |  l* | (nothing - deprecated)         |  L* | Stand-alone month            |
 * |  m  | Minute                         |  M  | Month                        |
 * |  n  |                                |  N  |                              |
 * |  o  |                                |  O* | Timezone (GMT)               |
 * |  p  |                                |  P  |                              |
 * |  q* | Stand-alone quarter            |  Q  | Quarter                      |
 * |  r  |                                |  R  |                              |
 * |  s  | Second                         |  S  | Fractional second            |
 * |  t  |                                |  T  |                              |
 * |  u  | Extended year                  |  U* | Cyclic year                  |
 * |  v* | Timezone (generic non-locat.)  |  V* | Timezone (location)          |
 * |  w  | Week of year                   |  W* | Week of month                |
 * |  x  | Timezone (ISO-8601 w/o Z)      |  X* | Timezone (ISO-8601)          |
 * |  y  | Year (abs)                     |  Y  | ISO week year                |
 * |  z* | Timezone (specific non-locat.) |  Z* | Timezone (aliases)           |
 *
 * Letters marked by * are not implemented but reserved by Unicode standard
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
  y: function (pattern, date, localize) {
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
  // TODO: could be locale specific week-numbering year instead of ISO 8601 week year
  Y: function (pattern, date, localize) {
    var isoWeekYear = getUTCISOWeekYear(date)

    // Two digit year
    if (pattern.length === 2) {
      return addLeadingZeros(isoWeekYear, 4).substr(2)
    }

    // Padding
    return addLeadingZeros(isoWeekYear, pattern.length)
  },

  // Extended year. This is a single number designating the year of this calendar system.
  // The main difference between `y` and `u` localizers are B.C. years:
  // | Year |  y |  u |
  // |------|----|----|
  // | AC 1 |  1 |  1 |
  // | BC 1 |  1 |  0 |
  // | BC 2 |  2 | -1 |
  // Also `yy` always returns two digits, while `uu` pads single digit years
  // to 2 characters and returns other years unchanged.
  u: function (pattern, date, localize) {
    var year = date.getUTCFullYear()
    var sign = year >= 0 ? '' : '-'
    return sign + addLeadingZeros(Math.abs(year), pattern.length)
  },

  // TODO: `U` - cyclic year

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

  // TODO: `q` - stand-alone quarter

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
      case 'GGGGG':
        return localize.month(era, {type: 'narrow'})
      // January, February, ..., December
      case 'MMMM':
      default:
        return localize.month(era, {type: 'long'})
    }
  },

  // TODO: `L` - stand-alone month

  // ISO week
  // TODO: could be locale specific week instead of ISO 8601 week
  w: function (pattern, date, localize) {
    var isoWeek = getUTCISOWeek(date)
    return addLeadingZeros(isoWeek, pattern.length)
  },

  // TODO: `W` - week of month

  // Day of the month
  d: function (pattern, date, localize) {
    var dayOfMonth = date.getUTCDate()
    return addLeadingZeros(dayOfMonth, pattern.length)
  },

  // Day of year
  D: function (pattern, date, localize) {
    var dayOfYear = getUTCDayOfYear(date)
    return addLeadingZeros(dayOfYear, pattern.length)
  },

  // TODO: `F` - day of week in month (e.g. 2nd Wed in July)
}

var formatters = {
  // Month: 1, 2, ..., 12
  'M': function (date) {
    return date.getUTCMonth() + 1
  },

  // Month: 1st, 2nd, ..., 12th
  'Mo': function (date, options) {
    var month = date.getUTCMonth() + 1
    return options.locale.localize.ordinalNumber(month, {unit: 'month'})
  },

  // Month: 01, 02, ..., 12
  'MM': function (date) {
    return addLeadingZeros(date.getUTCMonth() + 1, 2)
  },

  // Month: Jan, Feb, ..., Dec
  'MMM': function (date, options) {
    return options.locale.localize.month(date.getUTCMonth(), {type: 'short'})
  },

  // Month: January, February, ..., December
  'MMMM': function (date, options) {
    return options.locale.localize.month(date.getUTCMonth(), {type: 'long'})
  },

  // Quarter: 1, 2, 3, 4
  'Q': function (date) {
    return Math.ceil((date.getUTCMonth() + 1) / 3)
  },

  // Quarter: 1st, 2nd, 3rd, 4th
  'Qo': function (date, options) {
    var quarter = Math.ceil((date.getUTCMonth() + 1) / 3)
    return options.locale.localize.ordinalNumber(quarter, {unit: 'quarter'})
  },

  // Day of month: 1, 2, ..., 31
  'D': function (date) {
    return date.getUTCDate()
  },

  // Day of month: 1st, 2nd, ..., 31st
  'Do': function (date, options) {
    return options.locale.localize.ordinalNumber(date.getUTCDate(), {unit: 'dayOfMonth'})
  },

  // Day of month: 01, 02, ..., 31
  'DD': function (date) {
    return addLeadingZeros(date.getUTCDate(), 2)
  },

  // Day of year: 1, 2, ..., 366
  'DDD': function (date) {
    return getUTCDayOfYear(date)
  },

  // Day of year: 1st, 2nd, ..., 366th
  'DDDo': function (date, options) {
    return options.locale.localize.ordinalNumber(getUTCDayOfYear(date), {unit: 'dayOfYear'})
  },

  // Day of year: 001, 002, ..., 366
  'DDDD': function (date) {
    return addLeadingZeros(getUTCDayOfYear(date), 3)
  },

  // Day of week: Su, Mo, ..., Sa
  'dd': function (date, options) {
    return options.locale.localize.weekday(date.getUTCDay(), {type: 'narrow'})
  },

  // Day of week: Sun, Mon, ..., Sat
  'ddd': function (date, options) {
    return options.locale.localize.weekday(date.getUTCDay(), {type: 'short'})
  },

  // Day of week: Sunday, Monday, ..., Saturday
  'dddd': function (date, options) {
    return options.locale.localize.weekday(date.getUTCDay(), {type: 'long'})
  },

  // Day of week: 0, 1, ..., 6
  'd': function (date) {
    return date.getUTCDay()
  },

  // Day of week: 0th, 1st, 2nd, ..., 6th
  'do': function (date, options) {
    return options.locale.localize.ordinalNumber(date.getUTCDay(), {unit: 'dayOfWeek'})
  },

  // Day of ISO week: 1, 2, ..., 7
  'E': function (date) {
    return date.getUTCDay() || 7
  },

  // ISO week: 1, 2, ..., 53
  'W': function (date) {
    return getUTCISOWeek(date)
  },

  // ISO week: 1st, 2nd, ..., 53th
  'Wo': function (date, options) {
    return options.locale.localize.ordinalNumber(getUTCISOWeek(date), {unit: 'isoWeek'})
  },

  // ISO week: 01, 02, ..., 53
  'WW': function (date) {
    return addLeadingZeros(getUTCISOWeek(date), 2)
  },

  // Hour: 0, 1, ... 23
  'H': function (date) {
    return date.getUTCHours()
  },

  // Hour: 00, 01, ..., 23
  'HH': function (date) {
    return addLeadingZeros(date.getUTCHours(), 2)
  },

  // Hour: 1, 2, ..., 12
  'h': function (date) {
    var hours = date.getUTCHours()
    if (hours === 0) {
      return 12
    } else if (hours > 12) {
      return hours % 12
    } else {
      return hours
    }
  },

  // Hour: 01, 02, ..., 12
  'hh': function (date) {
    return addLeadingZeros(formatters['h'](date), 2)
  },

  // Minute: 0, 1, ..., 59
  'm': function (date) {
    return date.getUTCMinutes()
  },

  // Minute: 00, 01, ..., 59
  'mm': function (date) {
    return addLeadingZeros(date.getUTCMinutes(), 2)
  },

  // Second: 0, 1, ..., 59
  's': function (date) {
    return date.getUTCSeconds()
  },

  // Second: 00, 01, ..., 59
  'ss': function (date) {
    return addLeadingZeros(date.getUTCSeconds(), 2)
  },

  // 1/10 of second: 0, 1, ..., 9
  'S': function (date) {
    return Math.floor(date.getUTCMilliseconds() / 100)
  },

  // 1/100 of second: 00, 01, ..., 99
  'SS': function (date) {
    return addLeadingZeros(Math.floor(date.getUTCMilliseconds() / 10), 2)
  },

  // Millisecond: 000, 001, ..., 999
  'SSS': function (date) {
    return addLeadingZeros(date.getUTCMilliseconds(), 3)
  },

  // Timezone: -01:00, +00:00, ... +12:00
  'Z': function (date, options) {
    var originalDate = options._originalDate || date
    return formatTimezone(originalDate.getTimezoneOffset(), ':')
  },

  // Timezone: -0100, +0000, ... +1200
  'ZZ': function (date, options) {
    var originalDate = options._originalDate || date
    return formatTimezone(originalDate.getTimezoneOffset())
  },

  // Seconds timestamp: 512969520
  'X': function (date, options) {
    var originalDate = options._originalDate || date
    return Math.floor(originalDate.getTime() / 1000)
  },

  // Milliseconds timestamp: 512969520900
  'x': function (date, options) {
    var originalDate = options._originalDate || date
    return originalDate.getTime()
  },

  // AM, PM
  'A': function (date, options) {
    return options.locale.localize.timeOfDay(date.getUTCHours(), {type: 'uppercase'})
  },

  // am, pm
  'a': function (date, options) {
    return options.locale.localize.timeOfDay(date.getUTCHours(), {type: 'lowercase'})
  },

  // a.m., p.m.
  'aa': function (date, options) {
    return options.locale.localize.timeOfDay(date.getUTCHours(), {type: 'long'})
  }
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
