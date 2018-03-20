// Ricevo la libreria
(function (d3) {
  window.parallel = function (model, colors) {
    elementManage = ['Avg', 'SD_Interval', 'Avg_Equipe']
    var self = {}
    var dimensions
    var dragging = {}
    // TO CHECK=> Nutrient Parallel (highlighted)
    var highlighted = null
    var container = d3.select('#parallel')

    var line = d3.svg.line().interpolate('cardinal').tension(1)
      .defined(function (d) {
        return !isNaN(d[1])
      })
    // axis = d3.svg.axis().orient("left").ticks(1+height/50), IN NUTRIENT 
    // PARALLEL
    var axis = d3.svg.axis().orient('left')
    var line2 = d3.svg.line().interpolate('cardinal').tension(1)
    var background
    var foreground

    var dataGlobal = model.get('data')
    // Elaborazione dei dati per separarli in dati statistici (Avg, Avg_equipe,
    // SD_Interval) e in dati dei pazienti reali
    var dataStatistic = _.filter(dataGlobal, function (item) {
      return (_.indexOf(elementManage, item.group) >= 0)
    })
    var media = dataStatistic[0]
    var dataPatient = _.filter(dataGlobal, function (item) {
      return (_.indexOf(elementManage, item.group) === -1)
    })
    // ??? Cosa contiene pazienti_novalue?
    var dataPatientWithoutId = pazienti_novalue

    self.update = function (data) {
      dataPatient = data
    }

    self.render = function () {
      container.select('svg').remove()

      var bounds = [ $(container[0]).width(), $(container[0]).height() ]
        // margine //TO CHECK=> Nutrient Parallel [ m = [60, 0, 10, 0], ]
      var m = [30, 10, 10, 10]
        // TO CHECK=> Nutrient Parallel [w = width - m[1] - m[3],]
      var w = bounds[0] - m[1] - m[3]
        // TO CHECK=> Nutrient Parallel h = height - m[0] - m[2],
      var h = bounds[1] - m[0] - m[2]

      var x = d3.scale.ordinal().rangePoints([0, w], 1)
      var y = {}

      var svg = container.append('svg:svg')
          .attr('width', w + m[1] + m[3])
          .attr('height', h + m[0] + m[2])
        .append('svg:g')
          .attr('transform', 'translate(' + m[3] + ',' + m[0] + ')')

      // Estrae la lista delle dimesioni e crea una scala per ogni asse
      x.domain(dimensions = d3.keys(dataGlobal[0]).filter(function (d) {
        dominio = d3.extent(dataGlobal, function (p) { return +p[d] })
        if (dominio[0] === 1 || dominio[0] === 2) { dominio[0] = 0 }

        return d !== 'name' && d !== 'group' && d !== 'id' &&
               (y[d] = d3.scale.linear()
            .domain([dominio[0], dominio[1]])
            .range([h, 0]))
      }))

      // Add grey background lines for context.
      /* background = svg.append("svg:g")
          .attr("class", "background")
        .selectAll("path")
          .data(dataPatient)
        .enter().append("svg:path")
          .attr("d", path); */

      // Definisce le linee
      var tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('opacity', 0)

      foreground = svg.append('svg:g')
          .attr('class', 'foreground')
          .selectAll('path')
          .data(dataPatient)
          .enter().append('svg:path')
          .attr('class', function (d) { return d.group })
          .attr('data-id', function (d, k) { return k })
          .attr('d', path)
          .attr('style', function (d) {
            return 'stroke:' + colors[d.group] + '; stroke-opacity: 0.3;'
          })
      foreground2 = svg.append('svg:g')
                  .attr('class', 'foreground2')
                  .selectAll('path')
                  .data(dataPatientWithoutId)
                  .enter().append('svg:path')
                  .attr('class', function (d) { return d.group })
                  .attr('data-id', function (d, k) { return k })
                  .attr('d', path2)
                  .attr('style', function (d) {
                    return 'stroke:' + colors[d.group] + '; stroke-opacity: 0.1;' + 'stroke-dasharray: 5.5;'
                  })

                .on('mouseover', function (d) {
                  d3.select(this)
                    .attr('style', 'stroke:' + colors[d.group] + '; stroke-opacity: 1;' + 'stroke-dasharray: 5.5;')
                })

             .on('mouseout', function (d) {
               d3.select(this)
              .attr('style', 'stroke:' + colors[d.group] + '; stroke-opacity: 0.1;' + 'stroke-dasharray: 5.5;')
             })

        /*  // da lavorare if con la classe selected//
           .on("click", function(d) {
                      d3.select(this)
                        .attr("style", "stroke:" + colors[d.group] + "; stroke-opacity: 1;"+ "stroke-dasharray: 5.5;");

                  })
            .on("dblclick", function(d) {
                  d3.select(this)
                  .attr("style", "stroke:" + colors[d.group] + "; stroke-opacity: 0.1;"+ "stroke-dasharray: 5.5;") });
        */

        /*
            .on("mouseover", function(d) {

                tooltip.transition()
                     .duration(200)
                     .style("opacity", .9);
                tooltip.html("Non funziona")
                     .style("left", (d3.event.pageX + 5) + "px")
                     .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                  tooltip.transition()
                       .duration(500)
                       .style("opacity", 0);
            });
        */

      // Definisce le linee Avg, Avg_equipe e SD_Interval
      avg_layer = svg.append('svg:g')
            .attr('class', 'highlight')
            .selectAll('path')
            .data(dataStatistic)
            .enter().append('svg:path')
            .attr('d', path)
            .attr('class', function (d) {
              return (_.indexOf(elementManage, d.group) < 0)
                ? d.group
                : d.group + ' elementManage highlight_fissi'
              })
            .attr('data-id', function (d, k) { return k })
            .attr('style', function (d) {
              if (d.group === 'Avg_Equipe') {
                return 'stroke:' + colors[d.equipe] + ';'
              } else {
                return 'stroke:' + colors[d.group] + ';'
              }
            })

      // Render dimensioni
      var g = svg.selectAll('.dimension')
          .data(dimensions)
        .enter().append('svg:g')
          .attr('class', 'dimension')
          .attr('transform', function (d) { return 'translate(' + x(d) + ')' })
          .call(d3.behavior.drag()
            .on('dragstart', function (d) {
              $('path.Avg,path.SD_Interval,path.SD_Interval,path.Avg_Equipe')
                .hide()
              dragging[d] = this.__origin__ = x(d)
            })
            .on('drag', function (d) {
              dragging[d] = Math.min(w, Math.max(0, this.__origin__ += d3.event.dx))
              foreground.attr('d', path)
              foreground2.attr('d', path2)
              dimensions.sort(function (a, b) { return position(a) - position(b) })
              x.domain(dimensions)
              g.attr('transform', function (d) { return 'translate(' + position(d) + ')' })
            })
            .on('dragend', function (d) {
              delete this.__origin__
              delete dragging[d]
              transition(d3.select(this)).attr('transform', 'translate(' + x(d) + ')')
              transition(foreground)
                  .attr('d', path)
              transition(foreground2).attr('d', path2)
              transition(avg_layer)
                      .attr('d', path)

            }))

      // Crea un asse e il label 'titolo' corrispondente
      g.append('svg:g')
          .attr('class', 'axis')
          .each(function (d) { d3.select(this).call(axis.scale(y[d])) })
        .append('svg:text')
          .attr('class', 'axis_label')
          .attr('id', String)
          .attr('text-anchor', 'middle')
          .attr('y', -9)
          .text(String)

      // Crea e aggiunge un brush per ogni asse
      g.append('svg:g')
          .attr('class', 'brush')
          .each(function (d) {
            d3.select(this).call(y[d].brush = d3.svg.multibrush()
                  .extentAdaption(resizeExtent)
                  // Permette di fare brush asse y
                  .y(y[d]).on('brush', brush)
                  .on('brushend', brush)
                  .on('brushstart', function () {
                    d3.selectAll('.highlighted-table-row').remove()
                    $('#parallel').trigger('clearSelections')
                  }))
          })

          .selectAll('rect').call(resizeExtent)

      function position (d) {
        var v = dragging[d]
        return v == null ? x(d) : v
      }

      function resizeExtent (selection) {
        selection
                .attr('x', -12)
                .attr('width', 24)
      }

      function path (d) {
        var foo = null
        var bar = null
        switch (d['group']) {
          case 'SD_Interval':
          case 'Avg':
            foo = dimensions.map(function (p) { return [position(p), y[p](d[p])] })
            bar = line(foo.slice(2))
            break
          case 'Avg_Equipe':
            foo = dimensions.map(function (p) { return [position(p), y[p](d[p])] })
            bar = line(foo.slice(1))
            break
          default:
            var dim = dimensions.map(function (p) {
              var foo = y[p](d[p])
              return ([position(p), foo])
            })
            bar = line(dim)
        }
        return bar
      }

      function path2 (d) {
        var foo = null
        var bar = null
        var dim = dimensions.map(function (p) {
          var foo = y[p](d[p])
          if (!isNaN(foo)) {
            return [position(p), foo]
          } else if (!isNaN(media[p])) {
            return [position(p), y[p](media[p])]
          } else {
            return 'novalue'
          }
        })
        bar = line2(_.without(dim, 'novalue'))

        return bar
      }

      function brush () {
        tmp = []

        var actives = dimensions.filter(function (p) {
          return !y[p].brush.empty()
        })
        var extents = actives.map(function (p) {
          return y[p].brush.extent()
        })

        foreground.style('display', function (d) {
          return actives.every(function (p, i) {
            return extents[i].some(function (e) {
              return e[0] <= d[p] && d[p] <= e[1]
            })
          }) ? null : 'none'
        })

        foreground2.style('display', function (d) {
          return actives.every(function (p, i) {
            return extents[i].some(function (e) {
              return e[0] <= d[p] && d[p] <= e[1]
            })
          }) ? null : 'none'
        })

        $('#parallel').trigger('brushUpdated')
      }
    
    /*  function brush() {
        var actives = dimensions.filter(function(p) {
          return !y[p].brush.empty();
         })

        var extents = actives.map(function(p) {
          return y[p].brush.extent();
        });

        // To be factored
        var filter = {};
        _(actives).each(function(key, i) {
          filter[key] = {
            min: extents[i][0],
            max: extents[i][1]
          }
        });
        model.set({filter: filter});
        foreground.style("display", function(d) {
          return actives.every(function(p, i) {
            return extents[i][0] <= d[p] && d[p] <= extents[i][1];
          }) ? null : "none";
        });
      } */

      function transition (g) {
        return g.transition().duration(500)
      }

      self.highlight = function (i) {
        if (i < 0) {
          // Se esistono delle righe evidenziate tramite multiselezione dalla 
          // tabella attualmente nascoste, vengono rese di nuovo visibili 
          if (!d3.select('.highlighted-table-row').empty()) {
            d3.selectAll('.highlighted-table-row').attr('display', null)
          } else {
            toogleForegroundOpacity(1)
          }

          d3.select('.highlighted-graph-row').remove()
        } else {
          toogleForegroundOpacity(0)

          // Se prima di fare una selezione dal grafico esiste già una 
          // multiselezione dalla tabella, nasconde momentaneamente tutte le
          // righe evidenziate tramite la multiselezione
          d3.selectAll('.highlighted-table-row').attr('display', 'none')

          highlighted = svg.select('.highlight')
                          .append('svg:g')
                            .attr('class', 'highlighted-graph-row')
                          .selectAll('path')
                            .data([model.get('filtered')[i]])
                            .enter()
                          .append('svg:path')
                            .attr('d', path)
                            .attr('style', function (d) {
                              return 'stroke:' + colors[d.group] + ';'
                            })
        }
      }

      self.multipleHighlight = function (current, previous) {

        if (previous.length > current.length) {
          if (!current.length) {
            toogleForegroundOpacity(1)
          }

          var removedRow = previous.filter(notContainedIn(current))
          d3.select('.highlighted-row-' + removedRow).remove()
        } else {
          if (!previous.length) {
            toogleForegroundOpacity(0)
          }

          var addedRow = current.filter(notContainedIn(previous))

          highlighted = svg.select('.highlight')
                          .append('svg:g')
                            .attr('class', 'highlighted-row-' + addedRow)
                            .classed('highlighted-table-row', true)
                          .selectAll('path')
                            .data([model.get('filtered')[addedRow]])
                            .enter()
                          .append('svg:path')
                            .attr('d', path)
                            .attr('style', function (d) {
                              return 'stroke:' + colors[d.group] + ';'
                            })
        }
      }

      function notContainedIn(arr) {
        return function arrNotContains(element) {
          return arr.indexOf(element) === -1
        }
      }

      function toogleForegroundOpacity(i) {
        if (i === 0) {
          d3.select('#parallel .foreground').style('opacity', function (d, j) {
            return '0.35'
          })
        } else {
          d3.select('#parallel .foreground').style('opacity', function (d, j) {
            return '1'
          })
        }
      }
      
    }
    return self
  }
})(d3)
