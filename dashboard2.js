$(document).ready(function () {
  $(document).ready(function () {
    // Script per il filtro assi multiselect
    $('#show_asse').multiselect({
      enableFiltering: true,
      buttonWidth: '100%',
      enableHTML: true,
      maxHeight: 295,
      includeSelectAllOption: true,
      buttonClass: 'btn btn-white',

      templates: {
        button: '<button type="button" class="multiselect dropdown-toggle" data-toggle="dropdown"><span class="multiselect-selected-text"></span> &nbsp;<b class="fa fa-caret-down"></b></button>',
        ul: '<ul class="multiselect-container dropdown-menu"></ul>',
        filter: '<li class="multiselect-item filter"><div class="input-group"><span class="input-group-addon"><i class="fa fa-search"></i></span><input class="form-control multiselect-search" type="text"></div></li>',
        filterClearBtn: '<span class="input-group-btn"><button class="btn btn-default btn-white btn-grey multiselect-clear-filter" type="button"><i class="fa fa-times-circle red2"></i></button></span>',
        li: '<li><a tabindex="0"><label></label></a></li>',
        divider: '<li class="multiselect-item divider"></li>',
        liGroup: '<li class="multiselect-item multiselect-group"><label></label></li>'
      },

      buttonText: function (option, select) {
        return 'Seleziona assi'
      }

    })
  })

  $('#resize-d3').slider({
    value: 0,
    range: 'min',
    min: -50,
    max: 250,
    animate: true,
    slide: function (event, ui) {
      $('#parallel').css({
        height: parseInt(CordPar.heightBaseD3) + (parseInt(ui.value)) + 'px',
        width: '100%'
      })
      CordPar.renderD3()
      
      if ($('input[name="show_media_dev"]').prop("checked")) {
        $('path.Avg,path.SD_Interval,path.Avg_Equipe').show()
      } else {
        $('path.Avg,path.SD_Interval,path.Avg_Equipe').hide()
      }
    }
  })

  $('#line_opacity').slider({
    value: 20,
    range: 'min',
    min: 10,
    max: 40,
    animate: true,
    slide: function (event, ui) {
      op = ui.value / 100
      $('.foreground path').each(function () {
        var color = $(this).css('stroke')
        var disp = $(this).css('display')
        $(this).attr('style', 'stroke:' + color + '; stroke-opacity:' + op + '; display:' + disp + ';')
      })
    }
  })

  // Show media e dev
  $('input[name="show_media_dev"]').click(function () {
    if ($(this).prop("checked")) {
      $('path.Avg,path.SD_Interval,path.Avg_Equipe').show()
    } else {
      $('path.Avg,path.SD_Interval,path.Avg_Equipe').hide()
    }
  })

  // Normalizza
  // Eliminare input[name="normalizza"]
  $('input[name="normalizza_btn"]').click(function () {
    if ($('input[name="normalizza_btn"]').prop("checked")) {
      $('input[name="normalizza_btn"]').val(1)
    } else {
      $('input[name="normalizza_btn"]').val(0)
    }

    $('button[name="search_d3"]').trigger('click')
  })

  $('.chosen-select').chosen({width: '100%'})

  $('#protocollo').change(function () {
    var protocollo = $('#protocollo').val()
    if (protocollo !== '') {
      var selectShowAsse = document.getElementById('show_asse')

      if (protocollo !== 'all') {
        $('#show_asse > option').each(function (i) {
          var filtro = $(this)
          var listaProtocolli = filtro.attr('data-protocollo')
          var valoreOption = filtro.attr('value')
          var input = $('.contenitore input[value="' + valoreOption + '"]')
          var option = $('.contenitore option[value="' + valoreOption + '"]')

          if (listaProtocolli.indexOf(protocollo) === -1) {
            input.addClass('hidden')
            option.addClass('hidden')
            input.parent('label').parent('a').parent('li').addClass('hidden')
          } else {
            input.removeClass('hidden')
            option.removeClass('hidden')
            input.parent('label').parent('a').parent('li').removeClass('hidden')
          }
        })
      } else {
        $('#show_asse > option').each(function () {
          var filtro = $(this)
          var listaProtocolli = filtro.attr('data-protocollo')
          var valoreOption = filtro.attr('value')
          var input = $('.contenitore input[value="' + valoreOption + '"]')
          var option = $('.contenitore option[value="' + valoreOption + '"]')

          input.removeClass('hidden')
          option.removeClass('hidden')
          input.parent('label').parent('a').parent('li').removeClass('hidden')
        })
      }
    }
  })
  $('button[name="search_d3"]').click(function () {
    // Recuperare i dati delle select
    var protocollo = $('#protocollo').val()
    var step = $('#step').val()
    var anno = $('#anno').val()

    var show_asse = []
    $('#show_asse').find('option:selected').each(function () {
      show_asse.push($(this).val())
    })

    if (!($('input[name="show_media_dev"]').prop('checked'))) {
      $('input[name="show_media_dev"]').prop('checked')
      $('input[name="show_media_dev"]').click()
    }

    var normalizza = $('input[name="normalizza_btn"]').val()

    $('#carica').removeClass('hidden')
    // Chiamata Ajax per ricaricare D3 con dati filtrati
    $.post(url_filtro_d3, 'step=' + step + '&protocollo=' + protocollo + '&anno=' + anno + '&normalizza=' + normalizza + '&show_asse=' + show_asse, function (data) {
      if (data.response) {
        // No data found
        if (data.data === '[]') {
          $('#parallel').addClass('hidden')
          $('#notFound').removeClass('hidden')
          $('#legend').addClass('hidden')
          $('#boxgriglia').addClass('hidden')
          $('#myGrid').addClass('hidden')
        } else {
          var json = $.parseJSON(data.data)
          
          $('#parallel').removeClass('hidden')
          $('#notFound').addClass('hidden')
          $('#legend').removeClass('hidden')
          $('#boxgriglia').removeClass('hidden')
          $('#myGrid').removeClass('hidden')

          pazienti_novalue = $.parseJSON(data.data_novalue)
          CordPar.init(json)
          CordPar.initRenderD3()
          CordPar.initGrid()
          pazienti = json
        }
        $('#carica').addClass('hidden')
      }
    })
  })

  $('button[name="reset_filter_d3"]').click(function () {
    var currentTime = new Date()
    $('#equipe').val('').trigger('chosen:updated')
    $('#protocollo').val('').trigger('chosen:updated')
    $('#step').val('').trigger('chosen:updated')
    $('#anno').val(currentTime.getFullYear()).trigger('chosen:updated')
    $('#show_asse').multiselect('selectAll', false)

    $('button[name="search_d3"]').trigger('click')

    $('g.brush').trigger('mousedown')
  })

    /* $(document).on('click',".slick-row",function(){
        window.location.href = demo+'/paziente/'+$(this).children('.r0').html();
    }); */
})

