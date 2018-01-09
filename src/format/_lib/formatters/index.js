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
 * |  l* | (nothing - deprecated)         |  L  | Stand-alone month            |
 * |  m  | Minute                         |  M  | Month                        |
 * |  n  |                                |  N  |                              |
 * |  o! | Ordinal number modifier        |  O* | Timezone (GMT)               |
 * |  p  |                                |  P  |                              |
 * |  q  | Stand-alone quarter            |  Q  | Quarter                      |
 * |  r  |                                |  R  |                              |
 * |  s  | Second                         |  S  | Fractional second            |
 * |  t! | Seconds timestamp              |  T! | Milliseconds timestamp       |
 * |  u  | Extended year                  |  U* | Cyclic year                  |
 * |  v* | Timezone (generic non-locat.)  |  V* | Timezone (location)          |
 * |  w  | ISO week of year               |  W* | Week of month                |
 * |  x  | Timezone (ISO-8601 w/o Z)      |  X  | Timezone (ISO-8601)          |
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
    switch (pattern.length) {
      // AD, BC
      case 1:
      case 2:
      case 3:
        return localize.era(era, {width: 'abbreviated'})
      // A, B
      case 5:
        return localize.era(era, {width: 'narrow'})
      // Anno Domini, Before Christ
      case 4:
      default:
        return localize.era(era, {width: 'wide'})
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
      var twoDigitYear = year % 100
      return localize.number(twoDigitYear, {
        leadingZeros: 2,
        ordinal: options.ordinal,
        unit: 'year'
      })
    }

    // Padding
    return localize.number(year, {
      leadingZeros: pattern.length,
      ordinal: options.ordinal,
      unit: 'year'
    })
  },

  // ISO week-numbering year
  Y: function (pattern, date, localize, options) {
    var signedISOWeekYear = getUTCISOWeekYear(date, options)

    // Returns 1 for 1 BC (which is year 0 in JavaScript)
    var isoWeekYear = signedISOWeekYear > 0 ? signedISOWeekYear : 1 - signedISOWeekYear

    // Two digit year
    if (pattern.length === 2) {
      var twoDigitYear = isoWeekYear % 100
      return localize.number(twoDigitYear, {
        leadingZeros: 2,
        ordinal: options.ordinal,
        unit: 'year'
      })
    }

    // Padding
    return localize.number(isoWeekYear, {
      leadingZeros: pattern.length,
      ordinal: options.ordinal,
      unit: 'year'
    })
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
  u: function (pattern, date, localize, options) {
    var year = date.getUTCFullYear()
    return localize.number(year, {
      leadingZeros: pattern.length,
      ordinal: options.ordinal,
      unit: 'year'
    })
  },

  // TODO: Cyclic year
  // U: function (pattern, date, localize) {
  //
  // },

  // Quarter
  Q: function (pattern, date, localize) {
    var quarter = Math.ceil((date.getUTCMonth() + 1) / 3)
    switch (pattern.length) {
      // 1, 2, 3, 4
      case 1:
      // 01, 02, 03, 04
      case 2:
        return localize.number(quarter, {
          leadingZeros: pattern.length,
          ordinal: options.ordinal,
          unit: 'quarter'
        })
      // Q1, Q2, Q3, Q4
      case 3:
        return localize.quarter(quarter, {width: 'abbreviated', context: 'formatting'})
      // 1st quarter, 2nd quarter, ...
      case 4:
      default:
        return localize.quarter(quarter, {width: 'wide', context: 'formatting'})
    }
  },

  // Stand-alone quarter
  q: function (pattern, date, localize) {
    var quarter = Math.ceil((date.getUTCMonth() + 1) / 3)
    switch (pattern.length) {
      // 1, 2, 3, 4
      case 1:
      // 01, 02, 03, 04
      case 2:
        return localize.number(quarter, {
          leadingZeros: pattern.length,
          ordinal: options.ordinal,
          unit: 'quarter'
        })
      // Q1, Q2, Q3, Q4
      case 3:
        return localize.quarter(quarter, {width: 'abbreviated', context: 'standalone'})
      // 1st quarter, 2nd quarter, ...
      case 4:
      default:
        return localize.quarter(quarter, {width: 'wide', context: 'standalone'})
    }
  },

  // Month
  M: function (pattern, date, localize) {
    var month = date.getUTCMonth()
    switch (pattern.length) {
      // 1, 2, ..., 12
      case 1:
      // 01, 02, ..., 12
      case 2:
        return localize.number(month + 1, {
          leadingZeros: pattern.length,
          ordinal: options.ordinal,
          unit: 'month'
        })
      // Jan, Feb, ..., Dec
      case 3:
        return localize.month(month, {width: 'abbreviated', context: 'formatting'})
      // J, F, ..., D
      case 5:
        return localize.month(month, {width: 'narrow', context: 'formatting'})
      // January, February, ..., December
      case 4:
      default:
        return localize.month(month, {width: 'wide', context: 'formatting'})
    }
  },

  // Stand-alone month
  L: function (pattern, date, localize) {
    var month = date.getUTCMonth()
    switch (pattern.length) {
      // 1, 2, ..., 12
      case 1:
      // 01, 02, ..., 12
      case 2:
        return localize.number(month + 1, {
          leadingZeros: pattern.length,
          ordinal: options.ordinal,
          unit: 'month'
        })
      // Jan, Feb, ..., Dec
      case 3:
        return localize.month(month, {width: 'abbreviated', context: 'standalone'})
      // J, F, ..., D
      case 5:
        return localize.month(month, {width: 'narrow', context: 'standalone'})
      // January, February, ..., December
      case 4:
      default:
        return localize.month(month, {width: 'wide', context: 'standalone'})
    }
  },

  // ISO week of year
  w: function (pattern, date, localize, options) {
    var isoWeek = getUTCISOWeek(date, options)
    return localize.number(isoWeek, {
      leadingZeros: pattern.length,
      ordinal: options.ordinal,
      unit: 'week'
    })
  },

  // TODO: Week of month
  // W: function (pattern, date, localize) {
  //
  // },

  // Day of the month
  d: function (pattern, date, localize) {
    var dayOfMonth = date.getUTCDate()
    return localize.number(dayOfMonth, {
      leadingZeros: pattern.length,
      ordinal: options.ordinal,
      unit: 'date'
    })
  },

  // Day of year
  D: function (pattern, date, localize, options) {
    var dayOfYear = getUTCDayOfYear(date, options)
    return localize.number(dayOfYear, {
      leadingZeros: pattern.length,
      ordinal: options.ordinal,
      unit: 'dayOfYear'
    })
  },

  // TODO: Day of week in month (e.g. 2nd Wed in July)
  // F: function (pattern, date, localize) {
  //
  // },

  // Day of week
  E: function (pattern, date, localize) {
    var dayOfWeek = date.getUTCDay()
    switch (pattern.length) {
      // TODO: ISO day of week
      case 1:
      case 2:
      // Tue
      case 3:
        return localize.day(dayOfWeek, {width: 'abbreviated', context: 'formatting'})
      // T
      case 5:
        return localize.day(dayOfWeek, {width: 'narrow', context: 'formatting'})
      // Tu
      case 6:
        return localize.day(dayOfWeek, {width: 'short', context: 'formatting'})
      // Tuesday
      case 4:
      default:
        return localize.day(dayOfWeek, {width: 'wide', context: 'formatting'})
    }
  },

  // TODO: Local day of week
  // e: function (pattern, date, localize) {
  //
  // },

  // Stand-alone local day of week
  c: function (pattern, date, localize) {
    var dayOfWeek = date.getUTCDay()
    switch (pattern.length) {
      // Numerical value (same as in `e`)
      case 1:
      case 2:
        // TODO: implement
        return 'TODO'
      case 3:
        return localize.day(dayOfWeek, {width: 'abbreviated', context: 'standalone'})
      // T
      case 5:
        // TODO: verify type names
        return localize.day(dayOfWeek, {width: 'narrow', context: 'standalone'})
      // Tu
      case 6:
        return localize.day(dayOfWeek, {width: 'short', context: 'standalone'})
      // Tuesday
      case 4:
      default:
        return localize.day(dayOfWeek, {width: 'wide', context: 'standalone'})
    }
  },

  // AM or PM
  a: function (pattern, date, localize) {
    var hours = date.getUTCHours()
    return localize.timeOfDay(hours, {width: 'narrow'})
  },

  // Hour [1-12]
  h: function (pattern, date, localize) {
    var hours = date.getUTCHours() % 12

    if (hours === 0) {
      hours = 12
    }

    return localize.number(hours, {
      leadingZeros: pattern.length,
      ordinal: options.ordinal,
      unit: 'hours'
    })
  },

  // Hour [0-23]
  H: function (pattern, date, localize) {
    var hours = date.getUTCHours()
    return localize.number(hours, {
      leadingZeros: pattern.length,
      ordinal: options.ordinal,
      unit: 'hours'
    })
  },

  // Hour [0-11]
  K: function (pattern, date, localize) {
    var hours = date.getUTCHours() % 12
    return localize.number(hours, {
      leadingZeros: pattern.length,
      ordinal: options.ordinal,
      unit: 'hours'
    })
  },

  // Hour [1-24]
  k: function (pattern, date, localize) {
    var hours = date.getUTCHours()

    if (hours === 0) {
      hours = 24
    }

    return localize.number(hours, {
      leadingZeros: pattern.length,
      ordinal: options.ordinal,
      unit: 'hours'
    })
  },

  // Minute
  m: function (pattern, date, localize) {
    var minutes = date.getUTCMinutes()
    return localize.number(minutes, {
      leadingZeros: pattern.length,
      ordinal: options.ordinal,
      unit: 'minutes'
    })
  },

  // Second
  s: function (pattern, date, localize) {
    var seconds = date.getUTCSeconds()
    return localize.number(seconds, {
      leadingZeros: pattern.length,
      ordinal: options.ordinal,
      unit: 'seconds'
    })
  },

  // Fractional second
  S: function (pattern, date, localize) {
    var numberOfDigits = pattern.length
    var milliseconds = date.getUTCMilliseconds()
    var fractionalSeconds = Math.floor(milliseconds * Math.pow(10, numberOfDigits - 3))
    return localize.number(fractionalSeconds, {
      leadingZeros: numberOfDigits,
      ordinal: options.ordinal,
      unit: 'fractionalSeconds'
    })
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
  X: function (pattern, date, localize, options) {
    var originalDate = options._originalDate || date
    var timezoneOffset = originalData.getTimezoneOffset()

    if (timezoneOffset === 0) {
      return 'Z'
    }

    switch (pattern.length) {
      // Hours and optional minutes
      case 1:
        if (timezoneOffset % 60 === 0) {
          return localize.number(timezoneOffset / 60, {
            leadingZeros: 2
          })
        }
        return formatTimezone(timezoneOffset, localize)

      // Hours and minutes without `:` delimeter
      case 2:
      // Hours, minutes and optional seconds without `:` delimeter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this pattern always has the same output as `XX`
      case 4:
        return formatTimezone(timezoneOffset, localize)

      // Hours and minutes with `:` delimeter
      case 3:
      // Hours, minutes and optional seconds with `:` delimeter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this pattern always has the same output as `XXX`
      case 5:
      default:
        return formatTimezone(timezoneOffset, localize, {delimeter: ':'})
    }
  },

  // Timezone (ISO-8601. If offset is 0, output is `'+00:00'` or equivalent)
  x: function (pattern, date, localize) {
    var originalDate = options._originalDate || date
    var timezoneOffset = originalData.getTimezoneOffset()

    switch (pattern.length) {
      // Hours and optional minutes
      case 1:
        if (timezoneOffset % 60 === 0) {
          return localize.number(timezoneOffset / 60, {
            leadingZeros: 2
          })
        }
        return formatTimezone(timezoneOffset, localize)

      // Hours and minutes without `:` delimeter
      case 2:
      // Hours, minutes and optional seconds without `:` delimeter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this pattern always has the same output as `xx`
      case 4:
        return formatTimezone(timezoneOffset, localize)

      // Hours and minutes with `:` delimeter
      case 3:
      // Hours, minutes and optional seconds with `:` delimeter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this pattern always has the same output as `xxx`
      case 5:
      default:
        return formatTimezone(timezoneOffset, localize, {delimeter: ':'})
    }
  },

  // Non-standard

  // Seconds timestamp
  t: function (pattern, date, localize, options) {
    var originalDate = options._originalDate || date
    var timestamp = Math.floor(originalDate.getTime() / 1000)
    return localize.number(timestamp, {leadingZeros: pattern.length})
  },

  // Milliseconds timestamp
  T: function (pattern, date, options, options) {
    var originalDate = options._originalDate || date
    var timestamp = originalDate.getTime()
    return localize.number(timestamp, {leadingZeros: pattern.length})
  },
}

function formatTimezone (offset, localize, dirtyOptions) {
  var options = dirtyOptions || {}
  var delimeter = options.delimeter || ''
  var sign = offset > 0 ? '-' : '+'
  var absOffset = Math.abs(offset)
  var hours = localize.number(Math.floor(absOffset / 60), {leadingZeros: 2})
  var minutes = localize.number(absOffset % 60, {leadingZeros: 2})
  return sign + hours + delimeter + minutes
}

export default formatters
