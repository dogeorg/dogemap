/**
 * d3-hexgrid plugin v0.3.0. https://github.com/larsvers/d3-hexgrid.git.
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.d3 = {})));
}(this, (function (exports) { 'use strict';

  function ascending(a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }

  function bisector(compare) {
    if (compare.length === 1) compare = ascendingComparator(compare);
    return {
      left: function(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        while (lo < hi) {
          var mid = lo + hi >>> 1;
          if (compare(a[mid], x) < 0) lo = mid + 1;
          else hi = mid;
        }
        return lo;
      },
      right: function(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        while (lo < hi) {
          var mid = lo + hi >>> 1;
          if (compare(a[mid], x) > 0) hi = mid;
          else lo = mid + 1;
        }
        return lo;
      }
    };
  }

  function ascendingComparator(f) {
    return function(d, x) {
      return ascending(f(d), x);
    };
  }

  var ascendingBisect = bisector(ascending);

  function number(x) {
    return x === null ? NaN : +x;
  }

  function extent(values, valueof) {
    var n = values.length,
        i = -1,
        value,
        min,
        max;

    if (valueof == null) {
      while (++i < n) { // Find the first comparable value.
        if ((value = values[i]) != null && value >= value) {
          min = max = value;
          while (++i < n) { // Compare the remaining values.
            if ((value = values[i]) != null) {
              if (min > value) min = value;
              if (max < value) max = value;
            }
          }
        }
      }
    }

    else {
      while (++i < n) { // Find the first comparable value.
        if ((value = valueof(values[i], i, values)) != null && value >= value) {
          min = max = value;
          while (++i < n) { // Compare the remaining values.
            if ((value = valueof(values[i], i, values)) != null) {
              if (min > value) min = value;
              if (max < value) max = value;
            }
          }
        }
      }
    }

    return [min, max];
  }

  function quantile(values, p, valueof) {
    if (valueof == null) valueof = number;
    if (!(n = values.length)) return;
    if ((p = +p) <= 0 || n < 2) return +valueof(values[0], 0, values);
    if (p >= 1) return +valueof(values[n - 1], n - 1, values);
    var n,
        i = (n - 1) * p,
        i0 = Math.floor(i),
        value0 = +valueof(values[i0], i0, values),
        value1 = +valueof(values[i0 + 1], i0 + 1, values);
    return value0 + (value1 - value0) * (i - i0);
  }

  /**
   * Checks and if required converts the 1D extent to a 2D extent.
   * @param {Array} userExtent  Either the full 2D extent or just width and height.
   * @return                    The full 2D extent.
   */
  function expandExtent(userExtent) {
    var nestedArrayLength = Array.from(new Set(userExtent.map(function (e) {
      return e.length;
    })))[0];
    var extentLong = Array(2);

    if (nestedArrayLength === 2) {
      extentLong = userExtent;
    } else if (nestedArrayLength === undefined) {
      extentLong = [[0, 0], userExtent];
    } else {
      throw new Error("Check 'extent' is in the anticipated form [[x0,y0],[x1,y1]] or [x1,y1]");
    }

    return extentLong;
  }

  /**
   * Checks and sets given value to greater than 0.
   * @param  {number} v       Value.
   * @param  {string} name    Value name.
   * @return {number}         Value.
   */
  function convertToMin(v, name, min$$1) {
    if (v >= min$$1) {
      return v;
    }
    console.warn(name + ' should be ' + min$$1 + ' or greater. Coerced to ' + min$$1 + '.');
    return min$$1;
  }

  /**
   * Produce corner points for a pointy hexagon.
   * @param  {Object} center Hexagon center position.
   * @param  {number} r      Radius of hexagon.
   * @param  {number} i      Index of point to calculate.
   * @return {Object}        Hexagon corner position.
   */
  function pointyHexCorner(center, r, i) {
    var point = {};
    var angleDegree = 60 * i - 30;
    var angleRadian = Math.PI / 180 * angleDegree;
    point.x = center.x + r * Math.cos(angleRadian);
    point.y = center.y + r * Math.sin(angleRadian);
    return point;
  }

  /**
   * Draw a hexagon.
   * @param  {Object} context The canvas context.
   * @param  {Object} corners Hexagon corner positions.
   * @param  {String} action  'fill' or 'stroke'.
   * @param  {String} colour  Colour.
   * @return {[type]}         undefined
   */
  function hexDraw(context, corners, colour) {
    var action = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'fill';

    context.beginPath();
    corners.forEach(function (d) {
      d === 0 ? context.moveTo(d.x, d.y) : context.lineTo(d.x, d.y);
    });
    context.closePath();
    if (action === 'fill') {
      context.fillStyle = colour;
      context.fill();
    } else if (action === 'stroke') {
      context.strokeStyle = colour;
      context.stroke();
    } else {
      throw new Error("hexDraw action needs to be either 'fill' or 'stroke'");
    }
  }

  /**
   * Calculates the circle radius in pixel, given a circle polygon.
   * @param   {Object}    geoCirclePolygon  The circle polygon.
   * @param   {function}  projection        The D3 projection function.
   * @return  {number}                      The radius in pixel.
   */
  function getPixelRadius(geoCirclePolygon, projection) {
    // Get radius in pixel.
    var circleDataGeo = geoCirclePolygon.coordinates[0];
    var circleDataY = circleDataGeo.map(function (d) {
      return projection(d)[1];
    });
    var circleDiameter = extent(circleDataY);
    var radiusPixel = (circleDiameter[1] - circleDiameter[0]) / 2;

    return radiusPixel;
  }

  // Adds floating point numbers with twice the normal precision.
  // Reference: J. R. Shewchuk, Adaptive Precision Floating-Point Arithmetic and
  // Fast Robust Geometric Predicates, Discrete & Computational Geometry 18(3)
  // 305–363 (1997).
  // Code adapted from GeographicLib by Charles F. F. Karney,
  // http://geographiclib.sourceforge.net/

  function adder() {
    return new Adder;
  }

  function Adder() {
    this.reset();
  }

  Adder.prototype = {
    constructor: Adder,
    reset: function() {
      this.s = // rounded value
      this.t = 0; // exact error
    },
    add: function(y) {
      add(temp, y, this.t);
      add(this, temp.s, this.s);
      if (this.s) this.t += temp.t;
      else this.s = temp.t;
    },
    valueOf: function() {
      return this.s;
    }
  };

  var temp = new Adder;

  function add(adder, a, b) {
    var x = adder.s = a + b,
        bv = x - a,
        av = x - bv;
    adder.t = (a - av) + (b - bv);
  }

  var epsilon = 1e-6;
  var pi = Math.PI;
  var halfPi = pi / 2;
  var tau = pi * 2;

  var degrees = 180 / pi;
  var radians = pi / 180;
  var atan2 = Math.atan2;
  var cos = Math.cos;
  var sin = Math.sin;
  var sqrt = Math.sqrt;

  function acos(x) {
    return x > 1 ? 0 : x < -1 ? pi : Math.acos(x);
  }

  function asin(x) {
    return x > 1 ? halfPi : x < -1 ? -halfPi : Math.asin(x);
  }

  var areaRingSum = adder();

  var areaSum = adder();

  function spherical(cartesian) {
    return [atan2(cartesian[1], cartesian[0]), asin(cartesian[2])];
  }

  function cartesian(spherical) {
    var lambda = spherical[0], phi = spherical[1], cosPhi = cos(phi);
    return [cosPhi * cos(lambda), cosPhi * sin(lambda), sin(phi)];
  }

  // TODO return d
  function cartesianNormalizeInPlace(d) {
    var l = sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
    d[0] /= l, d[1] /= l, d[2] /= l;
  }

  var deltaSum = adder();

  function constant$1(x) {
    return function() {
      return x;
    };
  }

  function compose(a, b) {

    function compose(x, y) {
      return x = a(x, y), b(x[0], x[1]);
    }

    if (a.invert && b.invert) compose.invert = function(x, y) {
      return x = b.invert(x, y), x && a.invert(x[0], x[1]);
    };

    return compose;
  }

  function rotationIdentity(lambda, phi) {
    return [lambda > pi ? lambda - tau : lambda < -pi ? lambda + tau : lambda, phi];
  }

  rotationIdentity.invert = rotationIdentity;

  function rotateRadians(deltaLambda, deltaPhi, deltaGamma) {
    return (deltaLambda %= tau) ? (deltaPhi || deltaGamma ? compose(rotationLambda(deltaLambda), rotationPhiGamma(deltaPhi, deltaGamma))
      : rotationLambda(deltaLambda))
      : (deltaPhi || deltaGamma ? rotationPhiGamma(deltaPhi, deltaGamma)
      : rotationIdentity);
  }

  function forwardRotationLambda(deltaLambda) {
    return function(lambda, phi) {
      return lambda += deltaLambda, [lambda > pi ? lambda - tau : lambda < -pi ? lambda + tau : lambda, phi];
    };
  }

  function rotationLambda(deltaLambda) {
    var rotation = forwardRotationLambda(deltaLambda);
    rotation.invert = forwardRotationLambda(-deltaLambda);
    return rotation;
  }

  function rotationPhiGamma(deltaPhi, deltaGamma) {
    var cosDeltaPhi = cos(deltaPhi),
        sinDeltaPhi = sin(deltaPhi),
        cosDeltaGamma = cos(deltaGamma),
        sinDeltaGamma = sin(deltaGamma);

    function rotation(lambda, phi) {
      var cosPhi = cos(phi),
          x = cos(lambda) * cosPhi,
          y = sin(lambda) * cosPhi,
          z = sin(phi),
          k = z * cosDeltaPhi + x * sinDeltaPhi;
      return [
        atan2(y * cosDeltaGamma - k * sinDeltaGamma, x * cosDeltaPhi - z * sinDeltaPhi),
        asin(k * cosDeltaGamma + y * sinDeltaGamma)
      ];
    }

    rotation.invert = function(lambda, phi) {
      var cosPhi = cos(phi),
          x = cos(lambda) * cosPhi,
          y = sin(lambda) * cosPhi,
          z = sin(phi),
          k = z * cosDeltaGamma - y * sinDeltaGamma;
      return [
        atan2(y * cosDeltaGamma + z * sinDeltaGamma, x * cosDeltaPhi + k * sinDeltaPhi),
        asin(k * cosDeltaPhi - x * sinDeltaPhi)
      ];
    };

    return rotation;
  }

  // Generates a circle centered at [0°, 0°], with a given radius and precision.
  function circleStream(stream, radius, delta, direction, t0, t1) {
    if (!delta) return;
    var cosRadius = cos(radius),
        sinRadius = sin(radius),
        step = direction * delta;
    if (t0 == null) {
      t0 = radius + direction * tau;
      t1 = radius - step / 2;
    } else {
      t0 = circleRadius(cosRadius, t0);
      t1 = circleRadius(cosRadius, t1);
      if (direction > 0 ? t0 < t1 : t0 > t1) t0 += direction * tau;
    }
    for (var point, t = t0; direction > 0 ? t > t1 : t < t1; t -= step) {
      point = spherical([cosRadius, -sinRadius * cos(t), -sinRadius * sin(t)]);
      stream.point(point[0], point[1]);
    }
  }

  // Returns the signed angle of a cartesian point relative to [cosRadius, 0, 0].
  function circleRadius(cosRadius, point) {
    point = cartesian(point), point[0] -= cosRadius;
    cartesianNormalizeInPlace(point);
    var radius = acos(-point[1]);
    return ((-point[2] < 0 ? -radius : radius) + tau - epsilon) % tau;
  }

  function geoCircle() {
    var center = constant$1([0, 0]),
        radius = constant$1(90),
        precision = constant$1(6),
        ring,
        rotate,
        stream = {point: point};

    function point(x, y) {
      ring.push(x = rotate(x, y));
      x[0] *= degrees, x[1] *= degrees;
    }

    function circle() {
      var c = center.apply(this, arguments),
          r = radius.apply(this, arguments) * radians,
          p = precision.apply(this, arguments) * radians;
      ring = [];
      rotate = rotateRadians(-c[0] * radians, -c[1] * radians, 0).invert;
      circleStream(stream, r, p, 1);
      c = {type: "Polygon", coordinates: [ring]};
      ring = rotate = null;
      return c;
    }

    circle.center = function(_) {
      return arguments.length ? (center = typeof _ === "function" ? _ : constant$1([+_[0], +_[1]]), circle) : center;
    };

    circle.radius = function(_) {
      return arguments.length ? (radius = typeof _ === "function" ? _ : constant$1(+_), circle) : radius;
    };

    circle.precision = function(_) {
      return arguments.length ? (precision = typeof _ === "function" ? _ : constant$1(+_), circle) : precision;
    };

    return circle;
  }

  var sum$1 = adder();

  var lengthSum = adder();

  var areaSum$1 = adder(),
      areaRingSum$1 = adder();

  var lengthSum$1 = adder();

  /**
   * Sniffs the unit and converts to either "m" or "km".
   * @param   {string} unit The user given unit.
   * @return  {string}      The clean unit string.
   */
  function getUnitString(unit) {
    var unitLower = unit.toLowerCase();

    if (unitLower === 'm' || unitLower === 'km') {
      return unitLower;
    } else if (unitLower === 'kilometres' || unitLower === 'kilometre' || unitLower === 'kilometers' || unitLower === 'kilometer') {
      unitLower = 'km';
    } else if (unitLower === 'miles' || unitLower === 'mile') {
      unitLower = 'm';
    } else {
      throw new Error('Please provide the unit identifier as either "km" for kilometres or "m" for miles');
    }

    return unitLower;
  }

  /**
   *
   * @param   {number}    radiusDistance  The user given distance in either miles or km.
   * @param   {string}    distanceUnit    The user chosen distance unit (miles or km).
   * @param   {function}  projection      The D3 projection function.
   * @param   {Array}     center          The center coordinates of the drawing area.
   * @return  {Object}                    The geo circle, the radius in degrees and in pixel.
   */
  function convertUnitRadius (radiusDistance, distanceUnit, projection$$1, center) {
    // Get radius in degrees
    var unit = getUnitString(distanceUnit);
    var RADIUS_EARTH = unit === 'm' ? 3959 : 6371;
    var radiusRadians = radiusDistance / RADIUS_EARTH;
    var radiusDegrees = radiusRadians * (180 / Math.PI);

    // Get geo circle data.
    var circlePolygon = geoCircle().radius(radiusDegrees).center(projection$$1.invert(center));

    // Get radius in pixel.
    var radiusPixel = getPixelRadius(circlePolygon(), projection$$1);

    return { circlePolygon: circlePolygon, radiusDegrees: radiusDegrees, radiusPixel: radiusPixel };
  }

  var thirdPi = Math.PI / 3,
      angles = [0, thirdPi, 2 * thirdPi, 3 * thirdPi, 4 * thirdPi, 5 * thirdPi];

  function pointX(d) {
    return d[0];
  }

  function pointY(d) {
    return d[1];
  }

  function hexbin() {
    var x0 = 0,
        y0 = 0,
        x1 = 1,
        y1 = 1,
        x = pointX,
        y = pointY,
        r,
        dx,
        dy;

    function hexbin(points) {
      var binsById = {}, bins = [], i, n = points.length;

      for (i = 0; i < n; ++i) {
        if (isNaN(px = +x.call(null, point = points[i], i, points))
            || isNaN(py = +y.call(null, point, i, points))) continue;

        var point,
            px,
            py,
            pj = Math.round(py = py / dy),
            pi = Math.round(px = px / dx - (pj & 1) / 2),
            py1 = py - pj;

        if (Math.abs(py1) * 3 > 1) {
          var px1 = px - pi,
              pi2 = pi + (px < pi ? -1 : 1) / 2,
              pj2 = pj + (py < pj ? -1 : 1),
              px2 = px - pi2,
              py2 = py - pj2;
          if (px1 * px1 + py1 * py1 > px2 * px2 + py2 * py2) pi = pi2 + (pj & 1 ? 1 : -1) / 2, pj = pj2;
        }

        var id = pi + "-" + pj, bin = binsById[id];
        if (bin) bin.push(point);
        else {
          bins.push(bin = binsById[id] = [point]);
          bin.x = (pi + (pj & 1) / 2) * dx;
          bin.y = pj * dy;
        }
      }

      return bins;
    }

    function hexagon(radius) {
      var x0 = 0, y0 = 0;
      return angles.map(function(angle) {
        var x1 = Math.sin(angle) * radius,
            y1 = -Math.cos(angle) * radius,
            dx = x1 - x0,
            dy = y1 - y0;
        x0 = x1, y0 = y1;
        return [dx, dy];
      });
    }

    hexbin.hexagon = function(radius) {
      return "m" + hexagon(radius == null ? r : +radius).join("l") + "z";
    };

    hexbin.centers = function() {
      var centers = [],
          j = Math.round(y0 / dy),
          i = Math.round(x0 / dx);
      for (var y = j * dy; y < y1 + r; y += dy, ++j) {
        for (var x = i * dx + (j & 1) * dx / 2; x < x1 + dx / 2; x += dx) {
          centers.push([x, y]);
        }
      }
      return centers;
    };

    hexbin.mesh = function() {
      var fragment = hexagon(r).slice(0, 4).join("l");
      return hexbin.centers().map(function(p) { return "M" + p + "m" + fragment; }).join("");
    };

    hexbin.x = function(_) {
      return arguments.length ? (x = _, hexbin) : x;
    };

    hexbin.y = function(_) {
      return arguments.length ? (y = _, hexbin) : y;
    };

    hexbin.radius = function(_) {
      return arguments.length ? (r = +_, dx = r * 2 * Math.sin(thirdPi), dy = r * 1.5, hexbin) : r;
    };

    hexbin.size = function(_) {
      return arguments.length ? (x0 = y0 = 0, x1 = +_[0], y1 = +_[1], hexbin) : [x1 - x0, y1 - y0];
    };

    hexbin.extent = function(_) {
      return arguments.length ? (x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1], hexbin) : [[x0, y0], [x1, y1]];
    };

    return hexbin.radius(1);
  }

  /**
   * Configure the hexbin generator.
   * @param  {Array}    extent   Drawing area extent.
   * @param  {number}   radius   The desired hex radius.
   * @return {function}          Hexbin generator function.
   */
  function setHexGenerator (extent, radius) {
    // Set the hexbin generator. Note, x and y will
    // be set later when prepping the user data.
    // Also round radius to the nearest 0.5 step.
    return hexbin().extent(extent).radius(radius).x(function (d) {
      return d.x;
    }).y(function (d) {
      return d.y;
    });
  }

  var slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  /**
   * Checks which pixel of the image are filled
   * returning pixel positions to draw hexes on.
   * @param  {Array}    size        Width and height of base element.
   * @param  {function} pathGen     D3 path generator function.
   * @param  {Object}   geo         GeoJSON representing the object to tesselate.
   * @param  {number}   r           Hexagon radius.
   * @param  {string}   action      Drawing action `fill` or `stroke`.
   * @param  {number}   band        Extension of image (factor of r).
   * @return {Uint8ClampedArray}  Array of A values (from RGBA) per pixel.
   */
  // export default function(size, precision, pathGen, geo, r, action, band) {
  function getImageData (size, pathGen, geo, r, action, band) {
    var gridExtentStroke = band * r;
    var edgeBand = gridExtentStroke + 2 * r;

    // For debugging; append the canvas to the body and just draw on it.
    var canvas = document.createElement('canvas');
    // const canvas = d3.select('body').append('canvas').node();

    var _size = slicedToArray(size, 2);

    canvas.width = _size[0];
    canvas.height = _size[1];


    var context = canvas.getContext('2d');

    var canvasPath = pathGen.context(context);

    // Draw.
    context.beginPath();
    canvasPath(geo);
    if (action === 'fill') {
      // debugger
      if (band) {
        context.lineWidth = gridExtentStroke;
        context.stroke();
      }
      context.fill();
    } else if (action === 'stroke') {
      context.lineWidth = edgeBand;
      context.stroke();
    }

    // Remove side effect of setting the path's context.
    pathGen.context(null);

    // Get the pixel rgba data but only keep the 4th value (alpha).
    var imgData = context.getImageData(0, 0, size[0], size[1]).data;
    return imgData.filter(function (d, i) {
      return i % 4 === 3;
    });
  }

  /**
   * Checks for each center if it covers a pixel in the image.
   * Checks only for centers that are within the bounds of width and height.
   * Note, this can be optimised (for loop instead of filter all).
   * @param  {Array}              centers     Hexagon centers covering the
   *                                          extent of the drawing canvas.
   * @param  {Uint8ClampedArray}  image       Pixel alpha values indicating fill.
   * @param  {Array}              size        Width and height of drawing canvas.
   * @param  {number}             precision   Hidden canvas ratio of the
   *                                          drawing canvas.
   * @return {Array}                          Hexagon centers covering
   *                                          the displayed object.
   */
  // export default function(centers, image, size, precision) {
  function getImageCenters (centers, image, size) {
    var _size = slicedToArray(size, 2),
        w = _size[0],
        h = _size[1];

    return centers.filter(function (center) {
      return (
        // Guarantee centers to be within bounds.
        center[0] >= 0 && center[0] <= w && center[1] >= 0 && center[1] <= h && image[Math.floor(center[0]) + Math.floor(center[1]) * Math.floor(w)]
      );
    }).map(function (center, i) {
      return { id: i, x: center[0], y: center[1], gridpoint: 1, cover: 1 };
    });
  }

  /**
   * Checks for each center if it covers a pixel in the image.
   * @param  {Array}              centers     Hexagon centers covering the
   *                                          breadth of the drawing canvas.
   * @param  {Uint8ClampedArray}  image       Pixels indicating fill.
   * @param  {Array}              size        Width and height of drawing canvas.
   * @param  {number}             precision   Hidden canvas ratio of the
   *                                          drawing canvas.
   * @return {Array}                          Hexagon centers covering the
   *                                          displayed object only.
   */
  // export default function(centers, image, size, precision) {
  function getEdgeCenters (centers, image, size) {
    var w = size[0];

    return centers.filter(function (el) {
      return image[Math.floor(el.x) + w * Math.floor(el.y)];
    });
  }

  /**
   * Produe the canvas image of a specifically sized and scaled hexagon,
   * the canvas image of the desired base image as well as a context
   * to concoct the overlap image.
   * @param  {number}   precision   Scale for single hexagon-map image.
   * @param  {Array}    size        Width and height of base element.
   * @param  {function} pathGen     D3 path generator function.
   * @param  {Object}   geo         GeoJSON representing the object to tesselate.
   * @param  {number}   r           Hexagon radius.
   * @param  {number}   band        Extension of image (factor of r).
   * @return {Object}               The hex & geo image plus the context to use.
   */
  function getEdgeTools (precision, size, pathGen, geo, r, band) {
    // 1) Draw a hex with the correct radius at 0, 0.

    // Set up canvas and context.
    var w = Math.sqrt(3) * r * precision;
    var h = r * 2 * precision;
    var canvasHex = document.createElement('canvas');
    // const canvasHex = d3.select('body').append('canvas').node()
    canvasHex.width = w;
    canvasHex.height = h;
    var contextHex = canvasHex.getContext('2d');

    // Get the hexagon's corner points.
    var hexCorners = Array(7);
    for (var i = 0; i < 7; i++) {
      var corner = pointyHexCorner({ x: 0, y: 0 }, r * precision, i);
      hexCorners[i] = corner;
    }

    // Draw the hexagon.
    contextHex.translate(w / 2, h / 2);
    hexDraw(contextHex, hexCorners, 'red', 'fill');

    // 2) Draw the image.

    // Set up the image canvas and context.

    var _size = slicedToArray(size, 2),
        width = _size[0],
        height = _size[1];

    var canvasImage = document.createElement('canvas');
    // const canvasImage = d3.select('body').append('canvas').node();
    canvasImage.width = width * precision;
    canvasImage.height = height * precision;
    var contextImage = canvasImage.getContext('2d');

    // Set the context for the path generator for use with Canvas.
    pathGen.context(contextImage);

    // Draw the image.
    var gridExtentStroke = band * r;

    contextImage.scale(precision, precision);
    contextImage.beginPath();
    pathGen(geo);
    contextImage.lineWidth = gridExtentStroke;
    contextImage.fillStyle = 'blue';
    contextImage.strokeStyle = 'blue';
    contextImage.stroke();
    contextImage.fill();

    // Reset the pathGenerators context.
    pathGen.context(null);

    // 3) Create context to combine images;

    var canvasMix = document.createElement('canvas');
    // const canvasMix = d3.select('body').append('canvas').node()
    canvasMix.width = w;
    canvasMix.height = h;
    var contextMix = canvasMix.getContext('2d');

    return { canvasHex: canvasHex, canvasImage: canvasImage, contextMix: contextMix };
  }

  // Debug
  // import { pointyHexCorner, hexDraw } from './utils';

  /**
   * Calculates the cover for a single hexagon by
   * overlaying the map at the given position.
   * @param  {Object} edge      The datum representing the edge center.
   * @param  {Object} tools     The image and drawing tools
   *                            to create the overlap image.
   * @param  {number} precision The scaling factor for the image
   *                            at the given hex radius.
   * @param  {number} r         The hex radius. Required only for debugging.
   * @return {Object}           The cover updated egde center datum.
   */
  function getCover (edge, tools, precision, r) {
    var canvasHex = tools.canvasHex,
        canvasImage = tools.canvasImage,
        contextMix = tools.contextMix;

    var w = canvasHex.width;
    var h = canvasHex.height;

    // // Debug ↓ --------------------------------------------------------------

    // // const r = 7;
    // const hexCorners = Array(7);
    // for (let i = 0; i < 7; i++) {
    //   const corner = pointyHexCorner({ x: 0, y: 0 }, r * precision, i);
    //   hexCorners[i] = corner;
    // }

    // const contextImage = canvasImage.getContext('2d');

    // // Centers.
    // contextImage.beginPath();
    //   contextImage.arc(edge.x, edge.y, 2, 0, 2*Math.PI)
    // contextImage.fillStyle = '#000'
    // contextImage.fill();

    // // Hexagons
    // hexDraw(contextImage, hexCorners, 'red', 'fill')

    // // Debug ↑ --------------------------------------------------------------

    // 1) Concoct the specific edge hexagon image and get the pixel data.

    // Draw hex image.
    contextMix.drawImage(canvasHex, 0, 0);

    // Set the composite type in preperation for the image overlap.
    contextMix.globalCompositeOperation = 'source-atop';

    // Draw Map at correct position.
    contextMix.drawImage(canvasImage, -edge.x * precision + w / 2, -edge.y * precision + h / 2);

    // Get the image data.
    var imageData = contextMix.getImageData(0, 0, w, h).data;

    // // Clear the canvas and reset the composite type in preperation
    // // for the next overlap (http://bit.do/ekDx4).
    // contextMix.clearRect(0,0,w,h);
    // contextMix.globalCompositeOperation = 'source-over';

    // 2) Calculate the image cover per edge hexagon.

    // Init area count variables.
    var hexArea = 0;
    var imgArea = 0;

    // Find filled pixel with some alpha (>=100)
    // and identify image part.
    for (var pixelIndex = 3; pixelIndex < imageData.length; pixelIndex += 4) {
      var alpha = imageData[pixelIndex];
      if (alpha < 100) {
        continue;
      } else {
        var red = imageData[pixelIndex - 3];
        var blue = imageData[pixelIndex - 1];
        red > blue ? hexArea++ : imgArea++;
      }
    }

    // Calculate cover and add to edge hexagon.
    var imgRatio = imgArea / (hexArea + imgArea);
    var updatedEdge = Object.assign({}, edge);
    updatedEdge.cover = imgRatio;

    // Clear the canvas and reset the composite type in preperation
    // for the next overlap (http://bit.do/ekDx4).
    contextMix.clearRect(0, 0, w, h);
    contextMix.globalCompositeOperation = 'source-over';

    return updatedEdge;
  }

  /**
   * Adds the updated cover value to each center datum.
   * @param  {Array}  centers   All center objects including the edge centers.
   * @param  {Array}  edges     Only the edge center objects.
   * @return {Array}            The updated center objects.
   */
  function addCover (centers, edges) {
    var centersUpdated = centers.slice(0);

    for (var i = 0; i < edges.length; i++) {
      var edge = edges[i];
      // Assuming the centers array id's are
      // consistent with the edge id's.
      centersUpdated[edge.id].cover = edge.cover;
    }

    return centersUpdated;
  }

  /**
   * Defines the data's latitude and longitude keys.
   * @param  {Array} lonLat   User defined array of geo keys.
   * @param  {Array} data     User defined data.
   * @return {Array}          Array of geo keys.
   */
  function checkGeoKeyNames(lonLat, data) {
    if (lonLat && lonLat.length === 2) return lonLat;

    var lonKey = Object.keys(data[0]).filter(function (key) {
      var low = key.toLowerCase();
      return low === 'longitude' || low === 'lon' || low === 'lng' || low === 'long' || low === 'lambda';
    });

    var latKey = Object.keys(data[0]).filter(function (key) {
      var low = key.toLowerCase();
      return low === 'latitude' || low === 'lat' || low === 'phi';
    });

    return [lonKey[0], latKey[0]];
  }

  /**
   * Process the user data to be structured for further use.
   * @param  {Array}    data          Array of user data objects.
   * @param  {function} projection    Geo projection.
   * @param  {Array}    variables     Optional. Array of variables the user
   *                                  would like to add to the layout.
   * @return {Array}                  Array of user's data points.
   */
  function prepUserData (data, projection, lonLat, variables) {
    // Return an empty array if the user hasn't passed down data.
    if (!data.length) return [];

    var geoKeys = checkGeoKeyNames(lonLat, data);

    return data.map(function (el) {
      var coords = projection([+el[geoKeys[0]], +el[geoKeys[1]]]);

      var obj = {};

      var _coords = slicedToArray(coords, 2);

      obj.x = _coords[0];
      obj.y = _coords[1];


      if (variables && variables.length) {
        variables.forEach(function (varName) {
          obj[varName] = el[varName];
        });
      }

      return obj;
    });
  }

  /**
   * Bring each hexpoint into shape, by rolling up number of datapoints
   * per hexagon, add cover and setting apart original centers from
   * centers added by user-data.
   * @param  {Array} hexPoints        Array of arrays of grid and
   *                                  datapoints per hexagon.
   * @return {Array}                  Array of arrays of datapoints
   *                                  per hexagon plus additional props.
   */
  function rollupPoints (hexPoints) {
    for (var i = 0; i < hexPoints.length; i++) {
      // Cache current element and prep cover variable.
      var hexPoint = hexPoints[i];
      var cover = void 0;
      var gridpoint = void 0;

      // Remove grid points and cache cover.
      for (var j = 0; j < hexPoint.length; j++) {
        if (hexPoint[j].gridpoint === 1) {
          cover = hexPoint[j].cover;
          gridpoint = 1;
          hexPoint.splice(j, 1);
        }
      }

      // Augment with new properties.
      hexPoints[i].datapoints = hexPoints[i].length;
      hexPoints[i].cover = cover;
      hexPoints[i].gridpoint = gridpoint || 0;
    }

    return hexPoints;
  }

  /**
   * Calculates the cover weighted measures. Also assigns a
   * minimum cover proxy to each layout point without a cover.
   * Requried as some user data points can lie just outside the image.
   * @param  {Array}  points  Layout objects.
   * @param  {number} r       The hexagon's radius.
   * @return {Array}          Cover augmented layout objects.
   */
  function rollupDensity (points, r) {
    // Establish a minimum cover proxy: get a sorted array of cover values
    // for the quantile function. Only consider edges with cover < 1.
    var ascendingCover = points.filter(function (p) {
      return p.cover > 0 && p.cover < 1;
    }).map(function (d) {
      return d.cover;
    }).sort(function (a, b) {
      return a - b;
    });
    // Get the 10th percentile as the proxy.
    var quartileCover = quantile(ascendingCover, 0.1);

    // Get the hexagon's area in square pixel.
    var hexArea = 3 / 2 * Math.sqrt(3) * Math.pow(r, 2);

    // Initialise extents.
    var maxPoints = 0;
    var maxPointsWt = 0;
    var maxDensity = 0;

    // Initialise the min values with the largest possible min value.
    var minPoints = points.length;
    var minPointsWt = points.length;
    var minDensity = points.length / hexArea;

    for (var i = 0; i < points.length; i++) {
      var point = points[i];

      // All layout points w/o cover will get assigned the cover proxy.
      // Note, only non-gridpoont datapoints will have no cover.
      if (!point.cover) {
        point.cover = quartileCover;
      }

      // Calculate the cover weighted measures.
      point.datapointsWt = point.datapoints * (1 / point.cover);
      point.pointDensity = point.datapoints / (hexArea * point.cover);

      // Update extents.
      maxPoints = Math.max(maxPoints, point.datapoints);
      maxPointsWt = Math.max(maxPointsWt, point.datapointsWt);
      maxDensity = Math.max(maxDensity, point.pointDensity);

      if (point.datapoints > 0) {
        minPoints = Math.min(minPoints, point.datapoints);
        minPointsWt = Math.min(minPointsWt, point.datapointsWt);
      }
      if (point.pointDensity > 0) {
        minDensity = Math.min(minDensity, point.pointDensity);
      }
    }

    var extentPoints = [minPoints, maxPoints];
    var extentPointsWeighted = [minPointsWt, maxPointsWt];
    var extentPointDensity = [minDensity, maxDensity];

    return {
      layout: points,
      extentPoints: extentPoints,
      extentPointsWeighted: extentPointsWeighted,
      extentPointDensity: extentPointDensity
    };
  }

  /**
   * Main hexgrid component.
   */
  function hexgrid () {
    // Init exposed.
    var extent = void 0;
    var geography = void 0;
    var projection = void 0;
    var pathGenerator = void 0;
    var hexRadius = 4;
    var hexRadiusUnit = null;
    var hexRadiusInUnits = null;
    var edgePrecision = 1;
    var gridExtend = 0;
    var geoKeys = void 0;

    /**
     * hexgrid function producing the layout.
     * @param  {Array} userData       Datapoints to visualise.
     *                                One datum represents one location.
     * @param  {Array} userVariables  Optional array of object keys to be
     *                                included in the final layout hex data.
     * @return {function/Object}      Augmented hexbin generator.
     */
    var hexgrid = function hexgrid(userData, userVariables) {
      // Convert to pixel radius if provided in units.
      if (hexRadiusInUnits) {
        var conversion = convertUnitRadius(hexRadiusInUnits, hexRadiusUnit, projection, extent[1].map(function (d) {
          return d / 2;
        }));
        hexRadius = conversion.radiusPixel;
      }

      // Set hex radius to nearest full- or half-pixel.
      hexRadius = Math.round(hexRadius * 2) / 2;

      // console.log(hexRadius);

      // Identify hexagons to draw.
      var hexbin = setHexGenerator(extent, hexRadius);

      var size = hexbin.size();

      var centers = hexbin.centers();

      var imageData = getImageData(size, pathGenerator, geography, hexRadius, 'fill', gridExtend);

      var imageCenters = getImageCenters(centers, imageData, size);

      // Identify edge hexagons and calculate image overlap ratio.
      var imageDataEdges = getImageData(size, pathGenerator, geography, hexRadius, 'stroke', gridExtend);

      var imageEdges = getEdgeCenters(imageCenters, imageDataEdges, size);

      var edgeTools = getEdgeTools(edgePrecision, size, pathGenerator, geography, hexRadius, gridExtend);

      var imageEdgesCover = imageEdges.map(function (d) {
        return getCover(d, edgeTools, edgePrecision, hexRadius);
      });

      imageCenters = addCover(imageCenters, imageEdgesCover);

      // Prepare user data to augment layout.
      var userDataPrepped = prepUserData(userData, projection, geoKeys, userVariables);

      var mergedData = imageCenters.concat(userDataPrepped);

      var hexPoints = hexbin(mergedData);

      var hexData = rollupPoints(hexPoints);

      hexData = rollupDensity(hexData, hexRadius);

      // Augment hexbin generator.
      hexbin.grid = {};
      hexbin.grid.layout = hexData.layout;
      hexbin.grid.imageCenters = imageCenters;
      hexbin.grid.extentPoints = hexData.extentPoints;
      hexbin.grid.extentPointsWeighted = hexData.extentPointsWeighted;
      hexbin.grid.extentPointDensity = hexData.extentPointDensity;

      return hexbin;
    };

    // Exposed.
    hexgrid.extent = function (_) {
      return arguments.length ? (extent = expandExtent(_), hexgrid) : extent;
    };

    hexgrid.geography = function (_) {
      return arguments.length ? (geography = _, hexgrid) : geography;
    };

    hexgrid.projection = function (_) {
      return arguments.length ? (projection = _, hexgrid) : projection;
    };

    hexgrid.pathGenerator = function (_) {
      return arguments.length ? (pathGenerator = _, hexgrid) : pathGenerator;
    };

    hexgrid.hexRadius = function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (!args.length) {
        return hexRadiusUnit ? { radius: hexRadius, unit: hexRadiusUnit } : hexRadius;
      } else if (args.length === 1) {
        return hexRadius = args[0], hexgrid;
      } else if (args.length === 2) {
        hexRadiusInUnits = args[0];
        hexRadiusUnit = args[1];

        return hexgrid;
      } else {
        throw new Error('Please pass a numeric radius and optionally a string distance unit ("miles" or "kilometres") to `.hexradius()`');
      }
    };

    hexgrid.edgePrecision = function (_) {
      return arguments.length ? (edgePrecision = convertToMin(_, 'Edge precision', 0.3), hexgrid) : edgePrecision;
    };

    hexgrid.gridExtend = function (_) {
      return arguments.length ? (gridExtend = convertToMin(_, 'Edge band', 0), hexgrid) : gridExtend;
    };

    hexgrid.geoKeys = function (_) {
      return arguments.length ? (geoKeys = _, hexgrid) : geoKeys;
    };

    return hexgrid;
  }

  /**
   * Produce an array or arrays with all polygonal boundary points.
   * @param  {Object}   geo           The GeoJSON FeatureCollection.
   * @param  {function} projection    The D3 projection function.
   * @return {Array}                  Array of arrays holding the boundary points
   *                                  for each area.
   */
  function getBoundaryPoints (geo, projection) {
    var boundaryPoints = [];
    var collection = void 0;

    // 1) Try for geometry type and get their contents.

    try {
      if (geo.type === 'FeatureCollection') {
        collection = geo.features;
      } else if (geo.type === 'GeometryCollection') {
        collection = geo.geometries;
      } else {
        throw new Error('Geometry type not supported. Please feed me a "FeatureCollection" or a "GeometryCollection".');
      }
    } catch (err) {
      console.error(err);
    }

    // 2) Retrieve the boundary points.

    for (var i = 0; i < collection.length; i++) {
      // Crack open the geometry to get the coordinate holder object.
      var geom = geo.type === 'FeatureCollection' ? geo.features[i].geometry : geo.geometries[i];

      // Different ways to access coordinates in a FeatureCollection:

      // Polygons: coordinates[Array[coordinates]]
      if (geom && geom.type === 'Polygon') {
        // Correcting for longitudes +180°.
        var polygon = geom.coordinates[0].map(function (coord) {
          return projection(coord[0] > 180 ? [180, coord[1]] : coord);
        });
        boundaryPoints.push(polygon);

        // MultiPolygons: coordinates[Polygons[Array[[coordinates]]]]
      } else if (geom && geom.type === 'MultiPolygon') {
        // Correcting for longitudes +180°.
        var polygons = geom.coordinates.map(function (multi) {
          return multi[0].map(function (coord) {
            return projection(coord[0] > 180 ? [180, coord[1]] : coord);
          });
        });
        boundaryPoints = boundaryPoints.concat(polygons);
      } else {
        continue;
      }
    }

    return boundaryPoints;
  }

  // Returns the 2D cross product of AB and AC vectors, i.e., the z-component of

  function polygonContains$1(polygon, point) {
    var n = polygon.length,
        p = polygon[n - 1],
        x = point[0], y = point[1],
        x0 = p[0], y0 = p[1],
        x1, y1,
        inside = false;

    for (var i = 0; i < n; ++i) {
      p = polygon[i], x1 = p[0], y1 = p[1];
      if (((y1 > y) !== (y0 > y)) && (x < (x0 - x1) * (y - y1) / (y0 - y1) + x1)) inside = !inside;
      x0 = x1, y0 = y1;
    }

    return inside;
  }

  /**
   * Produce an array or arrays with all points within a polygonial area/feature.
   * @param  {Array} gridPoints         All grid points.
   * @param  {Array} boundaryPoints     Array of arrays, one for each area,
   *                                    holding the area's boundary points.
   * @return {Array}                    Array of grid points within each area.
   *                                    Sorted ascendingly by x and y.
   */
  function getPolygonPoints (gridPoints, boundaryPoints) {
    return boundaryPoints.reduce(function (result, boundary) {
      var areaPoints = gridPoints.filter(function (point) {
        return polygonContains$1(boundary, [point.x, point.y]);
      });

      return result.concat(areaPoints);
    }, []).sort(function (a, b) {
      return a.x - b.x || a.y - b.y;
    });
  }

  exports.hexgrid = hexgrid;
  exports.geoPolygon = getBoundaryPoints;
  exports.polygonPoints = getPolygonPoints;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
