//
// Copyright 2011, Boundary
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

(function (undefined) {

  var selectedRows = []

  window.grid = Backbone.View.extend({

    initialize: function (options) {
      var self = this
      for (var k in options) {
        this[k] = options[k]
      }
      this.model.bind('change:filtered', function () { self.update() })
      this.cols = _(this.columns).map(function (col) {
        return {
          id: col,
          name: (function () { if (self.alias) { return self.alias[col] } else { return col } }()), // how to do aliasing?
          field: col,
          width: (function () {
            switch (col) {
              case 'name':
                return 250
                break
              case 'group':
                return 130
                break
              default:
                return 105
            }
          } ())
        }
      })

      this.options = {
        enableCellNavigation: true,
        enableColumnReorder: false,
        forceFitColumns: false,
        rowHeight: 35,
        multiSelect: false
      }

      this.dataView = new Slick.Data.DataView()
      this.selectedRowIds = []
      this.grid = new Slick.Grid('#myGrid', this.dataView, this.cols, this.options)
      // Permette la selezione delle righe (sia singola sia multipla)
      this.grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: false}))
      // Genera tooltip se il titolo della colonna non è completamente visibile
      this.grid.registerPlugin( new Slick.AutoTooltips({ enableForHeaderCells: true }) )

      this.counter = 0

      var pager = new Slick.Controls.Pager(this.dataView, this.grid, $('#pager'))

      this.dataView.onRowCountChanged.subscribe(function (e, args) {
        self.grid.updateRowCount()
        self.grid.render()
      })

      if (this.selector) {
      
        this.grid.onClick.subscribe(function (e, args) {

          if ($.inArray(args.row, selectedRows) === -1) {
            selectedRows.push(args.row)
          } else {
            selectedRows.splice(selectedRows.indexOf(args.row), 1)
          }

          // Converto e riconverto l'array per far si che assuma una nuova 
          // reference, indispensabile per far funzionare a dovere l'evento
          // 'change' di Backbone.js 
          var tempArray = JSON.parse(JSON.stringify(selectedRows))
          self.selector.update(tempArray)

          self.grid.setSelectedRows(selectedRows)

        })
      }

      this.dataView.onRowsChanged.subscribe(function (e, args) {
        self.grid.invalidateRows(args.rows)
        self.grid.render()

        if (self.selectedRowIds.length > 0) {
          // since how the original data maps onto rows has changed,
          // the selected rows in the grid need to be updated
          var selRows = []
          for (var i = 0; i < self.selectedRowIds.length; i++) {
            var idx = self.dataView.getRowById(self.selectedRowIds[i])
            if (idx !== undefined) { selRows.push(idx) }
          }

          self.grid.setSelectedRows(selRows)
        }
      })
      
    },
    update: function () {
      filter = _.keys(this.model.get('filter'))[0]
      var self = this
      var data = _(this.model.get('filtered')).map(function (obj) {
        if (typeof filter === 'undefined') {
          obj.id = self.counter++
          return obj
        } else {
          if (obj[filter]) {
            obj.id = self.counter++
            return obj
          } else {
            return 'novalue'
          }
        }
      })

      this.dataView.beginUpdate()
      this.dataView.setItems(_.without(data, 'novalue'))
      this.dataView.endUpdate()
    },

    brushUpdated: function () {
      var data = _(this.model.get('filtered'))

      this.dataView.beginUpdate()
      this.dataView.setItems(data)
      this.dataView.endUpdate()
    },

    updateRetteToGrid: function () {
      filter = _.keys(this.model.get('filter'))[0]
      //
      //console.log("filter: ", filter)

      var self = this
      //
      //console.log("self: ", self)

      var data = _(this.model.get('filtered')).map(function (obj) {
        if (typeof filter === 'undefined') {
          //
          //console.log("obj.id before: ", obj.id)

          obj.id = self.counter++
          //
          //console.log("obj.id after: ", obj.id)
          //console.log("case 1: ", obj)

          return obj
        } else {
          if (obj[filter]) {
            obj.id = self.counter++
            //
            //console.log("case 2: ", obj)

            return obj
          } else {
            return 'novalue'
          }
        }
      })
      if (self.counter >= 0) {
        self.counter = 0
      }

      this.dataView.beginUpdate()
      this.dataView.setItems(_.without(data, 'novalue'))
      this.dataView.endUpdate()
    },
    clearSelections: function () {
      if (this.selector) {
        selectedRows = []
        this.selector.restartMultiselection(1)
        this.grid.setSelectedRows(selectedRows)
      }
    }
  })
})()