// D3
$(document).ready(function () {
  $(function () {
    CordPar = {
      json: null,
      columns: null,
      axes: null,
      dim: null,
      colors: null,
      heightBaseD3: null,
      pc: null,
      highlighter: null,
      slicky: null,
      widthBody: null,
      equipes: null,
      json_novalue: null,

      setDataInput: function (dati) {
        CordPar.dim = new Filter()
        CordPar.dim.set({data: dati })

        CordPar.columns = _(dati[0]).keys()
        CordPar.axes = _(CordPar.columns).without('name', 'group')
      },

      init: function (dati) {
        CordPar.equipes = equipes_mapping
        CordPar.json = dati
        CordPar.highlighter = new Selector()

        CordPar.highlighter.bind('change:selected', function () {
          var currentSelected = this.get('selected')
          var previousSelected = CordPar.highlighter.previous('selected')
          var newMultiselection = this.get('clear')

          if (newMultiselection === 1) {
            CordPar.pc.multipleHighlight(currentSelected, [])
            this.restartMultiselection(0)
          } else {
            CordPar.pc.multipleHighlight(currentSelected, previousSelected)
          }

        })

        CordPar.widthBody = $('body').width()

        CordPar.setDataInput(dati)

        CordPar.colors = {
          'Male': '#5291EF',
          'Female': '#FF40A0',
          'Avg': '#FF0000',
          'SD_Interval': '#FFAB68'
        }

        var equipeObj = {}

        $.each(CordPar.equipes, function (k, v) {
          equipeObj[k] = '#' + Math.floor(Math.random() * 16777215).toString(16)
        })

        _.extend(CordPar.colors, equipeObj)

        CordPar.eventHandler()
      },

      eventHandler: function () {
        $('#parallel').resize(function () {
          CordPar.pc.render()
        })
      },

      initRenderD3: function () {
        CordPar.pc = parallel(CordPar.dim, CordPar.colors)
        CordPar.renderD3()
        CordPar.initLegend()
      },
      renderD3: function () {
        CordPar.pc.render()

        $('#sesso').parent().children('g').remove()

        $('#equipe').parent().children('g').each(function () {
          var id = parseInt(Math.round($(this).children('text').text()))
          if (id === parseInt($(this).children('text').text())) { $(this).children('text').text(CordPar.equipes[id]) } else { $(this).children('text').text('') }
        })
      },

      initLegend: function () {
        $('#legend').html('')
        $.each(CordPar.colors, function (index, value) {
          if (!isNaN(parseInt(index))) {
            index = 'Avg_' + CordPar.equipes[index]
          }
          $('#legend').append("<div class='item'><div class='color' style='background: " + value + "';></div><div class='key'>" + index + '</div></div>')
        })
      },

      initGrid: function () {
        CordPar.slicky = new grid({
          model: CordPar.dim,
          selector: CordPar.highlighter,
          width: CordPar.widthBody,
          columns: CordPar.columns
        })
        CordPar.slicky.update()
      }
    }

    // Gestione dimensioni grafico
    CordPar.heightBaseD3 = parseInt($(document).height()) - 700
    $('#parallel').css({
      height: parseInt($(document).height()) - 700 + 'px',
      width: '100%'
    })

    CordPar.init(pazienti)
    CordPar.initRenderD3()
    CordPar.initGrid()

    var allValue
    var idAll
    var cont = 1
    $('#parallel .foreground2 path').click(function () {
      var id = $(this).attr('data-id')
      idAll = -1

      var dd = CordPar.dim

      allValue = _.filter(dd.attributes.data, function (item) { return item.id >= idAll })
      // Cambiando '==' in '===' non funziona più
      var filterbyId = _.filter(dd.attributes.data, function (item) { return item.id == id })

      if (cont === 1) {
        CordPar.pc.highlight(id)
        dd.attributes.filtered = filterbyId
        CordPar.slicky.model = dd
        CordPar.slicky.updateRetteToGrid()
        cont = 0
      } else {
        CordPar.pc.highlight(idAll)
        dd.attributes.filtered = allValue
        CordPar.slicky.model = dd
        CordPar.slicky.updateRetteToGrid()
        cont = 1
      }
    })

    $('#parallel').on('brushUpdated', function () {
      var filtered = $('path.Female,path.Male', '.foreground').filter(function () {
        return this.style.display !== 'none'
      }).map(function () {
        return this.dataset.id
      })

      $('#parallel').trigger('brush')

      /* AGGIUNTO QUESTO */
      var rowsBrushed = _.map(filtered, function (num) { return num * 1 })

      var dd = CordPar.dim

      var brushed = []

      var indice

      for (indice in rowsBrushed) {
        var rowIndex = rowsBrushed[indice]

        allValue = _.filter(dd.attributes.data, function (item) { return item.id === rowIndex })

        brushed.unshift(allValue[0])
      }

      dd.attributes.filtered = brushed
      CordPar.slicky.model = dd
      CordPar.slicky.brushUpdated()
    })

    $('#parallel').on('clearSelections', function () {
      CordPar.slicky.clearSelections()
      d3.select('#parallel .foreground').style('opacity', function (d, j) {
        return '1'
      })
    })

    // dblicck funziona come else
    /* $("#parallel .foreground2 path").dblclick(function(e) {
        alert("dblclick");
        var dd = CordPar.dim;
        CordPar.pc.highlight(idAll);
        dd.attributes.filtered = allValue;
        CordPar.slicky.model = dd;
        CordPar.slicky.update();
    }); */
  })
})
