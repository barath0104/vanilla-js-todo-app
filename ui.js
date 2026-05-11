// ui.js


// DOM CACHE

const DOM = {

  searchInput : document.getElementById('searchInput'),

  addForm     : document.getElementById('addForm'),

  newTaskText : document.getElementById('newTaskText'),

  newTaskCol  : document.getElementById('newTaskCol'),

  btnShowAdd  : document.getElementById('btnShowAdd'),

  btnSave     : document.getElementById('btnSave'),

  btnCancel   : document.getElementById('btnCancel'),

  editModal   : document.getElementById('editModal'),

  editInput   : document.getElementById('editInput'),

  editCol     : document.getElementById('editCol'),

  btnEditSave : document.getElementById('btnEditSave'),

  btnEditCancel:
    document.getElementById('btnEditCancel'),

  cols: Object.fromEntries(

    COLS.map(function(col) {

      return [col, {

        area:
          document.getElementById('cards-' + col),

        count:
          document.getElementById('cnt-' + col),

        colEl:
          document.getElementById('col-' + col),
      }]
    })
  )
}


// UPDATE COUNT

function updateCount(col) {
  DOM.cols[col].count.textContent =
    colMap[col].size
}


// VIRTUAL RENDER

function virtualRender(col, taskIds) {

  const area       = DOM.cols[col].area
  const scrollTop  = scrollState[col]

  const totalItems = taskIds.length

  const rawStart =
    Math.floor(scrollTop / ITEM_HEIGHT)

  const startIndex =
    Math.max(0, rawStart - BUFFER)

  const endIndex =
    Math.min(
      totalItems,
      rawStart + VISIBLE_COUNT + BUFFER
    )

  const paddingTop =
    startIndex * ITEM_HEIGHT

  const paddingBottom =
    Math.max(
      0,
      (totalItems - endIndex) * ITEM_HEIGHT
    )

  const visibleIds =
    taskIds.slice(startIndex, endIndex)

  requestAnimationFrame(function() {

    area.innerHTML = ''

    if (totalItems === 0) {

      area.style.paddingTop    = '0px'
      area.style.paddingBottom = '0px'

      const empty =
        document.createElement('div')

      empty.className = 'empty-state'

      empty.textContent =
        DOM.searchInput.value.trim()
          ? 'No matches'
          : 'Drop tasks here'

      area.appendChild(empty)

      return
    }

    area.style.paddingTop =
      paddingTop + 'px'

    area.style.paddingBottom =
      paddingBottom + 'px'

    const frag =
      document.createDocumentFragment()

    visibleIds.forEach(function(id) {
      frag.appendChild(makeCard(taskMap[id]))
    })

    area.appendChild(frag)

    updateCount(col)
  })
}


// RENDER COLUMN

function renderColumn(col) {

  const query =
    DOM.searchInput.value
      .toLowerCase()
      .trim()

  let taskIds = colArrayCache[col]

  if (query) {

    taskIds = taskIds.filter(function(id) {

      return taskMap[id]
        .textLower
        .includes(query)
    })
  }

  virtualRender(col, taskIds)
}


// RENDER ALL

function renderAll() {

  COLS.forEach(function(col) {
    renderColumn(col)
  })
}


// SCROLL LISTENERS

function setupScrollListeners() {

  COLS.forEach(function(col) {

    const area = DOM.cols[col].area

    area.style.height =
      (VISIBLE_COUNT * ITEM_HEIGHT) + 'px'

    area.style.overflowY = 'auto'

    area.addEventListener('scroll', function() {

      scrollState[col] = area.scrollTop

      renderColumn(col)
    })
  })
}


// EDIT MODAL

function openEditModal(task) {

  editingId = task.id

  DOM.editInput.value = task.text

  DOM.editCol.value = task.column

  DOM.editModal.classList.add('open')

  DOM.editInput.focus()
}

function closeEditModal() {

  DOM.editModal.classList.remove('open')

  DOM.editInput.value = ''

  editingId = null
}


// EVENTS

DOM.btnSave.addEventListener('click', addTask)

DOM.btnEditSave.addEventListener('click', saveEdit)

DOM.btnEditCancel.addEventListener(
  'click',
  closeEditModal
)

DOM.searchInput.addEventListener(
  'input',
  function() {
    requestAnimationFrame(renderAll)
  }
)


// DROP EVENTS

COLS.forEach(function(col) {

  const { colEl } = DOM.cols[col]

  colEl.addEventListener('dragover', function(e) {
    e.preventDefault()
  })

  colEl.addEventListener('drop', function(e) {

    e.preventDefault()

    const id =
      parseInt(
        e.dataTransfer.getData('taskId')
      )

    moveTask(id, col)
  })
})


// START

loadTasks()

setupScrollListeners()

renderAll()